import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllDeposits } from '../../api/DepositAPI';

const Deposit = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8; // 한 페이지에 표시할 아이템 수
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const data = await fetchAllDeposits();
        setDeposits(data);
      } catch (err) {
        console.error('Error fetching deposits : ', err);
        setError('예금 데이터를 가져오는 중 문제가 발생하였습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDeposits();
  }, []);

  if (loading) return <p>로딩 중입니다...</p>;
  if (error) return <p>{error}</p>;
  if (!deposits || deposits.length === 0) {
    return <p>표시할 예금 상품이 없습니다.</p>;
  }

  const totalPages = Math.ceil(deposits.length / itemsPerPage);

  const handlePageClick = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  const startIndex = currentPage * itemsPerPage;
  const currentItems = deposits.slice(startIndex, startIndex + itemsPerPage);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)', // 2열로 변경
    gap: '20px',
    padding: '20px 300px', // 양 옆 공간 추가
  };

  const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    gap: '10px',
  };

  const pageButtonStyle = (isActive) => ({
    width: isActive ? '30px' : '20px',
    height: '20px',
    borderRadius: '10px',
    backgroundColor: isActive ? '#007BFF' : '#ddd',
    border: 'none',
    cursor: 'pointer',
    transition: 'width 0.3s ease',
  });

  const itemStyle = {
    cursor: 'pointer',
    border: '1px solid #ddd',
    borderRadius: '30px', // 사각형 모서리를 둥글게
    padding: '40px', // 크기를 키움
    textAlign: 'center',
    width: '500px',
    height: '100px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
  };

  const itemHoverStyle = {
    transform: 'scale(1.05)',
  };

  return (
    <div>
      <div style={gridStyle}>
        {currentItems.map((deposit) => (
          <div
            key={deposit.depositProductId}
            onClick={() => navigate(`/deposit/${deposit.depositProductId}`)}
            style={itemStyle}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(`/deposit/${deposit.depositProductId}`);
            }}
          >
            <h3 style={{ fontSize: '16px', margin: '0' }}>{deposit.depositProductName}</h3>
            <p style={{ fontSize: '14px', margin: '5px 0' }}>{deposit.depositMaturityPeriod}개월</p>
            <p style={{ fontSize: '14px', margin: '0' }}>이율: {deposit.depositBaseInterestRate}%</p>
          </div>
        ))}
      </div>
      <div style={paginationStyle}>
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(index)}
            style={pageButtonStyle(index === currentPage)}
          />
        ))}
      </div>
    </div>
  );
};

export default Deposit;
