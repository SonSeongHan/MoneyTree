package com.moneytree_back.security.handler;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@Log4j2
public class APILoginFailHandler implements AuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {
        log.info(">>> Login fail: " + exception.getMessage());

        // 상태 코드 401
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=utf-8");

        // 실패 사유에 따른 메시지
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "ERROR_LOGIN");

        if (exception instanceof BadCredentialsException) {
            errorResponse.put("message", "아이디 또는 비밀번호가 잘못되었습니다.");
        } else if (exception instanceof LockedException) {
            errorResponse.put("message", "계정이 잠겨 있습니다.");
        } else if (exception instanceof DisabledException) {
            errorResponse.put("message", "계정이 비활성화되었습니다.");
        } else {
            errorResponse.put("message", "알 수 없는 이유로 로그인에 실패하였습니다.");
        }

        // JSON 변환 후 응답
        String jsonStr = new Gson().toJson(errorResponse);

        PrintWriter printWriter = response.getWriter();
        printWriter.println(jsonStr);
        printWriter.close();
    }
}
