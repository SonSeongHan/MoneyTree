import React from "react";
import "../css/home.css";

// 이미지 import
import main2 from "../image/main2.png";
import man1 from  "../image/man.png"
import iconEnvelope from "../image/main2.png";
import fundCard from "../image/fund.JPG"; // ETF 카드 이미지 (텍스트 포함)

const LandingPage = () => {
    return (
        <div className="landing-container">
            {/* 자산관리 섹션 (첫 번째) */}
            <section className="asset-management-section">
                <div className="text-area">
                    <h2>자산관리</h2>
                    <p>
                        필요한 때 내 모든 자산을 조회하고<br/>
                        한 번에 관리할 수 있어요.<br/>
                        카카오페이만 믿음 놓고 자산관리하세요.
                    </p>
                </div>
                <img className="main1_man" src={man1} alt="자산관리 예시화면"/>
            </section>


            {/* “이렇게 쓰세요” 섹션 */}
            <section className="guide-section">
                <div className="feature-box">
                    <div className="feature-text">
                        <h4>금융일정을 빠짐없이</h4>
                        <p>
                            지난달 거래부터 다가오는 일정까지<br/>
                            한 번에 확인하세요.
                        </p>
                    </div>
                </div>
            </section>

            {/* 송금봉투 섹션 */}
            <section className="envelope-section">
                <h3 className="section-title">송금봉투에 마음을 담아</h3>
                <p>돈과 함께 감사, 축하, 위로 전하기</p>
                <div className="envelope-image">
                    <img src={iconEnvelope} alt="봉투 아이콘"/>
                </div>
            </section>

            {/* 자산관리 섹션 (두 번째) */}
            <section className="asset-management-section second">
                <div className="text-area">
                    <h2>자산관리</h2>
                    <p>
                        필요한 때 내 모든 자산 조회하고<br/>
                        한 번에 관리할 수 있어요.<br/>
                        카카오페이로 마음 놓고 자산관리하세요.
                    </p>
                </div>
                <div className="image-area">
                    <img src={main2} alt="자산관리 예시화면"/>
                </div>
            </section>

            {/* ETF 트렌드 섹션 */}
            <section className="etf-section">
                <div className="etf-header">
                    <span className="step-num">01.</span>
                    <h3>회원들의 리뷰 </h3>
                    <p>지금 가장 핫한 ETF를 만나보세요.</p>
                </div>
                <div className="fund-image-grid">
                    {/* 위 3개 / 아래 3개 총 6장 */}
                    <img src={fundCard} alt="ETF 카드"/>
                    <img src={fundCard} alt="ETF 카드"/>
                    <img src={fundCard} alt="ETF 카드"/>
                    <img src={fundCard} alt="ETF 카드"/>
                    <img src={fundCard} alt="ETF 카드"/>
                    <img src={fundCard} alt="ETF 카드"/>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
