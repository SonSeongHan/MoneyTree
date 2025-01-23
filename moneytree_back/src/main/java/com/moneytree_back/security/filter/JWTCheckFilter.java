package com.moneytree_back.security.filter;

import com.moneytree_back.domain.MembershipType;
import com.moneytree_back.dto.MemberDTO;
<<<<<<< HEAD

=======
>>>>>>> 1cf2655218af686c8ba01f6e9d22ad7d9d06a07b
import com.moneytree_back.util.JWTUtil;
import com.google.gson.Gson;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
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

        String path = request.getRequestURI();
        String method = request.getMethod();

        log.info("check uri......................." + path);

        // /api/member/modify-pw는 필터링 처리

        // /api/member/ 경로는 필터링하지 않음
        if (path.startsWith("/api/member/")) {
            return true;
        }

<<<<<<< HEAD
        if (path.startsWith("/api/communities")){
            return true;
        }

        return true;
    }
=======
        // /api/member/make-account는 필터링하지 않음
        if (path.startsWith("/api/accounts")) {
            return true;
        }
>>>>>>> 1cf2655218af686c8ba01f6e9d22ad7d9d06a07b

        // 기본적으로 모든 요청은 필터링 처리
        return true; //
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        log.info("------------------------JWTCheckFilter------------------");

        String authHeaderStr = request.getHeader("Authorization");

        try {
            // Authorization 헤더가 없는 경우 처리
            if (authHeaderStr == null || !authHeaderStr.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Authorization header is missing or invalid");
            }

            // Bearer accessToken에서 토큰 추출
            String accessToken = authHeaderStr.substring(7);
            Map<String, Object> claims = JWTUtil.validateToken(accessToken);

            log.info("JWT claims: " + claims);

            // JWT claims에서 데이터 추출
            String memberName = (String) claims.get("member_name");
            String residentRegistrationNumber = (String) claims.get("residentRegistrationNumber");
            String membershipTypeStr = (String) claims.get("membershipType");

            // MembershipType Enum으로 변환
            MembershipType membershipType = MembershipType.valueOf(membershipTypeStr);

            // MemberDTO 생성
            MemberDTO memberDTO = new MemberDTO(memberName, residentRegistrationNumber, membershipType);

            log.info("-----------------------------------");
            log.info(memberDTO);
            log.info(memberDTO.getAuthorities());

            // SecurityContext에 인증 정보 설정
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(memberDTO, null, memberDTO.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            // 필터 체인 진행
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            log.error("JWT Check Error..............");
            log.error(e.getMessage());

            // 에러 메시지 응답
            Gson gson = new Gson();
            String msg = gson.toJson(Map.of("error", "ERROR_ACCESS_TOKEN"));

            response.setContentType("application/json");
            PrintWriter printWriter = response.getWriter();
            printWriter.println(msg);
            printWriter.close();
        }
    }
}
