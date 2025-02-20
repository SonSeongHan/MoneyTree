import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';
import StockAPI from '../../api/StockAPI';
import Fund from '../../components/recommends/Fund';
import Stock from '../../components/recommends/Stock';

function FundStock() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('fund');
  const [stockAccount, setStockAccount] = useState(null);

  // 주식 계좌 확인 함수 추가
  const checkStockAccount = async () => {
    try {
      const memberCookie = getCookie('member');
      if (!memberCookie) {
        navigate('/loginpage');
        return;
      }

      const dandwAcId = await StockAPI.getDandwacAccountNumber(memberCookie.memberId);
      if (!dandwAcId) {
        setStockAccount(null);
      } else {
        const stockAccountInfo = await StockAPI.getStockAccount(dandwAcId);
        setStockAccount(stockAccountInfo);
      }
    } catch (err) {
      console.error('주식 계좌 확인 중 오류:', err);
    }
  };

  const handleTabClick = async (tab) => {
    if (tab === 'stock') {
      try {
        const memberCookie = getCookie('member');
        if (!memberCookie) {
          navigate('/loginpage');
          return;
        }

        const dandwAcId = await StockAPI.getDandwacAccountNumber(memberCookie.memberId);
        if (!dandwAcId) {
          navigate('/create-stock-account');
          return;
        }

        const stockAccountInfo = await StockAPI.getStockAccount(dandwAcId);
        if (!stockAccountInfo) {
          navigate('/create-stock-account');
          return;
        }

        setStockAccount(stockAccountInfo);
        setActiveTab(tab);
      } catch (err) {
        console.error('주식 계좌 확인 중 오류:', err);
      }
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="fundstock-page-container">
      <div className="fundstock-header">
        <h1 className="fundstock-main-title">미래를 위한 투자, 지금 시작하세요</h1>
        <p className="fundstock-subtitle">펀드와 주식을 비교하고 선택하세요</p>
      </div>

      <div className="fundstock-search-wrap">
        <input
          type="text"
          placeholder="펀드를 검색하세요"
          className="fundstock-search-input"
        />
        <button className="fundstock-search-btn">
          검색
        </button>
      </div>

      <div className="fundstock-tabs-container">
        <button
          onClick={() => handleTabClick('fund')}
          className={`fundstock-tab-btn ${
            activeTab === 'fund' ? 'fundstock-tab-btn--active' : ''
          }`}
        >
          펀드
        </button>
        <button
          onClick={() => handleTabClick('stock')}
          className={`fundstock-tab-btn ${
            activeTab === 'stock' ? 'fundstock-tab-btn--active' : ''
          }`}
        >
          주식
        </button>
      </div>

      <div className="fundstock-content-area">
        {activeTab === 'fund' ? <Fund /> : <Stock />}
      </div>
    </div>
  );
}

export default FundStock;