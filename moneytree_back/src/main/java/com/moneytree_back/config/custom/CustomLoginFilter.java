package com.moneytree_back.config.custom;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

/**
 * 기본 UsernamePasswordAuthenticationFilter를 상속해서
 * "memberId", "memberpassword", "residentRegistrationNumber" 파라미터를 읽어오는 필터
 */
@Log4j2
public class CustomLoginFilter extends UsernamePasswordAuthenticationFilter {

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {
        if (request.getContentType() != null && request.getContentType().contains("application/json")) {
            try (InputStream is = request.getInputStream()) {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, String> authRequest = mapper.readValue(is, new TypeReference<Map<String, String>>() {});

                String memberId = authRequest.get("memberId");
                String password = authRequest.get("memberpassword");
                String rrn = authRequest.get("residentRegistrationNumber");

                log.info("CustomLoginFilter >>> memberId={}, pw={}, rrn={}", memberId, password, rrn);

                if (password == null) {
                    password = "";
                }

                UsernamePasswordAuthenticationToken token =
                        new UsernamePasswordAuthenticationToken(memberId, password);
                token.setDetails(rrn);
                return this.getAuthenticationManager().authenticate(token);
            } catch (IOException e) {
                throw new AuthenticationServiceException("로그인 요청 JSON 파싱 실패", e);
            }
        } else {
            // 기존 폼데이터 방식 처리
            String memberId = request.getParameter("memberId");
            String password = request.getParameter("memberpassword");
            String rrn = request.getParameter("residentRegistrationNumber");

            log.info("CustomLoginFilter >>> memberId={}, pw={}, rrn={}", memberId, password, rrn);

            if (password == null) {
                password = "";
            }

            UsernamePasswordAuthenticationToken token =
                    new UsernamePasswordAuthenticationToken(memberId, password);
            token.setDetails(rrn);
            return this.getAuthenticationManager().authenticate(token);
        }
    }

}
