import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';
import DepositAPI from '../../api/DepositAPI';
import SavingAPI from '../../api/SavingAPI';  // SavingAPI 추가
import MyDepositDetail from '../../components/recommends/MyDepositDetail';
import MySavingDetail from '../../components/recommends/MySavingDetail';
import '../../css/MyPage.css';

const Mypage = () => {
    const [activeTab, setActiveTab] = useState('deposit');
    const [depositAccounts, setDepositAccounts] = useState([]);
    const [savingAccounts, setSavingAccounts] = useState([]); // 적금 계좌 상태 추가
    const [depositProducts, setDepositProducts] = useState({});
    const [savingProducts, setSavingProducts] = useState({}); // 적금 상품 상태 추가
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
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
                // 예금과 적금 데이터를 병렬로 가져오기
                const [
                    depositAccountsResponse,
                    depositProductsResponse,
                    savingAccountsResponse,
                    savingProductsResponse
                ] = await Promise.all([
                    DepositAPI.getMyDepositAccounts(),
                    DepositAPI.getAllDeposits(),
                    SavingAPI.getMySavingAccounts(),
                    SavingAPI.getAllSavingProducts()
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

            } catch (err) {
                console.error('상세 에러 정보:', err);
                setError('정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handlePrevSlide = () => {
        setCurrentSlide(prev => Math.max(prev - 1, 0));
    };

    const handleNextSlide = () => {
        const currentAccounts = activeTab === 'deposit' ? depositAccounts : savingAccounts;
        const maxSlide = Math.ceil(currentAccounts.length / 3) - 1;
        setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
    };

    const renderProducts = () => {
        const currentAccounts = activeTab === 'deposit' ? depositAccounts : savingAccounts;
        const currentProducts = activeTab === 'deposit' ? depositProducts : savingProducts;

        if (currentAccounts.length === 0) {
            return <p className="no-products">가입한 {activeTab === 'deposit' ? '예금' : '적금'} 상품이 없습니다.</p>;
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
                      {currentAccounts.map((account) => {
                          const product = currentProducts[activeTab === 'deposit'
                            ? account.depositProductId
                            : account.savingProductId];

                          return (
                            <div
                              key={activeTab === 'deposit'
                                ? account.depositAccountNumber
                                : account.savingAccountNumber}
                              className="deposit-account-card"
                              onClick={() => {
                                  if (activeTab === 'deposit') {
                                      setSelectedAccount(account);
                                      setSelectedProduct(product);
                                      setIsModalOpen(true);
                                  } else if (activeTab === 'savings') {  // 적금 클릭 시 동작 추가
                                      setSelectedAccount(account);
                                      setSelectedProduct(product);
                                      setIsModalOpen(true);
                                  }
                              }}
                            >
                                <h3 className="deposit-account-name">
                                    {product
                                      ? (activeTab === 'deposit'
                                        ? product.depositProductName
                                        : product.savingProductName)
                                      : `${activeTab === 'deposit' ? '예금' : '적금'}상품`}
                                </h3>
                                <div className="deposit-account-details">
                                    <p className="deposit-account-number">
                                        계좌번호: {account.formattedAccountNumber ||
                                      (activeTab === 'deposit'
                                        ? account.depositAccountNumber
                                        : account.savingAccountNumber)}
                                    </p>
                                    <p className="deposit-account-balance">
                                        {activeTab === 'deposit' ? '예금액' : '적립액'}:
                                        {(activeTab === 'deposit'
                                          ? account.depositAmount
                                          : account.savingDepositAmount)?.toLocaleString()}원
                                    </p>
                                    <p className="deposit-account-start-date">
                                        계좌 생성일: {new Date(activeTab === 'deposit'
                                      ? account.depositStartDate
                                      : account.savingStartDate).toLocaleDateString()}
                                    </p>
                                    <p className="deposit-account-end-date">
                                        만기일: {new Date(activeTab === 'deposit'
                                      ? account.depositEndDate
                                      : account.savingEndDate).toLocaleDateString()}
                                    </p>
                                    {activeTab === 'savings' && account.savingRegularPaymentAmount && (
                                      <p className="deposit-account-payment">
                                          월 납입액: {account.savingRegularPaymentAmount.toLocaleString()}원
                                      </p>
                                    )}
                                </div>
                            </div>
                          );
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
                onClick={() => setActiveTab('fund')}
              >
                  펀드
              </button>
              <button
                className={`product-tab ${activeTab === 'stock' ? 'active' : ''}`}
                onClick={() => setActiveTab('stock')}
              >
                  주식
              </button>
          </div>

          <div className="products-container">
              {(activeTab === 'deposit' || activeTab === 'savings') && renderProducts()}
              {activeTab === 'fund' && <p className="no-products">가입한 펀드 상품이 없습니다.</p>}
              {activeTab === 'stock' && <p className="no-products">가입한 주식 상품이 없습니다.</p>}
          </div>

          {activeTab === 'deposit' && (
            <MyDepositDetail
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              account={selectedAccount}
              productDetails={selectedProduct}
            />
          )}

          {/* ✅ 적금 모달 */}
          {activeTab === 'savings' && (
            <MySavingDetail
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              account={selectedAccount}
              productDetails={selectedProduct}
            />
          )}

      </div>
    );
};

export default Mypage;