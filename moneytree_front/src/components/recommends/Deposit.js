import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DepositAPI from '../../api/DepositAPI';
import '../../css/recommends/Deposit.css';

const Deposit = () => {
  const [deposits, setDeposits] = useState([]);
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(() => {
    return Number(sessionStorage.getItem('depositPage')) || 0;
  });

  const [interestRateRange, setInterestRateRange] = useState({ min: '', max: '' });
  const [primeRate, setPrimeRate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maturityPeriod, setMaturityPeriod] = useState('');
  const [depositType, setDepositType] = useState('');

  // 필터 초기화 함수 추가
  const resetFilters = () => {
    setInterestRateRange({ min: '', max: '' });
    setPrimeRate('');
    setMinAmount('');
    setMaturityPeriod('');
    setDepositType('');
  };

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const data = await DepositAPI.getAllDeposits();
        setDeposits(data);
        setFilteredDeposits(data);
      } catch (err) {
        console.error('Error fetching deposits: ', err);
        setError('예금 데이터를 가져오는 중 문제가 발생하였습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDeposits();
  }, []);

  useEffect(() => {
    let filtered = deposits;

    if (interestRateRange.min || interestRateRange.max) {
      filtered = filtered.filter(d =>
        (!interestRateRange.min || d.depositBaseInterestRate >= parseFloat(interestRateRange.min)) &&
        (!interestRateRange.max || d.depositBaseInterestRate <= parseFloat(interestRateRange.max))
      );
    }

    if (primeRate) {
      filtered = filtered.filter(d => d.depositPrimeInterestRate >= parseFloat(primeRate));
    }

    if (minAmount) {
      filtered = filtered.filter(d => d.depositMinAmount >= parseFloat(minAmount));
    }

    if (maturityPeriod) {
      filtered = filtered.filter(d => d.depositMaturityPeriod === parseInt(maturityPeriod));
    }

    if (depositType) {
      filtered = filtered.filter(d => d.depositInterestRateType === depositType || d.depositInterestRateType === (depositType === 'simple' ? '단리' : '복리'));
    }

    setFilteredDeposits(filtered);
    setCurrentPage(0);
  }, [interestRateRange, primeRate, minAmount, maturityPeriod, depositType, deposits]);

  if (loading) return <p className="dep-loading-state">로딩 중입니다...</p>;
  if (error) return <p className="dep-error-state">{error}</p>;
  if (!deposits || deposits.length === 0) {
    return <p className="dep-empty-state">표시할 예금 상품이 없습니다.</p>;
  }

  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);
  const handlePageClick = (pageIndex) => {
    setCurrentPage(pageIndex);
    sessionStorage.setItem('depositPage', pageIndex);
  };

  const startIndex = currentPage * itemsPerPage;
  const currentItems = filteredDeposits.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="dep-container">
      <div className="dep-filter-box">
        <input
          type="number"
          placeholder="이자율 최소"
          value={interestRateRange.min}
          onChange={(e) => setInterestRateRange({ ...interestRateRange, min: e.target.value })}
        />
        <input
          type="number"
          placeholder="이자율 최대"
          value={interestRateRange.max}
          onChange={(e) => setInterestRateRange({ ...interestRateRange, max: e.target.value })}
        />
        <input
          type="number"
          placeholder="우대 이자율"
          value={primeRate}
          onChange={(e) => setPrimeRate(e.target.value)}
        />
        <input
          type="number"
          placeholder="최소 예치 금액"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
        />
        <select onChange={(e) => setMaturityPeriod(e.target.value)} value={maturityPeriod}>
          <option value="">예치 기간</option>
          <option value="6">6개월</option>
          <option value="12">12개월</option>
          <option value="24">24개월</option>
          <option value="36">36개월</option>
        </select>
        <select onChange={(e) => setDepositType(e.target.value)} value={depositType}>
          <option value="">단리/복리</option>
          <option value="simple">단리</option>
          <option value="compound">복리</option>
        </select>
        {/* 초기화 버튼 추가 */}
        <button
          onClick={resetFilters}
          className="dep-filter-reset-btn"
        >
          필터 초기화
        </button>
      </div>

      <div className="dep-product-grid">
        {currentItems.map((deposit) => (
          <div
            key={deposit.depositProductId}
            className="dep-product-card"
            onClick={() => navigate(`/deposit/${deposit.depositProductId}`)}
          >
            <h3 className="dep-product-title">{deposit.depositProductName}</h3>
            <p className="dep-product-period">{deposit.depositMaturityPeriod}개월</p>
            <p className="dep-product-rate">이율: {deposit.depositBaseInterestRate}%</p>
          </div>
        ))}
      </div>
      <div className="dep-pagination-wrap">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(index)}
            className={`dep-pagination-btn ${
              index === currentPage ? 'dep-pagination-btn--active' : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Deposit;