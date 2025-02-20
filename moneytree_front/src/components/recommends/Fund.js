import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getCookie } from '../../util/cookieUtil';
import FundAPI from '../../api/FundAPI';
import FundTradeModal from '../FundTradeModal';
import '../../css/recommends/Fund.css';

const Fund = () => {
  const [allFunds, setAllFunds] = useState([]);
  const [displayFunds, setDisplayFunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [investedFunds, setInvestedFunds] = useState(new Set()); // 가입한 펀드 ID 세트
  const observer = useRef(null);
  const itemsPerPage = 10;

  // 필터 상태
  const [minTotalAmount, setMinTotalAmount] = useState('');
  const [maxTotalAmount, setMaxTotalAmount] = useState('');
  const [minManagementFee, setMinManagementFee] = useState('');
  const [maxRedemptionFee, setMaxRedemptionFee] = useState('');
  const [fundYear, setFundYear] = useState('');
  const [filteredFunds, setFilteredFunds] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // 모달 상태
  const [selectedFund, setSelectedFund] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 가입한 펀드 정보 가져오기
  const fetchInvestedFunds = async () => {
    try {
      const memberCookie = getCookie('member');
      if (!memberCookie) return;

      const accountNumber = await FundAPI.getDandwacAccountNumber(memberCookie.memberId);
      if (!accountNumber) return;

      const fundAccounts = await FundAPI.getFundAccount(accountNumber);

      // 가입한 펀드 ID들을 Set으로 저장
      const investedFundIds = new Set(
        fundAccounts.map(account => account.fundProductId)
      );
      setInvestedFunds(investedFundIds);
    } catch (err) {
      console.error('Error fetching invested funds:', err);
    }
  };

  // 초기 데이터 불러오기
  const fetchInitialFunds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await FundAPI.getFundsByPage(1, 30);
      const fundsData = Array.isArray(response) ? response : response?.content || [];
      setAllFunds(fundsData);
      setDisplayFunds(fundsData.slice(0, itemsPerPage));
      setHasMore(true);

      // 가입한 펀드 정보 가져오기
      await fetchInvestedFunds();
    } catch (err) {
      console.error('Error fetching initial funds:', err);
      setError('펀드 데이터를 가져오는 중 문제가 발생하였습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 필터 초기화
  const resetFilters = useCallback(() => {
    setMinTotalAmount('');
    setMaxTotalAmount('');
    setMinManagementFee('');
    setMaxRedemptionFee('');
    setFundYear('');
    setPage(1);
    setFilteredFunds([]);
    setIsFiltering(false);
    setHasMore(true);
    fetchInitialFunds();
  }, [fetchInitialFunds]);

  useEffect(() => {
    fetchInitialFunds();
  }, [fetchInitialFunds]);

  // 필터링 적용
  const applyFilters = useCallback(async () => {
    if (!minTotalAmount && !maxTotalAmount && !minManagementFee &&
      !maxRedemptionFee && !fundYear) {
      setIsFiltering(false);
      setFilteredFunds([]);
      setDisplayFunds(allFunds.slice(0, page * itemsPerPage));
      return;
    }

    try {
      setLoading(true);
      setIsFiltering(true);

      const searchParams = {
        minFundTotalAmount: minTotalAmount || undefined,
        maxFundTotalAmount: maxTotalAmount || undefined,
        minFundManagementFee: minManagementFee || undefined,
        maxFundRedemptionFee: maxRedemptionFee || undefined,
        fundProductYear: fundYear || undefined
      };

      const filteredData = await FundAPI.getFilteredFunds(searchParams);
      setFilteredFunds(filteredData);
      setHasMore(false);
    } catch (error) {
      console.error('Error applying filters:', error);
      setError('필터 적용 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [minTotalAmount, maxTotalAmount, minManagementFee, maxRedemptionFee, fundYear, allFunds, page]);

  useEffect(() => {
    const filterTimer = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => clearTimeout(filterTimer);
  }, [applyFilters]);

  useEffect(() => {
    if (!isFiltering && allFunds.length > 0) {
      const endIndex = page * itemsPerPage;
      setDisplayFunds(allFunds.slice(0, endIndex));
      setHasMore(endIndex < allFunds.length);
    }
  }, [page, isFiltering, allFunds]);

  const lastFundElementRef = useCallback((node) => {
    if (loading || !hasMore || isFiltering) return;

    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, isFiltering]);

  const formatAmount = (amount) => {
    return `${Math.floor((amount * 100) / 10000).toLocaleString()}`;
  };

  // 펀드 클릭 핸들러
  const handleFundClick = (fund) => {
    setSelectedFund(fund);
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFund(null);
    // 모달이 닫힐 때 가입 상태 새로고침
    fetchInvestedFunds();
  };

  if (loading && displayFunds.length === 0) return <p className="fund-loading-state">로딩 중입니다...</p>;
  if (error) return <p className="fund-error-state">{error}</p>;
  if (!displayFunds || displayFunds.length === 0) {
    return <p className="fund-empty-state">표시할 펀드 상품이 없습니다.</p>;
  }

  const funds = filteredFunds.length > 0 ? filteredFunds : displayFunds;

  return (
    <div className="fund-container">
      <div className="filter-container">
        <input
          type="number"
          className="filter-input"
          placeholder="최소 펀드 규모"
          value={minTotalAmount}
          onChange={(e) => setMinTotalAmount(e.target.value)}
        />
        <input
          type="number"
          className="filter-input"
          placeholder="최대 펀드 규모"
          value={maxTotalAmount}
          onChange={(e) => setMaxTotalAmount(e.target.value)}
        />
        <input
          type="number"
          className="filter-input"
          placeholder="최소 운용 보수"
          value={minManagementFee}
          onChange={(e) => setMinManagementFee(e.target.value)}
        />
        <input
          type="number"
          className="filter-input"
          placeholder="최대 환매 수수료"
          value={maxRedemptionFee}
          onChange={(e) => setMaxRedemptionFee(e.target.value)}
        />
        <input
          type="number"
          className="filter-input"
          placeholder="설정 연도"
          value={fundYear}
          onChange={(e) => setFundYear(e.target.value)}
        />
        <button onClick={resetFilters} className="filter-reset-btn">
          필터 초기화
        </button>
      </div>

      <div className="fund-list">
        <div className="fund-header">
          <div className="fund-header-name">펀드명</div>
          <div className="fund-header-manager">운용사</div>
          <div className="fund-header-amount">펀드 규모</div>
        </div>
        {funds.map((fund, index) => (
          <div
            key={fund.fundProductId}
            ref={index === funds.length - 1 ? lastFundElementRef : null}
            className="fund-item-container"
            onClick={() => handleFundClick(fund)}
          >
            <div className="fund-item">
              <div className="fund-name-section">
                <span className="fund-title">
                  {fund.fundProductName}
                  {investedFunds.has(fund.fundProductId) && (
                    <span className="fund-invested-badge">가입중</span>
                  )}
                </span>
                <span className="fund-type">{fund.fundProductType}</span>
              </div>
              <div className="fund-manager">{fund.fundProductManager}</div>
              <div className="fund-amount">
                {formatAmount(fund.fundProductTotalAmount)}억원
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="fund-loading-indicator">
            <p>데이터를 불러오는 중...</p>
          </div>
        )}
      </div>

      <FundTradeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        fundProduct={selectedFund}
      />
    </div>
  );
};

export default Fund;