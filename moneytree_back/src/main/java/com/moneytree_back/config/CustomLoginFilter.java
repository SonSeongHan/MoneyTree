package com.moneytree_back.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * 기본 UsernamePasswordAuthenticationFilter를 상속해서
 * "memberId", "memberpassword", "residentRegistrationNumber" 파라미터를 읽어오는 필터
 */
@Log4j2
public class CustomLoginFilter extends UsernamePasswordAuthenticationFilter {

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {

        // 폼데이터 (x-www-form-urlencoded) 기준으로 파라미터 꺼내기
        String memberId = request.getParameter("memberId");
        String password = request.getParameter("memberpassword");
        String rrn = request.getParameter("residentRegistrationNumber");

        log.info("CustomLoginFilter >>> memberId={}, pw={}, rrn={}", memberId, password, rrn);

        // NPE 방지: password 혹은 rrn이 비어있다면 "" 또는 null 처리
        // (원하는 대로 처리)
        if (password == null) {
            password = "";
        }

        // UsernamePasswordAuthenticationToken의 principal=memberId, credentials=password
        UsernamePasswordAuthenticationToken authRequest =
                new UsernamePasswordAuthenticationToken(memberId, password);

        // 주민등록번호 등 추가 정보는 "details"에 담아서 Provider가 꺼내 쓰도록
        authRequest.setDetails(rrn);

        // AuthenticationManager에게 위 토큰을 넘겨서 인증 진행
        return this.getAuthenticationManager().authenticate(authRequest);
    }
}
