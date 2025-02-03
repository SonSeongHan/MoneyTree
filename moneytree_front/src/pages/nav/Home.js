// Home.js
import React, { useState, useEffect } from "react";
import "../../css/home.css";
import { getCookie } from "../../util/cookieUtil"; // 수정된 cookieUtil.js 경로

function Home() {
    // membershipType: 'FullMember', 'SimpleMember', 'none' 등을 저장
    const [membershipType, setMembershipType] = useState("none");
    const [userName, setUserName] = useState("손님");

    useEffect(() => {
        // react-cookie에서 가져온 값은 이미 'JSON -> 객체' 로 파싱된 상태
        const memberCookie = getCookie("member");
        if (memberCookie) {
            // memberCookie는 예: {
            //   "memberId":"user5",
            //   "member_name":"심정민",
            //   "membershipType":"FullMember",
            //   ...
            // }
            setUserName(memberCookie.member_name || "손님");
            setMembershipType(memberCookie.membershipType || "none");
        } else {
            // 쿠키가 없으면 비회원
            setUserName("손님");
            setMembershipType("none");
        }
    }, []);

    // 예시 데이터
    const investmentData = {
        productName: "3년 무이자 예금 가족과 프리미엄",
        amount: 20000000,
        period: "2023년 7월 22일 ~ 2026년 7월 21일 / 3년",
        cancellationRate: "1.4%",
        finalRate: "5.8%",
        progressPercent: 50,
    };

    const monthlySpending = 2806891;
    const spendingDetails = [
        { category: "의류", amount: 1119400, ratio: 39.89 },
        { category: "생활", amount: 565827, ratio: 20.11 },
        { category: "식비", amount: 396698, ratio: 14.12 },
        { category: "선물", amount: 326426, ratio: 11.6 },
    ];

    const recommendedProducts = [
        { id: 1, name: "1년 복리 예금(비과세)", interest: "연 1.5%" },
        { id: 2, name: "1년 적금 (예금자 보호)", interest: "연 1.5%" },
        { id: 3, name: "6개월 예비자금(단기)", interest: "연 1.5%" },
        { id: 4, name: "1년 치 생활비 저축", interest: "연 1.5%" },
    ];

    return (
        <div className="home-container">
                      <main>
                {/* 정회원 화면 */}
                {membershipType === "FullMember" && (
                    <>
                        <section className="welcome-section">
                            <h2>안녕하세요 {userName}님</h2>
                            <div className="investment-box">
                                <h3>상품이름: {investmentData.productName}</h3>
                                <p>투자금액: {investmentData.amount.toLocaleString()}원</p>
                                <p>투자기간: {investmentData.period}</p>
                                <p>중도 해지금리: {investmentData.cancellationRate}</p>
                                <p>최종 이율: {investmentData.finalRate}</p>
                                <div className="donut-chart">
                                    <div className="donut-inner">
                                        {investmentData.progressPercent}%
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="spending-section">
                            <h3>이번달의 소비내역</h3>
                            <h4>{monthlySpending.toLocaleString()}원 지출</h4>
                            <div className="pie-chart">
                                <p>파이 차트 자리</p>
                            </div>
                            <ul>
                                {spendingDetails.map((item, idx) => (
                                    <li key={idx}>
                                        {item.category}: {item.amount.toLocaleString()}원 (
                                        {item.ratio}%)
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="recommended-section">
                            <h3>JM 고객님의 성향에 맞는 BEST 인기상품</h3>
                            <div className="product-slider">
                                {recommendedProducts.map((product) => (
                                    <div key={product.id} className="product-card">
                                        <p>{product.name}</p>
                                        <p>{product.interest}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {/* 간편회원 화면 */}
                {membershipType === "SimpleMember" && (
                    <>
                        <section className="welcome-section">
                            <h2>안녕하세요 {userName}님</h2>
                            <div className="non-member-box">
                                <p>+</p>
                                <p>간편회원 전용 안내 영역</p>
                            </div>
                        </section>

                        <section className="spending-section">
                            <h3>이번달의 소비내역</h3>
                            <h4>{monthlySpending.toLocaleString()}원 지출</h4>
                            <p>간편회원은 일부 기능 제한</p>
                        </section>

                        <section className="recommended-section">
                            <h3>JM 고객님의 성향에 맞는 BEST 인기상품</h3>
                            <div className="product-slider">
                                {recommendedProducts.map((product) => (
                                    <div key={product.id} className="product-card">
                                        <p>{product.name}</p>
                                        <p>{product.interest}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {/* 비회원(쿠키가 없거나 membershipType이 없는 경우) */}
                {membershipType === "none" && (
                    <>
                        <section className="welcome-section">
                            <h2>안녕하세요 {userName}님</h2>
                            <div className="non-member-box">
                                <p>+</p>
                                <p>계좌 개설 후 이용 가능합니다</p>
                            </div>
                        </section>

                        <section className="spending-section">
                            <h3>이번달의 소비내역</h3>
                            <h4>{monthlySpending.toLocaleString()}원 지출</h4>
                            <p>비회원은 차트 확인 불가</p>
                        </section>

                        <section className="recommended-section">
                            <h3>JM 고객님의 성향에 맞는 BEST 인기상품</h3>
                            <div className="product-slider">
                                {recommendedProducts.map((product) => (
                                    <div key={product.id} className="product-card">
                                        <p>{product.name}</p>
                                        <p>{product.interest}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>

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
