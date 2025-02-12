import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';
import DepositAPI from '../../api/DepositAPI';
import MyDepositDetail from '../../components/recommends/MyDepositDetail';

const Mypage = () => {
    const [depositAccounts, setDepositAccounts] = useState([]);
    const [depositProducts, setDepositProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    if (loading) return <div className="mypage-loading">로딩중...</div>;
    if (error) return <div className="mypage-error">{error}</div>;

    return (
      <div className="mypage-container">
          <h2 className="mypage-title">나의 예금 계좌</h2>
          <div className="deposit-accounts-grid">
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
              {depositAccounts.length === 0 && (
                <p className="no-deposit-accounts">가입한 예금 상품이 없습니다.</p>
              )}
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