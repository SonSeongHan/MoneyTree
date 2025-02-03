package com.moneytree_back.security.handler;

import com.google.gson.Gson;
import com.moneytree_back.domain.Member;
import com.moneytree_back.dto.MemberDTO;
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

@Component //스프링이 관리하도록 설정하고
@Log4j2
@RequiredArgsConstructor //롬복을 사용하여 의존성 자동 주입
public class APILoginSuccessHandler implements AuthenticationSuccessHandler {

    private final MemberRepository memberRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {
        log.info(">>> APILoginSuccessHandler invoked - authentication: {}", authentication);

        // 1) principal에 MemberDTO를 넣은 경우 vs. 그냥 memberId(String)만 있는 경우
        // 여기서는 provider에서
        //   UsernamePasswordAuthenticationToken(memberId, password, authorities)
        // 로 넘겼으므로 principal = memberId(String)
        String memberId = (String) authentication.getPrincipal();

        //기존 코드에서 수정한 부분(승훈)
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("해당 사용자를 찾을 수 없습니다."));
        String membershipType = member.getMembershipType().name();
        String memberName = member.getMember_name();
        //기존 코드에서 수정한 부분(승훈)

        // 2) JWT 만들기 위해 claim에 넣을 정보 준비
        Map<String, Object> claims = new HashMap<>();
        claims.put("memberId", memberId);
        claims.put("membershipType", membershipType);
        claims.put("member_name", memberName);

        // 필요하다면 membershipType, 주민등록번호 등도 추가 가능

        // 3) JWT 토큰 생성
        String accessToken = JWTUtil.generateToken(claims, 60);        // 60분
        String refreshToken = JWTUtil.generateToken(claims, 60 * 24);  // 24시간

        log.info("AccessToken: {}",  accessToken);
        log.info("RefreshToken: {}" , refreshToken);
        log.info("member_name:{}", memberName);


        // 응답으로 JSON 내려주기
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("memberId", memberId);
        responseData.put("member_name", memberName);
        responseData.put("membershipType", membershipType); //추가 (승훈)
        responseData.put("accessToken", accessToken);
        responseData.put("refreshToken", refreshToken);

        String jsonStr = new Gson().toJson(responseData);

        log.info("jsonStr: {}" , jsonStr);

        response.setContentType("application/json; charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.println(jsonStr);
        out.close();
    }
}
