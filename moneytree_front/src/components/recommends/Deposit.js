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
  const [debouncedMinAmount, setDebouncedMinAmount] = useState(''); // ✅ 디바운싱 추가
  const [maturityPeriod, setMaturityPeriod] = useState('');
  const [depositType, setDepositType] = useState('');

  // 필터 초기화 함수
  const resetFilters = () => {
    setInterestRateRange({ min: '', max: '' });
    setPrimeRate('');
    setMinAmount('');
    setDebouncedMinAmount(''); // ✅ 디바운싱 변수도 초기화
    setMaturityPeriod('');
    setDepositType('');
  };

  // 초기 데이터 로드
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

  // ✅ 디바운싱 적용 (minAmount 입력 후 500ms 뒤에 적용)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMinAmount(minAmount);
    }, 500); // 500ms 뒤에 반영

    return () => clearTimeout(handler); // 이전 타이머 제거
  }, [minAmount]);

  // 필터링 로직
  useEffect(() => {
    const fetchFilteredDeposits = async () => {
      try {
        setLoading(true);

        // 필터 조건이 하나라도 있는 경우에만 검색 API 사용
        if (interestRateRange.min || interestRateRange.max || primeRate ||
          debouncedMinAmount || maturityPeriod || depositType) {
          const searchParams = {
            minInterestRate: interestRateRange.min || undefined,
            maxInterestRate: interestRateRange.max || undefined,
            primeRate: primeRate || undefined,
            minAmount: debouncedMinAmount || undefined, // ✅ 디바운싱된 값 사용
            maturityPeriod: maturityPeriod || undefined,
            depositType: depositType || undefined
          };

          const data = await DepositAPI.searchDeposits(searchParams);
          setFilteredDeposits(data);
        } else {
          // 필터가 없는 경우 전체 목록 사용
          setFilteredDeposits(deposits);
        }
        setCurrentPage(0);
      } catch (err) {
        console.error('Error filtering deposits:', err);
        setError('데이터 필터링 중 문제가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredDeposits();
  }, [interestRateRange, primeRate, debouncedMinAmount, maturityPeriod, depositType, deposits]);

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
          onChange={(e) => setDepositType(e.target.value)}
          value={depositType}
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