package com.moneytree_back.config.certificate;

import lombok.extern.log4j.Log4j2;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.StringReader;
import java.util.Base64;
import java.util.Collections;

/**
 * PDF 인증서를 처리하는 Provider
 * - 클라이언트로부터 Base64로 인코딩된 PDF 파일을 받고,
 * - PDFBox를 사용해 텍스트를 추출한 후 "은행 인증서" 문구와
 *   발급 ID/이름을 파싱하여 검증
 */
@Component
@Log4j2
public class CertificateAuthenticationProvider implements AuthenticationProvider {

    @Override
    public Authentication authenticate(Authentication authentication) {
        // 우리가 만든 Token 타입인지 확인
        if (!(authentication instanceof CertificateLoginToken certToken)) {
            return null; // 지원하지 않는 타입
        }

        // 클라이언트로부터 Base64 인코딩된 PDF 파일 내용
        String base64Pdf = certToken.getFileContent();

        // PDF 파일을 파싱하여 텍스트 추출
        String textContent = extractTextFromPDF(base64Pdf);
        log.info("추출된 PDF 텍스트: {}", textContent);

        // PDF에 "은행 인증서" 문구가 있는지 확인
        if (!textContent.contains("은행 인증서")) {
            throw new BadCredentialsException("문서에 '은행 인증서' 문구가 없습니다.");
        }

        // PDF 텍스트에서 "발급 ID:"와 "발급 이름:" 추출 (줄 단위로 파싱)
        String extractedId = extractField(textContent, "발급 ID:");
        String extractedName = extractField(textContent, "발급 이름:");
        log.info("추출된 ID: {}", extractedId);
        log.info("추출된 이름: {}", extractedName);

        // 발급 ID/이름이 없는 경우 예외 발생
        if (extractedId == null || extractedId.isEmpty()) {
            throw new BadCredentialsException("문서에서 ID를 확인할 수 없습니다.");
        }
        if (extractedName == null || extractedName.isEmpty()) {
            throw new BadCredentialsException("문서에서 이름을 확인할 수 없습니다.");
        }

        // 실제 DB 조회 로직 (예시에서는 값이 있으면 인증 성공으로 간주)
        CertificateLoginToken authenticated = new CertificateLoginToken(
                base64Pdf,
                extractedId,
                extractedName,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
        return authenticated;
    }

    /**
     * Base64 인코딩된 PDF 데이터를 디코딩 후 PDFBox를 이용해 텍스트를 추출하는 메서드
     */
    private String extractTextFromPDF(String base64Pdf) {
        try {
            byte[] pdfBytes = Base64.getDecoder().decode(base64Pdf);
            PDDocument document = PDDocument.load(new ByteArrayInputStream(pdfBytes));
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            document.close();
            return text;
        } catch (Exception e) {
            throw new RuntimeException("PDF 파싱 실패", e);
        }
    }

    /**
     * 추출한 텍스트에서 지정된 필드 이름으로 시작하는 줄에서 값만 추출하는 헬퍼 메서드
     */
    private String extractField(String text, String fieldName) {
        try (BufferedReader reader = new BufferedReader(new StringReader(text))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.startsWith(fieldName)) {
                    return line.substring(fieldName.length()).trim();
                }
            }
        } catch (IOException e) {
            // StringReader 사용 시 IOException 발생 가능성이 거의 없으므로 무시
        }
        return null;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return CertificateLoginToken.class.isAssignableFrom(authentication);
    }
}
