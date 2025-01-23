import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/MemberAPI"; // API 호출 함수
import { setCookie } from "../../util/cookieUtil"; // 쿠키 유틸리티

const LoginPage = () => {
  const [userType, setUserType] = useState("simple"); // "simple" or "manager"
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [rrn, setRrn] = useState(""); // 주민등록번호 (정회원일 경우)
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  // 간편회원가입 및 정회원가입 페이지 이동
  const handleSimpleSignUp = () => navigate("/member/simple/make");
  const handleFullSignUp = () => navigate("/member/full/make");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // 회원 타입 설정 (간편회원 또는 정회원)
    const membershipType = userType === "manager" ? "FullMember" : "SimpleMember";

    // 로그인 요청 데이터 구성
    const loginData = {
      member_id: userId, // 기존 userId 대신 member_id 사용
      member_password: password,
      membershipType: membershipType,
    };

    // 정회원일 경우 주민등록번호 추가
    if (membershipType === "FullMember") {
      loginData.residentRegistrationNumber = rrn;
    }

    try {
      // API 호출
      const response = await login(loginData);

      if (response.data) {
        const { accessToken, refreshToken, member_id } = response.data;

        // 쿠키 저장
        setCookie("access_token", accessToken, 1); // 1일 저장
        setCookie("refresh_token", refreshToken, 7); // 7일 저장
        setCookie("member", JSON.stringify(response.data), 1); // member 정보 저장

        setSuccessMessage("로그인 성공!");
        navigate("/home"); // 로그인 성공 후 홈 이동
      } else {
        setErrorMessage("로그인 실패");
      }
    } catch (error) {
      setErrorMessage("에러 발생: " + (error.response?.data || error.message));
    }
  };


  return (
      <div className="login-page">
        <div className="login-container">
          <h2>로그인</h2>
          <div className="user-type-selection">
            <label>
              <input
                  type="radio"
                  value="simple"
                  checked={userType === "simple"}
                  onChange={() => setUserType("simple")}
              />
              간편회원
            </label>
            <label>
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
            <div className="form-group">
              <label>아이디</label>
              <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
              />
            </div>
            {userType === "manager" && (
                <div className="form-group">
                  <label>주민등록번호 (13자리)</label>
                  <input
                      type="text"
                      value={rrn}
                      onChange={(e) => setRrn(e.target.value)}
                      placeholder="예: 1234561234567"
                      pattern="\d{13}"
                      required
                  />
                </div>
            )}
            <div className="form-group">
              <label>비밀번호</label>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
            </div>
            <button type="submit" className="login-button">
              로그인
            </button>
          </form>
          <div className="signup-buttons">
            <button onClick={handleSimpleSignUp} className="signup-button">
              간편회원가입
            </button>
            <button onClick={handleFullSignUp} className="signup-button">
              정회원가입
            </button>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
        </div>
      </div>
  );
};

export default LoginPage;
