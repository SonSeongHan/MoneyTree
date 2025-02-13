import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCookie } from '../../util/cookieUtil';
import '../../css/estate/ApartmentTransactionPage.css';

const ITEMS_PER_PAGE = 5;

const ApartmentTransactionPage = () => {
  const navigate = useNavigate();

  // 탭 상태: 'buyer' (매수 거래 내역) 또는 'seller' (매도 거래 내역)
  const [viewRole, setViewRole] = useState('buyer');

  // 거래 내역 배열 (전체 데이터)
  const [buyerTransactions, setBuyerTransactions] = useState([]);
  const [sellerTransactions, setSellerTransactions] = useState([]);

  // 로딩, 에러, 성공 메시지
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 거래 생성 폼 입력값 (매수 탭)
  const [sellerId, setSellerId] = useState('');
  const [apartmentName, setApartmentName] = useState('');
  const [price, setPrice] = useState('');
  const [remarks, setRemarks] = useState('');
  const [sellerExists, setSellerExists] = useState(null);
  const [latestPrice, setLatestPrice] = useState(null);

  // 추가: 계좌 잔액 상태 (실제 API에서 받아오거나, 쿠키에서 가져올 수 있음)
  const [accountBalance, setAccountBalance] = useState(0);

  // 아파트 목록
  const [apartments, setApartments] = useState([]);

  // Pagination 상태
  const [buyerPage, setBuyerPage] = useState(1);
  const [sellerPage, setSellerPage] = useState(1);

  // 매도 탭: 각 거래별 서명 입력값 관리
  const [signatureInputs, setSignatureInputs] = useState({});

  // 로그인 정보 (쿠키)
  const memberCookie = useMemo(() => getCookie('member'), []);
  const userId = memberCookie?.memberId || '';

  // 계좌 잔액 정보를 가져오는 함수 (예시)
  const fetchAccountBalance = () => {
    // 예: 회원 정보 API에서 계좌 잔액을 가져온다고 가정합니다.
    axios
      .get(`http://localhost:8080/api/members/${encodeURIComponent(userId)}`)
      .then((res) => {
        // 응답에 balance 필드가 있다고 가정합니다.
        setAccountBalance(res.data.balance || 0);
      })
      .catch((err) => {
        console.error('계좌 잔액 조회 오류:', err);
      });
  };

  // 거래 내역 및 아파트 목록 조회 함수
  const fetchTransactions = () => {
    if (!userId) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    const headers = {
      Authorization: `Bearer ${memberCookie.accessToken}`,
      memberId: String(userId),
    };

    // 아파트 목록 조회
    axios
      .get('http://localhost:8080/api/apartments', { headers })
      .then((res) => {
        setApartments(res.data);
      })
      .catch((err) => {
        console.error('아파트 목록 조회 오류:', err);
        setError('아파트 목록 조회 중 오류가 발생했습니다.');
      });

    // 매수 및 매도 거래 내역 조회
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

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchTransactions();
    fetchAccountBalance();
  }, [userId, memberCookie]);

  const handleTabChange = (role) => {
    setViewRole(role);
  };

  const handleCompleteTransaction = (transactionId) => {
    const headers = {
      Authorization: `Bearer ${memberCookie.accessToken}`,
      memberId: String(userId),
    };
    axios
      .put(`http://localhost:8080/api/apartment-transactions/complete/${transactionId}`, null, {
        headers,
      })
      .then((res) => {
        const updated = res.data;
        setSellerTransactions(
          sellerTransactions.map((tx) => (tx.id === updated.id ? updated : tx)),
        );
      })
      .catch((err) => {
        console.error('거래 완료 처리 오류:', err);
      });
  };

  const handleCancelTransaction = (transactionId) => {
    const headers = {
      Authorization: `Bearer ${memberCookie.accessToken}`,
      memberId: String(userId),
    };
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

  const checkSellerExists = () => {
    if (!sellerId || sellerId.trim() === '') {
      setSellerExists('empty');
      return;
    }
    if (sellerId === userId) {
      setSellerExists('self');
      return;
    }
    axios
      .get(`http://localhost:8080/api/members/${encodeURIComponent(sellerId)}`)
      .then((res) => {
        setSellerExists(res.data.exists);
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

  const handleCreateTransaction = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!userId) {
      setError('로그인이 필요합니다.');
      return;
    }
    if (sellerExists !== true) {
      alert('매도자 ID를 확인해 주십시오.');
      return;
    }

    // 거래 가격이 현재 가격보다 부족한 경우
    if (parseInt(price, 10) < parseInt(latestPrice, 10)) {
      const confirmResult = window.confirm(
        '거래 가격이 현재 가격보다 부족합니다. 추천 상품 페이지로 이동하시겠습니까?',
      );
      if (confirmResult) {
        navigate('/estate/fss/mortgage-loan-products');
      }
      return; // 거래 요청 진행하지 않음.
    }

    // 추가: 계좌 잔액을 확인 (거래 금액이 계좌 잔액보다 크면 진행 불가)
    if (parseInt(price, 10) > accountBalance) {
      alert('거래 금액이 계좌 잔액을 초과합니다.');
      return;
    }

    const headers = {
      Authorization: `Bearer ${memberCookie.accessToken}`,
      memberId: String(userId),
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const params = new URLSearchParams();
    params.append('buyerId', userId);
    params.append('sellerId', sellerId);
    params.append('apartmentName', apartmentName);
    params.append('price', parseInt(price, 10));
    params.append('remarks', remarks);

    axios
      .post('http://localhost:8080/api/apartment-transactions', params, { headers })
      .then((res) => {
        setSuccessMessage('거래 요청이 성공적으로 생성되었습니다.');
        setBuyerTransactions([res.data, ...buyerTransactions]);
        setBuyerPage(1);
        // 거래 요청 후 입력값 초기화
        setSellerId('');
        setApartmentName('');
        setPrice('');
        setRemarks('');
      })
      .catch((err) => {
        console.error('거래 생성 오류:', err);
        setError('거래 생성 중 오류가 발생했습니다.');
      });
  };

  const handleConsentForTransaction = (transactionId) => {
    const signature = signatureInputs[transactionId] || '';
    if (signature !== userId) {
      alert('입력하신 서명이 매도자 ID와 일치하지 않습니다. 정확한 매도자 ID를 입력해 주세요.');
      return;
    }
    const headers = {
      Authorization: `Bearer ${memberCookie.accessToken}`,
      memberId: String(userId),
    };
    axios
      .post(`http://localhost:8080/api/apartment-transactions/consent/${transactionId}`, null, {
        headers,
      })
      .then(() => {
        setSellerTransactions(
          sellerTransactions.map((tx) =>
            tx.id === transactionId ? { ...tx, consentGiven: true } : tx,
          ),
        );
      })
      .catch((err) => {
        console.error('서명 완료 처리 오류:', err);
        alert('서명 완료 처리 중 오류가 발생했습니다.');
      });
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
      <div className="pending-header">
        매수 대기중: {buyerTransactions.filter((tx) => tx.status === 'PENDING').length}개 | 매도
        대기중: {sellerTransactions.filter((tx) => tx.status === 'PENDING').length}개
      </div>
      <div className="transaction-tabs">
        <button
          className={viewRole === 'buyer' ? 'active' : ''}
          onClick={() => handleTabChange('buyer')}
        >
          매수 거래 내역
        </button>
        <button
          className={viewRole === 'seller' ? 'active' : ''}
          onClick={() => handleTabChange('seller')}
        >
          매도 거래 내역
        </button>
      </div>

      {viewRole === 'buyer' && (
        <section className="at-create-form">
          <h2>새 거래 요청</h2>
          <form onSubmit={handleCreateTransaction}>
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
              {sellerExists === null ? (
                <p>매도자 ID를 확인해주세요.</p>
              ) : sellerExists === 'empty' ? (
                <p>매도자 ID 입력란에 아이디를 작성해 주십시오.</p>
              ) : sellerExists === 'self' ? (
                <p>타인 명의의 아이디를 적어주십시오.</p>
              ) : sellerExists ? (
                <p>매도자 ID가 존재합니다.</p>
              ) : (
                <p>매도자 ID가 존재하지 않습니다.</p>
              )}
            </div>
            <div className="form-group apartment-select-group">
              <label>아파트 단지명:</label>
              <div
                className="apartment-select-wrapper"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <select value={apartmentName} onChange={handleApartmentChange} required>
                  <option value="">선택하세요</option>
                  {apartments.map((apt) => (
                    <option key={apt.id} value={apt.name}>
                      {apt.name}
                    </option>
                  ))}
                </select>
                {latestPrice !== null && (
                  <span className="latest-transaction" style={{ marginLeft: '10px' }}>
                    현재 가격: {latestPrice} 만원
                  </span>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>거래 가격 (만원):</label>
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
      )}

      <section className="at-list">
        <h2>{viewRole === 'buyer' ? '내 거래 내역' : '거래 요청 목록'}</h2>
        {viewRole === 'buyer' ? (
          paginatedBuyerTransactions.length === 0 ? (
            <p>거래 내역이 없습니다.</p>
          ) : (
            <>
              <ul>
                {paginatedBuyerTransactions.map((tx) => (
                  <li key={tx.id} className="at-item">
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
                      <strong>아파트:</strong> {tx.apartmentName}{' '}
                      <button
                        className="view-apartment-btn"
                        onClick={() =>
                          navigate(`/realestate/details/${encodeURIComponent(tx.apartmentName)}`)
                        }
                      >
                        아파트 조회
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
          <p>거래 내역이 없습니다.</p>
        ) : (
          <>
            <ul>
              {paginatedSellerTransactions.map((tx) => (
                <li key={tx.id} className="at-item">
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
                    <strong>아파트:</strong> {tx.apartmentName}{' '}
                    <button
                      className="view-apartment-btn"
                      onClick={() =>
                        navigate(`/realestate/details/${encodeURIComponent(tx.apartmentName)}`)
                      }
                    >
                      아파트 조회
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
                    <div className="consent-buttons">
                      <input
                        type="text"
                        placeholder="매도자 ID 입력"
                        value={signatureInputs[tx.id] || ''}
                        onChange={(e) =>
                          setSignatureInputs((prev) => ({ ...prev, [tx.id]: e.target.value }))
                        }
                        className="signature-input"
                      />
                      <button
                        className="consent-btn"
                        onClick={() => {
                          const documentUrl = `http://localhost:8080/api/apartment-transactions/complete/${tx.id}/document?memberId=${String(userId)}`;
                          window.open(documentUrl, '_blank');
                        }}
                      >
                        동의 대기중
                      </button>
                      <button
                        className="consent-complete-btn"
                        onClick={() => handleConsentForTransaction(tx.id)}
                      >
                        서명 완료
                      </button>
                    </div>
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
                  {tx.status !== 'PENDING' && (
                    <button className="cancel-btn" onClick={() => handleCancelTransaction(tx.id)}>
                      거래 취소
                    </button>
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
