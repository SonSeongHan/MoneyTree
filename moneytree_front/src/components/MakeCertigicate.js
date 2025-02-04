import React, { useEffect, useState } from "react";
import { getCookie } from "../util/cookieUtil";

const MakeCertificate = () => {
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");

    useEffect(() => {
        // getCookie("member")의 반환값은 이미 { memberId, member_name, ... } 형태의 "JS 객체"
        const cookieValue = getCookie("member");
        if (cookieValue) {
            // JSON.parse() 호출 없이 직접 사용
            setUserId(cookieValue.memberId || "");
            setUserName(cookieValue.member_name || "");
        }
    }, []);

    /**
     * "은행 인증서" + 사용자 정보가 포함된 .txt 파일을 다운로드
     */
    const handleDownloadCertificate = () => {
        const certificateContent = `
은행 인증서
인증서 내용 예시입니다.
발급 ID: ${userId || "로그인되지 않은 사용자"}
발급 이름: ${userName || "이름없음"}
        `;

        const blob = new Blob([certificateContent], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "MyBankCertificate.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
      <div style={{ margin: "50px" }}>
          <h2>인증서 발급 (간단 예시 - 쿠키값 포함)</h2>
          <p>
              아래 버튼을 클릭하면 "은행 인증서" 문구와 쿠키에 있는 사용자 정보가
              포함된 텍스트 파일이 다운로드됩니다.
          </p>
          <button onClick={handleDownloadCertificate}>인증서 다운로드</button>
          <div style={{ marginTop: "20px" }}>
              <strong>현재 쿠키상의 사용자 정보</strong>
              <p>ID: {userId || "없음"}</p>
              <p>이름: {userName || "없음"}</p>
          </div>
      </div>
    );
};

export default MakeCertificate;
