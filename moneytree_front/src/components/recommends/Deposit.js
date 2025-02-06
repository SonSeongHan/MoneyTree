import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DepositAPI from '../../api/DepositAPI';
import '../../css/recommends/Deposit.css';

const Deposit = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  // 세션 스토리지에서 저장된 페이지 인덱스를 불러오기 (없으면 0)
  const [currentPage, setCurrentPage] = useState(() => {
    return Number(sessionStorage.getItem('depositPage')) || 0;
  });

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const data = await DepositAPI.getAllDeposits();
        setDeposits(data);
      } catch (err) {
        console.error('Error fetching deposits: ', err);
        setError('예금 데이터를 가져오는 중 문제가 발생하였습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDeposits();
  }, []);

  if (loading) return <p className="dep-loading-state">로딩 중입니다...</p>;
  if (error) return <p className="dep-error-state">{error}</p>;
  if (!deposits || deposits.length === 0) {
    return <p className="dep-empty-state">표시할 예금 상품이 없습니다.</p>;
  }

  const totalPages = Math.ceil(deposits.length / itemsPerPage);

  // 페이지 변경 시 세션 스토리지에 저장
  const handlePageClick = (pageIndex) => {
    setCurrentPage(pageIndex);
    sessionStorage.setItem('depositPage', pageIndex);
  };

  const startIndex = currentPage * itemsPerPage;
  const currentItems = deposits.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="dep-container">
      <div className="dep-product-grid">
        {currentItems.map((deposit) => (
          <div
            key={deposit.depositProductId}
            className="dep-product-card"
            onClick={() => {
              sessionStorage.setItem('depositPage', currentPage); // 현재 페이지 저장
              navigate(`/deposit/${deposit.depositProductId}`);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sessionStorage.setItem('depositPage', currentPage);
                navigate(`/deposit/${deposit.depositProductId}`);
              }
            }}
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
