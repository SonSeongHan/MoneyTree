import React, { useState, useEffect } from "react";
import { changeName } from "../api/MemberAPI"; // 이름 변경 API 호출
import { getMemberIdFromCookie, getCookie, setCookie } from "../util/cookieUtil"; // 쿠키 관련 함수

const ChangeName = () => {
    const [memberId, setMemberId] = useState(""); // 현재 아이디 (쿠키에서 가져옴)
    const [newName, setNewName] = useState(""); // 변경할 이름
    const [password, setPassword] = useState(""); // 비밀번호
    const [message, setMessage] = useState(""); // 결과 메시지

    // ✅ 컴포넌트가 마운트될 때 쿠키에서 memberId 가져오기
    useEffect(() => {
        const storedMemberId = getMemberIdFromCookie(); // 쿠키에서 memberId 가져오기
        if (storedMemberId) {
            setMemberId(storedMemberId); // 상태값 업데이트
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!memberId || !newName || !password) {
            setMessage("모든 필드를 입력해주세요.");
            return;
        }

        try {
            const response = await changeName({
                memberId,        // 쿠키에서 가져온 기존 아이디 (수정 불가능)
                member_name: newName, // 변경할 이름
                memberpassword: password, // 비밀번호
            });

            if (response.status === 200) {
                // ✅ 성공 시 쿠키 값도 업데이트
                const currentMember = getCookie("member"); // 기존 쿠키 값 가져오기
                if (currentMember) {
                    const updatedMember = JSON.stringify({ ...currentMember, member_name: newName });
                    setCookie("member", updatedMember, 7);

                }

                // ✅ 알럿 띄우기
                alert("이름이 성공적으로 변경되었습니다.");

                // ✅ 새로고침하면서 /home 으로 이동
                window.location.href = "/home";
            } else {
                setMessage("이름 변경 실패: 알 수 없는 오류가 발생했습니다.");
            }
        } catch (error) {
            setMessage("이름 변경 실패: 비밀번호가 틀리거나 오류가 발생했습니다.");
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
              }}>이름 변경</h2>

              <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="memberId" style={{
                          display: 'block',
                          marginBottom: '8px',
                          color: '#555',
                          fontSize: '14px',
                          fontWeight: '500'
                      }}>현재 아이디</label>
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
                      <label htmlFor="newName" style={{
                          display: 'block',
                          marginBottom: '8px',
                          color: '#555',
                          fontSize: '14px',
                          fontWeight: '500'
                      }}>새 이름</label>
                      <input
                        type="text"
                        id="newName"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
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
                      <label htmlFor="password" style={{
                          display: 'block',
                          marginBottom: '8px',
                          color: '#555',
                          fontSize: '14px',
                          fontWeight: '500'
                      }}>비밀번호</label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                  >
                      이름 변경
                  </button>
              </form>

              {message && (
                <div style={{
                    marginTop: '20px',
                    padding: '12px',
                    backgroundColor: '#ffebee',
                    color: '#d32f2f',
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
                    }}
                  >
                      홈으로 돌아가기
                  </a>
              </div>
          </div>
      </div>
    );
};

export default ChangeName;