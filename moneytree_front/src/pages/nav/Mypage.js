import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';
import DepositAPI from '../../api/DepositAPI';
import SavingAPI from '../../api/SavingAPI';
import StockAPI from '../../api/StockAPI';
import MyDepositDetail from '../../components/recommends/MyDepositDetail';
import MySavingDetail from '../../components/recommends/MySavingDetail';
import '../../css/MyPage.css';
import StockTradeModal from '../../components/StockTradeModal';

const Mypage = () => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [depositAccounts, setDepositAccounts] = useState([]);
  const [savingAccounts, setSavingAccounts] = useState([]);
  const [stockHoldings, setStockHoldings] = useState([]);
  const [stockAccount, setStockAccount] = useState(null);
  const [depositProducts, setDepositProducts] = useState({});
  const [savingProducts, setSavingProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null); // 선택된 주식 정보
  const [isStockModalOpen, setIsStockModalOpen] = useState(false); // 주식 거래 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const memberInfo = getCookie('member');
    if (!memberInfo) {
      navigate('/loginpage');
      return;
    }

    const fetchData = async () => {
      try {
        // 예금, 적금, 주식 데이터를 병렬로 가져오기
        const [
          depositAccountsResponse,
          depositProductsResponse,
          savingAccountsResponse,
          savingProductsResponse,
        ] = await Promise.all([
          DepositAPI.getMyDepositAccounts(),
          DepositAPI.getAllDeposits(),
          SavingAPI.getMySavingAccounts(),
          SavingAPI.getAllSavingProducts(),
        ]);

        // 예금 데이터 설정
        setDepositAccounts(depositAccountsResponse.accounts || []);
        const depositProductsMap = {};
        depositProductsResponse.forEach((product) => {
          depositProductsMap[product.depositProductId] = product;
        });
        setDepositProducts(depositProductsMap);

        // 적금 데이터 설정
        setSavingAccounts(savingAccountsResponse.accounts || []);
        const savingProductsMap = {};
        savingProductsResponse.forEach((product) => {
          savingProductsMap[product.savingProductId] = product;
        });
        setSavingProducts(savingProductsMap);

        // // 주식 계좌 정보 조회
        // const dandwAcId = await StockAPI.getDandwacAccountNumber(memberInfo.memberId);

        // if (dandwAcId) {
        //   const stockAccountInfo = await StockAPI.getStockAccount(dandwAcId);
        //   setStockAccount(stockAccountInfo);

        //   // 보유 주식 정보 조회 (더 안정적으로)
        //   const holdingsInfo = await StockAPI.getStockHoldings(stockAccountInfo.stockAccountNumber);

        //   // 완전한 주식 정보 매핑
        //   const processedHoldings = await Promise.all(
        //     holdingsInfo.map(async (holding) => {
        //       try {
        //         // 각 주식의 추가 정보 조회
        //         const stockDetails = await StockAPI.searchStockProductsByName(
        //           holding.stockProductName,
        //         );
        //         return {
        //           ...holding,
        //           ...stockDetails[0], // 첫 번째 매칭되는 주식 정보 사용
        //           stockHoldingQuantity: holding.stockHoldingQuantity,
        //           stockClosingPrice: holding.stockClosingPrice,
        //           stockFluctuationRate: holding.stockFluctuationRate,
        //         };
        //       } catch (error) {
        //         console.error(`Error fetching details for ${holding.stockProductName}:`, error);
        //         return holding;
        //       }
        //     }),
        //   );

        //   setStockHoldings(processedHoldings);
        // }
      } catch (err) {
        console.error('❌ 상세 에러 정보:', err);
        setError('정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleNextSlide = () => {
    const accounts =
      activeTab === 'deposit'
        ? depositAccounts
        : activeTab === 'savings'
          ? savingAccounts
          : activeTab === 'stock'
            ? stockHoldings
            : [];
    const maxSlide = Math.ceil(accounts.length / 3) - 1;
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlide));
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
      console.log('🔍 주식 탭 렌더링 시작');
      console.log('🔍 현재 stockHoldings:', stockHoldings);
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
                : ''}{' '}
          보유 내역이 없습니다.
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
            {currentAccounts.map((item) => {
              if (activeTab === 'stock') {
                // 주식 카드 렌더링
                console.log('🔍 주식 아이템 렌더링:', item);
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
                      <p
                        className={`deposit-account-rate ${
                          (item.stockFluctuationRate || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        등락률: {(item.stockFluctuationRate || 0) >= 0 ? '+' : ''}
                        {item.stockFluctuationRate || 0}%
                      </p>
                      <p className="deposit-account-total-value">
                        평가금액: {(item.stockHoldingQuantity || 0) * (item.stockClosingPrice || 0)}
                        원
                      </p>
                    </div>
                  </div>
                );
              } else {
                // 예금/적금 카드 렌더링
                const product =
                  currentProducts[
                    activeTab === 'deposit' ? item.depositProductId : item.savingProductId
                  ];

                return (
                  <div
                    key={
                      activeTab === 'deposit' ? item.depositAccountNumber : item.savingAccountNumber
                    }
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
                        계좌번호:{' '}
                        {item.formattedAccountNumber ||
                          (activeTab === 'deposit'
                            ? item.depositAccountNumber
                            : item.savingAccountNumber)}
                      </p>
                      <p className="deposit-account-balance">
                        {activeTab === 'deposit' ? '예금액' : '적립액'}:
                        {activeTab === 'deposit'
                          ? item.depositAmount || 0
                          : item.savingDepositAmount || 0}
                        원
                      </p>
                      <p className="deposit-account-start-date">
                        계좌 생성일:{' '}
                        {new Date(
                          activeTab === 'deposit' ? item.depositStartDate : item.savingStartDate,
                        ).toLocaleDateString()}
                      </p>
                      <p className="deposit-account-end-date">
                        만기일:{' '}
                        {new Date(
                          activeTab === 'deposit' ? item.depositEndDate : item.savingEndDate,
                        ).toLocaleDateString()}
                      </p>
                      {activeTab === 'savings' && item.savingRegularPaymentAmount && (
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
          className="slider-button next"
          onClick={handleNextSlide}
          disabled={currentSlide >= Math.ceil(currentAccounts.length / 3) - 1}
        >
          →
        </button>
      </div>
    );
  };

  if (loading) return <div className="mypage-loading">로딩중...</div>;
  if (error) return <div className="mypage-error">{error}</div>;

  return (
    <div className="mypage-container">
      <h2 className="mypage-title">가입한 상품들</h2>

      <div className="product-tabs">
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
        {(activeTab === 'deposit' || activeTab === 'savings' || activeTab === 'stock') &&
          renderProducts()}
        {activeTab === 'fund' && <p className="no-products">가입한 펀드 상품이 없습니다.</p>}
      </div>

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

      {selectedStock && (
        <StockTradeModal
          isOpen={isStockModalOpen}
          onClose={() => {
            setIsStockModalOpen(false);
            // 모달이 닫힐 때 주식 데이터 다시 가져오기
            const refetchStockData = async () => {
              const memberInfo = getCookie('member');
              if (memberInfo) {
                const dandwAcId = await StockAPI.getDandwacAccountNumber(memberInfo.memberId);
                if (dandwAcId) {
                  const stockAccountInfo = await StockAPI.getStockAccount(dandwAcId);
                  const holdingsInfo = await StockAPI.getStockHoldings(
                    stockAccountInfo.stockAccountNumber,
                  );

                  const processedHoldings = await Promise.all(
                    holdingsInfo.map(async (holding) => {
                      try {
                        const stockDetails = await StockAPI.searchStockProductsByName(
                          holding.stockProductName,
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
                          error,
                        );
                        return holding;
                      }
                    }),
                  );

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
    </div>
  );
};

export default Mypage;
