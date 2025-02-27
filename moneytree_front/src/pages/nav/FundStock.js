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
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 주식 계좌 정보 확인
  useEffect(() => {
    checkStockAccount();
  }, []);

  // 주식 계좌 확인 함수
  const checkStockAccount = async () => {
    try {
      setLoading(true);
      const memberCookie = getCookie('member');
      if (!memberCookie) {
        navigate('/loginpage');
        return;
      }

      const dandwAcId = await StockAPI.getDandwacAccountNumber(memberCookie.memberId);

      if (dandwAcId) {
        const stockAccountInfo = await StockAPI.getStockAccount(dandwAcId);
        setStockAccount(stockAccountInfo);
      } else {
        setStockAccount(null);
      }
    } catch (err) {
      console.error('주식 계좌 확인 중 오류:', err);
      setStockAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = async (tab) => {
    if (tab === 'stock') {
      setLoading(true);
      try {
        await checkStockAccount();
        // 여기에서 stockAccount 상태를 직접 사용하지 않고 API 호출 결과 값을 활용
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

        // 계좌가 있으면 탭 변경
        setActiveTab(tab);
      } catch (err) {
        console.error('주식 탭 전환 중 오류:', err);
      } finally {
        setLoading(false);
      }
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
        <img className="fundstock-man"
             src={stockman}
             alt="설명"
        />
      </div>

      <div className="fundstock-tabs-container">
        <button
          onClick={() => handleTabClick('fund')}
          className={`fundstock-tab-btn ${activeTab === 'fund' ? 'fundstock-tab-btn--active' : ''}`}
          disabled={loading}
        >
          펀드
        </button>
        <button
          onClick={() => handleTabClick('stock')}
          className={`fundstock-tab-btn ${activeTab === 'stock' ? 'fundstock-tab-btn--active' : ''}`}
          disabled={loading}
        >
          주식
        </button>
      </div>

      <div className="fundstock-content-area">
        {loading ? (
          <div className="loading-indicator">로딩 중...</div>
        ) : (
          activeTab === 'fund' ? <Fund searchQuery={searchQuery}/> : <Stock/>
        )}
      </div>
    </div>
  );
}

export default FundStock;