import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { loginPostAsync } from "../../slices/loginSlice";
import { setCookie } from "../../util/cookieUtil";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import "../../css/loginpage.css";
import "../../css/certificatelogin.css";

const LoginPage = () => {
    // 로그인 관련 상태
    const [userType, setUserType] = useState("SimpleMember"); // 간편/정회원 선택
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [rrn, setRrn] = useState("");        // 정회원용 주민번호
    const [errorMessage, setErrorMessage] = useState("");

    // 인증서 관련 상태
    const [fileContent, setFileContent] = useState(""); // 업로드한 PDF base64
    const [certMessage, setCertMessage] = useState("");
    const [pdfBlob, setPdfBlob] = useState(null);       // 인증서 미리보기용 PDF

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const member = useSelector((state) => state.login);

    // 간편/정회원 회원가입 페이지 이동
    const handleSimpleSignUp = () => navigate("/member/simple/make");
    const handleFullSignUp = () => navigate("/member/full/make");

    // 일반 로그인 (간편회원/정회원)
    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        const loginData = {
            memberId: userId,
            memberpassword: password,
        };

        if (userType === "FullMember") {
            loginData.residentRegistrationNumber = rrn;
        }

        try {
            const resultAction = await dispatch(loginPostAsync(loginData));

            if (loginPostAsync.fulfilled.match(resultAction)) {
                if (!resultAction.payload.active) {
                    alert("계정이 비활성 상태입니다. 재활성화 페이지로 이동합니다.");
                    navigate("/reactivate-account");
                } else {
                    navigate("/home");
                }
            } else {
                setErrorMessage("로그인 중 오류가 발생했습니다.");
            }
        } catch (error) {
            setErrorMessage("로그인 중 오류가 발생했습니다.");
        }
    };

    // 인증서 파일 업로드
    const handleFileChange = (e) => {
        setCertMessage("");
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const dataUrl = evt.target.result;        // 예: "data:application/pdf;base64,....."
            const base64String = dataUrl.split(",")[1]; // 접두사("data:...") 제거
            setFileContent(base64String);
        };
        reader.readAsDataURL(file);
    };

    // PDF 미리보기(선택 기능)
    const generatePDF = async () => {
        if (!fileContent) {
            setCertMessage("먼저 PDF 파일을 업로드하세요.");
            return;
        }

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        page.drawText("인증서 확인용", {
            x: 50,
            y: 350,
            size: 20,
            color: rgb(0, 0, 0),
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        setPdfBlob(blob);
    };

    // 인증서 로그인 (파일이 업로드되어 있어야 함)
    const handleCertLogin = async () => {
        setCertMessage("");

        if (!fileContent) {
            setCertMessage("업로드된 PDF 파일이 없습니다.");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:8080/api/members/certificateLogin",
                { fileContent }
            );

            const {
                accessToken,
                refreshToken,
                memberId,
                member_name,
                membershipType,
            } = response.data;

            setCookie(
                "member",
                JSON.stringify({
                    memberId,
                    member_name,
                    membershipType,
                    accessToken,
                    refreshToken,
                }),
                1
            );

            setCertMessage("인증서 로그인 성공! 홈으로 이동합니다.");
            setTimeout(() => {
                navigate("/home");
            }, 1000);
        } catch (error) {
            console.error("인증서 로그인 에러:", error);
            const serverMessage =
                error.response?.data?.message ||
                "인증서 로그인 중 오류가 발생했습니다.";
            setCertMessage(serverMessage);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                {/* 인증서 로그인 영역 */}
                <div className="certificate-login">
                    <h3>인증서 로그인</h3>

                    {/* 인증서 선택 버튼 - 금융인증서 버튼 클릭 시 파일이 선택되어 있다면 로그인 처리 */}
                    <div className="certificate-buttons">
                        <button
                            className="certificate-button"
                            onClick={handleCertLogin}
                        >
                            금융인증서
                        </button>
                    </div>

                    <div className="certificate-options">
                        자동팝업{" "}
                        <label>
                            <input type="radio" name="autoPopup"/>
                            사용
                        </label>
                        <label>
                            <input type="radio" name="autoPopup" defaultChecked/>
                            사용안함
                        </label>
                    </div>

                    <div className="certificate-links">
                        <a href="#">인증서 발급</a>
                        <a href="#">금융인증서 발급</a>
                        <a href="#">공동인증서 발급</a>
                        <a href="#">인증센터</a>
                    </div>

                    {/* 파일 업로드 영역 */}
                    <div className="cert-form-group">
                        <label>인증서 PDF 파일 업로드:</label>
                        <input type="file" accept=".pdf" onChange={handleFileChange}/>

                        {pdfBlob && (
                            <button
                                onClick={() => saveAs(pdfBlob, "certificate.pdf")}
                                className="cert-login-button"
                            >
                                PDF 다운로드
                            </button>
                        )}
                    </div>

                    {/* 상태 메시지 표시 */}
                    {certMessage && (
                        <p
                            className={
                                certMessage.includes("성공")
                                    ? "cert-message-success"
                                    : "cert-message-error"
                            }
                        >
                            {certMessage}
                        </p>
                    )}
                </div>

                {/* 아이디 로그인 영역 */}
                <div className="id-login">
                    <h3>아이디 로그인</h3>

                    <div style={{marginBottom: "8px"}}>
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

                    <form className="login-form" onSubmit={handleLogin}>
                        <input
                            type="text"
                            placeholder="아이디 입력"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            required
                        />

                        {userType === "FullMember" && (
                            <input
                                type="text"
                                placeholder="주민등록번호 (13자리)"
                                value={rrn}
                                onChange={(e) => setRrn(e.target.value)}
                                pattern="\d{13}"
                                required
                            />
                        )}

                        <input
                            type="password"
                            placeholder="비밀번호 입력"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button type="submit" className="login-button" style={{marginTop:"38px"}}>
                            로그인
                        </button>
                    </form>

                    <div className="login-options">
                        <a onClick={handleSimpleSignUp} href="#!">
                            간편회원가입
                        </a>
                        <a onClick={handleFullSignUp} href="#!">
                            정회원가입
                        </a>
                    </div>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
            </div>
        </div>
            );
            };

            export default LoginPage;
