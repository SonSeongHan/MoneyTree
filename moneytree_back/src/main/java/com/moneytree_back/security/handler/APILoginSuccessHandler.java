// src/main/java/com/moneytree_back/security/handler/APILoginSuccessHandler.java
package com.moneytree_back.security.handler;

import com.google.gson.Gson;
import com.moneytree_back.domain.member.Member;
import com.moneytree_back.dto.member.MemberDTO;
import com.moneytree_back.repository.MemberRepository;
import com.moneytree_back.util.JWTUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@Component // 스프링이 관리하도록 설정
@Log4j2
@RequiredArgsConstructor
public class APILoginSuccessHandler implements AuthenticationSuccessHandler {

    private final MemberRepository memberRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {
        log.info(">>> APILoginSuccessHandler invoked - authentication: {}", authentication);

        // principal이 MemberDTO 인지, 아니면 단순 String인지 검사
        Object principal = authentication.getPrincipal();
        String memberId = null;
        if (principal instanceof MemberDTO) {
            memberId = ((MemberDTO) principal).getMemberId();
        } else if (principal instanceof String) {
            memberId = (String) principal;
        } else {
            throw new IllegalStateException("Unexpected principal type: " + principal.getClass());
        }

        // DB 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("해당 사용자를 찾을 수 없습니다."));
        String membershipType = member.getMembershipType().name();
        String memberName = member.getMemberName();
        Boolean active = member.getActive(); // active 값 가져오기

        // JWT claims 준비
        Map<String, Object> claims = new HashMap<>();
        claims.put("memberId", memberId);
        claims.put("membershipType", membershipType);
        claims.put("member_name", memberName);

        // JWT 토큰 생성 (유효기간은 예시입니다)
        String accessToken = JWTUtil.generateToken(claims, 1);        // 60분
        String refreshToken = JWTUtil.generateToken(claims, 60 * 24);    // 24시간

        log.info("AccessToken: {}", accessToken);
        log.info("RefreshToken: {}", refreshToken);
        log.info("member_name: {}", memberName);

        // 응답 JSON 생성 (active 값 포함)
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("memberId", memberId);
        responseData.put("member_name", memberName);
        responseData.put("membershipType", membershipType);
        responseData.put("active", active);
        responseData.put("accessToken", accessToken);
        responseData.put("refreshToken", refreshToken);

        String jsonStr = new Gson().toJson(responseData);
        log.info("jsonStr: {}", jsonStr);

        response.setContentType("application/json; charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.println(jsonStr);
        out.close();
    }
}
