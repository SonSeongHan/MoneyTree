import React, { useState } from 'react';
import axios from 'axios';
import { setCookie } from '../../util/cookieUtil'; // 쿠키 관련 유틸리티 임포트
import '../../css/adminlogin.css'; // 스타일 파일 임포트

const AdminLogin = () => {
    const [memberId, setMemberId] = useState('');
    const [memberpassword, setMemberpassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // POST 요청으로 관리자 로그인 엔드포인트 호출
            const response = await axios.post(
              'http://localhost:8080/api/admin/login',
              {
                  memberId,
                  memberpassword,
              },
              {
                  withCredentials: true,
              }
            );

            // 로그인 성공 시 처리
            console.log('로그인 성공:', response.data);

            // 쿠키에 저장
            setCookie('member', response.data, 1);

            // 관리자 메인 페이지로 이동
            window.location.href = '/admin/page';
        } catch (err) {
            console.error('로그인 실패:', err);
            setError('로그인에 실패하였습니다. 아이디와 비밀번호를 확인해주세요.');
            setIsLoading(false);
        }
    };

    return (
      <div className="admin-login-page">
          <div className="admin-login-container">
              <div className="admin-login-header">
                  <div className="admin-icon">👤</div>
                  <h2>관리자 로그인</h2>
              </div>

              <form onSubmit={handleLogin} className="admin-login-form">
                  <div className="form-group">
                      <label htmlFor="memberId">아이디</label>
                      <div className="input-wrapper">
                          <span className="input-icon">🔒</span>
                          <input
                            type="text"
                            id="memberId"
                            value={memberId}
                            onChange={(e) => setMemberId(e.target.value)}
                            placeholder="관리자 아이디를 입력하세요"
                            required
                          />
                      </div>
                  </div>

                  <div className="form-group">
                      <label htmlFor="memberpassword">비밀번호</label>
                      <div className="input-wrapper">
                          <span className="input-icon">🔑</span>
                          <input
                            type="password"
                            id="memberpassword"
                            value={memberpassword}
                            onChange={(e) => setMemberpassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            required
                          />
                      </div>
                  </div>

                  {error && <div className="error-message">{error}</div>}

                  <button
                    type="submit"
                    className="login-button"
                    disabled={isLoading}
                  >
                      {isLoading ? '로그인 중...' : '로그인'}
                  </button>

                  <div className="admin-login-footer">
                      <p>관리자 전용 페이지입니다.</p>
                      <p>권한이 없는 경우 접속이 제한됩니다.</p>
                  </div>
              </form>
          </div>

          <style jsx>{`
                .admin-login-page {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    padding: 20px;
                }
                
                .admin-login-container {
                    width: 100%;
                    max-width: 420px;
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                
                .admin-login-header {
                    background-color: #2c3e50;
                    color: white;
                    padding: 25px 30px;
                    text-align: center;
                    position: relative;
                }
                
                .admin-login-header h2 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                }
                
                .admin-icon {
                    font-size: 42px;
                    margin-bottom: 15px;
                }
                
                .admin-login-form {
                    padding: 30px;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #333;
                    font-size: 14px;
                }
                
                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                
                .input-icon {
                    position: absolute;
                    left: 12px;
                    color: #95a5a6;
                    font-size: 16px;
                }
                
                .form-group input {
                    width: 100%;
                    padding: 12px 12px 12px 40px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 15px;
                    transition: border-color 0.3s, box-shadow 0.3s;
                }
                
                .form-group input:focus {
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
                    outline: none;
                }
                
                .form-group input::placeholder {
                    color: #aaa;
                }
                
                .error-message {
                    background-color: #fee;
                    color: #e74c3c;
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 14px;
                    margin-bottom: 20px;
                    text-align: center;
                }
                
                .login-button {
                    width: 100%;
                    padding: 14px;
                    background-color: #2c3e50;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                
                .login-button:hover {
                    background-color: #1a252f;
                }
                
                .login-button:disabled {
                    background-color: #95a5a6;
                    cursor: not-allowed;
                }
                
                .admin-login-footer {
                    margin-top: 25px;
                    text-align: center;
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                }
                
                .admin-login-footer p {
                    margin: 5px 0;
                    font-size: 13px;
                    color: #7f8c8d;
                }
                
                @media (max-width: 480px) {
                    .admin-login-container {
                        max-width: 100%;
                    }
                    
                    .admin-login-header {
                        padding: 20px;
                    }
                    
                    .admin-login-form {
                        padding: 20px;
                    }
                }
            `}</style>
      </div>
    );
};

export default AdminLogin;