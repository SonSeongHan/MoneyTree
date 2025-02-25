import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCookie, getMemberIdFromCookie, getMemberNicknameFromCookie } from '../../util/cookieUtil';
import DepositAPI from '../../api/DepositAPI';
import SavingAPI from '../../api/SavingAPI';
import StockAPI from '../../api/StockAPI';
import FundAPI from '../../api/FundAPI';
import TransactionHistoryAPI from '../../api/TransactionHistoryAPI';
import MyDepositDetail from '../../components/recommends/MyDepositDetail';
import MySavingDetail from '../../components/recommends/MySavingDetail';
import MyFundDetail from '../../components/recommends/MyFundDetail';
import StockTradeModal from '../../components/StockTradeModal';
import AssetDistributionChart from '../../components/AssetDistributionChart';
import SpendingDonutChart from '../../SpendingDonutChart';
import { getOwnerName, transferMoney, depositMoney } from '../../api/AccountAPI';
import '../../css/MyPage.css';

// 목업 컴포넌트: 나이대 비교 차트
const AgeGroupChart = ({ data }) => {
    return (
        <div className="age-chart-box">
            <h4 className="age-chart-title">나이대별 가입 건수</h4>
            <ul className="age-chart-list">
                {data.map((item, index) => (
                    <li key={index} className="age-chart-item">
                        <span className="age-group">{item.ageGroup}</span>
                        <span className="age-count">{item.count}건</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// 목업 컴포넌트: 내가 찜한 취미 목록
const MyHobbyList = ({ hobbies }) => {
    return (
        <div className="hobby-box">
            <h4 className="hobby-title">찜한 취미</h4>
            <ul className="hobby-list">
                {hobbies.map((hobby, index) => (
                    <li key={index} className="hobby-item">{hobby}</li>
                ))}
            </ul>
        </div>
    );
};

// 목업 컴포넌트: 맞춤형 금융 상품 추천
const RecommendedProducts = ({ products }) => {
    return (
        <div className="recommendations-container">
            <h3 className="recommendations-title">맞춤형 금융 상품 추천</h3>
            <div className="recommendations-list">
                {products.map((prod, index) => (
                    <div key={index} className="recommendation-card">
                        <h4 className="recommendation-name">{prod.name}</h4>
                        <p className="recommendation-description">{prod.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Mypage = () => {
    // 기존 상품 관련 상태
    const [activeTab, setActiveTab] = useState('deposit'); // 'deposit', 'savings', 'fund', 'stock', 'transfer'
    const [depositAccounts, setDepositAccounts] = useState([]);
    const [savingAccounts, setSavingAccounts] = useState([]);
    const [stockHoldings, setStockHoldings] = useState([]);
    const [fundAccounts, setFundAccounts] = useState([]);
    const [fundProducts, setFundProducts] = useState({});
    const [stockAccount, setStockAccount] = useState(null);
    const [depositProducts, setDepositProducts] = useState({});
    const [savingProducts, setSavingProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedStock, setSelectedStock] = useState(null);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    // 추가: 동적 데이터 (나이대, 취미, 추천 상품)
    const [ageStats, setAgeStats] = useState([]);
    const [hobbies, setHobbies] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    // === 송금/충전 관련 상태 (별도 상태) ===
    const [transferSubTab, setTransferSubTab] = useState('transfer'); // 'transfer' 또는 'deposit'
    const [receiverAccountId, setReceiverAccountId] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferOwnerName, setTransferOwnerName] = useState('');
    const [transferPurpose, setTransferPurpose] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [depositPurpose, setDepositPurpose] = useState('');
    const [transferMessage, setTransferMessage] = useState('');
    const [transferLoading, setTransferLoading] = useState(false);

    // 추가: 소비 내역 관련 상태
    const [monthlySpending, setMonthlySpending] = useState(0);
    const [spendingDetails, setSpendingDetails] = useState([]);
    const chartData = spendingDetails.map(item => ({
        name: item.category,
        value: item.amount,
    }));

    const navigate = useNavigate();

    // 회원 정보 확인 및 상품 데이터 조회
    useEffect(() => {
        const memberInfo = getCookie('member');
        if (!memberInfo) {
            navigate('/loginpage');
            return;
        }

        const fetchData = async () => {
            try {
                // 예금, 적금, 펀드 데이터 병렬 조회
                const [
                    depositAccountsResponse,
                    depositProductsResponse,
                    savingAccountsResponse,
                    savingProductsResponse,
                    allFundsResponse,
                ] = await Promise.all([
                    DepositAPI.getMyDepositAccounts(),
                    DepositAPI.getAllDeposits(),
                    SavingAPI.getMySavingAccounts(),
                    SavingAPI.getAllSavingProducts(),
                    FundAPI.getAllFunds(),
                ]);

                // 예금 데이터 설정
                setDepositAccounts(depositAccountsResponse.accounts || []);
                const depositProductsMap = {};
                depositProductsResponse.forEach(product => {
                    depositProductsMap[product.depositProductId] = product;
                });
                setDepositProducts(depositProductsMap);

                // 적금 데이터 설정
                setSavingAccounts(savingAccountsResponse.accounts || []);
                const savingProductsMap = {};
                savingProductsResponse.forEach(product => {
                    savingProductsMap[product.savingProductId] = product;
                });
                setSavingProducts(savingProductsMap);

                // 펀드 데이터 설정
                const fundProductsMap = {};
                allFundsResponse.forEach(product => {
                    fundProductsMap[product.fundProductId] = product;
                });
                setFundProducts(fundProductsMap);

                // 주식 데이터 조회
                const memberInfo = getCookie('member');
                const dandwAcId = await StockAPI.getDandwacAccountNumber(memberInfo.memberId);
                if (dandwAcId) {
                    const stockAccountInfo = await StockAPI.getStockAccount(dandwAcId);
                    setStockAccount(stockAccountInfo);
                    const holdingsInfo = await StockAPI.getStockHoldings(stockAccountInfo.stockAccountNumber);

                    const processedHoldings = await Promise.all(holdingsInfo.map(async (holding) => {
                        try {
                            const stockDetails = await StockAPI.searchStockProductsByName(holding.stockProductName);
                            return {
                                ...holding,
                                ...stockDetails[0],
                                stockHoldingQuantity: holding.stockHoldingQuantity,
                                stockClosingPrice: holding.stockClosingPrice,
                                stockFluctuationRate: holding.stockFluctuationRate,
                            };
                        } catch (error) {
                            console.error(`Error fetching details for ${holding.stockProductName}:`, error);
                            return holding;
                        }
                    }));
                    setStockHoldings(processedHoldings);
                }

                // 초기 동적 데이터 세팅
                setAgeStats([
                    { ageGroup: '20대', count: 15 },
                    { ageGroup: '30대', count: 20 },
                    { ageGroup: '40대', count: 10 },
                    { ageGroup: '50대', count: 5 },
                ]);
                setHobbies(['독서', '등산', '요리']);
                setRecommendedProducts([
                    { name: '스마트 예금', description: '높은 이율과 다양한 혜택을 제공하는 예금 상품' },
                    { name: '액티브 펀드', description: '전문가가 운용하는 펀드 상품으로 높은 수익률 기대' },
                ]);
            } catch (err) {
                console.error('❌ 에러:', err);
                setError('소지하고 계신 상품이 없습니다');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // 소비 내역 데이터 조회 (회원 종류에 따라 FullMember면 실제 내역, SimpleMember면 더미 데이터)
    const memberInfo = getCookie('member');
    const memberId = memberInfo ? memberInfo.memberId : null;
    // 회원 종류가 FullMember / SimpleMember로 들어있다고 가정
    const membershipType = memberInfo && memberInfo.membershipType ? memberInfo.membershipType : 'SimpleMember';

    useEffect(() => {
        if (memberId && membershipType === "FullMember") {
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
            setMonthlySpending(2806891);
            setSpendingDetails([
                { category: "식비", amount: 1500000 },
                { category: "교통", amount: 500000 },
                { category: "기타", amount: 806891 },
            ]);
        }
    }, [memberId, membershipType]);

    const handlePrevSlide = () => {
        setCurrentSlide(prev => Math.max(prev - 1, 0));
    };

    const handleNextSlide = () => {

        let accounts = [];
        if (activeTab === 'deposit') accounts = depositAccounts;
        else if (activeTab === 'savings') accounts = savingAccounts;
        else if (activeTab === 'stock') accounts = stockHoldings;
        else if (activeTab === 'fund') accounts = fundAccounts;
        const maxSlide = Math.ceil(accounts.length / 3) - 1;
        setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
    };

    const renderProducts = () => {
        let currentAccounts = [];
        let currentProducts = {};

        if (activeTab === 'deposit') {
            currentAccounts = depositAccounts;
            currentProducts = depositProducts;
        } else if (activeTab === 'savings') {
            currentAccounts = savingAccounts;
            currentProducts = savingProducts;
        } else if (activeTab === 'stock') {
            currentAccounts = stockHoldings;
        } else if (activeTab === 'fund') {
            currentAccounts = fundAccounts;
            currentProducts = fundProducts;
        }

        if (currentAccounts.length === 0) {
            return (
                <p className="no-products">
                    {activeTab === 'deposit'
                        ? '예금'
                        : activeTab === 'savings'
                            ? '적금'
                            : activeTab === 'stock'
                                ? '주식'
                                : activeTab === 'fund'
                                    ? '펀드'
                                    : ''} 보유 내역이 없습니다.
                </p>
            );
        }

        const slideStyle = {
            transform: `translateX(-${currentSlide * 100}%)`,
        };

        return (

            <div className="products-slider-container">
                <button
                    className="slider-button prev"
                    onClick={handlePrevSlide}
                    disabled={currentSlide === 0}
                >
                    ←
                </button>
                <div className="products-wrapper">
                    <div className="products-slider" style={slideStyle}>
                        {currentAccounts.map(item => {
                            if (activeTab === 'stock') {
                                return (
                                    <div
                                        key={item.stockHoldingId}
                                        className="deposit-account-card"
                                        onClick={() => {
                                            setSelectedStock({
                                                stockProductId: item.stockProductId,
                                                stockProductName: item.stockProductName,
                                                stockMarketCategory: item.stockMarketCategory || 'KOSPI',
                                                stockClosingPrice: item.stockClosingPrice || 0,
                                                stockFluctuationRate: item.stockFluctuationRate || 0,
                                                stockPriceDifference: item.stockPriceDifference || 0,
                                            });
                                            setIsStockModalOpen(true);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <h3 className="deposit-account-name">{item.stockProductName}</h3>
                                        <div className="deposit-account-details">
                                            <p className="deposit-account-balance">
                                                보유수량: {item.stockHoldingQuantity || 0}주
                                            </p>
                                            <p className="deposit-account-current-price">
                                                현재가: {item.stockClosingPrice || 0}원
                                            </p>
                                            <p className={`deposit-account-rate ${(item.stockFluctuationRate || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                등락률: {(item.stockFluctuationRate || 0) >= 0 ? '+' : ''}{item.stockFluctuationRate || 0}%
                                            </p>
                                            <p className="deposit-account-total-value">
                                                평가금액: {(item.stockHoldingQuantity || 0) * (item.stockClosingPrice || 0)}원
                                            </p>
                                        </div>
                                    </div>
                                </div>
                              );
                          } else if (activeTab === 'fund') {
                              const product = currentProducts[item.fundProductId];
                              return (
                                <div
                                  key={item.fundAccountNumber}
                                  className="deposit-account-card"
                                  onClick={() => {
                                      setSelectedAccount(item);
                                      setSelectedProduct(product);
                                      setIsModalOpen(true);
                                  }}
                                >
                                    <h3 className="deposit-account-name">
                                        {product ? product.fundProductName : '펀드상품'}
                                    </h3>
                                    <div className="deposit-account-details">
                                        <p className="deposit-account-number">
                                            계좌번호: {item.fundAccountNumber}
                                        </p>
                                        <p className="deposit-account-balance">
                                            투자금액: {item.fundInvestmentAmount?.toLocaleString()}원
                                        </p>
                                        <p className="deposit-account-start-date">
                                            투자일: {new Date(item.fundInvestmentDate).toLocaleDateString()}
                                        </p>
                                        <p className="deposit-account-end-date">
                                            만기일: {new Date(item.fundMaturityDate).toLocaleDateString()}
                                        </p>
                                        <p className="deposit-account-status">
                                            상태: {item.fundStatus}
                                        </p>
                                    </div>
                                );
                            } else {
                                // 예금, 적금 카드 렌더링
                                const product = currentProducts[activeTab === 'deposit'
                                    ? item.depositProductId
                                    : item.savingProductId];
                                return (
                                    <div
                                        key={activeTab === 'deposit'
                                            ? item.depositAccountNumber
                                            : item.savingAccountNumber}
                                        className="deposit-account-card"
                                        onClick={() => {
                                            setSelectedAccount(item);
                                            setSelectedProduct(product);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        <h3 className="deposit-account-name">
                                            {product
                                                ? activeTab === 'deposit'
                                                    ? product.depositProductName
                                                    : product.savingProductName
                                                : `${activeTab === 'deposit' ? '예금' : '적금'}상품`}
                                        </h3>
                                        <div className="deposit-account-details">
                                            <p className="deposit-account-number">
                                                계좌번호: {item.formattedAccountNumber ||
                                                (activeTab === 'deposit'
                                                    ? item.depositAccountNumber
                                                    : item.savingAccountNumber)}
                                            </p>
                                            <p className="deposit-account-balance">
                                                {activeTab === 'deposit' ? '예금액' : '적립액'}: {activeTab === 'deposit'
                                                ? item.depositAmount || 0
                                                : item.savingDepositAmount || 0}원
                                            </p>
                                            <p className="deposit-account-start-date">
                                                계좌 생성일: {new Date(
                                                activeTab === 'deposit'
                                                    ? item.depositStartDate
                                                    : item.savingStartDate
                                            ).toLocaleDateString()}
                                            </p>
                                            <p className="deposit-account-end-date">
                                                만기일: {new Date(
                                                activeTab === 'deposit'
                                                    ? item.depositEndDate
                                                    : item.savingEndDate
                                            ).toLocaleDateString()}
                                            </p>
                                            {activeTab === 'savings' && item.savingRegularPaymentAmount && (
                                                <p className="deposit-account-payment">
                                                    월 납입액: {item.savingRegularPaymentAmount || 0}원
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                              );
                          }
                      })}
                  </div>
              </div>
              <button
                className="slider-button next"
                onClick={handleNextSlide}
                disabled={currentSlide >= Math.ceil(currentAccounts.length / 3) - 1}
              >
                  →
              </button>
          </div>
        );
    };

    // 송금/충전 UI 렌더링 함수
    const renderTransferUI = () => {
        return (
            <div className="transfer-container">
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => { setTransferSubTab('transfer'); setTransferMessage(''); }}
                        style={{ marginRight: '10px' }}
                        className={transferSubTab === 'transfer' ? 'active' : ''}
                    >
                        송금하기
                    </button>
                    <button
                        onClick={() => { setTransferSubTab('deposit'); setTransferMessage(''); }}
                        className={transferSubTab === 'deposit' ? 'active' : ''}
                    >
                        충전하기
                    </button>
                </div>

                {transferSubTab === 'transfer' && (
                    <div>
                        <h2>송금하기</h2>
                        <div>
                            <label>계좌 번호: </label>
                            <input
                                type="text"
                                value={receiverAccountId}
                                onChange={(e) => setReceiverAccountId(e.target.value)}
                                placeholder="계좌 번호"
                            />
                            <button onClick={async () => {
                                if (!receiverAccountId) {
                                    setTransferMessage('계좌 번호를 입력하세요.');
                                    return;
                                }
                                try {
                                    setTransferMessage('');
                                    setTransferLoading(true);
                                    const name = await getOwnerName(receiverAccountId);
                                    setTransferOwnerName(name);
                                } catch (error) {
                                    console.error('handleCheckOwner Error:', error);
                                    setTransferMessage(error?.response?.data || '계좌 정보를 찾을 수 없습니다.');
                                    setTransferOwnerName('');
                                } finally {
                                    setTransferLoading(false);
                                }
                            }} disabled={transferLoading}>
                                {transferLoading ? '확인 중...' : '계좌주 확인'}
                            </button>
                        </div>
                        {transferOwnerName && <p>계좌 주인: {transferOwnerName}</p>}
                        <div>
                            <label>송금 금액: </label>
                            <input
                                type="number"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                placeholder="송금 금액"
                                min="1"
                            />
                        </div>
                        <div>
                            <label>송금 목적: </label>
                            <input
                                type="text"
                                value={transferPurpose}
                                onChange={(e) => setTransferPurpose(e.target.value)}
                                placeholder="예) 생활비, 월세, 기타"
                            />
                        </div>
                        <button onClick={async () => {
                            const senderMemberId = getMemberIdFromCookie();
                            const fromMemberName = getMemberNicknameFromCookie();
                            if (!senderMemberId) {
                                setTransferMessage('로그인이 필요합니다.');
                                return;
                            }
                            if (!transferOwnerName) {
                                alert('계좌 확인을 먼저 해주세요.');
                                return;
                            }
                            if (!transferAmount || Number(transferAmount) <= 0) {
                                setTransferMessage('유효한 송금 금액을 입력하세요.');
                                return;
                            }
                            if (!transferPurpose.trim()) {
                                if (!window.confirm('송금 목적을 입력하지 않았습니다. 그래도 진행하시겠습니까?')) {
                                    return;
                                }
                            }
                            const confirmMsg = `${transferOwnerName}님에게 ${Number(transferAmount).toLocaleString()}원 송금하시겠습니까?`;
                            if (!window.confirm(confirmMsg)) return;
                            const inputPassword = prompt('비밀번호:');
                            if (!inputPassword) {
                                setTransferMessage('비밀번호를 입력하지 않았습니다.');
                                return;
                            }
                            try {
                                setTransferLoading(true);
                                await transferMoney(
                                    senderMemberId,
                                    receiverAccountId,
                                    inputPassword,
                                    Number(transferAmount),
                                    transferPurpose,
                                    fromMemberName,
                                    transferOwnerName
                                );
                                alert('송금이 성공적으로 완료되었습니다.');
                                navigate('/home');
                            } catch (error) {
                                console.error('handleTransfer Error:', error);
                                setTransferMessage(error?.response?.data || '송금 중 오류가 발생했습니다.');
                            } finally {
                                setTransferLoading(false);
                            }
                        }} disabled={transferLoading}>
                            {transferLoading ? '송금 중...' : '송금'}
                        </button>
                    </div>
                )}

                {transferSubTab === 'deposit' && (
                    <div>
                        <h2>충전하기</h2>
                        <div>
                            <label>충전 금액: </label>
                            <input
                                type="number"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                placeholder="충전할 금액"
                                min="1"
                            />
                        </div>
                        <div>
                            <label>충전 목적: </label>
                            <input
                                type="text"
                                value={depositPurpose}
                                onChange={(e) => setDepositPurpose(e.target.value)}
                                placeholder="예) 생활비, 투자, 기타"
                            />
                        </div>
                        <button onClick={async () => {
                            const memberId = getMemberIdFromCookie();
                            const fromMemberName = getMemberNicknameFromCookie();
                            if (!memberId) {
                                setTransferMessage('로그인이 필요합니다.');
                                return;
                            }
                            if (!depositAmount || Number(depositAmount) <= 0) {
                                setTransferMessage('유효한 충전 금액을 입력하세요.');
                                return;
                            }
                            const confirmMsg = `내 계좌에 ${Number(depositAmount).toLocaleString()}원을 충전하시겠습니까?`;
                            if (!window.confirm(confirmMsg)) return;
                            const inputPassword = prompt('비밀번호를 입력하세요:');
                            if (!inputPassword) {
                                setTransferMessage('비밀번호를 입력하지 않았습니다.');
                                return;
                            }
                            try {
                                setTransferLoading(true);
                                await depositMoney(
                                    memberId,
                                    inputPassword,
                                    Number(depositAmount),
                                    depositPurpose,
                                    fromMemberName
                                );
                                alert('충전이 성공적으로 완료되었습니다.');
                                navigate('/home');
                            } catch (error) {
                                console.error('handleDeposit Error:', error);
                                setTransferMessage(error?.response?.data || '충전 중 오류가 발생했습니다.');
                            } finally {
                                setTransferLoading(false);
                            }
                        }} disabled={transferLoading}>
                            {transferLoading ? '충전 중...' : '충전하기'}
                        </button>
                    </div>
                )}

                {transferMessage && <p style={{ color: 'red' }}>{transferMessage}</p>}
            </div>
        );
    };

    if (loading) return <div className="mypage-loading">로딩중...</div>;
    if (error) return <div className="mypage-error">{error}</div>;

    return (
        <div className="mypage_all_bg">
            <div className="mypage-container">
                <h2 className="mypage-title">가입한 상품들</h2>
                <div className="product-tabs">
                    <button
                        className={`product-tab ${activeTab === 'transfer' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('transfer');
                            setCurrentSlide(0);
                        }}
                    >
                        송금/충전
                    </button>
                    <button
                        className={`product-tab ${activeTab === 'deposit' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('deposit');
                            setCurrentSlide(0);
                        }}
                    >
                        예금
                    </button>
                    <button
                        className={`product-tab ${activeTab === 'savings' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('savings');
                            setCurrentSlide(0);
                        }}
                    >
                        적금
                    </button>
                    <button
                        className={`product-tab ${activeTab === 'fund' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('fund');
                            setCurrentSlide(0);
                        }}
                    >
                        펀드
                    </button>
                    <button
                        className={`product-tab ${activeTab === 'stock' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('stock');
                            setCurrentSlide(0);
                        }}
                    >
                        주식
                    </button>
                </div>

                <div className="products-container">
                    {activeTab === 'transfer'
                        ? renderTransferUI()
                        : (activeTab === 'deposit' ||
                        activeTab === 'savings' ||
                        activeTab === 'stock' ||
                        activeTab === 'fund') && renderProducts()
                    }
                </div>

                {/* 내 자산 분포 현황 */}
                <div className="asset-distribution-section mt-8">
                    <h2 className="mypage-title">내 자산 분포 현황</h2>
                    <AssetDistributionChart
                        depositAccounts={depositAccounts}
                        savingAccounts={savingAccounts}
                        fundAccounts={fundAccounts}
                        stockHoldings={stockHoldings}
                        stockAccount={stockAccount}
                    />
                </div>

                {/* 추가: 이번달 소비내역 섹션 */}
                <div className="spending-section mt-8">
                    <h2 className="mypage-title">이번달 소비내역</h2>
                    <SpendingDonutChart data={chartData} total={monthlySpending} />
                </div>

                {/* 추가 섹션: 나이대 비교 & 찜한 취미 */}
                <div className="additional-info">
                    <div className="age-group-chart">
                        <h3>내 나이대 가입 상품 비교</h3>
                        {ageStats && ageStats.length > 0 ? (
                            <AgeGroupChart data={ageStats} />
                        ) : (
                            <p>나이대 비교 데이터를 불러오는 중입니다...</p>
                        )}
                    </div>
                    <div className="hobby-list">
                        <h3>내가 찜한 취미</h3>
                        {hobbies && hobbies.length > 0 ? (
                            <MyHobbyList hobbies={hobbies} />
                        ) : (
                            <p>찜한 취미가 없습니다.</p>
                        )}
                    </div>
                </div>

                {/* 맞춤형 금융 상품 추천 섹션 */}
                <RecommendedProducts products={recommendedProducts} />

                {/* 모달 컴포넌트들 */}
                {activeTab === 'deposit' && (
                    <MyDepositDetail
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        account={selectedAccount}
                        productDetails={selectedProduct}
                    />
                )}

                {activeTab === 'savings' && (
                    <MySavingDetail
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        account={selectedAccount}
                        productDetails={selectedProduct}
                    />
                )}

                {activeTab === 'fund' && (
                    <MyFundDetail
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        account={selectedAccount}
                        productDetails={selectedProduct}
                    />
                )}

                {selectedStock && (
                    <StockTradeModal
                        isOpen={isStockModalOpen}
                        onClose={async () => {
                            setIsStockModalOpen(false);
                            // 모달 닫힐 때 주식 데이터를 새로 조회
                            const memberInfo = getCookie('member');
                            if (memberInfo) {
                                const dandwAcId = await StockAPI.getDandwacAccountNumber(memberInfo.memberId);
                                if (dandwAcId) {
                                    const stockAccountInfo = await StockAPI.getStockAccount(dandwAcId);
                                    const holdingsInfo = await StockAPI.getStockHoldings(stockAccountInfo.stockAccountNumber);
                                    const processedHoldings = await Promise.all(holdingsInfo.map(async (holding) => {
                                        try {
                                            const stockDetails = await StockAPI.searchStockProductsByName(holding.stockProductName);
                                            return {
                                                ...holding,
                                                ...stockDetails[0],
                                                stockHoldingQuantity: holding.stockHoldingQuantity,
                                                stockClosingPrice: holding.stockClosingPrice,
                                                stockFluctuationRate: holding.stockFluctuationRate,
                                            };
                                        } catch (error) {
                                            console.error(`Error fetching details for ${holding.stockProductName}:`, error);
                                            return holding;
                                        }
                                    }));
                                    setStockHoldings(processedHoldings);
                                }
                            }
                            setSelectedStock(null);
                        }}
                        stockProduct={selectedStock}
                    />
                )}
            </div>
        </div>
    );
};

export default Mypage;
