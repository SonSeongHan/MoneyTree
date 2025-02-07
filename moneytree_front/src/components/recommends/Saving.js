import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SavingAPI from '../../api/SavingAPI';
import '../../css/recommends/Saving.css';

const Saving = () => {
  const [savings, setSavings] = useState([]);
  const [filteredSavings, setFilteredSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(
    parseInt(sessionStorage.getItem('savingPage'), 10) || 0
  );
  const itemsPerPage = 8;
  const navigate = useNavigate();

  // 필터 상태 추가
  const [interestRateRange, setInterestRateRange] = useState({ min: '', max: '' });
  const [primeRate, setPrimeRate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maturityPeriod, setMaturityPeriod] = useState('');
  const [savingType, setSavingType] = useState('');

  // 필터 초기화 함수
  const resetFilters = () => {
    setInterestRateRange({ min: '', max: '' });
    setPrimeRate('');
    setMinAmount('');
    setMaturityPeriod('');
    setSavingType('');
  };

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const data = await SavingAPI.getAllSavingProducts();
        setSavings(data);
        setFilteredSavings(data);
      } catch (err) {
        console.error('Error fetching savings: ', err);
        setError('적금 데이터를 가져오는 중 문제가 발생하였습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchSavings();
  }, []);

  // 필터링 로직 추가
  useEffect(() => {
    let filtered = savings;

    if (interestRateRange.min || interestRateRange.max) {
      filtered = filtered.filter(s =>
        (!interestRateRange.min || s.savingBaseInterestRate >= parseFloat(interestRateRange.min)) &&
        (!interestRateRange.max || s.savingBaseInterestRate <= parseFloat(interestRateRange.max))
      );
    }

    if (primeRate) {
      filtered = filtered.filter(s => s.savingPrimeInterestRate >= parseFloat(primeRate));
    }

    if (minAmount) {
      filtered = filtered.filter(s => s.savingMinAmount >= parseFloat(minAmount));
    }

    if (maturityPeriod) {
      filtered = filtered.filter(s => s.savingMaturityPeriod === parseInt(maturityPeriod));
    }

    if (savingType) {
      filtered = filtered.filter(s => s.savingInterestRateType === savingType ||
        s.savingInterestRateType === (savingType === 'simple' ? '단리' : '복리'));
    }

    setFilteredSavings(filtered);
    setCurrentPage(0);
  }, [interestRateRange, primeRate, minAmount, maturityPeriod, savingType, savings]);

  useEffect(() => {
    sessionStorage.setItem('savingPage', currentPage);
  }, [currentPage]);

  if (loading) return <p className="saving-loading-state">로딩 중입니다...</p>;
  if (error) return <p className="saving-error-state">{error}</p>;
  if (!savings || savings.length === 0) {
    return <p className="saving-empty-state">표시할 적금 상품이 없습니다.</p>;
  }

  const totalPages = Math.ceil(filteredSavings.length / itemsPerPage);
  const handlePageClick = (pageIndex) => {
    setCurrentPage(pageIndex);
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
        {currentItems.map((saving) => (
          <div
            key={saving.savingProductId}
            className="saving-product-card"
            onClick={() => navigate(`/saving/${saving.savingProductId}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(`/saving/${saving.savingProductId}`);
            }}
          >
            <h3 className="saving-product-title">{saving.savingProductName}</h3>
            <p className="saving-product-period">{saving.savingMaturityPeriod}개월</p>
            <p className="saving-product-rate">이율: {saving.savingBaseInterestRate}%</p>
          </div>
        ))}
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