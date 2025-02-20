import React, { useState, useEffect } from 'react';
import { getCookie } from '../util/cookieUtil';
import StockAPI from '../api/StockAPI';
import '../css/StockTradeModal.css';

const StockTradeModal = ({ isOpen, onClose, stockProduct }) => {
  // 상태 관리
  const [quantity, setQuantity] = useState(1);
  const [stockAccount, setStockAccount] = useState(null);
  const [holdings, setHoldings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 계좌 정보 불러오기
  const fetchAccountInfo = async (dandwAcId) => {
    try {
      const stockAccountInfo = await StockAPI.getStockAccount(dandwAcId);
      setStockAccount(stockAccountInfo);

      const holdingsInfo = await StockAPI.getStockHoldings(stockAccountInfo.stockAccountNumber);
      setHoldings(holdingsInfo);

      return { stockAccountInfo, holdingsInfo };
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      if (!isOpen) return;

      setLoading(true);
      try {
        const memberCookie = getCookie('member');
        if (!memberCookie) {
          throw new Error('로그인이 필요합니다.');
        }

        const dandwAcId = await StockAPI.getDandwacAccountNumber(memberCookie.memberId);
        if (!dandwAcId) {
          throw new Error('입출금 계좌를 찾을 수 없습니다.');
        }

        await fetchAccountInfo(dandwAcId);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [isOpen]);

  // 수량 변경 핸들러
  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
  };

  // 총 거래금액 계산
  const calculateTotal = () => {
    if (!stockProduct) return 0;
    return stockProduct.stockClosingPrice * quantity;
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    setQuantity(1);
    setError(null);
    onClose();
  };

  // 매수/매도 핸들러
  const handleTrade = async (type) => {
    try {
      const dandwAcId = await StockAPI.getDandwacAccountNumber(getCookie('member').memberId);

      if (type === 'buy') {
        await StockAPI.buyStock(
          stockAccount.stockAccountNumber,
          stockProduct.stockProductId,
          quantity,
          stockProduct.stockClosingPrice
        );
        alert('매수가 완료되었습니다.');
      } else {
        await StockAPI.sellStock(
          stockAccount.stockAccountNumber,
          stockProduct.stockProductId,
          quantity
        );
        alert('매도가 완료되었습니다.');
      }

      // 거래 후 즉시 계좌 정보 새로고침
      await fetchAccountInfo(dandwAcId);
    } catch (err) {
      alert(err.message || '거래 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  // 로딩 상태
  if (loading) return (
    <div className="stock-trade-modal-overlay">
      <div className="stock-trade-modal-loading">
        <p>로딩 중...</p>
      </div>
    </div>
  );

  // 에러 상태
  if (error) return (
    <div className="stock-trade-modal-overlay">
      <div className="stock-trade-modal-error">
        <p className="stock-trade-modal-error-message">{error}</p>
        <button onClick={handleClose} className="stock-trade-modal-close-btn">
          닫기
        </button>
      </div>
    </div>
  );

  // 현재 보유 주식 찾기
  const currentHolding = holdings?.find(h => h.stockProductId === stockProduct.stockProductId);

  return (
    <div className="stock-trade-modal-overlay">
      <div className="stock-trade-modal-container">
        {/* 헤더 섹션 */}
        <div className="stock-trade-modal-header">
          <div>
            <h2 className="stock-trade-modal-title">{stockProduct.stockProductName}</h2>
            <p className="stock-trade-modal-market">{stockProduct.stockMarketCategory}</p>
          </div>
          <button
            onClick={handleClose}
            className="stock-trade-modal-close-btn"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 가격 정보 섹션 */}
        <div className="stock-trade-modal-price-section">
          <div>
            <p className="stock-trade-modal-price-label">현재가</p>
            <p className="stock-trade-modal-price-value">
              {stockProduct?.stockClosingPrice.toLocaleString()}원
            </p>
          </div>
          <div>
            <p className="stock-trade-modal-price-label">등락률</p>
            <p className={`stock-trade-modal-price-value ${
              stockProduct.stockFluctuationRate >= 0
                ? 'stock-trade-modal-price-up'
                : 'stock-trade-modal-price-down'
            }`}>
              {stockProduct.stockFluctuationRate >= 0 ? '+' : ''}
              {stockProduct.stockFluctuationRate}%
              <span>
                ({stockProduct.stockPriceDifference >= 0 ? '+' : ''}
                {stockProduct.stockPriceDifference.toLocaleString()})
              </span>
            </p>
          </div>
        </div>

        {/* 계좌 정보 섹션 */}
        <div className="stock-trade-modal-account-section">
          <div className="stock-trade-modal-account-row">
            <span className="stock-trade-modal-account-label">계좌번호</span>
            <span className="stock-trade-modal-account-value">
              {stockAccount?.stockAccountNumber}
            </span>
          </div>
          <div className="stock-trade-modal-account-row">
            <span className="stock-trade-modal-account-label">보유잔고</span>
            <span className="stock-trade-modal-account-value">
              {stockAccount?.stockAccountBalance.toLocaleString()}원
            </span>
          </div>
          {currentHolding && (
            <div className="stock-trade-modal-account-row">
              <span className="stock-trade-modal-account-label">보유수량</span>
              <span className="stock-trade-modal-account-value">
                {currentHolding.stockHoldingQuantity.toLocaleString()}주
              </span>
            </div>
          )}
        </div>

        {/* 주문 수량 섹션 */}
        <div className="stock-trade-modal-quantity-section">
          <div className="stock-trade-modal-quantity-controls">
            <button
              className="stock-trade-modal-quantity-btn"
              onClick={() => handleQuantityChange(-1)}
            >
              -
            </button>
            <span className="stock-trade-modal-quantity-value">{quantity}주</span>
            <button
              className="stock-trade-modal-quantity-btn"
              onClick={() => handleQuantityChange(1)}
            >
              +
            </button>
          </div>
          <div className="stock-trade-modal-total">
            <p className="stock-trade-modal-total-label">총 거래금액</p>
            <p className="stock-trade-modal-total-value">
              {calculateTotal().toLocaleString()}원
            </p>
          </div>
        </div>

        {/* 매수/매도 버튼 섹션 */}
        <div className="stock-trade-modal-actions">
          <button
            className="stock-trade-modal-buy-btn"
            onClick={() => handleTrade('buy')}
            disabled={calculateTotal() > (stockAccount?.stockAccountBalance || 0)}
          >
            매수
          </button>
          <button
            className="stock-trade-modal-sell-btn"
            onClick={() => handleTrade('sell')}
            disabled={!currentHolding || currentHolding.stockHoldingQuantity < quantity}
          >
            매도
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockTradeModal;