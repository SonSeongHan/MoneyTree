package com.moneytree_back.config;

import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import java.util.Collections;

/**
 * "문서 인증"을 처리하는 Provider
 * - fileContent 안에 "은행 인증서" 문구가 있는지,
 * - parsedId, parsedName이 유효한지
 * - 실제 DB 조회 로직은 생략 or 간단히 처리
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

        String fileContent = certToken.getFileContent();
        String parsedId = certToken.getParsedId();
        String parsedName = certToken.getParsedName();

        // 1) 문서에 "은행 인증서" 문구가 있는지
        if (!fileContent.contains("은행 인증서")) {
            throw new BadCredentialsException("문서에 '은행 인증서' 문구가 없습니다.");
        }

        // 2) ID/이름이 있는지
        if (parsedId == null || parsedId.isEmpty()) {
            throw new BadCredentialsException("문서에서 ID를 확인할 수 없습니다.");
        }
        if (parsedName == null || parsedName.isEmpty()) {
            throw new BadCredentialsException("문서에서 이름을 확인할 수 없습니다.");
        }

        // 3) DB 조회 로직 (예시)
        // 여기서는 간단히 "아이디/이름이 있으면 성공" 처리
        // 실제로는 parsedId, parsedName을 DB와 대조해야 함.
        log.info("Received fileContent: {}", fileContent);
        log.info("Received parsedId: {}", parsedId);
        log.info("Received parsedName: {}", parsedName);

        // 4) 인증 성공 시, 인증 완료 토큰 생성
        CertificateLoginToken authenticated = new CertificateLoginToken(
                fileContent,
                parsedId,
                parsedName,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))


        );
        return authenticated;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        // CertificateLoginToken 타입만 처리
        return CertificateLoginToken.class.isAssignableFrom(authentication);
    }
}
