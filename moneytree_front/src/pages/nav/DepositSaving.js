import React, { useState } from 'react';
import Deposit from '../../components/recommends/Deposit';
import '../../css/recommends/DepositSaving.css';
import Saving from '../../components/recommends/Saving';
import mainman from '../../image/homeman.png'


function DepositSaving() {
    const [activeTab, setActiveTab] = useState('deposit');
    const [searchQuery, setSearchQuery] = useState('');
    // 실제 Deposit 컴포넌트에 전달할 검색어 (검색 버튼 클릭 시 업데이트)
    const [appliedSearchQuery, setAppliedSearchQuery] = useState('');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearch = () => {
        // 검색 버튼 클릭 또는 엔터 키 입력 시 appliedSearchQuery 업데이트
        setAppliedSearchQuery(searchQuery);
    };

    // 엔터 키 이벤트 핸들러
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
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
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
                <button className="depsav-search-btn" onClick={handleSearch}>
                    검색
                </button>
            </div>
            <img className="depositsaviong-man"
                src={mainman}
                alt="설명"

            />
            <div className="depsav-tabs-container">
                <button
                    onClick={() => handleTabClick('deposit')}
                    className={`depsav-tab-btn ${activeTab === 'deposit' ? 'depsav-tab-btn--active' : ''}`}
                >
                    예금
                </button>
                <button
                    onClick={() => handleTabClick('saving')}
                    className={`depsav-tab-btn ${activeTab === 'saving' ? 'depsav-tab-btn--active' : ''}`}
                >
                    적금
                </button>
            </div>

            <div className="depsav-content-area">
                {activeTab === 'deposit' ? (
                    <div>
                        <Deposit searchQuery={appliedSearchQuery}/>
                    </div>
                ) : (
                    <div>
                        <Saving searchQuery={appliedSearchQuery}/>
                    </div>
                )}
            </div>

        </div>
    );
}

export default DepositSaving;
