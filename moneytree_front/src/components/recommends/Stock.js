import React, { useEffect, useState, useRef } from 'react';
import StockAPI from '../../api/StockAPI';
import '../../css/recommends/Stock.css';

const Stock = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const observer = useRef(null);
  const [expandedStocks, setExpandedStocks] = useState({});

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const data = await StockAPI.getStocksByPage(page, itemsPerPage);
        if (data.length === 0) return; // 👉 더 이상 데이터가 없으면 추가 중지
        setStocks((prev) => [...prev, ...data.filter(stock =>
          !prev.some(existing => existing.stockProductId === stock.stockProductId)
        )]); // 👉 중복 방지
      } catch (err) {
        console.error('Error fetching stocks: ', err);
        setError('주식 데이터를 가져오는 중 문제가 발생하였습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [page]);

  const lastStockElementRef = (node) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && stocks.length >= page * itemsPerPage) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  };

  const toggleExpand = (stockId) => {
    setExpandedStocks((prev) => ({ ...prev, [stockId]: !prev[stockId] }));
  };

  if (loading) return <p className="stock-loading-state">로딩 중입니다...</p>;
  if (error) return <p className="stock-error-state">{error}</p>;
  if (!stocks || stocks.length === 0) {
    return <p className="stock-empty-state">표시할 주식 상품이 없습니다.</p>;
  }

  return (
    <div className="stock-container">
      <div className="stock-list">
        {stocks.map((stock, index) => (
          <div
            key={stock.stockProductId}
            className="stock-item-container"
            ref={index === stocks.length - 1 ? lastStockElementRef : null}
          >
            <div className="stock-item">
              <div className="stock-rank">{index + 1}</div>
              <div className="stock-name">{stock.stockProductName}</div>
              <div className="stock-price">{stock.stockClosingPrice.toLocaleString()} 원</div>
              <div className={`stock-change ${stock.stockFluctuationRate >= 0 ? 'stock-positive' : 'stock-negative'}`}>
                {stock.stockFluctuationRate >= 0 ? '+' : ''}{stock.stockFluctuationRate.toFixed(2)}%
              </div>
              <button
                className={`stock-expand-btn ${expandedStocks[stock.stockProductId] ? 'expanded' : ''}`}
                onClick={() => toggleExpand(stock.stockProductId)}
              >
                {expandedStocks[stock.stockProductId] ? '-' : '+'}
              </button>
            </div>

            {expandedStocks[stock.stockProductId] && (
              <div className="stock-details">
                <div className="stock-details-grid">
                  <div className="stock-detail-item">
                    <span className="stock-detail-label">시장</span>
                    <span className="stock-detail-value">{stock.stockMarketCategory}</span>
                  </div>
                  <div className="stock-detail-item">
                    <span className="stock-detail-label">시가</span>
                    <span className="stock-detail-value">{stock.stockOpeningPrice.toLocaleString()} 원</span>
                  </div>
                  <div className="stock-detail-item">
                    <span className="stock-detail-label">고가</span>
                    <span className="stock-detail-value">{stock.stockHighestPrice.toLocaleString()} 원</span>
                  </div>
                  <div className="stock-detail-item">
                    <span className="stock-detail-label">저가</span>
                    <span className="stock-detail-value">{stock.stockLowestPrice.toLocaleString()} 원</span>
                  </div>
                  <div className="stock-detail-item">
                    <span className="stock-detail-label">거래량</span>
                    <span className="stock-detail-value">{stock.stockTradingVolume.toLocaleString()}</span>
                  </div>
                  <div className="stock-detail-item">
                    <span className="stock-detail-label">거래대금</span>
                    <span className="stock-detail-value">{stock.stockTradingValue.toLocaleString()} 원</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stock;