import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCookie } from '../../util/cookieUtil';
import '../../css/estate/ApartmentTransactionPage.css';

const ITEMS_PER_PAGE = 5;

const ApartmentTransactionPage = () => {
    const navigate = useNavigate();

    // 상태들
    const [viewRole, setViewRole] = useState('buyer'); // 'buyer' 또는 'seller'
    const [buyerTransactions, setBuyerTransactions] = useState([]);
    const [sellerTransactions, setSellerTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [sellerId, setSellerId] = useState(''); // 거래 요청 폼에서 입력하는 매도자 ID
    const [apartmentName, setApartmentName] = useState('');
    const [price, setPrice] = useState('');
    const [remarks, setRemarks] = useState('');
    const [latestPrice, setLatestPrice] = useState(null); // 선택한 아파트의 최신 가격
    const [apartments, setApartments] = useState([]);
    const [buyerPage, setBuyerPage] = useState(1);
    const [sellerPage, setSellerPage] = useState(1);
    const [accountBalance, setAccountBalance] = useState(null);
    const [sellerExists, setSellerExists] = useState(null); // 'empty', 'exists', 'not_exists', 'self'

    const memberCookie = useMemo(() => getCookie('member'), []);
    const userId = memberCookie?.memberId || '';

    function maskOwnerId(ownerId) {
        if (!ownerId) {
            return '미등록';
        }

        // 보여줄 길이(앞 2글자만)
        const visibleLen = 2;

        // 아이디가 2글자 이하라면, 그대로 + '****' 해도 되고
        // 혹은 그냥 '****'만 붙여도 됩니다(원하는 규칙에 따라).
        if (ownerId.length <= visibleLen) {
            return ownerId + '****';
        }

        // 그 외엔 앞 2글자 + '****'
        return ownerId.slice(0, visibleLen) + '****';
    }

    // 인증 헤더 생성 함수
    const getAuthHeaders = () => {
        if (!memberCookie || !memberCookie.accessToken) {
            console.error('Access token is missing. Redirecting to login.');
            navigate('/login');
            return {};
        }
        return {
            Authorization: `Bearer ${memberCookie.accessToken}`,
            memberId: String(userId),
        };
    };

    // 거래 취소 처리 함수
    const handleCancelTransaction = (transactionId) => {
        const headers = getAuthHeaders();
        axios
          .delete(`http://localhost:8080/api/apartment-transactions/${transactionId}`, { headers })
          .then(() => {
              setBuyerTransactions(buyerTransactions.filter((tx) => tx.id !== transactionId));
              setSellerTransactions(sellerTransactions.filter((tx) => tx.id !== transactionId));
          })
          .catch((err) => {
              console.error('거래 취소 처리 오류:', err);
              alert('거래 취소 처리 중 오류가 발생했습니다.');
          });
    };

    // 거래 완료 처리 (서명 완료 후 거래 수락)
    const handleCompleteTransaction = async (transactionId) => {
        try {
            const headers = getAuthHeaders();
            const transaction = sellerTransactions.find((tx) => tx.id === transactionId);
            if (!transaction || !transaction.consentGiven) {
                alert('서명을 완료한 후 거래를 수락할 수 있습니다.');
                return;
            }
            const response = await axios.put(
              `http://localhost:8080/api/apartment-transactions/complete/${transactionId}`,
              null,
              { headers },
            );
            const updated = response.data;
            setSellerTransactions(sellerTransactions.map((tx) => (tx.id === updated.id ? updated : tx)));
            alert('거래가 완료되었습니다.');
        } catch (error) {
            console.error('거래 완료 처리 오류:', error);
            let errorMessage = '거래 수락 처리 중 오류가 발생했습니다.';
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            }
            alert(errorMessage);
        }
    };

    // 계좌 잔액 조회
    useEffect(() => {
        if (!userId) return;
        const headers = getAuthHeaders();
        axios
          .get(`http://localhost:8080/api/apartment-transactions/account-balance`, { headers })
          .then((res) => {
              setAccountBalance(Number(res.data.balance));
          })
          .catch((err) => {
              console.error('계좌 정보 조회 오류:', err);
          });
    }, [userId, memberCookie, navigate]);

    // 거래 내역 조회
    useEffect(() => {
        setLoading(true);
        setError('');
        fetchTransactions();
    }, [userId, memberCookie]);

    const fetchTransactions = () => {
        if (!userId) {
            setError('로그인이 필요합니다.');
            setLoading(false);
            return;
        }
        const headers = getAuthHeaders();

        axios
          .get('http://localhost:8080/api/apartments', { headers })
          .then((res) => {
              setApartments(res.data);
          })
          .catch((err) => {
              console.error('아파트 목록 조회 오류:', err);
              setError('아파트 목록 조회 중 오류가 발생했습니다.');
          });

        Promise.all([
            axios.get(
              `http://localhost:8080/api/apartment-transactions/buyer/${encodeURIComponent(String(userId))}`,
              { headers },
            ),
            axios.get(
              `http://localhost:8080/api/apartment-transactions/seller/${encodeURIComponent(String(userId))}`,
              { headers },
            ),
        ])
          .then(([buyerRes, sellerRes]) => {
              const sortedBuyer = buyerRes.data.sort(
                (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate),
              );
              const sortedSeller = sellerRes.data.sort(
                (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate),
              );
              setBuyerTransactions(sortedBuyer);
              setSellerTransactions(sortedSeller);
              setLoading(false);
              setBuyerPage(1);
              setSellerPage(1);
          })
          .catch((err) => {
              console.error('거래 내역 조회 오류:', err);
              setError('거래 내역 조회 중 오류가 발생했습니다.');
              setLoading(false);
          });
    };

    // 거래 생성 전 검증
    const handlePreCreateTransaction = (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!userId) {
            setError('로그인이 필요합니다.');
            return;
        }
        if (sellerExists !== 'exists') {
            alert('매도자 ID를 확인해 주십시오.');
            return;
        }

        // (2) 아파트의 ownerId와 sellerId 일치 여부 확인
        const apt = apartments.find((a) => a.name === apartmentName);
        if (!apt) {
            alert('선택한 아파트 정보를 찾을 수 없습니다.');
            return;
        }
        if (apt.ownerId !== sellerId) {
            alert(
              `이 아파트의 소유자는 ${maskOwnerId(apt.ownerId)} 이므로,` +
              ` 입력한 매도자 ID(${sellerId})와 일치하지 않습니다.`,
            );
            return;
        }
        if (parseInt(price, 10) < parseInt(latestPrice, 10)) {
            const confirmResult = window.confirm(
              '거래가격이 현재 가격보다 부족합니다. 추천 상품 페이지로 가시겠습니까?',
            );
            if (confirmResult) {
                navigate('/estate/fss/mortgage-loan-products');
            }
            return;
        }
        if (accountBalance !== null && accountBalance < parseInt(price, 10) * 10000) {
            alert('계좌 잔액이 부족하여 거래를 진행할 수 없습니다.');
            const loanConfirm = window.confirm('대출 상품 추천 페이지로 이동하시겠습니까?');
            if (loanConfirm) {
                navigate('/estate/fss/mortgage-loan-products');
            }
            return;
        }

        handleCreateTransaction();
    };

    // 거래 생성 처리
    const handleCreateTransaction = async () => {
        try {
            const headers = getAuthHeaders();
            const transactionDataToSend = {
                buyerId: userId,
                sellerId,
                apartmentName,
                price: parseInt(price, 10),
                remarks,
            };

            console.log(transactionDataToSend);

            const response = await axios.post(
              'http://localhost:8080/api/apartment-transactions',
              transactionDataToSend,
              { headers },
            );

            setSuccessMessage('거래 요청이 성공적으로 생성되었습니다.');
            setBuyerTransactions([response.data, ...buyerTransactions]);
            setBuyerPage(1);

            // 폼 초기화
            setSellerId('');
            setApartmentName('');
            setPrice('');
            setRemarks('');
        } catch (error) {
            console.error('거래 생성 오류:', error);
            setError(error.response?.data || '거래 생성 중 오류가 발생했습니다.');
        }
    };

    // 매도자 존재 여부 체크 (서버에서 조회)
    const checkSellerExists = () => {
        if (!sellerId || sellerId.trim() === '') {
            setSellerExists('empty');
            return;
        }
        if (sellerId === userId) {
            setSellerExists('self');
            return;
        }
        const headers = getAuthHeaders();
        axios
          .get(`http://localhost:8080/api/members/${encodeURIComponent(sellerId)}`, { headers })
          .then((res) => {
              if (res.data.exists) {
                  setSellerExists('exists'); // 존재하면 'exists'
              } else {
                  setSellerExists('not_exists'); // 존재하지 않으면 'not_exists'
              }
          })
          .catch((err) => {
              console.error('매도자 ID 확인 오류:', err);
              setError('매도자 ID 확인 중 오류가 발생했습니다.');
          });
    };

    const handleApartmentChange = (e) => {
        const selected = e.target.value;
        setApartmentName(selected);
        const apt = apartments.find((a) => a.name === selected);
        if (apt) {
            setLatestPrice(apt.currentPrice);
        } else {
            setLatestPrice(null);
        }
    };

    // Pagination 계산
    const buyerTotalPages = Math.ceil(buyerTransactions.length / ITEMS_PER_PAGE);
    const sellerTotalPages = Math.ceil(sellerTransactions.length / ITEMS_PER_PAGE);
    const paginatedBuyerTransactions = buyerTransactions.slice(
      (buyerPage - 1) * ITEMS_PER_PAGE,
      buyerPage * ITEMS_PER_PAGE,
    );
    const paginatedSellerTransactions = sellerTransactions.slice(
      (sellerPage - 1) * ITEMS_PER_PAGE,
      sellerPage * ITEMS_PER_PAGE,
    );

    const handleBuyerPrevPage = () => {
        if (buyerPage > 1) setBuyerPage(buyerPage - 1);
    };
    const handleBuyerNextPage = () => {
        if (buyerPage < buyerTotalPages) setBuyerPage(buyerPage + 1);
    };
    const handleSellerPrevPage = () => {
        if (sellerPage > 1) setSellerPage(sellerPage - 1);
    };
    const handleSellerNextPage = () => {
        if (sellerPage < sellerTotalPages) setSellerPage(sellerPage + 1);
    };

    if (loading) return <p className="at-loading">로딩 중...</p>;
    if (error) return <p className="at-error">{error}</p>;

    return (
      <div className="at-container">
          <h1 className="at-title">내 부동산 거래 내역</h1>
          {accountBalance !== null && (
            <div className="account-balance">내 계좌 잔액: {accountBalance.toLocaleString()} 원</div>
          )}
          <div className="pending-header">
              매수 대기중: {buyerTransactions.filter((tx) => tx.status === 'PENDING').length}개 | 매도
              대기중: {sellerTransactions.filter((tx) => tx.status === 'PENDING').length}개
          </div>

          {/* 거래 요청 폼 */}
          <section className="at-create-form">
              <h2>새 거래 요청</h2>
              <form onSubmit={handlePreCreateTransaction}>
                  <div className="form-group">
                      <label>매도자 ID:</label>
                      <input
                        type="text"
                        value={sellerId}
                        onChange={(e) => setSellerId(e.target.value)}
                        required
                      />
                      <button type="button" onClick={checkSellerExists}>
                          매도자 ID 확인
                      </button>
                      {sellerExists === 'empty' && <p>아이디를 입력해주세요.</p>}
                      {sellerExists === 'exists' && <p>해당 회원이 존재합니다.</p>}
                      {sellerExists === 'not_exists' && <p>해당 회원이 존재하지 않습니다.</p>}
                      {sellerExists === 'self' && <p>자신의 아이디를 사용할 수 없습니다.</p>}
                  </div>
                  <div className="form-group">
                      <label>아파트 단지명:</label>
                      <select value={apartmentName} onChange={handleApartmentChange} required>
                          <option value="">선택하세요</option>
                          {apartments.map((apt) => (
                            <option key={apt.id} value={apt.name}>
                                {apt.name}
                            </option>
                          ))}
                      </select>
                      {latestPrice !== null && <p>현재 가격: {latestPrice.toLocaleString()} 만원</p>}
                  </div>
                  <div className="form-group">
                      <label>가격:</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                  </div>
                  <div className="form-group">
                      <label>비고:</label>
                      <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                  </div>
                  <button type="submit" className="at-submit-btn">
                      거래 요청 생성
                  </button>
              </form>
              {successMessage && <p className="at-success">{successMessage}</p>}
          </section>

          {/* 거래 내역 탭 */}
          <div className="transaction-tabs">
              <button
                className={viewRole === 'buyer' ? 'active' : ''}
                onClick={() => setViewRole('buyer')}
              >
                  매수 거래 내역
              </button>
              <button
                className={viewRole === 'seller' ? 'active' : ''}
                onClick={() => setViewRole('seller')}
              >
                  매도 거래 내역
              </button>
          </div>

          {/* 거래 내역 목록 */}
          <section className="at-list">
              <h2>{viewRole === 'buyer' ? '내 거래 내역' : '거래 요청 목록'}</h2>
              {viewRole === 'buyer' ? (
                paginatedBuyerTransactions.length === 0 ? (
                  <p>거래 내역이 없습니다.</p>
                ) : (
                  <>
                      <ul>
                          {paginatedBuyerTransactions.map((tx) => (
                            <li key={tx.id}>
                                <p>
                                    <strong>거래 ID:</strong> {tx.id}
                                </p>
                                <p>
                                    <strong>매수자:</strong> {tx.buyerId}
                                </p>
                                <p>
                                    <strong>매도자:</strong> {tx.sellerId}
                                </p>
                                <p>
                                    <strong>아파트:</strong> {tx.apartmentName}
                                    <button
                                      onClick={() =>
                                        (window.location.href = `/realestate/details/${encodeURIComponent(tx.apartmentName)}`)
                                      }
                                      style={{ marginLeft: '10px' }}
                                    >
                                        아파트 상세 조회
                                    </button>
                                </p>
                                <p>
                                    <strong>거래 가격:</strong> {tx.price} 만원
                                </p>
                                <p>
                                    <strong>거래일자:</strong> {new Date(tx.transactionDate).toLocaleString()}
                                </p>
                                <p>
                                    <strong>거래 상태:</strong>{' '}
                                    <span
                                      className={tx.status === 'PENDING' ? 'status-pending' : 'status-completed'}
                                    >
                        {tx.status === 'PENDING' ? '매수대기중' : '매수완료'}
                      </span>
                                </p>
                                <p>
                                    <strong>비고:</strong> {tx.remarks || '없음'}
                                </p>
                                {tx.status === 'PENDING' && tx.buyerId === userId && (
                                  <button className="cancel-btn" onClick={() => handleCancelTransaction(tx.id)}>
                                      거래 취소
                                  </button>
                                )}
                            </li>
                          ))}
                      </ul>
                      <div className="pagination">
                          <button onClick={handleBuyerPrevPage} disabled={buyerPage === 1}>
                              이전
                          </button>
                          <span>
                  {buyerPage} / {buyerTotalPages}
                </span>
                          <button onClick={handleBuyerNextPage} disabled={buyerPage === buyerTotalPages}>
                              다음
                          </button>
                      </div>
                  </>
                )
              ) : paginatedSellerTransactions.length === 0 ? (
                <p>매도 거래 내역이 없습니다.</p>
              ) : (
                <>
                    <ul>
                        {paginatedSellerTransactions.map((tx) => (
                          <li key={tx.id}>
                              <p>
                                  <strong>거래 ID:</strong> {tx.id}
                              </p>
                              <p>
                                  <strong>매수자:</strong> {tx.buyerId}
                              </p>
                              <p>
                                  <strong>매도자:</strong> {tx.sellerId}
                              </p>
                              <p>
                                  <strong>아파트:</strong> {tx.apartmentName}
                                  <button
                                    onClick={() => {
                                        window.location.href = `/realestate/details/${encodeURIComponent(tx.apartmentName)}`;
                                    }}
                                  >
                                      아파트 상세 조회
                                  </button>
                              </p>
                              <p>
                                  <strong>거래 가격:</strong> {tx.price} 만원
                              </p>
                              <p>
                                  <strong>거래일자:</strong> {new Date(tx.transactionDate).toLocaleString()}
                              </p>
                              <p>
                                  <strong>거래 상태:</strong>{' '}
                                  <span
                                    className={tx.status === 'PENDING' ? 'status-pending' : 'status-completed'}
                                  >
                      {tx.status === 'PENDING' ? '매도대기중' : '매도완료'}
                    </span>
                              </p>
                              <p>
                                  <strong>비고:</strong> {tx.remarks || '없음'}
                              </p>
                              {tx.status === 'PENDING' && !tx.consentGiven && (
                                <button
                                  onClick={() => {
                                      if (viewRole !== 'seller') {
                                          alert('매도자만 매도 인증 문서를 열 수 있습니다.');
                                          return;
                                      }
                                      // 매도 인증 문서를 새 창에서 열어서 서명을 진행하도록 합니다.
                                      const sellerAuthUrl = `http://localhost:8080/seller-auth?transactionId=${tx.id}&memberId=${userId}`;
                                      window.open(sellerAuthUrl, '_blank');
                                  }}
                                >
                                    부동산 거래 계약서 서명
                                </button>
                              )}
                              {tx.status === 'PENDING' && tx.consentGiven && (
                                <>
                                    <button
                                      className="complete-btn"
                                      onClick={() => handleCompleteTransaction(tx.id)}
                                    >
                                        거래 수락
                                    </button>
                                    <button className="cancel-btn" onClick={() => handleCancelTransaction(tx.id)}>
                                        거래 취소
                                    </button>
                                </>
                              )}
                          </li>
                        ))}
                    </ul>
                    <div className="pagination">
                        <button onClick={handleSellerPrevPage} disabled={sellerPage === 1}>
                            이전
                        </button>
                        <span>
                {sellerPage} / {sellerTotalPages}
              </span>
                        <button onClick={handleSellerNextPage} disabled={sellerPage === sellerTotalPages}>
                            다음
                        </button>
                    </div>
                </>
              )}
          </section>
      </div>
    );
};

export default ApartmentTransactionPage;
