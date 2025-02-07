package com.moneytree_back.security.filter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

public class CookieAuthenticationFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("member".equals(cookie.getName())) {
                    // URL 디코딩 (쿠키 값이 URL 인코딩되어 저장되어 있을 경우)
                    String decodedCookie = URLDecoder.decode(cookie.getValue(), StandardCharsets.UTF_8.name());
                    try {
                        JsonNode node = objectMapper.readTree(decodedCookie);
                        String membershipType = node.get("membershipType").asText();
                        String memberId = node.get("memberId").asText();

                        // membershipType이 ADMIN이면 ROLE_ADMIN 권한 부여
                        if ("ADMIN".equalsIgnoreCase(membershipType)) {
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(
                                            memberId,
                                            null,
                                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))
                                    );
                            // SecurityContext에 인증 객체 저장
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        }
                    } catch (Exception e) {
                        // JSON 파싱 오류 등의 예외 처리 (로깅 등)
                        e.printStackTrace();
                    }
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
