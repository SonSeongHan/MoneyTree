import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginPostAsync } from "../../slices/loginSlice";
import CertificateLogin from "./CertificateLogin";
import "../../css/loginpage.css";

const LoginPage = () => {
    const [userType, setUserType] = useState("SimpleMember");
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [rrn, setRrn] = useState(""); // 주민등록번호 (정회원일 경우)
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();
    const dispatch = useDispatch();
    // Redux store에 있는 로그인 상태를 가져올 수 있습니다.
    const member = useSelector((state) => state.login);

    // 간편회원가입 & 정회원가입 버튼
    const handleSimpleSignUp = () => navigate("/member/simple/make");
    const handleFullSignUp = () => navigate("/member/full/make");

    // 로그인 요청 핸들러
    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        // 파라미터 구성 (정회원이면 주민등록번호 추가)
        const loginData = {
            memberId: userId,
            memberpassword: password,
        };
        if (userType === "FullMember") {
            loginData.residentRegistrationNumber = rrn;
        }

        // Redux 액션 디스패치
        try {
            const resultAction = await dispatch(loginPostAsync(loginData));
            // 액션이 fulfilled 되었을 때의 처리 (예: navigate)
            if (loginPostAsync.fulfilled.match(resultAction)) {
                // 예시: 응답 payload에 active 필드가 있는 경우
                if (!resultAction.payload.active) {
                    alert("계정이 비활성 상태입니다. 재활성화 페이지로 이동합니다.");
                    navigate("/reactivate-account");
                } else {
                    // 정상 로그인 시 홈 페이지로 이동
                    navigate("/home");
                }
            } else {
                // rejected 액션일 경우 에러 메시지 처리
                setErrorMessage("로그인 중 오류가 발생했습니다.");
            }
        } catch (error) {
            setErrorMessage("로그인 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2 className="login-title">로그인</h2>

                {/* 유저 타입(간편, 정회원, 인증서) 선택 */}
                <div className="user-type-selection">
                    <label>
                        <input
                            type="radio"
                            value="SimpleMember"
                            checked={userType === "SimpleMember"}
                            onChange={() => setUserType("SimpleMember")}
                        />
                        간편회원
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="FullMember"
                            checked={userType === "FullMember"}
                            onChange={() => setUserType("FullMember")}
                        />
                        정회원
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="Certificate"
                            checked={userType === "Certificate"}
                            onChange={() => setUserType("Certificate")}
                        />
                        인증서
                    </label>
                </div>

                {/* userType이 "Certificate"이면 <CertificateLogin> 렌더링 */}
                {userType === "Certificate" ? (
                    <CertificateLogin
                        navigate={navigate}
                        setErrorMessage={setErrorMessage}
                    />
                ) : (
                    // 간편/정회원 로그인 폼
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label>아이디</label>
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                required
                            />
                        </div>

                        {userType === "FullMember" && (
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
                )}

                {/* 회원가입 버튼들 */}
                <div className="signup-buttons">
                    <button onClick={handleSimpleSignUp} className="signup-btn">
                        간편회원가입
                    </button>
                    <button onClick={handleFullSignUp} className="signup-btn">
                        정회원가입
                    </button>
                </div>

                {/* 에러 메시지 */}
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
        </div>
    );
};

export default LoginPage;
