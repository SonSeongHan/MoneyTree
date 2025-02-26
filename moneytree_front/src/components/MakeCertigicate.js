import React, { useEffect, useState } from "react";
import { getCookie } from "../util/cookieUtil";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import { saveAs } from "file-saver";
import fontkit from "@pdf-lib/fontkit";

const MakeCertificate = () => {
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

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
            setIsGenerating(true);

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

            setIsGenerating(false);
        } catch (error) {
            console.error("🚨 PDF 생성 중 오류 발생:", error);
            setIsGenerating(false);
        }
    };

    return (
      <div className="certificate-container">
          <div className="certificate-card">
              <div className="certificate-header">
                  <div className="certificate-icon">🔐</div>
                  <h2>인증서 발급 서비스</h2>
              </div>

              <div className="certificate-content">
                  <div className="info-section">
                      <p className="certificate-description">
                          공식 은행 인증서를 PDF 형태로 발급받으실 수 있습니다.
                          인증서에는 귀하의 ID와 이름이 포함되며, 은행 거래 시 필요한
                          본인 인증 서류로 사용하실 수 있습니다.
                      </p>

                      <div className="user-info-box">
                          <h3>인증서 발급 정보</h3>
                          <div className="info-item">
                              <span className="info-label">사용자 ID:</span>
                              <span className="info-value">{userId || "로그인 필요"}</span>
                          </div>
                          <div className="info-item">
                              <span className="info-label">사용자 이름:</span>
                              <span className="info-value">{userName || "로그인 필요"}</span>
                          </div>
                          <div className="info-item">
                              <span className="info-label">발급일:</span>
                              <span className="info-value">2025년 02월 13일</span>
                          </div>
                      </div>
                  </div>

                  <div className="preview-section">
                      <div className="certificate-preview">
                          <div className="preview-header">인증서 미리보기</div>
                          <div className="preview-content">
                              <div className="preview-title">공식 은행 인증서</div>
                              <div className="preview-watermark">공식 인증서</div>
                              <div className="preview-info">
                                  <p>ID: {userId || "..."}</p>
                                  <p>이름: {userName || "..."}</p>
                              </div>
                              <div className="preview-footer">공식 은행</div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="certificate-actions">
                  <button
                    className="download-button"
                    onClick={handleDownloadCertificate}
                    disabled={isGenerating}
                  >
                      {isGenerating ? (
                        <>
                            <span className="spinner"></span>
                            생성 중...
                        </>
                      ) : (
                        <>
                            <span className="download-icon">📄</span>
                            인증서 PDF 다운로드
                        </>
                      )}
                  </button>

                  <p className="note">
                      * 인증서는 PDF 형식으로 다운로드됩니다. PDF 뷰어로 확인하실 수 있습니다.
                  </p>
              </div>
          </div>

          <style jsx>{`
                .certificate-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    padding: 2rem;
                    background-color: #f5f7fa;
                    font-family: 'Noto Sans KR', sans-serif;
                }
                
                .certificate-card {
                    background-color: white;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 900px;
                    overflow: hidden;
                }
                
                .certificate-header {
                    background: linear-gradient(135deg, #2b74e2, #1c5bbf);
                    color: white;
                    padding: 20px 30px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                
                .certificate-icon {
                    font-size: 2rem;
                }
                
                .certificate-header h2 {
                    margin: 0;
                    font-weight: 500;
                    font-size: 1.8rem;
                }
                
                .certificate-content {
                    padding: 30px;
                    display: flex;
                    gap: 30px;
                }
                
                @media (max-width: 768px) {
                    .certificate-content {
                        flex-direction: column;
                    }
                }
                
                .info-section {
                    flex: 1;
                }
                
                .certificate-description {
                    color: #555;
                    line-height: 1.6;
                    margin-top: 0;
                }
                
                .user-info-box {
                    background-color: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 20px;
                }
                
                .user-info-box h3 {
                    margin-top: 0;
                    color: #333;
                    font-size: 1.2rem;
                    margin-bottom: 15px;
                    border-bottom: 1px solid #e9ecef;
                    padding-bottom: 10px;
                }
                
                .info-item {
                    display: flex;
                    margin-bottom: 10px;
                }
                
                .info-label {
                    font-weight: 500;
                    width: 120px;
                    color: #555;
                }
                
                .info-value {
                    color: #2b74e2;
                    font-weight: 500;
                }
                
                .preview-section {
                    flex: 1;
                }
                
                .certificate-preview {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                .preview-header {
                    background-color: #f1f3f5;
                    color: #495057;
                    padding: 10px 15px;
                    font-weight: 500;
                    border-bottom: 1px solid #ddd;
                }
                
                .preview-content {
                    padding: 20px;
                    flex-grow: 1;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    background-color: white;
                    min-height: 250px;
                }
                
                .preview-title {
                    font-weight: 600;
                    font-size: 1.2rem;
                    margin-bottom: 20px;
                    color: #333;
                }
                
                .preview-watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    color: rgba(0, 0, 0, 0.05);
                    font-size: 3rem;
                    font-weight: bold;
                    white-space: nowrap;
                    pointer-events: none;
                }
                
                .preview-info {
                    margin-bottom: auto;
                }
                
                .preview-info p {
                    margin: 5px 0;
                    color: #555;
                }
                
                .preview-footer {
                    text-align: center;
                    color: #adb5bd;
                    margin-top: 20px;
                    font-weight: 500;
                }
                
                .certificate-actions {
                    padding: 20px 30px;
                    border-top: 1px solid #e9ecef;
                    background-color: #f8f9fa;
                }
                
                .download-button {
                    background-color: #2b74e2;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 6px;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    width: 100%;
                    max-width: 300px;
                    transition: background-color 0.2s;
                }
                
                .download-button:hover {
                    background-color: #1c5bbf;
                }
                
                .download-button:disabled {
                    background-color: #adb5bd;
                    cursor: not-allowed;
                }
                
                .download-icon {
                    font-size: 1.2rem;
                }
                
                .spinner {
                    width: 18px;
                    height: 18px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s ease-in-out infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .note {
                    color: #868e96;
                    font-size: 0.9rem;
                    margin-top: 15px;
                }
            `}</style>
      </div>
    );
};

export default MakeCertificate;