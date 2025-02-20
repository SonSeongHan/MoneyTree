import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SavingAPI from '../../api/SavingAPI';
import '../../css/recommends/Saving.css';

const Saving = () => {
  const [savings, setSavings] = useState([]);
  const [filteredSavings, setFilteredSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinedProducts, setJoinedProducts] = useState([]);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(() => {
    return Number(sessionStorage.getItem('savingPage')) || 0;
  });

  const [interestRateRange, setInterestRateRange] = useState({ min: '', max: '' });
  const [primeRate, setPrimeRate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [debouncedMinAmount, setDebouncedMinAmount] = useState('');
  const [maturityPeriod, setMaturityPeriod] = useState('');
  const [savingType, setSavingType] = useState('');

  // 필터 초기화 함수
  const resetFilters = () => {
    setInterestRateRange({ min: '', max: '' });
    setPrimeRate('');
    setMinAmount('');
    setDebouncedMinAmount('');
    setMaturityPeriod('');
    setSavingType('');
  };

  // 초기 데이터 로드 시 가입한 상품 목록도 함께 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        const savingData = await SavingAPI.getAllSavingProducts();
        setSavings(savingData);
        setFilteredSavings(savingData);

        // 가입한 상품 목록 조회
        const myAccounts = await SavingAPI.getMySavingAccounts();
        const joinedProductIds = myAccounts.accounts.map(account => account.savingProductId);
        setJoinedProducts(joinedProductIds);
      } catch (err) {
        console.error('Error fetching savings: ', err);
        setError('적금 데이터를 가져오는 중 문제가 발생하였습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 최소 금액 디바운싱
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMinAmount(minAmount);
    }, 500);

    return () => clearTimeout(handler);
  }, [minAmount]);

  // 필터링 효과
  useEffect(() => {
    const fetchFilteredSavings = async () => {
      try {
        setLoading(true);

        if (interestRateRange.min || interestRateRange.max || primeRate ||
          debouncedMinAmount || maturityPeriod || savingType) {
          const searchParams = {
            minInterestRate: interestRateRange.min || undefined,
            maxInterestRate: interestRateRange.max || undefined,
            primeRate: primeRate || undefined,
            minAmount: debouncedMinAmount || undefined,
            maturityPeriod: maturityPeriod || undefined,
            savingType: savingType || undefined
          };

          const data = await SavingAPI.searchSavings(searchParams);
          setFilteredSavings(data);
        } else {
          setFilteredSavings(savings);
        }
        setCurrentPage(0);
      } catch (err) {
        console.error('Error filtering savings:', err);
        setError('데이터 필터링 중 문제가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredSavings();
  }, [interestRateRange, primeRate, debouncedMinAmount, maturityPeriod, savingType, savings]);

  if (loading) return <p className="saving-loading-state">로딩 중입니다...</p>;
  if (error) return <p className="saving-error-state">{error}</p>;
  if (!savings || savings.length === 0) {
    return <p className="saving-empty-state">표시할 적금 상품이 없습니다.</p>;
  }

  const totalPages = Math.ceil(filteredSavings.length / itemsPerPage);
  const handlePageClick = (pageIndex) => {
    setCurrentPage(pageIndex);
    sessionStorage.setItem('savingPage', pageIndex);
  };

  const startIndex = currentPage * itemsPerPage;
  const currentItems = filteredSavings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="saving-container">
      <div className="filter-container">
        <input
          type="number"
          className="filter-input"
          placeholder="최소 이자율"
          value={interestRateRange.min}
          onChange={(e) => setInterestRateRange({ ...interestRateRange, min: e.target.value })}
        />
        <input
          type="number"
          className="filter-input"
          placeholder="최대 이자율"
          value={interestRateRange.max}
          onChange={(e) => setInterestRateRange({ ...interestRateRange, max: e.target.value })}
        />
        <input
          type="number"
          className="filter-input"
          placeholder="우대 이자율"
          value={primeRate}
          onChange={(e) => setPrimeRate(e.target.value)}
        />
        <input
          type="number"
          className="filter-input"
          placeholder="최소 예치금"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
        />
        <select
          className="filter-select"
          onChange={(e) => setMaturityPeriod(e.target.value)}
          value={maturityPeriod}
        >
          <option value="">예치 기간</option>
          <option value="6">6개월</option>
          <option value="12">12개월</option>
          <option value="24">24개월</option>
          <option value="36">36개월</option>
        </select>
        <select
          className="filter-select"
          onChange={(e) => setSavingType(e.target.value)}
          value={savingType}
        >
          <option value="">단리/복리</option>
          <option value="simple">단리</option>
          <option value="compound">복리</option>
        </select>
        <button
          onClick={resetFilters}
          className="filter-reset-btn"
        >
          필터 초기화
        </button>
      </div>

      <div className="saving-product-grid">
        {currentItems.map((saving) => {
          const isJoined = joinedProducts.includes(saving.savingProductId);

          return (
            <div
              key={saving.savingProductId}
              className={`saving-product-card ${isJoined ? 'joined' : ''}`}
              onClick={() => navigate(`/saving/${saving.savingProductId}`)}
            >
              {isJoined && (
                <div className="saving-joined-badge">
                  가입완료
                </div>
              )}
              <h3 className="saving-product-title">{saving.savingProductName}</h3>
              <p className="saving-product-period">{saving.savingMaturityPeriod}개월</p>
              <p className="saving-product-rate">이율: {saving.savingBaseInterestRate}%</p>
            </div>
          );
        })}
      </div>

      <div className="saving-pagination-wrap">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(index)}
            className={`saving-pagination-btn ${
              index === currentPage ? 'saving-pagination-btn--active' : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Saving;