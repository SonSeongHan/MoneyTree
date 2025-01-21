package com.moneytree_back.security.filter;

import com.moneytree_back.login.domain.MembershipType;
import com.moneytree_back.login.dto.MemberDTO;

import com.moneytree_back.util.JWTUtil;
import com.google.gson.Gson;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Log4j2             // 모든 요청에 대해 체크.
public class JWTCheckFilter extends OncePerRequestFilter {

    @Override   // 필터로 체크하지 않을 경로나 메서드(get/post)등을 지정하기 위해사용.
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Preflight요청은 체크하지 않음
        if (request.getMethod().equals("OPTIONS")) {
            return true;
        }
        String path = request.getRequestURI();
        String method = request.getMethod();

        log.info("check uri......................." + path);
        //api/member/ 경로의 호출은 체크하지 않음

        // 이미지 조회 경로는 체크하지 않는다면
        if (path.startsWith("/api/member/**")) {
            return true;
        }

        return true;
    }


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        log.info("------------------------JWTCheckFilter------------------");

        String authHeaderStr = request.getHeader("Authorization");

        try {
            if (authHeaderStr == null || !authHeaderStr.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Invalid Authorization header");
            }

            String accessToken = authHeaderStr.substring(7);
            Map<String, Object> claims = JWTUtil.validateToken(accessToken);

            log.info("JWT claims: " + claims);

            // JWT 클레임에서 필요한 데이터 추출
            String memberName = (String) claims.get("member_name");
            String memberPassword = (String) claims.get("memberpassword");
            String membershipTypeStr = (String) claims.get("membershipType");

            // MembershipType Enum으로 변환
            MembershipType membershipType = MembershipType.valueOf(membershipTypeStr);

            // MemberDTO 생성
            MemberDTO memberDTO = new MemberDTO(memberName, memberPassword, membershipType);

            // 디버깅 로그
            log.info("Member Name: " + memberDTO.getMember_name());
            log.info("Membership Type: " + membershipType.name());

            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(memberDTO, memberPassword, memberDTO.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            log.error("JWT Check Error..............");
            log.error(e.getMessage());

            Gson gson = new Gson();
            String msg = gson.toJson(Map.of("error", "ERROR_ACCESS_TOKEN"));

            response.setContentType("application/json");
            PrintWriter printWriter = response.getWriter();
            printWriter.println(msg);
            printWriter.close();
        }
    }
}