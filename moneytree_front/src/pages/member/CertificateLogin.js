import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setCookie } from "../util/cookieUtil"; // 토큰 저장 용도 (쿠키 유틸)

const CertificateLogin = () => {
    const navigate = useNavigate();

    // 파일 내용을 저장하는 state
    const [fileContent, setFileContent] = useState("");
    const [parsedId, setParsedId] = useState("");
    const [parsedName, setParsedName] = useState("");
    const [message, setMessage] = useState("");

    /**
     * 파일 업로드 시 FileReader로 내용을 읽어서
     * - "은행 인증서" 문구 체크
     * - "발급 ID: ???", "발급 이름: ???" 추출
     * - 이 단계에서는 간단히 클라이언트에서도 1차 파싱/확인
     */
    const handleFileChange = (e) => {
        setMessage("");
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const content = evt.target.result;
            setFileContent(content);

            // 간단 파싱 로직
            let extractedId = "";
            let extractedName = "";

            const lines = content.split("\n");
            lines.forEach((line) => {
                line = line.trim();
                if (line.startsWith("발급 ID: ")) {
                    extractedId = line.replace("발급 ID: ", "").trim();
                } else if (line.startsWith("발급 이름: ")) {
                    extractedName = line.replace("발급 이름: ", "").trim();
                }
            });

            setParsedId(extractedId);
            setParsedName(extractedName);
        };

        reader.readAsText(file);
    };

    /**
     * 실제 "인증서 로그인" 버튼 클릭 시
     * 1) 백엔드에 파일 내용 + 파싱된 ID/이름을 보낸다.
     * 2) 백엔드가 검증 후 토큰(또는 사용자 정보) 반환.
     * 3) 클라이언트에서 쿠키에 토큰 저장 → 홈으로 이동.
     */
    const handleLogin = async () => {
        setMessage("");

        if (!fileContent) {
            setMessage("업로드된 파일이 없습니다.");
            return;
        }

        try {
            // 서버로 인증서 파일 내용과 파싱 결과를 전송
            // (백엔드에서 '은행 인증서' 문구 포함 여부, ID/이름 유효성 등을 다시 한번 확인)
            const response = await axios.post("http://localhost:8080/api/members/certificateLogin", {
                fileContent,
                parsedId,
                parsedName,
            });

            // 서버 응답이 정상적으로 오면 (토큰, 사용자 정보 등)
            if (response.data) {
                const { accessToken, refreshToken, memberId, memberName } = response.data;

                // 쿠키에 토큰 저장
                setCookie("member", {
                    memberId,
                    member_name: memberName,
                    accessToken,
                    refreshToken,
                }, 1);

                setMessage("인증서 로그인 성공! 홈으로 이동합니다.");
                // 홈 화면으로 이동
                setTimeout(() => {
                    navigate("/home");
                }, 1000);
            }
        } catch (error) {
            console.error("인증서 로그인 에러:", error);
            const serverMessage = error.response?.data?.message || "인증서 로그인 중 오류가 발생했습니다.";
            setMessage(serverMessage);
        }
    };

    return (
      <div style={{ margin: "50px" }}>
          <h2>인증서 로그인 (파일 업로드)</h2>

          <div style={{ marginBottom: "20px" }}>
              <label>인증서 파일 업로드: </label>
              <input type="file" accept=".txt" onChange={handleFileChange} />
          </div>

          <button onClick={handleLogin}>인증서 로그인</button>

          {message && (
            <p style={{ marginTop: "20px", color: message.includes("성공") ? "green" : "red" }}>
                {message}
            </p>
          )}

          {/* 디버깅용 정보 */}
          {fileContent && (
            <div style={{ marginTop: "20px" }}>
                <h4>파일 내용</h4>
                <pre>{fileContent}</pre>
                <h4>파싱 결과</h4>
                <p>ID: {parsedId}</p>
                <p>이름: {parsedName}</p>
            </div>
          )}
      </div>
    );
};

export default CertificateLogin;
