import React, { useState } from 'react';
import Fund from '../../components/recommends/Fund';
// import '../../css/recommends/FundStock.css';
//import Stock from '../../components/recommends/Stock';

function FundStock() {
  const [activeTab, setActiveTab] = useState('fund');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
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
        <Fund />
      </div>
    </div>
  );
}

export default FundStock;
