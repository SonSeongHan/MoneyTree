import React, { useState } from 'react';
import Deposit from '../../components/recommends/Deposit';
import '../../css/recommends/DepositSaving.css';
import Saving from '../../components/recommends/Saving';

function DepositSaving() {
  const [activeTab, setActiveTab] = useState('deposit');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="depsav-page-container">
      <div className="depsav-header">
        <h1 className="depsav-main-title">오늘의 작은 시작이 내일의 큰 꿈을 만듭니다</h1>
        <p className="depsav-subtitle">지금 적금으로 미래를 설계하세요</p>
      </div>

      <div className="depsav-search-wrap">
        <input
          type="text"
          placeholder="적금을 검색하세요"
          className="depsav-search-input"
        />
        <button className="depsav-search-btn">
          검색
        </button>
      </div>

      <div className="depsav-tabs-container">
        <button
          onClick={() => handleTabClick('deposit')}
          className={`depsav-tab-btn ${
            activeTab === 'deposit' ? 'depsav-tab-btn--active' : ''
          }`}
        >
          예금
        </button>
        <button
          onClick={() => handleTabClick('saving')}
          className={`depsav-tab-btn ${
            activeTab === 'saving' ? 'depsav-tab-btn--active' : ''
          }`}
        >
          적금
        </button>
      </div>

      <div className="depsav-content-area">
        {activeTab === 'deposit' ? (
          <div>
            <Deposit />
          </div>
        ) : (
          <div>
            <Saving />
          </div>
        )}
      </div>
    </div>
  );
}

export default DepositSaving;