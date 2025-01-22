package com.moneytree_back.security.handler;

import com.moneytree_back.login.dto.MemberDTO;
import com.moneytree_back.util.JWTUtil;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
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

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        log.info("-------------------------------");
        log.info(authentication);
        log.info("-------------------------------");

        // 인증에 성공한 사용자 정보 (Principal) 가져오기
        MemberDTO memberDTO = (MemberDTO) authentication.getPrincipal();

        // DTO 내부에 정의된 클레임 정보 가져오기
        Map<String, Object> claims = memberDTO.getClaims();

        // 기존에 'roleNames'가 아닌 단일 'roleName'으로 Put
        claims.put("roleName", memberDTO.getRoleName());

        // 토큰 생성 (JWTUtil 사용)
        String accessToken = JWTUtil.generateToken(claims, 60);      // 유효기간 예: 60분
        String refreshToken = JWTUtil.generateToken(claims, 60 * 24); // 유효기간 예: 24시간

        // 생성된 토큰을 응답에 포함
        claims.put("accessToken", accessToken);
        claims.put("refreshToken", refreshToken);

        // JSON으로 변환 후 출력
        Gson gson = new Gson();
        String jsonStr = gson.toJson(claims);

        response.setContentType("application/json; charset=UTF-8");
        PrintWriter printWriter = response.getWriter();
        printWriter.println(jsonStr);
        printWriter.close();
    }
}
