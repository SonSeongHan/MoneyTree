import React, { useState } from "react";
import useCustomLogin from "../../hooks/PlayerLoginHook";
import KakaoLoginComponent from "./KakaoLoginComponent";
import "../../css/logincomponent.css"; // CSS 파일 연결
import { useNavigate } from "react-router-dom";
import {useAuth} from "../../AuthContext";

const initState = {
  email: "",
  pw: "",
};

const LoginComponent = () => {
  const [loginParam, setLoginParam] = useState({ ...initState });
  const { login } = useAuth(); // AuthContext에서 login 함수 가져오기
  const { doLogin, moveToPath } = useCustomLogin();


  const handleChange = (e) => {
    loginParam[e.target.name] = e.target.value;
    setLoginParam({ ...loginParam });
  };


  const navigate = useNavigate(); // useNavigate 호출
  const handleSignUp = () => {
    navigate("/player/make");
  };

  const handleClickLogin = async () => {
    try {
      const data = await doLogin(loginParam);
      if (data.error) {
        alert('이메일과 패스워드를 다시 확인하세요');
      } else {
        alert('로그인 성공');
        login(data.user); // 로그인 상태 업데이트
        moveToPath('/'); // 메인 페이지로 이동
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleClickLogin();
    }
  };
  return (
      <div className="login-container">
        <div className="login-header">
          <h1>Login</h1>
        </div>
        <div className="login-form">
          <label>Email</label>
          <input
              type="text"
              name="email"
              value={loginParam.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="login-input"
          />
          <label>Password</label>
          <input
              type="password"
              name="pw"
              value={loginParam.pw}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="login-input"
          />
          <button onClick={handleClickLogin} className="login-button">
            Login
          </button>
          <>wdwdwd</>
        </div>
        <KakaoLoginComponent/>
        <button className="signup-button" onClick={handleSignUp}>
          회원가입
        </button>
      </div>
  );
};

export default LoginComponent;
