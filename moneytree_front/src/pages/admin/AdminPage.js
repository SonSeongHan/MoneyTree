import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../css/adminpage.css'; // 스타일 파일 임포트

const AdminPage = () => {
    const [members, setMembers] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = () => {
        setIsLoading(true);
        axios
          .get('http://localhost:8080/api/admin/members', { withCredentials: true })
          .then(response => {
              setMembers(response.data);
              setError(null);
              setIsLoading(false);
          })
          .catch(err => {
              console.error('회원 정보를 불러오는 중 오류 발생:', err);
              setError('회원 정보를 불러오는 데 실패하였습니다.');
              setIsLoading(false);
          });
    };

    // 검색 필터링
    const filteredMembers = members.filter(member =>
      member.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.membershipType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="admin-dashboard">
          <div className="admin-sidebar">
              <div className="admin-logo">
                  <span className="logo-icon">🏦</span>
                  <h2>Admin Panel</h2>
              </div>
              <nav className="admin-nav">
                  <ul>
                      <li className="active"><span className="nav-icon">👥</span> 회원 관리</li>
                      <li><span className="nav-icon">💰</span> 계좌 관리</li>
                      <li><span className="nav-icon">📊</span> 통계</li>
                      <li><span className="nav-icon">⚙️</span> 설정</li>
                  </ul>
              </nav>
              <div className="admin-sidebar-footer">
                  <button className="logout-button">
                      <span className="logout-icon">🚪</span> 로그아웃
                  </button>
              </div>
          </div>

          <div className="admin-main">
              <header className="admin-header">
                  <h1>회원 관리</h1>
                  <div className="admin-actions">
                      <div className="search-box">
                          <input
                            type="text"
                            placeholder="회원 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <span className="search-icon">🔍</span>
                      </div>
                      <button className="refresh-button" onClick={fetchMembers}>
                          <span className="refresh-icon">🔄</span>
                      </button>
                  </div>
              </header>

              <div className="admin-content">
                  <div className="members-card">
                      <div className="card-header">
                          <h2>전체 회원 목록</h2>
                          <span className="member-count">{members.length}명</span>
                      </div>

                      {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                      )}

                      {isLoading ? (
                        <div className="loading-indicator">
                            <div className="spinner"></div>
                            <p>회원 정보를 불러오는 중...</p>
                        </div>
                      ) : (
                        <div className="table-container">
                            <table className="admin-members-table">
                                <thead>
                                <tr>
                                    <th>회원 ID</th>
                                    <th>회원 유형</th>
                                    <th>가입일</th>
                                    <th>상태</th>
                                    <th>작업</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredMembers.length > 0 ? (
                                  filteredMembers.map(member => (
                                    <tr key={member.memberId}>
                                        <td>
                                            <Link to={`/admin/members/${member.memberId}`} className="member-link">
                                                {member.memberId}
                                            </Link>
                                        </td>
                                        <td>
                                                        <span className={`badge ${member.membershipType.toLowerCase()}`}>
                                                            {member.membershipType}
                                                        </span>
                                        </td>
                                        <td>{new Date(member.member_created_day).toLocaleString()}</td>
                                        <td>
                                                        <span className={`status-badge ${member.deleted ? 'inactive' : 'active'}`}>
                                                            {member.deleted ? '탈퇴' : '활동중'}
                                                        </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="view-button" title="상세 정보">
                                                    <Link to={`/admin/members/${member.memberId}`}>
                                                        👁️
                                                    </Link>
                                                </button>
                                                <button className="edit-button" title="회원 정보 수정">
                                                    ✏️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                      <td colSpan="5" className="no-data">
                                          {searchTerm ? '검색 결과가 없습니다.' : '회원 정보가 없습니다.'}
                                      </td>
                                  </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                      )}
                  </div>
              </div>
          </div>

          <style jsx>{`
                .admin-dashboard {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f5f7fa;
                    font-family: 'Noto Sans KR', sans-serif;
                }
                
                /* 사이드바 스타일 */
                .admin-sidebar {
                    width: 250px;
                    background-color: #2c3e50;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
                }
                
                .admin-logo {
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .logo-icon {
                    font-size: 24px;
                }
                
                .admin-logo h2 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }
                
                .admin-nav {
                    flex: 1;
                    padding: 20px 0;
                }
                
                .admin-nav ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .admin-nav li {
                    padding: 12px 20px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: background-color 0.2s;
                }
                
                .admin-nav li:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                .admin-nav li.active {
                    background-color: rgba(255, 255, 255, 0.2);
                    border-left: 3px solid #3498db;
                }
                
                .nav-icon {
                    font-size: 18px;
                }
                
                .admin-sidebar-footer {
                    padding: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .logout-button {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    padding: 10px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .logout-button:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                /* 메인 콘텐츠 영역 */
                .admin-main {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                }
                
                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .admin-header h1 {
                    margin: 0;
                    font-size: 24px;
                    color: #2c3e50;
                }
                
                .admin-actions {
                    display: flex;
                    gap: 10px;
                }
                
                .search-box {
                    position: relative;
                }
                
                .search-box input {
                    padding: 8px 12px 8px 36px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                    width: 250px;
                }
                
                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 14px;
                    color: #95a5a6;
                }
                
                .refresh-button {
                    background: #ecf0f1;
                    border: 1px solid #ddd;
                    color: #7f8c8d;
                    width: 36px;
                    height: 36px;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s;
                }
                
                .refresh-button:hover {
                    background: #dfe6e9;
                }
                
                /* 카드 스타일 */
                .members-card {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
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
                
                .member-count {
                    background: #f1f2f6;
                    color: #2c3e50;
                    padding: 4px 8px;
                    border-radius: 50px;
                    font-size: 14px;
                    font-weight: 500;
                }
                
                /* 테이블 스타일 */
                .table-container {
                    overflow-x: auto;
                }
                
                .admin-members-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .admin-members-table th {
                    background-color: #f8f9fa;
                    color: #2c3e50;
                    font-weight: 600;
                    text-align: left;
                    padding: 12px 16px;
                    border-bottom: 2px solid #eee;
                }
                
                .admin-members-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #eee;
                    color: #333;
                }
                
                .admin-members-table tr:hover {
                    background-color: #f8f9fa;
                }
                
                .member-link {
                    color: #3498db;
                    text-decoration: none;
                    font-weight: 500;
                }
                
                .member-link:hover {
                    text-decoration: underline;
                }
                
                .badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .badge.normal {
                    background-color: #e1f5fe;
                    color: #0288d1;
                }
                
                .badge.vip {
                    background-color: #ede7f6;
                    color: #5e35b1;
                }
                
                .badge.admin {
                    background-color: #ffebee;
                    color: #c62828;
                }
                
                .status-badge {
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
                
                .action-buttons {
                    display: flex;
                    gap: 8px;
                }
                
                .action-buttons button {
                    background: transparent;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                }
                
                .action-buttons button:hover {
                    background-color: #f1f2f6;
                }
                
                .view-button {
                    color: #3498db;
                }
                
                .edit-button {
                    color: #27ae60;
                }
                
                .no-data {
                    text-align: center;
                    color: #7f8c8d;
                    padding: 40px 0 !important;
                }
                
                /* 에러 메시지 */
                .error-message {
                    background-color: #fff3f3;
                    color: #e74c3c;
                    padding: 12px 16px;
                    margin: 16px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .error-icon {
                    font-size: 18px;
                }
                
                /* 로딩 인디케이터 */
                .loading-indicator {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 0;
                    color: #7f8c8d;
                }
                
                .spinner {
                    width: 30px;
                    height: 30px;
                    border: 3px solid rgba(0, 0, 0, 0.1);
                    border-radius: 50%;
                    border-top-color: #3498db;
                    animation: spin 1s linear infinite;
                    margin-bottom: 10px;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                /* 반응형 디자인 */
                @media (max-width: 768px) {
                    .admin-dashboard {
                        flex-direction: column;
                    }
                    
                    .admin-sidebar {
                        width: 100%;
                        height: auto;
                    }
                    
                    .admin-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }
                    
                    .admin-actions {
                        width: 100%;
                    }
                    
                    .search-box input {
                        width: 100%;
                    }
                }
            `}</style>
      </div>
    );
};

export default AdminPage;