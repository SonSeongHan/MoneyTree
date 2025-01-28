import React, { useState } from 'react';
import Deposit from '../../components/recommends/Deposit';

function DepositSaving() {
  const [activeTab, setActiveTab] = useState('deposit'); // Default tab is 'deposit'

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      {/* 상단 문구 */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1>오늘의 작은 시작이 내일의 큰 꿈을 만듭니다</h1>
        <p>지금 적금으로 미래를 설계하세요</p>
      </div>

      {/* 검색창 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="적금을 검색하세요"
          style={{ width: '300px', padding: '10px', borderRadius: '15px', border: '1px solid #ddd' }}
        />
        <button
          style={{ padding: '10px', marginLeft: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#007BFF', color: 'white' }}
        >
          검색
        </button>
      </div>

      {/* 탭 전환 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => handleTabClick('deposit')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            border: 'none',
            borderBottom: activeTab === 'deposit' ? '2px solid #007BFF' : 'none',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'deposit' ? 'bold' : 'normal',
          }}
        >
          예금
        </button>
        <button
          onClick={() => handleTabClick('saving')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'saving' ? '2px solid #007BFF' : 'none',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'saving' ? 'bold' : 'normal',
          }}
        >
          적금
        </button>
      </div>

      {/* 탭 내용 */}
      <div>
        {activeTab === 'deposit' ? (
          <div>
            <Deposit rows={4} columns={2} />
          </div>
        ) : (
          <div>
            <h2>정기 적금 상품</h2>
            <p>적금 데이터 준비 중...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DepositSaving;