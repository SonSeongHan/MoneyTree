import React, { useState, useEffect, useRef } from 'react';
import '../css/mainhome.css';
import mainvideo from '../image/homemain.mp4';
import mainimg1 from '../image/mainhome1.jpg';
import mainimg2 from '../image/mainhome2.jpg';
import mainimg3 from '../image/homemain3.png';


/**
 * (1) 라인 Path (테두리) 생성 함수
 * chartData: [숫자, 숫자, ...]
 */
function generateLinePath(data, width = 100, height = 50) {
    if (!data || data.length === 0) return '';
    const minY = Math.min(...data);
    const maxY = Math.max(...data);
    const rangeY = maxY - minY || 1;
    const stepX = width / (data.length - 1);

    return data.reduce((acc, val, i) => {
        const x = stepX * i;
        // y좌표는 SVG상 위->아래 증가 / 데이터는 아래->위 증가
        const y = height - ((val - minY) / rangeY) * height;
        return i === 0 ? `M ${x},${y}` : acc + ` L ${x},${y}`;
    }, '');
}

/**
 * (2) 면적(Area) Path 생성 함수
 */
function generateAreaPath(data, width = 100, height = 50) {
    if (!data || data.length === 0) return '';
    const linePath = generateLinePath(data, width, height);
    // 아래쪽(바닥)을 닫아서 면적을 채움
    return linePath + ` L ${width},${height} L 0,${height} Z`;
}

