package com.moneytree_back.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree_back.security.handler.APILoginFailHandler;
import com.moneytree_back.security.handler.APILoginSuccessHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;

import java.util.Map;

/**
 * "/api/members/certificateLogin" 경로로 오는 요청(POST)을 가로채 문서 인증을 시도하는 필터
 */
@Log4j2
public class CertificateLoginFilter extends AbstractAuthenticationProcessingFilter {

    // 성공/실패 핸들러 주입 (필요하면 세터 메서드 이용)
    private APILoginSuccessHandler successHandler;
    private APILoginFailHandler failHandler;

    public CertificateLoginFilter() {
        super("/api/members/certificateLogin"); // 필터가 작동할 URL 지정
    }

    public void setAuthenticationSuccessHandler(APILoginSuccessHandler successHandler) {
        this.successHandler = successHandler;
    }

    public void setAuthenticationFailureHandler(APILoginFailHandler failHandler) {
        this.failHandler = failHandler;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {

        if (!request.getMethod().equals("POST")) {
            throw new AuthenticationServiceException("Certificate Login not supported: " + request.getMethod());
        }

        try {
            // ObjectMapper를 사용하여 JSON 요청 본문을 파싱
            // CertificateLoginFilter.java - attemptAuthentication() 내
            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> jsonMap = mapper.readValue(request.getInputStream(), Map.class);

            String fileContent = jsonMap.get("fileContent");
            String parsedId = jsonMap.get("parsedId");
            String parsedName = jsonMap.get("parsedName");

            log.info("Parsed fileContent: {}", fileContent);
            log.info("Parsed parsedId: {}", parsedId);
            log.info("Parsed parsedName: {}", parsedName);


            if (fileContent == null) fileContent = "은행 인증서";
            if (parsedId == null) parsedId = "";
            if (parsedName == null) parsedName = "";

            // 인증 요청 토큰 생성
            CertificateLoginToken authRequest = new CertificateLoginToken(fileContent, parsedId, parsedName);

            // AuthenticationManager에게 인증 위임
            Authentication authResult = this.getAuthenticationManager().authenticate(authRequest);

            if (authResult != null && authResult.isAuthenticated()) {
                this.successHandler.onAuthenticationSuccess(request, response, authResult);
            }

            return authResult;
        } catch (Exception e) {
            log.error("CertificateLoginFilter error: ", e);
            try {
                this.failHandler.onAuthenticationFailure(request, response, new AuthenticationServiceException(e.getMessage(), e));
            } catch (Exception ex) {
                log.error("failHandler error:", ex);
            }
            return null;
        }
    }
}
