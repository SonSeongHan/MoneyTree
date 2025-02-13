package com.moneytree_back.security.filter;

import com.moneytree_back.domain.member.MembershipType;
import com.moneytree_back.dto.member.MemberDTO;
import com.moneytree_back.util.JWTUtil;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Type;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Log4j2
@Component
public class JWTCheckFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // OPTIONS 요청은 필터링하지 않음
        if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
            return true;
        }

        String path = request.getRequestURI();
        String method = request.getMethod();
        log.info("check uri......................." + path);

        // 특정 경로/메서드는 필터 적용 제외
        if (path.startsWith("/api/members/make")) return true;
        if (path.startsWith("/api/communities") && method.equalsIgnoreCase("GET")) return true;
        if (path.startsWith("/api/mail/")) return true;
        if (path.startsWith("/api/community/replies") && method.equalsIgnoreCase("GET")) return true;
        if (path.startsWith("/api/accounts")) return true;
        if (path.startsWith("/api/deposit-products")) return true;

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        log.info("------------------------JWTCheckFilter------------------");
        String accessToken = null;

        // 1. 우선 Authorization 헤더에서 토큰 추출
        String authHeaderStr = request.getHeader("Authorization");
        if (authHeaderStr != null && authHeaderStr.startsWith("Bearer ")) {
            accessToken = authHeaderStr.substring(7);
            log.info("Access token from header: " + accessToken);
        } else {
            // 2. 헤더에 토큰이 없으면 쿠키에서 토큰 추출
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                // 2-1. "accessToken" 쿠키 우선 확인
                for (Cookie cookie : cookies) {
                    if ("accessToken".equals(cookie.getName())) {
                        accessToken = cookie.getValue();
                        log.info("Access token from 'accessToken' cookie: " + accessToken);
                        break;
                    }
                }
                // 2-2. "member" 쿠키에 저장된 값에서 accessToken 추출
                if (accessToken == null) {
                    for (Cookie cookie : cookies) {
                        if ("member".equals(cookie.getName())) {
                            String cookieValue = cookie.getValue();
                            log.info("Raw 'member' cookie value: " + cookieValue);

                            // URL 디코딩
                            cookieValue = URLDecoder.decode(cookieValue, StandardCharsets.UTF_8);
                            log.info("URL decoded 'member' cookie value: " + cookieValue);

                            // 외부 큰따옴표 한 번 제거 (예: "\"{...}\"" → "{...}")
                            if (cookieValue.startsWith("\"") && cookieValue.endsWith("\"") && cookieValue.length() > 1) {
                                cookieValue = cookieValue.substring(1, cookieValue.length() - 1);
                            }
                            log.info("After removing external quotes: " + cookieValue);

                            // 내부에 남은 백슬래시 제거
                            cookieValue = cookieValue.replace("\\", "");
                            log.info("After removing backslashes: " + cookieValue);

                            try {
                                Gson gson = new Gson();
                                Type type = new TypeToken<Map<String, Object>>() {}.getType();
                                Map<String, Object> cookieData = gson.fromJson(cookieValue, type);
                                log.info("Parsed 'member' cookie JSON: " + cookieData);
                                if (cookieData != null && cookieData.get("accessToken") != null) {
                                    accessToken = cookieData.get("accessToken").toString();
                                    log.info("Extracted access token from 'member' cookie: " + accessToken);
                                    break;
                                }
                            } catch (Exception ex) {
                                log.error("member 쿠키 파싱 에러: " + ex.getMessage());
                            }
                        }
                    }
                }
            }
        }

        try {
            if (accessToken == null) {
                throw new IllegalArgumentException("Access token is missing in header and cookies");
            }

            // 토큰 검증 후 claims 추출
            Map<String, Object> claims = JWTUtil.validateToken(accessToken);
            log.info("JWT claims: " + claims);

            // JWT claims에서 데이터 추출
            String memberId = (String) claims.get("memberId");
            String memberName = (String) claims.get("member_name");
            String membershipTypeStr = (String) claims.get("membershipType");

            log.info("memberId 추출 결과: " + memberId);
            log.info("memberName 추출 결과: " + memberName);
            log.info("membershipTypeStr 추출 결과: " + membershipTypeStr);

            // MembershipType Enum 변환 및 MemberDTO 생성
            MembershipType membershipType = MembershipType.valueOf(membershipTypeStr);
            MemberDTO memberDTO = new MemberDTO(memberId, "", membershipType);
            memberDTO.setMember_name(memberName);

            // SecurityContext에 인증 정보 설정
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(memberDTO, null, memberDTO.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            // 필터 체인 진행
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            log.error("JWT Check Error..............", e);
            Gson gson = new Gson();
            String msg = gson.toJson(Map.of("error", "ERROR_ACCESS_TOKEN"));
            response.setContentType("application/json");
            PrintWriter printWriter = response.getWriter();
            printWriter.println(msg);
            printWriter.close();
        }
    }
}