function App() {
    // 예시 데이터: 각 항목마다 chartData가 달라서 서로 다른 그래프 모양
    const [etfs] = useState([
        {
            id: 1,
            name: 'XX정 고객님',
            yield: 13.2,
            capital: 2000000,
            chartData: [2, 5, 7, 9, 12, 13.2],
        },
        {
            id: 2,
            name: 'XX원 고객님',
            yield: 8.8,
            capital: 3200000,
            chartData: [5, 5, 4, 6, 7.5, 8.8],
        },
        {
            id: 3,
            name: 'XX욱 고객님',
            yield: 5.6,
            capital: 5000000,
            chartData: [3, 2, 5, 5.5, 5.3, 5.6],
        },
        {
            id: 4,
            name: 'XX훈 고객님',
            yield: 9.2,
            capital: 1500000,
            chartData: [4, 4.5, 5, 6, 8, 9.2],
        },
        {
            id: 5,
            name: 'XX민 고객님',
            yield: 7.1,
            capital: 4100000,
            chartData: [3, 4, 4.5, 5, 6.2, 7.1],
        },
        {
            id: 6,
            name: 'XX한 고객님',
            yield: 17.1,
            capital: 4100000,
            chartData: [10, 12, 12.5, 14, 15.5, 17.1],
        },
    ]);

    const [sortOption, setSortOption] = useState('yield');

    // 정렬 로직
    const sortedEtfs = [...etfs].sort((a, b) => {
        if (sortOption === 'yield') {
            return b.yield - a.yield;
        } else {
            return b.capital - a.capital;
        }
    });

    // 평균 수익률 애니메이션
    const [yieldValue, setYieldValue] = useState(0);
    const statsRef = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        let currentYield = 0;
                        const targetYield = 8.5;
                        const duration = 2000;
                        const interval = 20;
                        const increment = targetYield / (duration / interval);

                        const timer = setInterval(() => {
                            currentYield += increment;
                            if (currentYield >= targetYield) {
                                currentYield = targetYield;
                                clearInterval(timer);
                            }
                            setYieldValue(currentYield);
                        }, interval);

                        setHasAnimated(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );
        if (statsRef.current) {
            observer.observe(statsRef.current);
        }
        return () => {
            if (statsRef.current) observer.unobserve(statsRef.current);
        };
    }, [hasAnimated]);

    // 스크롤 시 페이드업
    useEffect(() => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-up');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );
        elements.forEach((el) => observer.observe(el));
        return () => {
            elements.forEach((el) => observer.unobserve(el));
        };
    }, []);

    // Hero 버튼
    const handleLoginClick = () => {
        window.location.href = '/loginpage';
    };

    return (
        <div>
            {/* --- Hero Section --- */}
            <section className="hero-section">
                {/* 로컬 동영상 파일을 배경으로 사용 */}
                <video className="hero-video" autoPlay muted loop playsInline>
                    <source src={mainvideo} type="video/mp4"/>
                    브라우저가 동영상을 지원하지 않습니다.
                </video>

                <div className="hero-overlay"></div>
                <div className="hero-content animate-on-scroll">
                    <h1>미래를 여는 자산관리</h1>
                    <p>우리 회사 고객들은 안정적이고 높은 수익률을 경험하고 있습니다.</p>
                    <button className="cta-button" onClick={handleLoginClick}>
                        지금 로그인하기
                    </button>
                </div>
            </section>

            {/* --- Process Section --- */}
            <section className="process_bg">
                <div className="process">
                    <h2 className="animate-on-scroll">자산관리 프로세스</h2>
                    <div className="process-step animate-on-scroll">
                        <div className="process-text">
                            <h3>1. 다양성</h3>
                            <p>하나의 앱에서 은행 투자 관리 지갑역할까지</p>
                            <p>당신의 금융 생활을 하나의 앱으로, 더 쉽고 스마트하게.</p>
                            <p>앱으로 즐겨보세요.</p>
                        </div>
                        <div className="process-image">
                            <img
                                src={mainimg1}
                                alt="상담 이미지"
                            />
                        </div>
                    </div>
                </div>
            </section>


            <div className="process">
                <div className="process-step reverse animate-on-scroll">
                    <div className="process-text">
                        <h3>2. 기능</h3>
                        <p>송금부터 부동산 투자까지, 모든 금융을 한곳에서 </p>
                        <p>한 번의 터치로, 당신의 자산을 손쉽게 관리하세요</p>
                    </div>
                    <div className="process-image">
                        <img
                            src={mainimg2}
                            alt="분석 이미지"
                        />
                    </div>
                </div>
            </div>


            <section className="process_bg">
                <div className="process">
                    <div className="process-step animate-on-scroll">
                        <div className="process-text">
                            <h3>3. 상품 프로모션</h3>
                            <p>목표에 맞는 상품을 쉽고 빠르게.</p>
                            <p>다양한 금융 상품을 한 번에 비교하고, 현명하게 선택하세요.</p>
                        </div>
                        <div className="process-image">
                            <img
                                src={mainimg3}
                                alt="투자 이미지"
                                style={{width: '100%', maxWidth: '100%'}}
                            />
                        </div>
                    </div>
                </div>
            </section>


            <div className="process">
                <div className="process-step reverse animate-on-scroll">
                    <div className="process-text">
                        <h3>4. 수많은 성공 사례</h3>
                        <p>지수많은 성공 사례가 증명하는 신뢰와 가치</p>
                        <p>수천 명의 선택, 수많은 성공이 말해주는 이유</p>
                        <p>수많은 성공 스토리, 그다음 주인공은 당신입니다.</p>
                    </div>
                    <div className="process-image">
                        <img
                            src={mainimg3}
                            alt="관리 이미지"
                        />
                    </div>
                </div>
            </div>


            {/* --- Stats Section (평균 수익률) --- */}
            <div className="etfsection-bg">
                <section className="stats" ref={statsRef}>
                    <h2 className="animate-on-scroll">31,272만명의 고객님의 평균</h2>
                    <div className="stat-item animate-on-scroll">
                        <div className="number">{yieldValue.toFixed(1)}%</div>
                        <p>안정적 성장</p>
                    </div>
                </section>
            </div>

                {/* --- 리뷰 --- */}

                <section className="etf-section">
                    {/* 상단 헤더: "01. ETF 트렌드 한눈에 보기" / 날짜 정보 등 */}
                    <div className="etf-header animate-on-scroll">
                        <div className="etf-title">
                            <h2>01. 고객 리뷰 한번에 보기</h2>
                            <p>최근 1년간 수익률 가장 좋은 고객님.</p>
                        </div>
                        <div className="etf-meta">
                            <span className="meta-item">2025.01.24 ~ 2025.01.28 (4영업일)</span>
                            {/* 필요 시 다른 정보 추가 */}
                        </div>
                    </div>

                    {/* 본문 레이아웃: 좌측 FAQ / 우측 정렬필터 & 카드리스트 */}
                    <div className="etf-main-container">
                        {/* 왼쪽: FAQ 섹션(질문 목록) */}
                        <div className="etf-faq animate-on-scroll">
                            <h3>수익률이 궁금하다면?</h3>
                            <ul>
                                <li>조회수가 가장 높은 종목은?</li>
                                <li>초보자에게 좋은 30개 상품은?</li>
                                <li>최소 신탁금액은 얼마?</li>
                                <li>안정적 성장 주식?</li>
                            </ul>
                        </div>

                        {/* 오른쪽: 정렬필터 + 카드들 */}
                        <div className="etf-right animate-on-scroll">
                            <div className="filter-area">
                                <p className="filter-title">정렬 기준</p>
                                <label>
                                    <input
                                        type="radio"
                                        name="sortOption"
                                        value="yield"
                                        checked={sortOption === 'yield'}
                                        onChange={() => setSortOption('yield')}
                                    />
                                    수익률이 높은 순
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="sortOption"
                                        value="capital"
                                        checked={sortOption === 'capital'}
                                        onChange={() => setSortOption('capital')}
                                    />
                                    투자금액이 큰 순
                                </label>
                            </div>

                            {/* 카드 리스트 */}
                            <div className="card-list">
                                {sortedEtfs.map((etf) => {
                                    const linePath = generateLinePath(etf.chartData, 100, 50);
                                    const areaPath = generateAreaPath(etf.chartData, 100, 50);

                                    return (
                                        <div className="etf-card" key={etf.id}>
                                            <div className="etf-card-top">
                                                <h4 className="etf-name">{etf.name}</h4>
                                                {/* 예: 현재가/기준가 등 필요하면 추가 */}
                                                <span className="etf-price">
                        {/* 임의로 표기: (capital/100) */}
                                                    {(etf.capital / 100).toLocaleString()}원
                      </span>
                                            </div>

                                            {/* 차트 */}
                                            <div className="etf-chart">
                                                <svg viewBox="0 0 100 50">
                                                    <defs>
                                                        <linearGradient
                                                            id={`gradient-${etf.id}`}
                                                            x1="0"
                                                            y1="0"
                                                            x2="0"
                                                            y2="1"
                                                        >
                                                            <stop offset="0%" stopColor="#ff7f50"
                                                                  stopOpacity="0.4"/>
                                                            <stop offset="100%" stopColor="#ff7f50"
                                                                  stopOpacity="0"/>
                                                        </linearGradient>
                                                    </defs>

                                                    <path
                                                        d={areaPath}
                                                        fill={`url(#gradient-${etf.id})`}
                                                    />
                                                    <path
                                                        d={linePath}
                                                        fill="none"
                                                        stroke="#ff7f50"
                                                        strokeWidth="2"
                                                    />
                                                </svg>
                                            </div>

                                            {/* 하단 수익률 / 투자금액 */}
                                            <div className="etf-card-bottom">
                                                <div className="yield-text">{etf.yield.toFixed(1)}%</div>
                                                <div className="capital-text">
                                                    투자금액 {etf.capital.toLocaleString()}원
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

            {/* --- Footer --- */}
            {/*<footer className="footer">*/}
            {/*    <p>&copy; 2025 AssetPlus. All rights reserved.</p>*/}
            {/*</footer>*/}
        </div>
    );
}

                export default App;
