import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';
import StockAPI from '../../api/StockAPI';
import Fund from '../../components/recommends/Fund';
import Stock from '../../components/recommends/Stock';
import stockman from  '../../image/stockman.png';

function FundStock() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('fund');
  const [stockAccount, setStockAccount] = useState(null);
  const [searchInput, setSearchInput] = useState(''); // 입력 중인 값
  const [searchQuery, setSearchQuery] = useState(''); // 실제 검색에 사용되는 값
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);

  // 주식 계좌 확인 함수
  const checkStockAccount = async () => {
    try {
      setIsCheckingAccount(true);
      const memberCookie = getCookie('member');
      if (!memberCookie) {
        navigate('/loginpage');
        return false;
      }

      const dandwAcId = await StockAPI.getDandwacAccountNumber(memberCookie.memberId);
      if (!dandwAcId) {
        setStockAccount(null);
        return false;
      } else {
        const stockAccountInfo = await StockAPI.getStockAccount(dandwAcId);
        setStockAccount(stockAccountInfo);
        return true;
      }
    } catch (err) {
      console.error('주식 계좌 확인 중 오류:', err);
      return false;
    } finally {
      setIsCheckingAccount(false);
    }
  };

  // 컴포넌트 마운트 시 계좌 확인
  useEffect(() => {
    if (activeTab === 'stock') {
      checkStockAccount();
    }
  }, [activeTab]);

  const handleTabClick = async (tab) => {
    if (tab === 'stock') {
      setIsCheckingAccount(true);
      const hasAccount = await checkStockAccount();

      if (!hasAccount) {
        navigate('/create-stock-account');
        return;
      }
      setActiveTab(tab);
    } else {
      setActiveTab(tab);
    }
  };

  // 검색 버튼 클릭 시 검색어 상태 업데이트
  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  // 엔터키 입력 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="fundstock-search-btn" onClick={handleSearch}>
          검색
        </button>
        <img
          src={stockman}
          alt="설명"
          style={{
            position: 'absolute',
            width: '360px',
            left: '65%',
            top: '170px',
            zIndex:'-100'
          }}
        />

      </div>

      <div className="fundstock-tabs-container">
        <button
          onClick={() => handleTabClick('fund')}
          className={`fundstock-tab-btn ${activeTab === 'fund' ? 'fundstock-tab-btn--active' : ''}`}
        >
          펀드
        </button>
        <button
          onClick={() => handleTabClick('stock')}
          className={`fundstock-tab-btn ${activeTab === 'stock' ? 'fundstock-tab-btn--active' : ''}`}
          disabled={isCheckingAccount}
        >
          주식
        </button>
      </div>

      <div className="fundstock-content-area">
        {activeTab === 'fund' ? <Fund searchQuery={searchQuery}/> : <Stock/>}
      </div>
    </div>

  );
}

export default FundStock;