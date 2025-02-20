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
@Component // Spring 빈으로 등록
public class JWTCheckFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // OPTIONS 요청은 필터링하지 않음
        if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
            return true;
        }

        // 실제 요청 경로(컨텍스트 경로 제거)
        String requestURI = request.getRequestURI();
        String contextPath = request.getContextPath();
        String effectivePath = requestURI.substring(contextPath.length());
        String method = request.getMethod();
        String uri = request.getRequestURI();

        log.info("Effective Path: " + effectivePath);

        // 정적 파일은 JWT 검증 없이 바로 처리 (기존 조건)
        if (uri.endsWith(".html") || uri.endsWith(".css") ||
                uri.endsWith(".js") || uri.endsWith(".ico") ||
                uri.contains("/images/")) {
            return true;
        }

        // 리프레쉬 엔드포인트이면 필터 건너뛰기
        if (effectivePath.startsWith("/api/auth/refresh")) {
            log.info("Refresh endpoint detected; skipping JWTCheckFilter.");
            return true;
        }

        if (uri.startsWith("/api/apartment-transactions/buyer-auth-html/") ||
                uri.startsWith("/api/apartment-transactions/seller-auth-html/") ||
                uri.startsWith("/api/apartment-transactions/submit-seller-auth")) {
            return true;
        }

        // 기타 특정 경로/메서드 제외
        if (effectivePath.startsWith("/api/members/make")) return true;
        if (effectivePath.startsWith("/api/communities") && method.equalsIgnoreCase("GET")) return true;
        if (effectivePath.startsWith("/api/mail/")) return true;
        if (effectivePath.startsWith("/api/community/replies") && method.equalsIgnoreCase("GET")) return true;
        if (effectivePath.startsWith("/api/accounts")) return true;
        if (effectivePath.startsWith("/api/deposit-products")) return true;

        if (path.startsWith("/api/community/replies") && method.equalsIgnoreCase("PUT")) {
            return false;
        }
        if (path.startsWith("/api/community/replies") && method.equalsIgnoreCase("DELETE")) {
            return false;
        }

        // /api/member/make-account는 필터링하지 않음
        if (path.startsWith("/api/accounts")) {
            return true;
        }

        if (path.startsWith("/api/deposit-products")) {
            return true;
        }

        if (path.startsWith("/api/hobbies")) {
            return true;
        }



        // 기본적으로 모든 요청은 필터링 처리
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        log.info("------------------------JWTCheckFilter------------------");
        String accessToken = null;

        // 1. Authorization 헤더에서 토큰 추출
        String authHeaderStr = request.getHeader("Authorization");
        if (authHeaderStr != null && authHeaderStr.startsWith("Bearer ")) {
            accessToken = authHeaderStr.substring(7);
            log.info("Access token from header: " + accessToken);
        } else {
            // 2. 쿠키에서 토큰 추출
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                // 우선 "accessToken" 쿠키 확인
                for (Cookie cookie : cookies) {
                    if ("accessToken".equals(cookie.getName())) {
                        accessToken = cookie.getValue();
                        log.info("Access token from 'accessToken' cookie: " + accessToken);
                        break;
                    }
                }
                // 없으면 "member" 쿠키 내에서 accessToken 추출
                if (accessToken == null) {
                    for (Cookie cookie : cookies) {
                        if ("member".equals(cookie.getName())) {
                            String cookieValue = cookie.getValue();
                            log.info("Raw 'member' cookie value: " + cookieValue);

                            // URL 디코딩
                            cookieValue = URLDecoder.decode(cookieValue, StandardCharsets.UTF_8);
                            log.info("URL decoded 'member' cookie value: " + cookieValue);

                            // 외부 큰따옴표 제거
                            if (cookieValue.startsWith("\"") && cookieValue.endsWith("\"") && cookieValue.length() > 1) {
                                cookieValue = cookieValue.substring(1, cookieValue.length() - 1);
                            }
                            log.info("After removing external quotes: " + cookieValue);

                            // 내부 백슬래시 제거
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

            Map<String, Object> claims = null;
            try {
                // 토큰 검증 (만료된 토큰이면 예외 발생)
                claims = JWTUtil.validateToken(accessToken);
            } catch (Exception ex) {
                // access token이 만료되었을 경우 refresh token을 사용하여 새로운 access token 발급
                if (ex.getMessage() != null && ex.getMessage().equals("Expired")) {
                    log.info("Access token expired, attempting refresh using refresh token from member cookie.");

                    // member 쿠키 찾기
                    Cookie[] cookies = request.getCookies();
                    Cookie memberCookie = null;
                    if (cookies != null) {
                        for (Cookie cookie : cookies) {
                            if ("member".equals(cookie.getName())) {
                                memberCookie = cookie;
                                break;
                            }
                        }
                    }

                    if (memberCookie == null) {
                        throw new Exception("Member cookie not found for token refresh.");
                    }

                    // member 쿠키 파싱
                    String cookieValue = URLDecoder.decode(memberCookie.getValue(), StandardCharsets.UTF_8);
                    if (cookieValue.startsWith("\"") && cookieValue.endsWith("\"") && cookieValue.length() > 1) {
                        cookieValue = cookieValue.substring(1, cookieValue.length() - 1);
                    }
                    cookieValue = cookieValue.replace("\\", "");

                    Gson gson = new Gson();
                    Type type = new TypeToken<Map<String, Object>>() {}.getType();
                    Map<String, Object> memberData = gson.fromJson(cookieValue, type);

                    // refresh token 추출 (memberData 내에 있어야 함)
                    String refreshToken = null;
                    if (memberData != null && memberData.get("refreshToken") != null) {
                        refreshToken = memberData.get("refreshToken").toString();
                    }

                    if (refreshToken == null) {
                        throw new Exception("Refresh token not found in member cookie.");
                    }

                    // refresh token 검증
                    Map<String, Object> refreshClaims = JWTUtil.validateToken(refreshToken);
                    log.info("Refresh token validated. Claims: " + refreshClaims);

                    // refresh token에서 사용자 정보 추출
                    String memberId = (String) refreshClaims.get("memberId");
                    String memberName = (String) refreshClaims.get("member_name");
                    String membershipTypeStr = (String) refreshClaims.get("membershipType");

                    // 새로운 access token 생성 (예: 15분 유효)
                    String newAccessToken = JWTUtil.generateAccessToken(memberId, memberName, membershipTypeStr);
                    log.info("Generated new access token: " + newAccessToken);

                    // 업데이트된 memberData 내에 accessToken 업데이트; **refreshToken은 그대로 유지**
                    memberData.put("accessToken", newAccessToken);
                    // memberData.remove("refreshToken"); // 제거하지 않음

                    // 업데이트된 memberData를 JSON 문자열로 변환 후 URL 인코딩
                    String updatedJson = gson.toJson(memberData);
                    String encodedValue = java.net.URLEncoder.encode(updatedJson, StandardCharsets.UTF_8);

                    // 업데이트된 member 쿠키 생성 및 응답에 추가
                    Cookie updatedMemberCookie = new Cookie("member", encodedValue);
                    updatedMemberCookie.setHttpOnly(true);
                    updatedMemberCookie.setPath("/");
                    // 필요에 따라 만료 시간 등 추가 설정
                    response.addCookie(updatedMemberCookie);

                    // 새 access token으로 claims 재설정
                    claims = JWTUtil.validateToken(newAccessToken);
                } else {
                    throw ex;
                }
            }

            log.info("JWT claims: " + claims);

            // claims에서 데이터 추출
            String memberId = (String) claims.get("memberId");
            String memberName = (String) claims.get("member_name");
            String membershipTypeStr = (String) claims.get("membershipType");

            log.info("memberId: " + memberId);
            log.info("memberName: " + memberName);
            log.info("membershipType: " + membershipTypeStr);

            // MemberDTO 생성 후 SecurityContext에 설정
            MembershipType membershipType = MembershipType.valueOf(membershipTypeStr);
            MemberDTO memberDTO = new MemberDTO(memberId, "", membershipType);
            memberDTO.setMember_name(memberName);

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
