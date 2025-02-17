import React, { useEffect, useState, useRef } from 'react';
import FundAPI from '../../api/FundAPI';
import '../../css/recommends/Fund.css';

const Fund = () => {
  const [allFunds, setAllFunds] = useState([]);
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [expandedFund, setExpandedFund] = useState(null);
  const [fundDetail, setFundDetail] = useState(null);
  const itemsPerPage = 10;
  const observer = useRef(null);

  // 필터링 상태
  const [minTotalAmount, setMinTotalAmount] = useState('');
  const [maxTotalAmount, setMaxTotalAmount] = useState('');
  const [minManagementFee, setMinManagementFee] = useState('');
  const [maxRedemptionFee, setMaxRedemptionFee] = useState('');
  const [fundYear, setFundYear] = useState('');
  const [debouncedFilters, setDebouncedFilters] = useState({
    minTotalAmount: '',
    maxTotalAmount: '',
    minManagementFee: '',
    maxRedemptionFee: '',
    fundYear: '',
  });

  // 필터 초기화 함수
  const resetFilters = () => {
    setMinTotalAmount('');
    setMaxTotalAmount('');
    setMinManagementFee('');
    setMaxRedemptionFee('');
    setFundYear('');
  };

  // 디바운싱 적용
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters({
        minTotalAmount: minTotalAmount,
        maxTotalAmount: maxTotalAmount,
        minManagementFee: minManagementFee,
        maxRedemptionFee: maxRedemptionFee,
        fundYear: fundYear,
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [minTotalAmount, maxTotalAmount, minManagementFee, maxRedemptionFee, fundYear]);

  // 필터링 로직
  useEffect(() => {
    const fetchFilteredFunds = async () => {
      try {
        setLoading(true);

        if (
          debouncedFilters.minTotalAmount ||
          debouncedFilters.maxTotalAmount ||
          debouncedFilters.minManagementFee ||
          debouncedFilters.maxRedemptionFee ||
          debouncedFilters.fundYear
        ) {
          const searchParams = {
            minFundTotalAmount: debouncedFilters.minTotalAmount || undefined,
            maxFundTotalAmount: debouncedFilters.maxTotalAmount || undefined,
            minFundManagementFee: debouncedFilters.minManagementFee || undefined,
            maxFundRedemptionFee: debouncedFilters.maxRedemptionFee || undefined,
            fundProductYear: debouncedFilters.fundYear || undefined,
          };

          const data = await FundAPI.getFilteredFunds(searchParams);
          setAllFunds(data);
          setFunds(data.slice(0, itemsPerPage));
        } else {
          const data = await FundAPI.getAllFunds();
          setAllFunds(data);
          setFunds(data.slice(0, itemsPerPage));
        }
        setPage(1);
      } catch (err) {
        console.error('Error filtering funds:', err);
        setError('데이터 필터링 중 문제가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredFunds();
  }, [debouncedFilters]);

  const formatAmount = (amount) => {
    const correctAmount = Math.floor((amount * 100) / 10000);
    return `${correctAmount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatPercentage = (decimal) => {
    if (!decimal) return '-';
    return decimal.toFixed(3) + '%'; //(승훈) 수정 이유: 프론트에서 각 수수료율이 수치가 상이해짐.
  };

  const lastFundElementRef = (node) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prevPage) => {
          const nextPage = prevPage + 1;
          const startIndex = (nextPage - 1) * itemsPerPage;
          const newFunds = allFunds.slice(startIndex, startIndex + itemsPerPage);

          if (newFunds.length > 0) {
            setFunds((prevFunds) => {
              const fundMap = new Map();
              [...prevFunds, ...newFunds].forEach((fund) => {
                fundMap.set(fund.fundProductId, fund);
              });
              return Array.from(fundMap.values());
            });
          }
          return nextPage;
        });
      }
    });
    if (node) observer.current.observe(node);
  };

  const handleExpand = async (fundId) => {
    if (expandedFund === fundId) {
      setExpandedFund(null);
      setFundDetail(null);
    } else {
      try {
        const detail = await FundAPI.getFundById(fundId);
        setFundDetail(detail);
        setExpandedFund(fundId);
      } catch (err) {
        console.error('Error fetching fund details:', err);
      }
    }
  };

  const handleJoinClick = () => {
    // navigate('/join');
  };

  if (loading) return <p className="fund-loading-state">로딩 중입니다...</p>;
  if (error) return <p className="fund-error-state">{error}</p>;
  if (!funds || funds.length === 0) {
    return <p className="fund-empty-state">표시할 펀드 상품이 없습니다.</p>;
  }

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
        {funds.map((fund, index) => (
          <div
            key={fund.fundProductId}
            className="fund-item-container"
            ref={index === funds.length - 1 ? lastFundElementRef : null}
          >
            <div className="fund-item">
              <div className="fund-item-left">
                <div className="fund-item-icon">🏢</div>
                <div className="fund-item-info">
                  <div className="fund-item-title">{fund.fundProductName}</div>
                  <div className="fund-item-subtitle">{fund.fundProductManager}</div>
                </div>
              </div>
              <div className="fund-item-right">
                <div className="fund-item-chart">
                  <div className="placeholder-chart"></div>
                </div>
                <div className="fund-item-numbers">
                  <div className="fund-item-amount">
                    {formatAmount(fund.fundProductTotalAmount)}억
                  </div>
                  <div className="fund-item-yield">+2.67%</div>
                </div>
                <button
                  className={`fund-expand-button ${expandedFund === fund.fundProductId ? 'expanded' : ''}`}
                  onClick={() => handleExpand(fund.fundProductId)}
                >
                  +
                </button>
              </div>
            </div>

            {expandedFund === fund.fundProductId && fundDetail && (
              <div className="fund-item-details">
                <div className="details-section">
                  <h3>펀드 상세 정보</h3>
                  <div className="details-grid">
                    <div className="details-item">
                      <span className="details-label">펀드 유형</span>
                      <span className="details-value">{fundDetail.fundProductType}</span>
                    </div>
                    <div className="details-item">
                      <span className="details-label">설정 연도</span>
                      <span className="details-value">{fundDetail.fundProductYear}</span>
                    </div>
                    <div className="details-item">
                      <span className="details-label">만기일</span>
                      <span className="details-value">
                        {formatDate(fundDetail.fundProductExpiration)}
                      </span>
                    </div>
                    <div className="details-item">
                      <span className="details-label">총 펀드 규모</span>
                      <span className="details-value">
                        {formatAmount(fundDetail.fundProductTotalAmount)}억 원
                      </span>
                    </div>
                    <div className="details-item">
                      <span className="details-label">운용 보수</span>
                      <span className="details-value">
                        {formatPercentage(fundDetail.fundProductManagementFee)}
                      </span>
                    </div>
                    <div className="details-item">
                      <span className="details-label">환매 수수료</span>
                      <span className="details-value">
                        {formatPercentage(fundDetail.fundProductRedemptionFee)}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="join-button" onClick={handleJoinClick}>
                  가입하기
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fund;
