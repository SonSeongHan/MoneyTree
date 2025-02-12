package com.moneytree_back.config.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree_back.security.handler.APILoginFailHandler;
import com.moneytree_back.security.handler.APILoginSuccessHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


import java.io.IOException;
import java.util.Map;

public class AdminLoginFilter extends UsernamePasswordAuthenticationFilter {

    public AdminLoginFilter(AuthenticationManager authenticationManager,
                            APILoginSuccessHandler successHandler,
                            APILoginFailHandler failHandler) {
        // AuthenticationManager 등록
        super.setAuthenticationManager(authenticationManager);
        // 로그인 요청 엔드포인트 설정 (예: /admin/login)
        super.setFilterProcessesUrl("/admin/login");
        // 폼 데이터 방식일 경우 파라미터 이름 설정
        super.setUsernameParameter("memberId");
        super.setPasswordParameter("memberpassword");
        // 성공 및 실패 핸들러 등록
        super.setAuthenticationSuccessHandler(successHandler);
        super.setAuthenticationFailureHandler(failHandler);
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {
        // Content-Type이 application/json 인 경우 JSON 파싱 처리
        if (request.getContentType() != null && request.getContentType().contains("application/json")) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                // JSON 요청 본문에서 데이터를 읽어 Map으로 변환
                Map<String, String> authRequest = mapper.readValue(request.getInputStream(), Map.class);
                String username = authRequest.get("memberId");
                String password = authRequest.get("memberpassword");

                // UsernamePasswordAuthenticationToken 생성 후 인증 처리 진행
                UsernamePasswordAuthenticationToken token =
                        new UsernamePasswordAuthenticationToken(username, password);
                // 추가 정보가 필요하면 setDetails() 호출
                setDetails(request, token);
                return this.getAuthenticationManager().authenticate(token);
            } catch (IOException e) {
                throw new AuthenticationServiceException("JSON 파싱에 실패하였습니다.", e);
            }
        }
        // JSON이 아닌 경우 기존 폼 방식 처리
        return super.attemptAuthentication(request, response);
    }
}
