package com.moneytree_back.security.handler;

import com.moneytree_back.dto.MemberDTO;
import com.moneytree_back.util.JWTUtil;
import com.google.gson.Gson;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

@Log4j2
public class APILoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JWTUtil jwtUtil = new JWTUtil(); // JWT 유틸리티 사용

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        log.info("Authentication Success!");

        MemberDTO memberDTO = (MemberDTO) authentication.getPrincipal();
        String memberId = memberDTO.getMember_id();

        // 클레임 생성
        Map<String, Object> claims = memberDTO.getClaims();
        claims.put("member_id", memberId);

        // 액세스 토큰 및 리프레시 토큰 생성
        String accessToken = jwtUtil.generateToken(claims, 60);      // 60분 유효
        String refreshToken = jwtUtil.generateToken(claims, 60 * 24); // 24시간 유효

        // JSON 응답 생성
        Gson gson = new Gson();
        String jsonResponse = gson.toJson(Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken
        ));

        // 응답 설정
        response.setContentType("application/json; charset=UTF-8");
        PrintWriter writer = response.getWriter();
        writer.write(jsonResponse);
        writer.close();

        log.info("JSON Response Sent: " + jsonResponse);
    }
}
