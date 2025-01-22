import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/MemberAPI";

const LoginPage = () => {
  const [userType, setUserType] = useState("simple");
  const [userId, setUserId] = useState("");
  const [rrn, setRrn] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleSimpleSignUp = () => navigate("/member/simple/make");
  const handleFullSignUp = () => navigate("/member/full/make");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (userType === "manager" && (!rrn || rrn.length !== 13)) {
      setErrorMessage("주민등록번호는 13자리를 입력하세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/members/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          residentRegistrationNumber: userType === "manager" ? rrn : null,
          member_password: password,
          membershipType: userType === "manager" ? "FullMember" : "SimpleMember",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "로그인 실패");
      }

      setSuccessMessage("로그인 성공!");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };


  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2>로그인</h2>
        <div style={styles.userTypeGroup}>
          <label>
            <input
              type="radio"
              value="simple"
              checked={userType === "simple"}
              onChange={() => setUserType("simple")}
            />
            간편회원
          </label>
          <label style={{ marginLeft: "1rem" }}>
            <input
              type="radio"
              value="manager"
              checked={userType === "manager"}
              onChange={() => setUserType("manager")}
            />
            정회원
          </label>
        </div>
        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label>아이디</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          {userType === "manager" && (
            <div style={styles.formGroup}>
              <label>주민등록번호(13자리)</label>
              <input
                type="text"
                value={rrn}
                onChange={(e) => setRrn(e.target.value)}
                style={styles.input}
                placeholder="예: 1234561234567"
                required
              />
            </div>
          )}
          <div style={styles.formGroup}>
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.loginButton}>
            로그인
          </button>
        </form>
        <div style={styles.signupButtonsContainer}>
          <button onClick={handleSimpleSignUp} style={styles.signupButton}>
            간편회원가입
          </button>
          <button onClick={handleFullSignUp} style={styles.signupButton}>
            정회원가입
          </button>
        </div>
        {errorMessage && <p style={styles.errorMsg}>{errorMessage}</p>}
        {successMessage && <p style={styles.successMsg}>{successMessage}</p>}
      </div>
    </div>
  );
};

// 간단한 인라인 스타일
const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f5f5f5",
  },
  container: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "350px",
    textAlign: "center",
  },
  userTypeGroup: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1rem",
  },
  formGroup: {
    marginBottom: "1rem",
    textAlign: "left",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    boxSizing: "border-box",
    marginTop: "0.25rem",
    fontSize: "1rem",
  },
  loginButton: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "1rem",
  },
  signupButtonsContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "1rem",
  },
  signupButton: {
    width: "48%", // 두 버튼이 나란히 보이도록 예시값
    padding: "0.75rem",
    fontSize: "1rem",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  errorMsg: {
    color: "red",
    marginTop: "1rem",
  },
  successMsg: {
    color: "green",
    marginTop: "1rem",
  },
};

export default LoginPage;
