import React, { useEffect, useState } from 'react';
import Fund from '../../components/recommends/Fund';
import Stock from '../../components/recommends/Stock';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFund } from '../../FundContext';

function FundStock() {
  const location = useLocation(); //(승훈 추가)
  const navigate = useNavigate(); //(승훈 추가) URL 변경을 위한 추가
  const queryParams = new URLSearchParams(location.search); //(승훈 추가)

  const initialTab = queryParams.get('tab') || 'fund'; //(승훈 추가) URL의 tab값 가져오기
  const selectedFundId = queryParams.get('selectedFundId');

  const [activeTab, setActiveTab] = useState(initialTab); //(승훈 추가 수정) 챗봇에서 요청으로 fund와 stock을 구분해서 탭을 구분해서 보여줌
  const { setSelectedFundId, isChatbotRequest, setIsChatbotRequest } = useFund();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (selectedFundId && isChatbotRequest) {
      console.log(` 챗봇 요청으로 펀드 ${selectedFundId} 페이지로 이동`);
      setSelectedFundId(selectedFundId);
      setActiveTab('fund'); // ✅ 탭 강제 설정
      setIsChatbotRequest(true);
    }
  }, [selectedFundId, isChatbotRequest]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    navigate(`/products/fund-stock?tab=${tab}`); //  URL 변경
  };

  return (
    <div className="fundstock-page-container">
      <div className="fundstock-header">
        <h1 className="fundstock-main-title">미래를 위한 투자, 지금 시작하세요</h1>
        <p className="fundstock-subtitle">펀드와 주식을 비교하고 선택하세요</p>
      </div>

      <div className="fundstock-search-wrap">
        <input type="text" placeholder="펀드를 검색하세요" className="fundstock-search-input" />
        <button className="fundstock-search-btn">검색</button>
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
          className={`fundstock-tab-btn ${
            activeTab === 'stock' ? 'fundstock-tab-btn--active' : ''
          }`}
        >
          주식
        </button>
      </div>

      <div className="fundstock-content-area">
        {activeTab === 'fund' ? <Fund selectedFundId={selectedFundId} /> : <Stock />}
      </div>
    </div>
  );
}

export default FundStock;
