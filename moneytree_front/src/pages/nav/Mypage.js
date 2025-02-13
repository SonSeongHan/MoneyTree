import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';
import DepositAPI from '../../api/DepositAPI';
import MyDepositDetail from '../../components/recommends/MyDepositDetail';
import '../../css/MyPage.css';

const Mypage = () => {
    const [activeTab, setActiveTab] = useState('deposit');
    const [depositAccounts, setDepositAccounts] = useState([]);
    const [depositProducts, setDepositProducts] = useState({});
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
                const accountsResponse = await DepositAPI.getMyDepositAccounts();
                setDepositAccounts(accountsResponse.accounts || []);

                const productsResponse = await DepositAPI.getAllDeposits();
                const productsMap = {};
                productsResponse.forEach(product => {
                    productsMap[product.depositProductId] = product;
                });
                setDepositProducts(productsMap);
            } catch (err) {
                console.error('상세 에러 정보:', err);
                setError('정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleAccountClick = (account) => {
        setSelectedAccount(account);
        setSelectedProduct(depositProducts[account.depositProductId]);
        setIsModalOpen(true);
    };

    const handlePrevSlide = () => {
        setCurrentSlide(prev => Math.max(prev - 1, 0));
    };

    const handleNextSlide = () => {
        const maxSlide = Math.ceil(depositAccounts.length / 3) - 1;
        setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
    };

    const renderProducts = () => {
        if (depositAccounts.length === 0) {
            return <p className="no-products">가입한 상품이 없습니다.</p>;
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
                      {depositAccounts.map((account) => (
                        <div
                          key={account.depositAccountNumber}
                          className="deposit-account-card"
                          onClick={() => handleAccountClick(account)}
                        >
                            <h3 className="deposit-account-name">
                                {depositProducts[account.depositProductId]?.depositProductName ||
                                  `예금상품 ${account.depositProductId}`}
                            </h3>
                            <div className="deposit-account-details">
                                <p className="deposit-account-number">
                                    계좌번호: {account.formattedAccountNumber || account.depositAccountNumber}
                                </p>
                                <p className="deposit-account-balance">
                                    예금액: {account.depositAmount?.toLocaleString()}원
                                </p>
                                <p className="deposit-account-start-date">
                                    계좌 생성일: {new Date(account.depositStartDate).toLocaleDateString()}
                                </p>
                                <p className="deposit-account-end-date">
                                    만기일: {new Date(account.depositEndDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                      ))}
                  </div>
              </div>
              <button
                className="slider-button next"
                onClick={handleNextSlide}
                disabled={currentSlide >= Math.ceil(depositAccounts.length / 3) - 1}
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
                onClick={() => setActiveTab('deposit')}
              >
                  예금
              </button>
              <button
                className={`product-tab ${activeTab === 'savings' ? 'active' : ''}`}
                onClick={() => setActiveTab('savings')}
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
              {activeTab === 'deposit' && renderProducts()}
              {activeTab === 'savings' && <p className="no-products">가입한 적금 상품이 없습니다.</p>}
              {activeTab === 'fund' && <p className="no-products">가입한 펀드 상품이 없습니다.</p>}
              {activeTab === 'stock' && <p className="no-products">가입한 주식 상품이 없습니다.</p>}
          </div>

          <MyDepositDetail
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            account={selectedAccount}
            productDetails={selectedProduct}
          />
      </div>
    );
};

export default Mypage;