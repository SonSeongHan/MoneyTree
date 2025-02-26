import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import '../../css/MemberDetailPage.css';

const MemberDetailPage = () => {
  const { memberId } = useParams();
  const [memberDetail, setMemberDetail] = useState(null);
  const [balance, setBalance] = useState(null);
  const [depositAccounts, setDepositAccounts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('accounts');

  useEffect(() => {
    fetchMemberData();
  }, [memberId]);

  const fetchMemberData = async () => {
    setIsLoading(true);
    try {
      // 1. 회원 상세 정보 조회 (기존 API)
      const memberResponse = await axios.get(
        `http://localhost:8080/api/admin/members/${memberId}`,
        { withCredentials: true }
      );
      console.log('회원 상세 정보 응답:', memberResponse.data);
      setMemberDetail(memberResponse.data);

      // 2. 멤버 아이디로 입출금 계좌 번호 조회 후 잔액 조회
      try {
        const accountResponse = await axios.get(
          `http://localhost:8080/api/accounts/account-number/${memberId}`,
          { withCredentials: true }
        );
        console.log('계좌 번호 응답:', accountResponse.data);
        const dandwAcId = accountResponse.data; // 계좌 번호가 직접 반환된다고 가정

        const balanceResponse = await axios.get(
          `http://localhost:8080/api/accounts/balance/${dandwAcId}`,
          { withCredentials: true }
        );
        console.log('잔액 응답:', balanceResponse.data);
        setBalance(balanceResponse.data);
      } catch (err) {
        console.error('잔액 정보를 불러오는 중 오류 발생:', err);
        setBalance(0); // 잔액 정보가 없을 경우 0으로 표시
      }

      // 3. 예금 상품(예금 계좌) 조회
      try {
        const depositResponse = await axios.get(
          `http://localhost:8080/api/deposit-accounts/my-accounts`,
          { withCredentials: true }
        );
        console.log('예금 상품 응답 데이터:', depositResponse.data);
        // 만약 응답 데이터가 배열이라면 바로 설정
        const accounts = Array.isArray(depositResponse.data)
          ? depositResponse.data
          : depositResponse.data.accounts;
        setDepositAccounts(accounts || []);
      } catch (err) {
        console.error('예금 상품 정보를 불러오는 중 오류 발생:', err);
        setDepositAccounts([]);
      }

      setError(null);
    } catch (err) {
      console.error('회원 상세 정보를 불러오는 중 오류 발생:', err);
      setError('회원 상세 정보를 불러오는 데 실패하였습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 숫자 포맷팅 함수
  const formatNumber = (number) => {
    return new Intl.NumberFormat('ko-KR').format(number);
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{error}</div>
        <Link to="/admin/page" className="back-button">회원 목록으로 돌아가기</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>회원 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="member-detail-page">
      <div className="page-header">
        <div className="header-left">
          <Link to="/admin/page" className="back-link">
            <span className="back-icon">←</span> 목록으로
          </Link>
          <h1>{memberDetail.memberId}님의 상세 정보</h1>
        </div>
        <div className="header-actions">
          <button className="refresh-button" onClick={fetchMemberData}>
            <span className="refresh-icon">🔄</span> 새로고침
          </button>
        </div>
      </div>

      <div className="member-profile-section">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {memberDetail.memberName ? memberDetail.memberName.charAt(0).toUpperCase() : memberId.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h2>{memberDetail.memberName || memberDetail.memberId}</h2>
              <span className="membership-badge">
                                {memberDetail.membershipType || "일반 회원"}
                            </span>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">회원 ID</span>
              <span className="detail-value">{memberDetail.memberId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">잔액</span>
              <span className="detail-value balance">{formatNumber(balance)} 원</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">가입일</span>
              <span className="detail-value">
                                {memberDetail.member_created_day ?
                                  new Date(memberDetail.member_created_day).toLocaleDateString() :
                                  '정보 없음'}
                            </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">상태</span>
              <span className={`status-badge ${memberDetail.deleted ? 'inactive' : 'active'}`}>
                                {memberDetail.deleted ? '탈퇴' : '활동중'}
                            </span>
            </div>
          </div>
        </div>

        <div className="profile-extra-info">
          <div className="info-card">
            <h3>가입 상품</h3>
            <div className="tag-list">
              {memberDetail.subscribedProducts && memberDetail.subscribedProducts.length > 0 ? (
                memberDetail.subscribedProducts.map((product, index) => (
                  <span key={index} className="info-tag product-tag">{product}</span>
                ))
              ) : (
                <span className="empty-info">  NH내가Green초록세상예금
                  <p>
                    예금액 : 1,000,000
                  </p>
                </span>


              )}
            </div>
          </div>

          <div className="info-card">
            <h3>취미</h3>
            <div className="tag-list">
              {memberDetail.hobbies && memberDetail.hobbies.length > 0 ? (
                memberDetail.hobbies.map((hobby, index) => (
                  <span key={index} className="info-tag hobby-tag">{hobby}</span>
                ))
              ) : (
                <span className="empty-info">여행/수영</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-header">
          <button
            className={`tab-button ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            예금 상품
          </button>
          <button
            className={`tab-button ${activeTab === 'transfers' ? 'active' : ''}`}
            onClick={() => setActiveTab('transfers')}
          >
            송금 내역
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'accounts' && (
            <div className="data-card">
              <div className="card-header">
                <h2>예금 상품 목록</h2>
                <span className="item-count">{depositAccounts.length}개</span>
              </div>

              {depositAccounts.length > 0 ? (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                    <tr>
                      <th>계좌 번호</th>
                      <th>예금 금액</th>
                      <th>시작 날짜</th>
                      <th>만기 날짜</th>
                      <th>상태</th>
                    </tr>
                    </thead>
                    <tbody>
                    {depositAccounts.map(account => {
                      const startDate = new Date(account.depositStartDate);
                      const endDate = new Date(account.depositEndDate);
                      const now = new Date();
                      const status = now > endDate ? '만기' : '진행중';

                      return (
                        <tr key={account.depositAccountNumber}>
                          <td>{account.formattedAccountNumber}</td>
                          <td className="amount-cell">
                            {formatNumber(account.depositAmount)} 원
                          </td>
                          <td>{startDate.toLocaleDateString()}</td>
                          <td>{endDate.toLocaleDateString()}</td>
                          <td>
                                                            <span className={`account-status ${status === '만기' ? 'expired' : 'active'}`}>
                                                                {status}
                                                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <p>가입한 예금 상품이 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transfers' && (
            <div className="data-card">
              <div className="card-header">
                <h2>송금 내역</h2>
                <span className="item-count">
                                    {memberDetail.transferHistory ? memberDetail.transferHistory.length : 0}건
                                </span>
              </div>

              {memberDetail.transferHistory && memberDetail.transferHistory.length > 0 ? (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                    <tr>
                      <th>거래 ID</th>
                      <th>거래 유형</th>
                      <th>금액</th>
                      <th>날짜</th>
                      <th>보낸 사람</th>
                      <th>받은 사람</th>
                    </tr>
                    </thead>
                    <tbody>
                    {memberDetail.transferHistory.map(tx => (
                      <tr key={tx.id}>
                        <td>{tx.id}</td>
                        <td>
                                                        <span className={`transaction-type ${tx.transactionType.toLowerCase()}`}>
                                                            {tx.transactionType}
                                                        </span>
                        </td>
                        <td className="amount-cell">{formatNumber(tx.amount)} 원</td>
                        <td>{new Date(tx.createdAt).toLocaleString()}</td>
                        <td>{tx.fromMemberName || '-'}</td>
                        <td>{tx.toMemberName || '-'}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">💸</div>
                  <p>송금 내역이 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
                .member-detail-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 30px;
                    font-family: 'Noto Sans KR', sans-serif;
                }
                
                /* 헤더 섹션 */
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                }
                
                .header-left {
                    display: flex;
                    flex-direction: column;
                }
                
                .header-left h1 {
                    margin: 10px 0 0 0;
                    font-size: 26px;
                    color: #2c3e50;
                }
                
                .back-link {
                    display: inline-flex;
                    align-items: center;
                    color: #3498db;
                    text-decoration: none;
                    font-size: 14px;
                    margin-bottom: 8px;
                }
                
                .back-icon {
                    margin-right: 6px;
                    font-size: 16px;
                }
                
                .refresh-button {
                    background-color: #f8f9fa;
                    border: 1px solid #ddd;
                    color: #555;
                    padding: 8px 16px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .refresh-button:hover {
                    background-color: #e9ecef;
                }
                
                .refresh-icon {
                    font-size: 14px;
                }
                
                /* 프로필 섹션 */
                .member-profile-section {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                
                .profile-card {
                    flex: 1;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                
                .profile-header {
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border-bottom: 1px solid #eee;
                }
                
                .profile-avatar {
                    width: 60px;
                    height: 60px;
                    background-color: #3498db;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 600;
                }
                
                .profile-info h2 {
                    margin: 0 0 8px 0;
                    font-size: 20px;
                    color: #2c3e50;
                }
                
                .membership-badge {
                    display: inline-block;
                    background-color: #e1f5fe;
                    color: #0288d1;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .profile-details {
                    padding: 20px;
                }
                
                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #eee;
                }
                
                .detail-item:last-child {
                    margin-bottom: 0;
                    padding-bottom: 0;
                    border-bottom: none;
                }
                
                .detail-label {
                    color: #7f8c8d;
                    font-size: 14px;
                }
                
                .detail-value {
                    font-weight: 500;
                    color: #2c3e50;
                }
                
                .detail-value.balance {
                    color: #3498db;
                    font-weight: 600;
                }
                
                .status-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 50px;
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .status-badge.active {
                    background-color: #e8f5e9;
                    color: #2e7d32;
                }
                
                .status-badge.inactive {
                    background-color: #fafafa;
                    color: #757575;
                }
                
                /* 추가 정보 카드 */
                .profile-extra-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .info-card {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    flex: 1;
                }
                
                .info-card h3 {
                    margin: 0 0 15px 0;
                    color: #2c3e50;
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .tag-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .info-tag {
                    display: inline-block;
                    padding: 6px 10px;
                    border-radius: 50px;
                    font-size: 13px;
                }
                
                .product-tag {
                    background-color: #fff8e1;
                    color: #ff8f00;
                }
                
                .hobby-tag {
                    background-color: #e8eaf6;
                    color: #3f51b5;
                }
                
                .empty-info {
                    color: #95a5a6;
                    font-style: italic;
                    font-size: 14px;
                }
                
                /* 탭 컨테이너 */
                .tabs-container {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                
                .tabs-header {
                    display: flex;
                    border-bottom: 1px solid #eee;
                }
                
                .tab-button {
                    padding: 16px 20px;
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid transparent;
                    font-size: 15px;
                    color: #7f8c8d;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .tab-button:hover {
                    background-color: #f8f9fa;
                }
                
                .tab-button.active {
                    color: #3498db;
                    border-bottom-color: #3498db;
                    font-weight: 500;
                }
                
                .data-card {
                    padding: 0;
                }
                
                .card-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .card-header h2 {
                    margin: 0;
                    font-size: 18px;
                    color: #2c3e50;
                }
                
                .item-count {
                    background: #f1f2f6;
                    color: #2c3e50;
                    padding: 4px 8px;
                    border-radius: 50px;
                    font-size: 13px;
                    font-weight: 500;
                }
                
                /* 테이블 스타일 */
                .table-responsive {
                    overflow-x: auto;
                }
                
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .data-table th {
                    background-color: #f8f9fa;
                    color: #2c3e50;
                    font-weight: 600;
                    text-align: left;
                    padding: 12px 16px;
                    border-bottom: 1px solid #eee;
                    white-space: nowrap;
                }
                
                .data-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #eee;
                    color: #333;
                }
                
                .data-table tr:hover {
                    background-color: #f8f9fa;
                }
                
                .data-table tr:last-child td {
                    border-bottom: none;
                }
                
                .amount-cell {
                    font-weight: 500;
                    text-align: right;
                }
                
                .account-status {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 50px;
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .account-status.active {
                    background-color: #e8f5e9;
                    color: #2e7d32;
                }
                
                .account-status.expired {
                    background-color: #fff8e1;
                    color: #ff8f00;
                }
                
                .transaction-type {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .transaction-type.deposit {
                    background-color: #e8f5e9;
                    color: #2e7d32;
                }
                
                .transaction-type.withdraw {
                    background-color: #ffebee;
                    color: #c62828;
                }
                
                .transaction-type.transfer {
                    background-color: #e3f2fd;
                    color: #1565c0;
                }
                
                /* 빈 상태 */
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 0;
                    color: #7f8c8d;
                }
                
                .empty-icon {
                    font-size: 36px;
                    margin-bottom: 10px;
                }
                
                .empty-state p {
                    margin: 0;
                    font-size: 15px;
                }
                
                /* 로딩 & 에러 상태 */
                .loading-container, .error-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                    padding: 40px;
                    text-align: center;
                }
                
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(0, 0, 0, 0.1);
                    border-radius: 50%;
                    border-top-color: #3498db;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .error-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }
                
                .error-message {
                    font-size: 18px;
                    color: #e74c3c;
                    margin-bottom: 20px;
                }
                
                .back-button {
                    display: inline-block;
                    background-color: #3498db;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 4px;
                    text-decoration: none;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }
                
                .back-button:hover {
                    background-color: #2980b9;
                }
                
                /* 반응형 디자인 */
                @media (max-width: 768px) {
                    .member-profile-section {
                        flex-direction: column;
                    }
                    
                    .profile-extra-info {
                        flex-direction: column;
                    }
                    
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }
                    
                    .header-actions {
                        align-self: flex-end;
                    }
                }
            `}</style>
    </div>
  );
};

export default MemberDetailPage;