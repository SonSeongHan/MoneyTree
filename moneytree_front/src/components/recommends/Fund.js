import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FundAPI from '../../api/FundAPI';
// import '../../css/recommends/Fund.css';

const Fund = () => {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const observer = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const data = await FundAPI.getAllFunds();
        setFunds((prevFunds) => [...prevFunds, ...data]);
      } catch (err) {
        console.error('Error fetching funds: ', err);
        setError('펀드 데이터를 가져오는 중 문제가 발생하였습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchFunds();
  }, [page]);

  const lastFundElementRef = (node) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  };

  if (loading) return <p className="fund-loading-state">로딩 중입니다...</p>;
  if (error) return <p className="fund-error-state">{error}</p>;
  if (!funds || funds.length === 0) {
    return <p className="fund-empty-state">표시할 펀드 상품이 없습니다.</p>;
  }

  return (
    <div className="fund-container">
      <div className="fund-list">
        {funds.map((fund, index) => (
          <div
            key={fund.fundProductId}
            className="fund-item"
            onClick={() => navigate(`/fund/${fund.fundProductId}`)}
            ref={index === funds.length - 1 ? lastFundElementRef : null}
          >
            <h3 className="fund-title">{fund.fundProductName}</h3>
            <p className="fund-manager">운용사: {fund.fundProductManager}</p>
            <p className="fund-amount">총 투자 금액: {fund.fundProductTotalAmount.toLocaleString()} 원</p>
            <p className="fund-fee">운용 보수: {fund.fundProductManagementFee}%</p>
            <p className="fund-redemption">환매 수수료: {fund.fundProductRedemptionFee}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fund;
