import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SavingAPI from '../../api/SavingAPI';
import '../../css/recommends/Saving.css';

const Saving = () => {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(
    parseInt(sessionStorage.getItem('savingPage'), 10) || 0
  );
  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const data = await SavingAPI.getAllSavingProducts();
        setSavings(data);
      } catch (err) {
        console.error('Error fetching savings: ', err);
        setError('적금 데이터를 가져오는 중 문제가 발생하였습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchSavings();
  }, []);

  useEffect(() => {
    sessionStorage.setItem('savingPage', currentPage);
  }, [currentPage]);

  if (loading) return <p className="saving-loading-state">로딩 중입니다...</p>;
  if (error) return <p className="saving-error-state">{error}</p>;
  if (!savings || savings.length === 0) {
    return <p className="saving-empty-state">표시할 적금 상품이 없습니다.</p>;
  }

  const totalPages = Math.ceil(savings.length / itemsPerPage);
  const handlePageClick = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  const startIndex = currentPage * itemsPerPage;
  const currentItems = savings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="saving-container">
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
