import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setCookie } from "../../util/cookieUtil";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

const CertificateLogin = () => {
    const navigate = useNavigate();
    const [fileContent, setFileContent] = useState(""); // Base64 인코딩된 PDF 데이터
    const [message, setMessage] = useState("");
    const [pdfBlob, setPdfBlob] = useState(null); // 옵션: 생성된 PDF 미리보기용

    // PDF 파일 업로드 시 처리 (Base64 문자열 변환)
    const handleFileChange = (e) => {
        setMessage("");
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const dataUrl = evt.target.result; // 예: "data:application/pdf;base64,......"
            const base64String = dataUrl.split(",")[1]; // 접두사 제거
            setFileContent(base64String);
        };

        reader.readAsDataURL(file);
    };

    // 옵션: 업로드한 PDF 정보를 기반으로 새 PDF를 생성 (필수 아님)
    const generatePDF = async () => {
        if (!fileContent) {
            setMessage("먼저 PDF 파일을 업로드하세요.");
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
        // 추가 정보를 원한다면 여기에 추가로 그릴 수 있습니다.

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        setPdfBlob(blob);
    };

    // PDF 파일을 서버로 전송하여 인증 처리
    const handleLogin = async () => {
        setMessage("");

        if (!fileContent) {
            setMessage("업로드된 PDF 파일이 없습니다.");
            return;
        }

        try {
            const response = await axios.post(
              "http://localhost:8080/api/members/certificateLogin",
              {
                  fileContent, // Base64 인코딩된 PDF 데이터 전송
              }
            );

            // 서버에서 PDF의 텍스트를 파싱해 발급 ID/이름과 member DB를 대조 후 로그인 처리 후 토큰을 반환한다고 가정합니다.
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

            setMessage("인증서 로그인 성공! 홈으로 이동합니다.");
            setTimeout(() => {
                navigate("/home");
            }, 1000);
        } catch (error) {
            console.error("인증서 로그인 에러:", error);
            const serverMessage =
              error.response?.data?.message ||
              "인증서 로그인 중 오류가 발생했습니다.";
            setMessage(serverMessage);
        }
    };

    return (
      <div style={{ margin: "50px" }}>
          <h2>인증서 로그인 (PDF 파일 업로드)</h2>

          <div style={{ marginBottom: "20px" }}>
              <label>인증서 PDF 파일 업로드: </label>
              <input type="file" accept=".pdf" onChange={handleFileChange} />
          </div>

          <button onClick={handleLogin}>인증서 로그인</button>
          <button onClick={generatePDF} style={{ marginLeft: "10px" }}>
              PDF 생성 (옵션)
          </button>

          {pdfBlob && (
            <button
              onClick={() => {
                  saveAs(pdfBlob, "certificate.pdf");
              }}
              style={{ marginLeft: "10px" }}
            >
                PDF 다운로드
            </button>
          )}

          {message && (
            <p
              style={{
                  marginTop: "20px",
                  color: message.includes("성공") ? "green" : "red",
              }}
            >
                {message}
            </p>
          )}
      </div>
    );
};

export default CertificateLogin;
