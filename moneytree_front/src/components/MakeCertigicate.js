import React, { useEffect, useState } from "react";
import { getCookie } from "../util/cookieUtil";
import { PDFDocument, rgb, degrees } from "pdf-lib";
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
   * 디자인 요소가 추가된 은행 인증서 PDF 생성 및 다운로드 함수
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

      // 1. (파란색 헤더 배경 제거됨)
      // 원래 있던 헤더 배경을 제거하고, 바로 텍스트만 그립니다.
      page.drawText("공식 은행 인증서", {
        x: 50,
        y: height - 60,
        size: 28,
        font: customFont,
        color: rgb(0, 0, 0), // 검은색 텍스트
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

      // 2. 장식용 외곽 테두리 (페이지 외곽에)
      page.drawRectangle({
        x: 20,
        y: 20,
        width: width - 40,
        height: height - 40,
        borderColor: rgb(0.2, 0.2, 0.2),
        borderWidth: 3,
        opacity: 0.7,
      });

      // 3. 헤더 아래 구분선 (연한 회색)
      page.drawLine({
        start: { x: 30, y: height - 110 },
        end: { x: width - 30, y: height - 110 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });

      // 4. 중앙 워터마크 (회전, 투명도 적용)
      page.drawText("공식 인증서", {
        x: width / 2 - 150,
        y: height / 2 - 40,
        size: 80,
        font: customFont,
        color: rgb(0.8, 0.8, 0.8),
        rotate: degrees(-45),
        opacity: 0.2,
      });

      // 5. 본문 텍스트 영역
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

      // 6. 하단 서명 및 발급일 영역
      page.drawText("발급일: 2025년 02월 13일", {
        x: 50,
        y: 100,
        size: 14,
        font: customFont,
        color: rgb(0, 0, 0),
      });

      page.drawText("은행 대표 서명:", {
        x: 50,
        y: 70,
        size: 14,
        font: customFont,
        color: rgb(0, 0, 0),
      });

      // 서명용 밑줄
      page.drawLine({
        start: { x: 160, y: 75 },
        end: { x: 300, y: 75 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      // 7. 하단 푸터 (워터마크 스타일)
      page.drawText("공식 은행", {
        x: width / 2 - 40,
        y: 40,
        size: 20,
        font: customFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      // PDF 저장 및 다운로드
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
          아래 버튼을 클릭하면 디자인이 추가된 공식 은행 인증서 PDF가 다운로드됩니다.
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
