import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "../../css/home.css";
import "../../css/recommends/Stock.css";
import "../../css/recommends/Fund.css";
import SpendingDonutChart from "../../SpendingDonutChart";
import homeman from "../../image/homeman.png";
import news1 from "../../image/news1.jpg";
import news2 from "../../image/news2.jpg";
import news3 from "../../image/news3.jpg";
import { getCookie } from "../../util/cookieUtil";
import DepositAPI from "../../api/DepositAPI";
import SavingAPI from "../../api/SavingAPI";
import StockAPI from "../../api/StockAPI";
import FundAPI from "../../api/FundAPI";
import TransactionHistoryAPI from "../../api/TransactionHistoryAPI";

/** 날짜로 진행도 계산 (퍼센트) */
function getProgressRate(startDateStr, endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const now = new Date();
    const total = endDate - startDate;
    const passed = now - startDate;
    if (total <= 0) return 0;
    let progress = Math.floor((passed / total) * 100);
    if (progress < 0) progress = 0;
    if (progress > 100) progress = 100;
    return progress;
}

function Home() {
    const [membershipType, setMembershipType] = useState("none");
    const [userName, setUserName] = useState("손님");
    const [depositAccounts, setDepositAccounts] = useState([]);
    const [depositProducts, setDepositProducts] = useState({});
    const [savingAccounts, setSavingAccounts] = useState([]);
    const [savingProducts, setSavingProducts] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 주식/펀드 관련
    const [displayStocks, setDisplayStocks] = useState([]);
    const [stockLoading, setStockLoading] = useState(false);
    const [stockError, setStockError] = useState(null);
    const [expandedStockId, setExpandedStockId] = useState(null);

    const [funds, setFunds] = useState([]);
    const [fundLoading, setFundLoading] = useState(false);
    const [fundError, setFundError] = useState(null);
    const [expandedFundId, setExpandedFundId] = useState(null);
    const [fundDetail, setFundDetail] = useState(null);

    // 탭 전환 (주식/펀드)
    const [currentTab, setCurrentTab] = useState("stock");

    // 소비내역
    const [monthlySpending, setMonthlySpending] = useState(0);
    const [spendingDetails, setSpendingDetails] = useState([]);

    // 차트에 넘길 데이터
    const chartData = spendingDetails.map((item) => ({
        name: item.category,
        value: item.amount,
    }));

    // 추천 슬라이드
    const [topDeposits, setTopDeposits] = useState([]);
    const [topSavings, setTopSavings] = useState([]);
    const [recommendedPage, setRecommendedPage] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);

    // 1) 쿠키 확인 & 예금/적금 조회
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

                    // 실제 가입 계좌
                    setDepositAccounts(depositAccRes.accounts || []);
                    // 예금 상품 매핑
                    const depMap = {};
                    depositProdRes.forEach((p) => {
                        depMap[p.depositProductId] = p;
                    });
                    setDepositProducts(depMap);

                    // 실제 가입 계좌
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
            // 비회원
            setUserName("손님");
            setMembershipType("none");
        }
    }, []);

    // 2) 인기 예금/적금 4개
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

    // 3) 주식 10개 & 펀드 10개
    const fetchStocks = useCallback(async () => {
        try {
            setStockLoading(true);
            setStockError(null);
            const data = await StockAPI.getStocksByPage(1, 10);
            setDisplayStocks(data.slice(0, 10));
        } catch (err) {
            console.error("Error fetching stocks:", err);
            setStockError("주식 데이터를 가져오는 중 문제가 발생했습니다.");
        } finally {
            setStockLoading(false);
        }
    }, []);

    const toggleStockExpand = useCallback((stockId) => {
        setExpandedStockId((prev) => (prev === stockId ? null : stockId));
    }, []);

    const fetchFunds = useCallback(async () => {
        try {
            setFundLoading(true);
            setFundError(null);
            const data = await FundAPI.getAllFunds();
            setFunds(data.slice(0, 10));
        } catch (err) {
            console.error("Error fetching funds:", err);
            setFundError("펀드 데이터를 가져오는 중 문제가 발생했습니다.");
        } finally {
            setFundLoading(false);
        }
    }, []);

    const toggleFundExpand = useCallback(
        async (fundId) => {
            if (expandedFundId === fundId) {
                setExpandedFundId(null);
                setFundDetail(null);
            } else {
                try {
                    const detail = await FundAPI.getFundById(fundId);
                    setFundDetail(detail);
                    setExpandedFundId(fundId);
                } catch (err) {
                    console.error("Error fetching fund details:", err);
                }
            }
        },
        [expandedFundId]
    );

    useEffect(() => {
        fetchStocks();
        fetchFunds();
    }, [fetchStocks, fetchFunds]);

    // 4) 소비내역
    const memberCookie = getCookie("member");
    const memberId = memberCookie ? memberCookie.memberId : null;

    useEffect(() => {
        if (memberId && membershipType === "FullMember") {
            // 정회원만 실제 소비내역 가져온다 (예시)
            async function fetchTransactions() {
                try {
                    const transactions = await TransactionHistoryAPI.getTransactionsForMember(memberId, 1);
                    let totalSpending = 0;
                    let categoryMap = {};

                    transactions.forEach((tx) => {
                        if (
                            tx.transactionType === "송금" ||
                            tx.transactionType === "식사" ||
                            tx.transactionType === "취미" ||
                            tx.transactionType === "병원" ||
                            tx.transactionType === "교통" ||
                            tx.transactionType === "기타"
                        ) {
                            const amount = Number(tx.amount);
                            totalSpending += amount;
                            const category = tx.transactionType;
                            categoryMap[category] = (categoryMap[category] || 0) + amount;
                        }
                    });

                    const details = Object.entries(categoryMap).map(([category, amount]) => ({
                        category,
                        amount,
                        ratio: totalSpending > 0 ? ((amount / totalSpending) * 100).toFixed(2) : "0.00",
                    }));

                    setMonthlySpending(totalSpending);
                    setSpendingDetails(details);
                } catch (err) {
                    console.error("Error fetching transaction histories", err);
                }
            }
            fetchTransactions();
        } else if (membershipType === "SimpleMember") {
            // 간편회원은 가짜 데이터로 표시
            setMonthlySpending(2806891); // 예시: 2,806,891원
            setSpendingDetails([
                { category: "식비", amount: 1500000 },
                { category: "교통", amount: 500000 },
                { category: "기타", amount: 806891 },
            ]);
        }
    }, [memberId, membershipType]);

    // 숫자/포맷 유틸
    const toLocale = (num) => (num ? num.toLocaleString() : "");
    const formatAmount = (amount) => {
        if (!amount) return "-";
        return (amount / 100000000).toFixed(1) + "억";
    };
    const formatPercentage = (val) => {
        if (!val) return "-";
        return (val * 100).toFixed(2) + "%";
    };

    /** (A) 가입상품(예금/적금) 섹션 렌더 */
    function renderDepositSavingSection() {
        // 정회원
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
                                            const progress = getProgressRate(
                                                acc.savingStartDate,
                                                acc.savingEndDate
                                            );
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

        // 간편회원(SimpleMember)일 경우
        return (
            <div className="placeholder-box" style={{ height: "200px", position: "relative" }}>
                {/* 원하는 스타일로 크게 박스 + 플러스 기호 표시 */}
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
                {/* 가운데 “계좌 개설 후 이용 가능합니다” 문구 */}
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

    /** (B) 이번달 소비내역 섹션 렌더 */
    function renderSpendingSection() {
        // 정회원
        if (membershipType === "FullMember") {
            return (
                <div className="spending-content">
                    <div className="pie-chart">
                        <SpendingDonutChart data={chartData} total={monthlySpending} />
                    </div>
                </div>
            );
        }

        // 간편회원
        return (
            <div className="spending-content" style={{ position: "relative" }}>
                {/* 더미 차트 */}
                <div className="pie-chart">
                    <SpendingDonutChart data={chartData} total={monthlySpending} />
                </div>

                {/* 오버레이 문구 */}
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "rgba(0, 0, 0, 0.4)",
                        padding: "130px 560px",
                        borderRadius: "8px",
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        color: "#333",
                        whiteSpace: "nowrap",
                    }}
                >
                    <p>계좌 개설 후 이용 가능합니다</p>
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

                    {/* 정회원일 때만 에러 표시 */}
                    {membershipType === "FullMember" && error && (
                        <p style={{ color: "red" }}>{error}</p>
                    )}

                    {/* (A) 가입상품(예금/적금) 영역 */}
                    {renderDepositSavingSection()}
                </section>

                {/* (2) 이번달 소비내역 섹션 */}
                <section className="spending-section">
                    <h3>이번달의 소비내역</h3>
                    {renderSpendingSection()}
                </section>

                {/* (3) 추천 상품 */}
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

                {/* (5) 주식 & 펀드 */}
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

                        {/* 주식 탭 */}
                        {currentTab === "stock" && (
                            <>
                                {stockLoading && displayStocks.length === 0 && (
                                    <p className="stock-loading-state">로딩 중입니다...</p>
                                )}
                                {stockError && <p className="stock-error-state">{stockError}</p>}
                                {!stockLoading && !stockError && displayStocks.length === 0 && (
                                    <p className="stock-empty-state">
                                        표시할 주식 상품이 없습니다.
                                    </p>
                                )}

                                <div className="stock-list">
                                    {displayStocks.map((stock, index) => (
                                        <div
                                            key={stock.stockProductId}
                                            className="stock-item-container"
                                        >
                                            <div className="stock-item">
                                                <div className="stock-rank">{index + 1}</div>
                                                <div className="stock-name">{stock.stockProductName}</div>
                                                <div className="stock-price">
                                                    {toLocale(stock.stockClosingPrice)} 원
                                                </div>
                                                <div
                                                    className={`stock-change ${
                                                        stock.stockFluctuationRate >= 0
                                                            ? "stock-positive"
                                                            : "stock-negative"
                                                    }`}
                                                >
                                                    {stock.stockFluctuationRate >= 0 ? "+" : ""}
                                                    {stock.stockFluctuationRate.toFixed(2)}%
                                                </div>
                                                <button
                                                    className={`stock-expand-btn ${
                                                        expandedStockId === stock.stockProductId
                                                            ? "expanded"
                                                            : ""
                                                    }`}
                                                    onClick={() => toggleStockExpand(stock.stockProductId)}
                                                >
                                                    {expandedStockId === stock.stockProductId ? "-" : "+"}
                                                </button>
                                            </div>

                                            {expandedStockId === stock.stockProductId && (
                                                <div className="stock-details">
                                                    <div className="stock-details-grid">
                                                        <div className="stock-detail-item">
                                                            <span className="stock-detail-label">시장</span>
                                                            <span className="stock-detail-value">
                                {stock.stockMarketCategory}
                              </span>
                                                        </div>
                                                        <div className="stock-detail-item">
                                                            <span className="stock-detail-label">시가</span>
                                                            <span className="stock-detail-value">
                                {toLocale(stock.stockOpeningPrice)} 원
                              </span>
                                                        </div>
                                                        <div className="stock-detail-item">
                                                            <span className="stock-detail-label">고가</span>
                                                            <span className="stock-detail-value">
                                {toLocale(stock.stockHighestPrice)} 원
                              </span>
                                                        </div>
                                                        <div className="stock-detail-item">
                                                            <span className="stock-detail-label">저가</span>
                                                            <span className="stock-detail-value">
                                {toLocale(stock.stockLowestPrice)} 원
                              </span>
                                                        </div>
                                                        <div className="stock-detail-item">
                                                            <span className="stock-detail-label">거래량</span>
                                                            <span className="stock-detail-value">
                                {toLocale(stock.stockTradingVolume)}
                              </span>
                                                        </div>
                                                        <div className="stock-detail-item">
                                                            <span className="stock-detail-label">거래대금</span>
                                                            <span className="stock-detail-value">
                                {toLocale(stock.stockTradingValue)} 원
                              </span>
                                                        </div>
                                                        <div className="stock-detail-item">
                                                            <span className="stock-detail-label">시가총액</span>
                                                            <span className="stock-detail-value">
                                {(
                                    stock.stockMarketCapitalization / 100000000
                                )
                                    .toFixed(0)
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                                억원
                              </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* 펀드 탭 */}
                        {currentTab === "fund" && (
                            <>
                                {fundLoading && funds.length === 0 && (
                                    <p className="fund-loading-state">로딩 중입니다...</p>
                                )}
                                {fundError && <p className="fund-error-state">{fundError}</p>}
                                {!fundLoading && !fundError && funds.length === 0 && (
                                    <p className="fund-empty-state">
                                        표시할 펀드 상품이 없습니다.
                                    </p>
                                )}

                                <div className="fund-list">
                                    {funds.map((fund, index) => (
                                        <div key={fund.fundProductId} className="fund-item-container">
                                            <div className="fund-item">
                                                <div className="fund-item-left">
                                                    <div className="fund-item-icon">🏢</div>
                                                    <div className="fund-item-info">
                                                        <div className="fund-item-title">
                                                            {fund.fundProductName}
                                                        </div>
                                                        <div className="fund-item-subtitle">
                                                            {fund.fundProductManager}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="fund-item-right">
                                                    <div className="fund-item-chart">
                                                        <div className="placeholder-chart"></div>
                                                    </div>
                                                    <div className="fund-item-numbers">
                                                        <div className="fund-item-amount">
                                                            {formatAmount(fund.fundProductTotalAmount)}억
                                                        </div>
                                                        <div className="fund-item-yield">+2.67%</div>
                                                    </div>
                                                    <button
                                                        className={`fund-expand-button ${
                                                            expandedFundId === fund.fundProductId
                                                                ? "expanded"
                                                                : ""
                                                        }`}
                                                        onClick={() => toggleFundExpand(fund.fundProductId)}
                                                    >
                                                        {expandedFundId === fund.fundProductId ? "-" : "+"}
                                                    </button>
                                                </div>
                                            </div>

                                            {expandedFundId === fund.fundProductId && fundDetail && (
                                                <div className="fund-item-details">
                                                    <div className="details-section">
                                                        <h3>펀드 상세 정보</h3>
                                                        <div className="details-grid">
                                                            <div className="details-item">
                                                                <span className="details-label">펀드 유형</span>
                                                                <span className="details-value">
                                  {fundDetail.fundProductType}
                                </span>
                                                            </div>
                                                            <div className="details-item">
                                                                <span className="details-label">설정 연도</span>
                                                                <span className="details-value">
                                  {fundDetail.fundProductYear}
                                </span>
                                                            </div>
                                                            <div className="details-item">
                                                                <span className="details-label">만기일</span>
                                                                <span className="details-value">
                                  {fundDetail.fundProductExpiration}
                                </span>
                                                            </div>
                                                            <div className="details-item">
                                                                <span className="details-label">총 펀드 규모</span>
                                                                <span className="details-value">
                                  {formatAmount(
                                      fundDetail.fundProductTotalAmount
                                  )} 억 원
                                </span>
                                                            </div>
                                                            <div className="details-item">
                                                                <span className="details-label">운용 보수</span>
                                                                <span className="details-value">
                                  {formatPercentage(
                                      fundDetail.fundProductManagementFee
                                  )}
                                </span>
                                                            </div>
                                                            <div className="details-item">
                                                                <span className="details-label">환매 수수료</span>
                                                                <span className="details-value">
                                  {formatPercentage(
                                      fundDetail.fundProductRedemptionFee
                                  )}
                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="join-button"
                                                        onClick={() => alert("펀드 가입하기!")}
                                                    >
                                                        가입하기
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "20px",
                                marginBottom: "10px",
                            }}
                        >
                            <Link to={"/products/fund-stock"}>
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
