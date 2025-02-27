import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';

import DepositAPI from '../../api/DepositAPI';
import SavingAPI from '../../api/SavingAPI';
import StockAPI from '../../api/StockAPI';
import FundAPI from '../../api/FundAPI';
import TransactionHistoryAPI from '../../api/TransactionHistoryAPI';
import { withdrawMember } from '../../api/MemberAPI';

import MyDepositDetail from '../../components/recommends/MyDepositDetail';
import MySavingDetail from '../../components/recommends/MySavingDetail';
import MyFundDetail from '../../components/recommends/MyFundDetail';
import StockTradeModal from '../../components/StockTradeModal';
import StockTransferModal from '../../components/StockTransferModal';
import AssetDistributionChart from '../../components/AssetDistributionChart';
import SpendingDonutChart from '../../SpendingDonutChart'; // 소비내역 도넛 차트 추가

import '../../css/MyPage.css';

// 하드코딩된 정보 컴포넌트들
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

const MyHobbyList = ({ hobbies }) => {
    return (
      <div className="hobby-box">
          <h4 className="hobby-title">찜한 취미</h4>
          <ul className="hobby-listt">
              {hobbies.map((hobby, index) => (
                <li key={index} className="hobby-item">
                    {hobby}
                </li>
              ))}
          </ul>
      </div>
    );
};

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

// ... 생략 (import 및 기타 컴포넌트들)

