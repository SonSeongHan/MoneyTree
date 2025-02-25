import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/home.css";
import "../../css/recommends/Stock.css";
import "../../css/recommends/Fund.css";
import homeman from "../../image/homeman.png";
import news1 from "../../image/news1.jpg";
import news2 from "../../image/news2.jpg";
import news3 from "../../image/news3.jpg";
import mainprom1 from "../../image/mainprom1.JPG"
import mainprom2 from "../../image/mainprom2.JPG"
import mainprom3 from "../../image/mainprom3.JPG"
import mainprom4 from "../../image/mainprom4.JPG"
import mainprom5 from "../../image/mainprom5.JPG"


import { getCookie } from "../../util/cookieUtil";
import DepositAPI from "../../api/DepositAPI";
import SavingAPI from "../../api/SavingAPI";
import FundAPI from "../../api/FundAPI";

// 주식, 펀드 컴포넌트
import Stock from "../../components/recommends/Stock";
import Fund from "../../components/recommends/Fund";


/** 시작일과 종료일을 기준으로 진행도를 계산 (0~100%) */
function getProgressRate(startDateStr, endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const now = new Date();
    const totalDuration = endDate - startDate;
    const passed = now - startDate;

    if (totalDuration <= 0) return 0;
    let progress = Math.floor((passed / totalDuration) * 100);
    if (progress < 0) progress = 0;
    if (progress > 100) progress = 100;
    return progress;
}

