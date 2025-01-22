// src/components/MakeAccount.js

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // useNavigate 추가
import { createAccount } from "../../api/AccountAPI"; // 실제 API 함수 임포트

const MakeAccount = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅

  const initialMemberId = location.state?.memberId || "";

  // 상태 정의
  const [memberId, setMemberId] = useState(initialMemberId); // 회원 고유 ID
  const [dandwAcId, setDandwAcId] = useState("");            // 입출금 계좌번호
  const [balance, setBalance] = useState("");                // 계좌 잔액
  const [accountPassword, setAccountPassword] = useState(""); // 계좌 비밀번호
  const [createdAt, setCreatedAt] = useState("");            // 생성일

  // 성공/에러 메시지
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- 1) 랜덤 계좌번호 생성 함수 ---
  const generateAccountNumber = () => {
    // 랜덤 5자리
    const random5 = String(Math.floor(Math.random() * 90000) + 10000);
    // 랜덤 3자리
    const random3 = String(Math.floor(Math.random() * 900) + 100);
    // 최종 형식: 110-23 + 5자리 + - + 3자리
    return `110-23${random5}-${random3}`;
  };

  // --- 2) 컴포넌트가 처음 마운트될 때, 계좌번호 자동 생성 ---
  useEffect(() => {
    const newAccountNumber = generateAccountNumber();
    setDandwAcId(newAccountNumber);
    // 생성일을 오늘 날짜로 자동 설정
    const today = new Date().toISOString().split('T')[0];
    setCreatedAt(today);
  }, []); // 빈 배열이므로 마운트 시 1회만 실행

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const accountData = {
        memberId: memberId,              // DTO에 맞게 키 수정
        dandwAcId: dandwAcId,            // 이미 자동생성된 값
        balance: parseFloat(balance) || 0, // 숫자형으로 변환, 기본값 0
        accountPassword: accountPassword, // DTO에 맞게 키 수정
        createdAt: createdAt,            // 날짜 형식 맞춤
        accountType: "입금출금용",            // 기본값 설정 (필요 시 사용자 입력 가능)
      };

      // 실제 API 호출
      const result = await createAccount(accountData);

      setSuccessMessage("계좌가 성공적으로 생성되었습니다!");
      // 필요하다면 이후 로직 추가 (예: 다른 페이지로 이동)
      // 예: navigate('/some-page');
    } catch (error) {
      setErrorMessage(error || "계좌 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h2>계좌 개설</h2>
          <form onSubmit={handleSubmit} style={styles.form}>

            {/* 회원 고유 ID (readOnly로 수정 불가능하게) */}
            <div style={styles.formGroup}>
              <label>회원 고유 ID</label>
              <input
                  type="text"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  readOnly
                  required
              />
            </div>

            {/* 자동 생성된 계좌번호 */}
            <div style={styles.formGroup}>
              <label>입출금 계좌번호</label>
              <input
                  type="text"
                  value={dandwAcId}
                  onChange={(e) => setDandwAcId(e.target.value)}
                  readOnly  // 필요 시 readOnly 처리 (또는 원하는 경우 editable)
                  required
              />
            </div>

            {/* 계좌 잔액 */}
            <div style={styles.formGroup}>
              <label>계좌 잔액</label>
              <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="잔액"
                  required
                  min="0"
              />
            </div>

            {/* 계좌 비밀번호 */}
            <div style={styles.formGroup}>
              <label>계좌 비밀번호</label>
              <input
                  type="password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  placeholder="비밀번호"
                  required
              />
            </div>

            {/* 생성일 */}
            <div style={styles.formGroup}>
              <label>생성일</label>
              <input
                  type="date"
                  value={createdAt}
                  onChange={(e) => setCreatedAt(e.target.value)}
                  required
              />
            </div>

            <button type="submit" style={styles.submitButton}>
              계좌 개설하기
            </button>
          </form>

          {errorMessage && (
              <p style={{ color: "red", marginTop: "1rem" }}>{errorMessage}</p>
          )}
          {successMessage && (
              <p style={{ color: "green", marginTop: "1rem" }}>{successMessage}</p>
          )}
        </div>
      </div>
  );
};

// 스타일 설정
const styles = {
  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: "center",
    height: "100vh",
    background: "#f5f5f5",
  },
  container: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "400px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "1rem",
  },
  submitButton: {
    padding: "0.75rem",
    fontSize: "1rem",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default MakeAccount;