const Mypage = () => {
    const navigate = useNavigate();

    // 기존 상품 관련 state
    const [membershipType, setMembershipType] = useState('none');
    const [monthlySpending, setMonthlySpending] = useState(0);
    const [spendingDetails, setSpendingDetails] = useState([]);

    const [activeTab, setActiveTab] = useState('deposit');
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

    // 모달 관련 state
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedStock, setSelectedStock] = useState(null);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isStockTransferModalOpen, setIsStockTransferModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 슬라이더 관련 state
    const [currentSlide, setCurrentSlide] = useState(0);

    // 하드코딩된 추가 정보 (나이대, 취미, 추천 상품)
    const [ageStats, setAgeStats] = useState([]);
    const [hobbies, setHobbies] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    // AllManagement 회원 정보 state
    const [memberInfo, setMemberInfo] = useState({
        memberId: "",
        memberName: "",
        membershipType: "",
    });
    const [stockAccountNumber, setStockAccountNumber] = useState(null);

    // 1) 로그인 체크, 회원 정보 및 회원 유형 설정 (쿠키에서 가져옴)
    useEffect(() => {
        const memberCookie = getCookie('member');
        console.log("쿠키에서 가져온 값:", memberCookie);
        if (!memberCookie) {
            navigate('/loginpage');
            return;
        }
        setMembershipType(memberCookie.membershipType || 'none');
        setMemberInfo({
            memberId: memberCookie.memberId || "알 수 없음",
            memberName: memberCookie.member_name || "알 수 없음",
            membershipType: memberCookie.membershipType || "알 수 없음",
        });
        console.log("설정된 회원 정보:", {
            memberId: memberCookie.memberId,
            memberName: memberCookie.member_name,
            membershipType: memberCookie.membershipType,
        });
    }, [navigate]);

    // 2) 예금/적금/주식/펀드 데이터 가져오기
    useEffect(() => {
        const memberCookie = getCookie('member');
        if (!memberCookie) return; // 로그인 안 된 경우 중단

        const fetchData = async () => {
            try {
                console.log("API 호출 전: 예금/적금/펀드 데이터 요청 시작");
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
                console.log("예금 응답:", depositAccountsResponse);
                console.log("예금 상품 응답:", depositProductsResponse);
                console.log("적금 응답:", savingAccountsResponse);
                console.log("적금 상품 응답:", savingProductsResponse);
                console.log("펀드 응답:", allFundsResponse);

                // 예금 데이터 세팅
                setDepositAccounts(depositAccountsResponse.accounts || []);
                const depositProductsMap = {};
                depositProductsResponse.forEach((product) => {
                    depositProductsMap[product.depositProductId] = product;
                });
                setDepositProducts(depositProductsMap);

                // 적금 데이터 세팅
                setSavingAccounts(savingAccountsResponse.accounts || []);
                const savingProductsMap = {};
                savingProductsResponse.forEach((product) => {
                    savingProductsMap[product.savingProductId] = product;
                });
                setSavingProducts(savingProductsMap);

                // 펀드 데이터 세팅
                const fundProductsMap = {};
                allFundsResponse.forEach((product) => {
                    fundProductsMap[product.fundProductId] = product;
                });
                setFundProducts(fundProductsMap);

                // 주식 데이터 세팅
                const dandwAcId = await StockAPI.getDandwacAccountNumber(memberCookie.memberId);
                console.log("주식 입출금 계좌 ID:", dandwAcId);
                if (dandwAcId) {
                    const stockAccountInfo = await StockAPI.getStockAccount(dandwAcId);
                    console.log("주식 계좌 정보:", stockAccountInfo);
                    setStockAccount(stockAccountInfo);

                    const holdingsInfo = await StockAPI.getStockHoldings(
                      stockAccountInfo.stockAccountNumber
                    );
                    console.log("주식 보유 내역:", holdingsInfo);

                    const processedHoldings = await Promise.all(
                      holdingsInfo.map(async (holding) => {
                          try {
                              const stockDetails = await StockAPI.searchStockProductsByName(
                                holding.stockProductName
                              );
                              return {
                                  ...holding,
                                  ...stockDetails[0],
                                  stockHoldingQuantity: holding.stockHoldingQuantity,
                                  stockClosingPrice: holding.stockClosingPrice,
                                  stockFluctuationRate: holding.stockFluctuationRate,
                              };
                          } catch (error) {
                              console.error(
                                `Error fetching details for ${holding.stockProductName}:`,
                                error
                              );
                              return holding;
                          }
                      })
                    );
                    console.log("처리된 주식 보유 내역:", processedHoldings);
                    setStockHoldings(processedHoldings);

                    // 펀드 계좌 데이터 조회
                    const fundAccountsInfo = await FundAPI.getFundAccount(dandwAcId);
                    console.log("펀드 계좌 정보:", fundAccountsInfo);
                    setFundAccounts(fundAccountsInfo || []);
                }
            } catch (err) {
                console.error('❌ 상세 에러 정보:', err);
                setError('소지하고 계신 상품이 없습니다');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 3) 소비 내역 데이터 가져오기
    useEffect(() => {
        // 회원 정보가 아직 설정되지 않은 경우 API 호출하지 않음.
        if (membershipType === 'none') {
            console.log("소비 내역 조회 스킵 - 아직 회원 정보가 설정되지 않음:", membershipType);
            return;
        }
        const memberCookie = getCookie('member');
        if (!memberCookie) return;

        const fetchTransactions = async () => {
            console.log("소비 내역 조회 시작 - 회원 유형:", membershipType);
            try {
                if (membershipType === 'FullMember') {
                    const response = await TransactionHistoryAPI.getTransactionsForMember(
                      memberCookie.memberId,
                      1,
                      membershipType
                    );
                    console.log("거래 내역 응답:", response);
                    const transactions = Array.isArray(response)
                      ? response
                      : response.transactions || [];

                    let totalSpending = 0;
                    let categoryMap = {};

                    transactions.forEach((tx) => {
                        if (
                          tx.transactionType === '송금' ||
                          tx.transactionType === '식사' ||
                          tx.transactionType === '취미' ||
                          tx.transactionType === '병원' ||
                          tx.transactionType === '교통' ||
                          tx.transactionType === '기타'
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
                        ratio: totalSpending > 0 ? ((amount / totalSpending) * 100).toFixed(2) : '0.00',
                    }));

                    console.log("계산된 소비 내역:", { totalSpending, details });
                    setMonthlySpending(totalSpending);
                    setSpendingDetails(details);
                } else if (membershipType === 'SimpleMember') {
                    console.log("간편회원용 임시 소비 내역 적용");
                    setMonthlySpending(2806891);
                    setSpendingDetails([
                        { category: '식사', amount: 1500000 },
                        { category: '교통', amount: 500000 },
                        { category: '기타', amount: 806891 },
                    ]);
                } else {
                    setMonthlySpending(0);
                    setSpendingDetails([]);
                }
            } catch (err) {
                console.error('거래내역 조회 중 오류: ', err);
            }
        };

        fetchTransactions();
    }, [membershipType]);

    // 4) 슬라이더 이동 로직 (카드를 3개씩 보여줌)
    const handlePrevSlide = () => {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
    };

    const handleNextSlide = () => {
        let accounts = [];
        if (activeTab === 'deposit') {
            accounts = depositAccounts;
        } else if (activeTab === 'savings') {
            accounts = savingAccounts;
        } else if (activeTab === 'stock') {
            accounts = stockHoldings;
        } else if (activeTab === 'fund') {
            accounts = fundAccounts;
        }
        const maxSlide = Math.ceil(accounts.length / 3) - 1;
        setCurrentSlide((prev) => Math.min(prev + 1, maxSlide));
    };

    // 5) 예금/적금/주식/펀드 카드 렌더링
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
                className="slider-button prev-btn"
                onClick={handlePrevSlide}
                disabled={currentSlide === 0}
              >
                  ←
              </button>
              <div className="products-wrapper">
                  <div className="products-slider" style={slideStyle}>
                      {currentAccounts.map((item) => {
                          // 주식
                          if (activeTab === 'stock') {
                              return (
                                <div
                                  key={item.stockHoldingId}
                                  className="deposit-account-card stock-card"
                                  onClick={() => {
                                      console.log("선택한 주식:", item);
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
                                        <p
                                          className={`deposit-account-rate ${
                                            (item.stockFluctuationRate || 0) >= 0
                                              ? 'text-green-500'
                                              : 'text-red-500'
                                          }`}
                                        >
                                            등락률: {(item.stockFluctuationRate || 0) >= 0 ? '+' : ''}{item.stockFluctuationRate || 0}%
                                        </p>
                                        <p className="deposit-account-total-value">
                                            평가금액: {(item.stockHoldingQuantity || 0) * (item.stockClosingPrice || 0)}원
                                        </p>
                                    </div>
                                </div>
                              );
                          }
                          // 펀드
                          else if (activeTab === 'fund') {
                              const product = currentProducts[item.fundProductId];
                              return (
                                <div
                                  key={item.fundAccountNumber}
                                  className="deposit-account-card fund-card"
                                  onClick={() => {
                                      console.log("선택한 펀드 계좌:", item);
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
                                </div>
                              );
                          }
                          // 예금/적금
                          else {
                              const product =
                                currentProducts[
                                  activeTab === 'deposit'
                                    ? item.depositProductId
                                    : item.savingProductId
                                  ];

                              const accountKey =
                                activeTab === 'deposit'
                                  ? item.depositAccountNumber
                                  : item.savingAccountNumber;

                              return (
                                <div
                                  key={accountKey}
                                  className="deposit-account-card account-card"
                                  onClick={() => {
                                      console.log("선택한 계좌:", item);
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
                                            계좌번호: {item.formattedAccountNumber || accountKey}
                                        </p>
                                        <p className="deposit-account-balance">
                                            {activeTab === 'deposit' ? '예금액' : '적립액'}: {activeTab === 'deposit'
                                          ? item.depositAmount || 0
                                          : item.savingDepositAmount || 0}원
                                        </p>
                                        <p className="deposit-account-start-date">
                                            계좌 생성일: {new Date(activeTab === 'deposit' ? item.depositStartDate : item.savingStartDate).toLocaleDateString()}
                                        </p>
                                        <p className="deposit-account-end-date">
                                            만기일: {new Date(activeTab === 'deposit' ? item.depositEndDate : item.savingEndDate).toLocaleDateString()}
                                        </p>
                                        {activeTab === 'savings' &&
                                          item.savingRegularPaymentAmount && (
                                            <p className="deposit-account-payment">
                                                월 납입액: {item.savingRegularPaymentAmount || 0}원
                                            </p>
                                          )}
                                    </div>
                                </div>
                              );
                          }
                      })}
                  </div>
              </div>
              <button
                className="slider-button next-btn"
                onClick={handleNextSlide}
                disabled={currentSlide >= Math.ceil(currentAccounts.length / 3) - 1}
              >
                  →
              </button>
          </div>
        );
    };

    // 6) 소비내역 차트를 위한 데이터 변환
    const chartData = spendingDetails.map((item) => ({
        name: item.category,
        value: item.amount,
    }));

    // 7) 하드코딩된 추가 정보 세팅 (나이대, 취미, 추천 상품)
    useEffect(() => {
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
        console.log("추가 정보 세팅 완료:", { ageStats, hobbies, recommendedProducts });
    }, []);

    // 8) 회원 탈퇴 로직 (쿠키 삭제 포함)
    const deleteCookie = (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    };

    const handleWithdraw = async () => {
        if (!window.confirm("정말로 회원 탈퇴하시겠습니까?")) {
            return;
        }
        try {
            console.log("회원 탈퇴 요청:", memberInfo.memberId);
            await withdrawMember(memberInfo.memberId);
            deleteCookie("member");
            alert("회원 탈퇴가 완료되었습니다.");
            navigate("/");
        } catch (error) {
            console.error("회원 탈퇴 중 오류 발생:", error);
            alert("회원 탈퇴 중 오류가 발생했습니다.");
        }
    };

    // 9) 주식 송금 모달 오픈 로직
    const handleOpenStockTransferModal = async () => {
        try {
            const dandwAcId = await StockAPI.getDandwacAccountNumber(memberInfo.memberId);
            if (!dandwAcId) {
                throw new Error("입출금 계좌를 찾을 수 없습니다.");
            }
            const stockAccountInfo = await StockAPI.getStockAccount(dandwAcId);
            console.log("주식 송금 모달 오픈 - 주식 계좌 정보:", stockAccountInfo);
            setStockAccountNumber(stockAccountInfo.stockAccountNumber);
            setIsStockTransferModalOpen(true);
        } catch (error) {
            console.error("주식 계좌 조회 중 오류 발생:", error);
            alert(error.message || "주식 계좌 정보를 불러올 수 없습니다.");
        }
    };

    // 최종 렌더링 (회원 관리 섹션은 페이지 하단에 위치)
    const content = loading ? (
      <div className="mypage-loading">로딩중...</div>
    ) : error ? (
      <div className="mypage-error">{error}</div>
    ) : (
      <div className="mypage-container">
          {/* 금융상품 섹션 */}
          <h2 className="mypage-title">가입한 상품들</h2>
          <div className="product-tabs">
              <button
                className={`product-tab btn-deposit ${activeTab === 'deposit' ? 'active' : ''}`}
                onClick={() => {
                    setActiveTab('deposit');
                    setCurrentSlide(0);
                }}
              >
                  예금
              </button>
              <button
                className={`product-tab btn-savings ${activeTab === 'savings' ? 'active' : ''}`}
                onClick={() => {
                    setActiveTab('savings');
                    setCurrentSlide(0);
                }}
              >
                  적금
              </button>
              <button
                className={`product-tab btn-fund ${activeTab === 'fund' ? 'active' : ''}`}
                onClick={() => {
                    setActiveTab('fund');
                    setCurrentSlide(0);
                }}
              >
                  펀드
              </button>
              <button
                className={`product-tab btn-stock ${activeTab === 'stock' ? 'active' : ''}`}
                onClick={() => {
                    setActiveTab('stock');
                    setCurrentSlide(0);
                }}
              >
                  주식
              </button>
          </div>
          <div className="products-container">
              {(activeTab === 'deposit' ||
                activeTab === 'savings' ||
                activeTab === 'stock' ||
                activeTab === 'fund') && renderProducts()}
          </div>

          {/*소비 내역 섹션 */}
          <section className="my-spending-section">
              <h2>이번 달 소비내역</h2>
              {membershipType === 'FullMember' && monthlySpending > 0 && (
                <SpendingDonutChart data={chartData} total={monthlySpending} />
              )}
              {membershipType === 'FullMember' && monthlySpending === 0 && (
                <p>이번 달 소비내역이 없습니다.</p>
              )}
              {membershipType === 'SimpleMember' && (
                <>
                    <p>간편회원님, 임시 소비내역 예시입니다.</p>
                    <SpendingDonutChart data={chartData} total={monthlySpending} />
                </>
              )}
              {membershipType === 'none' && (
                <p>소비 내역은 정회원 전용 기능입니다. 계좌 개설 후 이용 가능합니다.</p>
              )}
          </section>

          {/*// 모달들 */}
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
              onClose={() => {
                  setIsStockModalOpen(false);
                  // refetch 주식 데이터
                  const refetchStockData = async () => {
                      const memberCookie = getCookie('member');
                      if (memberCookie) {
                          const dandwAcId = await StockAPI.getDandwacAccountNumber(memberCookie.memberId);
                          if (dandwAcId) {
                              const stockAccountInfo = await StockAPI.getStockAccount(dandwAcId);
                              const holdingsInfo = await StockAPI.getStockHoldings(
                                stockAccountInfo.stockAccountNumber
                              );
                              const processedHoldings = await Promise.all(
                                holdingsInfo.map(async (holding) => {
                                    try {
                                        const stockDetails = await StockAPI.searchStockProductsByName(
                                          holding.stockProductName
                                        );
                                        return {
                                            ...holding,
                                            ...stockDetails[0],
                                            stockHoldingQuantity: holding.stockHoldingQuantity,
                                            stockClosingPrice: holding.stockClosingPrice,
                                            stockFluctuationRate: holding.stockFluctuationRate,
                                        };
                                    } catch (error) {
                                        console.error(
                                          `Error fetching details for ${holding.stockProductName}:`,
                                          error
                                        );
                                        return holding;
                                    }
                                })
                              );
                              console.log("리패치된 주식 보유 내역:", processedHoldings);
                              setStockHoldings(processedHoldings);
                          }
                      }
                  };
                  refetchStockData();
                  setSelectedStock(null);
              }}
              stockProduct={selectedStock}
            />
          )}

          {/* 주식 송금 모달 */}
          <StockTransferModal
            isOpen={isStockTransferModalOpen}
            onClose={() => setIsStockTransferModalOpen(false)}
            stockAccountNumber={stockAccountNumber}
          />

          {/* 추가 정보 섹션 */}
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

          {/* 회원 관리 섹션 - 페이지 맨 아래 배치 */}
          <div className="management-container bottom-management">
              <div className="menu-container grid-3">
                  <Link to="/change-password" className="menu-button btn-change-password">
                      비밀번호 변경
                  </Link>
                  <Link to="/change-name" className="menu-button btn-change-name">
                      이름 변경
                  </Link>
                  <Link to="/make-account" className="menu-button btn-make-account">
                      계좌생성
                  </Link>
                  <Link to="/create-stock-account" className="menu-button btn-create-stock-account">
                      주식 계좌 생성
                  </Link>
                  <button onClick={handleOpenStockTransferModal} className="menu-button btn-stock-transfer">
                      주식 송금하기
                  </button>
                  <Link to="/reissue-certificate" className="menu-button btn-reissue-certificate">
                      인증서 발급
                  </Link>
              </div>
              <div className="withdraw-container">
                  <button onClick={handleWithdraw} className="menu-button btn-withdraw">
                      회원 탈퇴
                  </button>
              </div>
          </div>

      </div>
    );

    return content;
};

export default Mypage;