function Home() {
    // 회원 관련 및 예금/적금
    const [membershipType, setMembershipType] = useState("none");
    const [userName, setUserName] = useState("손님");
    const [depositAccounts, setDepositAccounts] = useState([]);
    const [depositProducts, setDepositProducts] = useState({});
    const [savingAccounts, setSavingAccounts] = useState([]);
    const [savingProducts, setSavingProducts] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 주식/펀드 탭
    const [currentTab, setCurrentTab] = useState("stock");

    // 추천 슬라이드 (예금/적금)
    const [topDeposits, setTopDeposits] = useState([]);
    const [topSavings, setTopSavings] = useState([]);
    const [recommendedPage, setRecommendedPage] = useState(0);

    // 내가 가입한 예금/적금 슬라이더
    const [currentSlide, setCurrentSlide] = useState(0);

    // 1) 쿠키 확인 및 예금/적금 조회
    useEffect(() => {
        const memberCookie = getCookie("member");
        if (memberCookie) {
            setUserName(memberCookie.member_name || "손님");
            setMembershipType(memberCookie.membershipType || "none");

            const fetchData = async () => {
                setLoading(true);
                try {
                    const [depositAccRes, depositProdRes, savingAccRes, savingProdRes] =
                        await Promise.all([
                            DepositAPI.getMyDepositAccounts(),
                            DepositAPI.getAllDeposits(),
                            SavingAPI.getMySavingAccounts(),
                            SavingAPI.getAllSavingProducts(),
                        ]);

                    // (예금) 실제 가입 계좌
                    setDepositAccounts(depositAccRes.accounts || []);
                    // 예금 상품 매핑
                    const depMap = {};
                    depositProdRes.forEach((p) => {
                        depMap[p.depositProductId] = p;
                    });
                    setDepositProducts(depMap);

                    // (적금) 실제 가입 계좌
                    setSavingAccounts(savingAccRes.accounts || []);
                    // 적금 상품 매핑
                    const savMap = {};
                    savingProdRes.forEach((p) => {
                        savMap[p.savingProductId] = p;
                    });
                    setSavingProducts(savMap);
                } catch (err) {
                    setError("정보를 불러오는데 실패했습니다.");
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            // 비회원 처리
            setUserName("손님");
            setMembershipType("none");
        }
    }, []);

    // 2) 인기 예금/적금 4개 조회
    useEffect(() => {
        const fetchTopDeposits = async () => {
            try {
                const depositList = await DepositAPI.getAllDeposits();
                setTopDeposits(depositList.slice(0, 4));
            } catch (err) {}
        };
        fetchTopDeposits();
    }, []);

    useEffect(() => {
        const fetchTopSavings = async () => {
            try {
                const savingList = await SavingAPI.getAllSavingProducts();
                setTopSavings(savingList.slice(0, 4));
            } catch (err) {}
        };
        fetchTopSavings();
    }, []);

    // 펀드 페이지 당 표시개수 수정
    useEffect(() => {
        const originalGetFundsByPage = FundAPI.getFundsByPage;
        FundAPI.getFundsByPage = (page, limit) => {
            return originalGetFundsByPage(page, 10);
        };
    }, []);

    const promoData = [
        {
            category: "정기결제",
            title: "잊기 쉬운 생활요금 납부",
            description: "자동납부로 편리하게 이용하세요.",
            icon: "📅🔔", // 캘린더 + 알림 아이콘
        },
        {
            category: "자동차",
            title: "차 살 때 더 좋은 혜택",
            description: "신차/중고차 구매 계획이 있으시다면",
            icon: "🚗", // 자동차 아이콘
        },
    ];



    // 슬라이드용 (예금/적금 통합)
    const combinedAccounts = [
        ...depositAccounts.map((acc) => ({ ...acc, productType: "deposit" })),
        ...savingAccounts.map((acc) => ({ ...acc, productType: "saving" })),
    ];
    const maxSlide = combinedAccounts.length - 1;

    const handlePrevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
    };
    const handleNextSlide = () => {
        if (currentSlide < maxSlide) setCurrentSlide(currentSlide + 1);
    };

    // 추천상품 슬라이드
    const handlePrevRecommended = () => {
        if (recommendedPage > 0) setRecommendedPage(recommendedPage - 1);
    };
    const handleNextRecommended = () => {
        if (recommendedPage < 1) setRecommendedPage(recommendedPage + 1);
    };

    /** (A) 가입상품(예금/적금) 섹션 렌더링 */
    function renderDepositSavingSection() {
        if (membershipType === "FullMember") {
            return (
                <>
                    {combinedAccounts.length === 0 ? (
                        <div className="placeholder-box">
                            <p>가입된 예금/적금이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="slider-container">
                            <button
                                className="slider_button prev"
                                onClick={handlePrevSlide}
                                disabled={currentSlide === 0}
                            >
                                &lt;
                            </button>
                            <div className="slider-wrapper">
                                <div
                                    className="slider"
                                    style={{
                                        transform: `translateX(-${currentSlide * 100}%)`,
                                    }}
                                >
                                    {combinedAccounts.map((acc) => {
                                        const progress = getProgressRate(
                                            acc.depositStartDate || acc.savingStartDate,
                                            acc.depositEndDate || acc.savingEndDate
                                        );
                                        if (acc.productType === "deposit") {
                                            const product = depositProducts[acc.depositProductId];
                                            return (
                                                <div
                                                    key={`deposit-${acc.depositAccountNumber}`}
                                                    className="slider-item product-section top-product-box"
                                                >
                                                    <div className="top-product-left">
                                                        <h3 className="product-title">
                                                            {product?.depositProductName || "예금상품"}
                                                        </h3>
                                                        <ul className="product-info-list">
                                                            <li>
                                                                <p>투자금액</p> {acc.depositAmount.toLocaleString()}원
                                                            </li>
                                                            <li>
                                                                <p>투자기간</p>{" "}
                                                                {new Date(acc.depositStartDate).toLocaleDateString()} ~{" "}
                                                                {new Date(acc.depositEndDate).toLocaleDateString()} / 3년
                                                            </li>
                                                            <li>
                                                                <p>중도 해지금리</p> {product?.cancelInterestRate || "1.4%"}
                                                            </li>
                                                            <li>
                                                                <p>최종 이율</p> {product?.interestRate || "5.8%"}
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="top-product-right">
                                                        <div
                                                            className="donut-chart"
                                                            style={{
                                                                background: `conic-gradient(#3e5eb8 0% ${progress}%, #ddd ${progress}% 100%)`,
                                                            }}
                                                        >
                                                            <div className="donut-inner">{progress}%</div>
                                                        </div>
                                                        <p className="donut-text">투자 진행도</p>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            const product = savingProducts[acc.savingProductId];
                                            return (
                                                <div
                                                    key={`saving-${acc.savingAccountNumber}`}
                                                    className="slider-item product-section top-product-box"
                                                >
                                                    <div className="top-product-left">
                                                        <h3 className="product-title">
                                                            {product?.savingProductName || "적금상품"}
                                                        </h3>
                                                        <ul className="product-info-list">
                                                            <li>
                                                                <p>적립금액</p>{" "}
                                                                {acc.savingDepositAmount.toLocaleString()}원
                                                            </li>
                                                            <li>
                                                                <p>투자기간</p>{" "}
                                                                {new Date(acc.savingStartDate).toLocaleDateString()} ~{" "}
                                                                {new Date(acc.savingEndDate).toLocaleDateString()} / 1년
                                                            </li>
                                                            <li>
                                                                <p>중도 해지금리</p>{" "}
                                                                {product?.cancelInterestRate || "1.2%"}
                                                            </li>
                                                            <li>
                                                                <p>최종 이율</p> {product?.interestRate || "4.5%"}
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="top-product-right">
                                                        <div
                                                            className="donut-chart"
                                                            style={{
                                                                background: `conic-gradient(#3e5eb8 0% ${progress}%, #ddd ${progress}% 100%)`,
                                                            }}
                                                        >
                                                            <div className="donut-inner">{progress}%</div>
                                                        </div>
                                                        <p className="donut-text">투자 진행도</p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                            <button
                                className="slider_button next"
                                onClick={handleNextSlide}
                                disabled={currentSlide >= maxSlide}
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </>
            );
        }
        return (
            <div className="placeholder-box" style={{ height: "200px", position: "relative" }}>
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        background: "#e5e5e5",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2rem",
                        color: "#999",
                    }}
                >
                    +
                </div>
                <div
                    style={{
                        position: "absolute",
                        top: "40%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#333",
                        fontWeight: "bold",
                        padding: "10px 20px",
                        borderRadius: "8px",
                    }}
                >
                    계좌 개설 후 이용 가능합니다
                </div>
            </div>
        );
    }

    return (
        <div className="home-container">
            <main>
                {/* (1) 상단 환영 섹션 */}
                <section className="welcome-section">
                    <h2>
                        안녕하세요 <span className="username">{userName}</span>님
                    </h2>
                    {loading && <p>로딩 중...</p>}
                    {membershipType === "FullMember" && error && (
                        <p style={{ color: "red" }}>{error}</p>
                    )}
                    {renderDepositSavingSection()}
                </section>

                {/*
                프로모션
                */}
                <section className="finance-promo-section">
                    <div style={{display: "flex", justifyContent: "space-between"}}>

                        {/* 왼쪽: 장기카드대출 */}
                        <img
                            src={mainprom1}
                            alt="상품 이미지"
                            style={{marginTop: "10px"}}
                        />

                        {/* 오른쪽: 10시 일일특가 */}

                        <img
                            src={mainprom2}
                            alt="상품 이미지"
                            style={{marginTop: "10px"}}
                        />
                    </div>


                    {/* 아래 여러 프로모션 박스들 */}
                    <div className="finance-promo-bottom">
                        <div className="promo-box" style={{background: "#F3F6FB"}}>
                            <img src={mainprom3} alt="피자 프로모션"/>

                            <div style={{height:"70px"}}>
                                <p>나무은행 카드로 피자먹자</p>
                                <p>~ 2022.12.31</p>
                            </div>
                        </div>

                        <div className="promo-box" style={{background: "#F3F6FB"}}>
                            <img src={mainprom4} alt="자동차 캐시백"/>
                            <div>
                            <p>자동차 구매할 때 캐쉬백, 포인트 받아요</p>
                            <p>~ 2022.12.31</p>
                            </div>
                        </div>

                        <div className="promo-box" style={{background: "#F3F6FB"}}>
                            <img src={mainprom5} alt="나무카드할부"/>
                            <p>60까지 이자율 할인 오토 카드할부</p>
                            <p>~ 2022.12.31</p>
                        </div>
                        <div className="promo-container">
                            {promoData.map((item, index) => (
                                <div key={index} className="promo-card">
                                    {/* 아이콘 영역 */}
                                    <div className="promo-icon">{item.icon}</div>
                                    {/* 텍스트 영역 */}
                                    <div className="promo-text">
                                        <span className="promo-category">{item.category}</span>
                                        <h3 className="promo-title">{item.title}</h3>
                                        <p className="promo-description">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* (3) 추천 상품 (예금/적금) */}
                <section
                    className={
                        recommendedPage === 0
                            ? "recommended-section recommended-deposit-bg"
                            : "recommended-section recommended-saving-bg"
                    }
                >
                    <div className="recommended-back">
                        <div className="recommended-text">
                            <h3>JM 고객님의 성향에 맞는 BEST 인기상품</h3>
                            {recommendedPage === 0 && (
                                <Link to="/deposit-products" className="view-more-link">
                                    예금상품보기
                                </Link>
                            )}
                            {recommendedPage === 1 && (
                                <Link to="/saving-products" className="view-more-link">
                                    적금상품보기
                                </Link>
                            )}
                        </div>
                        <div className="recommended-content">
                            <div className="recommended-manimg">
                                <img src={homeman} alt="홈맨" />
                            </div>
                            <div className="recommended-illustration" />
                            <div className="product-cards">
                                {recommendedPage === 0 &&
                                    topDeposits.map((dep) => (
                                        <div key={dep.depositProductId} className="product-card">
                                            <p className="product-name">{dep.depositProductName}</p>
                                            <p className="product-interest">
                                                연 {dep.depositBaseInterestRate}%
                                            </p>
                                        </div>
                                    ))}
                                {recommendedPage === 1 &&
                                    topSavings.map((sav) => (
                                        <div key={sav.savingProductId} className="product-card">
                                            <p className="product-name">{sav.savingProductName}</p>
                                            <p className="product-interest">
                                                연 {sav.savingBaseInterestRate}%
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div className="recommended-pagination-wrap">
                            <button
                                className="arrow-button"
                                onClick={handlePrevRecommended}
                                disabled={recommendedPage === 0}
                            >
                                &lt;
                            </button>
                            <div className="slider-area">
                                <div className="slider-dots">
                                    <div
                                        className={`dot ${recommendedPage === 0 ? "active" : ""}`}
                                        onClick={() => setRecommendedPage(0)}
                                    />
                                    <div
                                        className={`dot ${recommendedPage === 1 ? "active" : ""}`}
                                        onClick={() => setRecommendedPage(1)}
                                    />
                                </div>
                            </div>
                            <button
                                className="arrow-button"
                                onClick={handleNextRecommended}
                                disabled={recommendedPage === 1}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </section>

                {/* (4) 금융 뉴스 */}
                <section className="news-section">
                    <h2>금융 뉴스</h2>
                    <div
                        className="news-item"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "1rem 0",
                        }}
                    >
                        <div className="news-content" style={{ width: "70%" }}>
                            <h3>승승금융, 장애아동 보조기구 지원...</h3>
                            <p>
                                그룹 회장은 전날 열린 학습 보조기구 전달식에 참석해
                                "장애를 극복하고자 노력하는 아동...
                            </p>
                            <p style={{ marginTop: "8px" }}>- 네이버 뉴스</p>
                        </div>
                        <div
                            className="news-thumbnail"
                            style={{
                                width: "100px",
                                height: "100px",
                                background: `url(${news1}) no-repeat center/cover`,
                            }}
                        />
                    </div>

                    <div
                        className="news-item"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "1rem 0",
                        }}
                    >
                        <div className="news-content" style={{ width: "70%" }}>
                            <h3>업비트 제재심 관련 답변하는 위원장</h3>
                            <p>
                                금융휘원장이 18일 서울 여의도 국회에서 열린 정무위원회
                                제422회국회 제1차 전체회의에 출석해...
                            </p>
                            <p style={{ marginTop: "8px" }}>- 네이버 뉴스</p>
                        </div>
                        <div
                            className="news-thumbnail"
                            style={{
                                width: "100px",
                                height: "100px",
                                background: `url(${news2}) no-repeat center/cover`,
                            }}
                        />
                    </div>

                    <div
                        className="news-item"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "1rem 0",
                        }}
                    >
                        <div className="news-content" style={{ width: "70%" }}>
                            <h3>롯데멤버스 AI 서비스 '세그먼트 랩' 혁신서비스</h3>
                            <p>
                                롯데 멤버스는 트렌드 분석 인공지능(AI) 서비스 '세그먼트 랩'
                                이 지난달 금융위원회 혁신금융서비스로 지정됐다고...
                            </p>
                            <p style={{ marginTop: "8px" }}>- 네이버 뉴스</p>
                        </div>
                        <div
                            className="news-thumbnail"
                            style={{
                                width: "100px",
                                height: "100px",
                                background: `url(${news3}) no-repeat center/cover`,
                            }}
                        />
                    </div>
                </section>

                {/* (5) 주식 & 펀드 섹션 */}
                <div className="stock-bg">
                    <section className="stock-section">
                        <h3>주식 / 펀드 정보</h3>
                        <div className="stock-fund-radio-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="stockOrFund"
                                    value="stock"
                                    checked={currentTab === "stock"}
                                    onChange={() => setCurrentTab("stock")}
                                />
                                주식
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="stockOrFund"
                                    value="fund"
                                    checked={currentTab === "fund"}
                                    onChange={() => setCurrentTab("fund")}
                                />
                                펀드
                            </label>
                        </div>
                        <div className="stock-list">
                            {currentTab === "stock" ? (
                                <Stock showFilter={false} limit={10} />
                            ) : (
                                <Fund showFilter={false} limit={10} />
                            )}
                        </div>
                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "20px",
                                marginBottom: "10px",
                            }}
                        >
                            <Link to="/products/fund-stock">
                                <button className="fund-add-bt">더 보기 (10/30) +</button>
                            </Link>
                        </div>
                    </section>
                </div>

                {/* (6) 취미 섹션 - 누구나 볼 수 있음 */}
                <section className="hobbies-preview-section">
                    <h3>취미로 삶의 활력을 더해보세요!</h3>
                    <div className="hobbies-preview-box">
                        <p>
                            다양한 취미 활동을 통해 스트레스를 해소하고, 새로운 인연을 만들어 보세요.
                            <br />
                            아래 버튼을 클릭하여 취미 페이지에서 자세한 정보를 확인해 보실 수 있습니다.
                        </p>
                        <Link to="/hobbies" className="hobbies-link">
                            취미 페이지로 이동
                        </Link>
                    </div>
                </section>
            </main>

            {/* 푸터 */}
            <footer className="home-footer">
                <div className="footer-links">
                    <span>고객센터 | 공지사항 | 개인정보처리방침 | ...</span>
                </div>
                <p>Copyright © JM Bank. All Rights Reserved.</p>
            </footer>
        </div>
    );
}

export default Home;
