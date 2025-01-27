import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setCookie } from "../../util/cookieUtil";

const LoginPage = () => {
    // 로그인 컴포넌트 초기 state
    const [userType, setUserType] = useState("SimpleMember");
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [rrn, setRrn] = useState(""); // 주민등록번호 (정회원일 경우)
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const navigate = useNavigate();

    // 간편회원가입 & 정회원가입 버튼
    const handleSimpleSignUp = () => navigate("/member/simple/make");
    const handleFullSignUp = () => navigate("/member/full/make");

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        try {
            // ----------- (1) FormData(혹은 URLSearchParams)로 폼 파라미터 구성 -----------
            const formData = new URLSearchParams();
            formData.append("memberId", userId);
            formData.append("memberpassword", password);

            // 정회원(FullMember)일 경우에만 주민등록번호 파라미터를 추가
            if (userType === "FullMember") {
                formData.append("residentRegistrationNumber", rrn);
            }

            // ----------- (2) axios로 x-www-form-urlencoded 요청 보내기 -----------
            const response = await axios.post("http://localhost:8080/api/members/login", formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            // ----------- (3) 응답에서 토큰 등 정보 추출 -----------
            if (response && response.data) {
                const { memberId, accessToken, refreshToken } = response.data;

                // 쿠키나 로컬 스토리지에 토큰 저장
                setCookie(
                    "member",
                    JSON.stringify({ memberId, accessToken, refreshToken }),
                    1
                );

                setSuccessMessage("로그인 성공!");
                navigate("/home");
            }
        } catch (error) {
            // 에러 메시지 추출
            const serverErrorMessage = error.response?.data?.message || "로그인 중 오류가 발생했습니다.";
            setErrorMessage(serverErrorMessage);
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
                <div className="signup-buttons">
                    <button onClick={handleSimpleSignUp}>간편회원가입</button>
                    <button onClick={handleFullSignUp}>정회원가입</button>
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
            </div>
        </div>
    );
};

export default LoginPage;
