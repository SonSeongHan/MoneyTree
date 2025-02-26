import React, { useState, useEffect } from 'react';
import { changePassword } from '../api/MemberAPI';
import { getMemberIdFromCookie } from '../util/cookieUtil';

const AccountManagement = () => {
    const [memberId, setMemberId] = useState("");
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('error'); // 'error' 또는 'success'

    useEffect(() => {
        const storedMemberId = getMemberIdFromCookie();
        if (storedMemberId) {
            setMemberId(storedMemberId);
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!memberId || !currentPassword || !newPassword || !confirmNewPassword) {
            setMessage('모든 필드를 입력해주세요.');
            setMessageType('error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setMessage('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            setMessageType('error');
            return;
        }

        try {
            const response = await changePassword({
                memberId,
                memberpassword: currentPassword,
                accountNumber: newPassword,
            });

            if (response.status === 200) {
                setMessage('비밀번호가 성공적으로 변경되었습니다.');
                setMessageType('success');
                setTimeout(() => {
                    window.location.href = "/home";
                }, 2000);
            } else if (response.status === 401) {
                setMessage("현재 비밀번호가 일치하지 않습니다.");
                setMessageType('error');
            } else {
                setMessage("비밀번호 변경 실패: 알 수 없는 오류가 발생했습니다.");
                setMessageType('error');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setMessage("현재 비밀번호가 일치하지 않습니다.");
                setMessageType('error');
            } else {
                setMessage("비밀번호 변경 실패: 서버 오류가 발생했습니다.");
                setMessageType('error');
            }
        }
    };

    return (
      <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          padding: '20px'
      }}>
          <div style={{
              width: '100%',
              maxWidth: '450px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '30px',
              boxSizing: 'border-box'
          }}>
              <h2 style={{
                  textAlign: 'center',
                  color: '#333',
                  marginBottom: '30px',
                  fontSize: '24px',
                  fontWeight: '600'
              }}>비밀번호 변경</h2>

              <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="memberId" style={{
                          display: 'block',
                          marginBottom: '8px',
                          color: '#555',
                          fontSize: '14px',
                          fontWeight: '500'
                      }}>회원 아이디</label>
                      <input
                        type="text"
                        id="memberId"
                        value={memberId}
                        disabled
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: '#f5f5f5',
                            color: '#666',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                        }}
                      />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="currentPassword" style={{
                          display: 'block',
                          marginBottom: '8px',
                          color: '#555',
                          fontSize: '14px',
                          fontWeight: '500'
                      }}>현재 비밀번호</label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.3s'
                        }}
                      />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="newPassword" style={{
                          display: 'block',
                          marginBottom: '8px',
                          color: '#555',
                          fontSize: '14px',
                          fontWeight: '500'
                      }}>새 비밀번호</label>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.3s'
                        }}
                      />
                  </div>

                  <div style={{ marginBottom: '25px' }}>
                      <label htmlFor="confirmNewPassword" style={{
                          display: 'block',
                          marginBottom: '8px',
                          color: '#555',
                          fontSize: '14px',
                          fontWeight: '500'
                      }}>새 비밀번호 확인</label>
                      <input
                        type="password"
                        id="confirmNewPassword"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.3s'
                        }}
                      />
                  </div>

                  <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#2b74e2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1c5bbf'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2b74e2'}
                  >
                      비밀번호 변경
                  </button>
              </form>

              {message && (
                <div style={{
                    marginTop: '20px',
                    padding: '12px',
                    backgroundColor: messageType === 'error' ? '#ffebee' : '#e8f5e9',
                    color: messageType === 'error' ? '#d32f2f' : '#388e3c',
                    borderRadius: '4px',
                    fontSize: '14px',
                    textAlign: 'center'
                }}>
                    {message}
                </div>
              )}

              <div style={{
                  marginTop: '25px',
                  textAlign: 'center',
                  fontSize: '14px',
                  color: '#666'
              }}>
                  <a
                    href="/home"
                    style={{
                        color: '#2b74e2',
                        textDecoration: 'none',
                        transition: 'color 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#1c5bbf'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#2b74e2'}
                  >
                      홈으로 돌아가기
                  </a>
              </div>
          </div>
      </div>
    );
};

export default AccountManagement;