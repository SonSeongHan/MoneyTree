import React, { useEffect, useState } from "react";
import { getCookie } from "../util/cookieUtil";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import fontkit from "@pdf-lib/fontkit";

const MakeCertificate = () => {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // 쿠키에서 사용자 정보를 읽어옵니다.
    const cookieValue = getCookie("member");
    if (cookieValue) {
      setUserId(cookieValue.memberId || "");
      setUserName(cookieValue.member_name || "");
    }
  }, []);

  /**
   * 은행 인증서와 유사한 디자인의 PDF 생성 및 다운로드 함수
   */
  const handleDownloadCertificate = async () => {
    try {
      // PDF 문서 생성 및 fontkit 등록
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      // 한글 지원을 위한 커스텀 폰트 로드 (예: NotoSansKR)
      const fontUrl = "/fonts/NotoSansKR-Regular.ttf";
      const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
      const customFont = await pdfDoc.embedFont(fontBytes);

      // A4 크기 페이지 추가 (595.28 x 841.89 포인트)
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();

      // 1. 헤더 배경 그리기 (파란색)
      page.drawRectangle({
        x: 0,
        y: height - 100,
        width: width,
        height: 100,
        color: rgb(0, 0.4, 0.8),
      });

      // 2. 헤더 텍스트 (흰색: "공식 은행 인증서")
      page.drawText("공식 은행 인증서", {
        x: 50,
        y: height - 60,
        size: 28,
        font: customFont,
        color: rgb(1, 1, 1),
      });

      // (옵션) 은행 로고 이미지 삽입 가능 (이미지가 있다면 아래 주석 해제)
      /*
      const logoUrl = "/images/bank-logo.png";
      const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
      const logoImage = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImage, {
        x: width - 120,
        y: height - 80,
        width: 70,
        height: 70,
      });
      */

      // 3. 페이지 테두리 그리기
      page.drawRectangle({
        x: 30,
        y: 30,
        width: width - 60,
        height: height - 60,
        borderColor: rgb(0, 0, 0),
        borderWidth: 2,
      });

      // 4. 본문 텍스트 그리기
      page.drawText("이 문서는 공식 은행에서 발급한 인증서입니다.", {
        x: 50,
        y: height - 150,
        size: 18,
        font: customFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(`발급 ID: ${userId || "로그인되지 않은 사용자"}`, {
        x: 50,
        y: height - 190,
        size: 16,
        font: customFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(`발급 이름: ${userName || "이름없음"}`, {
        x: 50,
        y: height - 220,
        size: 16,
        font: customFont,
        color: rgb(0, 0, 0),
      });

      // 5. 하단 워터마크 또는 서명란 (회색 텍스트)
      page.drawText("공식 은행", {
        x: width / 2 - 50,
        y: 50,
        size: 20,
        font: customFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      // PDF를 저장 후 Blob 생성 및 다운로드
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, "MyBankCertificate.pdf");
    } catch (error) {
      console.error("🚨 PDF 생성 중 오류 발생:", error);
    }
  };

  return (
    <div style={{ margin: "50px" }}>
      <h2>인증서 발급 (한글 지원 완료!)</h2>
      <p>
        아래 버튼을 클릭하면 공식 은행 인증서처럼 보이는 PDF 파일이 다운로드됩니다.
      </p>
      <button onClick={handleDownloadCertificate}>인증서 PDF 다운로드</button>
      <div style={{ marginTop: "20px" }}>
        <strong>현재 쿠키상의 사용자 정보</strong>
        <p>ID: {userId || "없음"}</p>
        <p>이름: {userName || "없음"}</p>
      </div>
    </div>
  );
};

export default MakeCertificate;
