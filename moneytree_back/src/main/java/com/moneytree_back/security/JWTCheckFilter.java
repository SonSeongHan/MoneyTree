//package com.moneytree_back.security;
//
//import com.gamestore_back.dto.PlayerDTO;
//import com.gamestore_back.util.JWTUtil;
//import com.google.gson.Gson;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.extern.log4j.Log4j2;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//import java.io.PrintWriter;
//import java.util.List;
//import java.util.Map;
//
//@Log4j2             // 모든 요청에 대해 체크.
//public class JWTCheckFilter extends OncePerRequestFilter {
//
//    @Override   // 필터로 체크하지 않을 경로나 메서드(get/post)등을 지정하기 위해사용.
//    protected boolean shouldNotFilter(HttpServletRequest request) {
//        // Preflight요청은 체크하지 않음
//        if (request.getMethod().equals("OPTIONS")) {
//            return true;
//        }
//        String path = request.getRequestURI();
//        String method = request.getMethod();
//
//        log.info("check uri......................." + path);
//        //api/player/ 경로의 호출은 체크하지 않음
//
//        // 이미지 조회 경로는 체크하지 않는다면
//        if (path.startsWith("/api/player/modify-pw")) {
//            return false;
//        }
//
//        if (path.startsWith("/api/player/")) {
//            return true;
//        }
//
//
//        if (path.startsWith("/api/products/view/")) {
//            return true;
//        }
//
//        // categories/games 경로는 체크하지 않음
//        if (path.startsWith("/categories/games")) {
//            return true;
//        }
//
//        if (path.startsWith("/api/games")) {
//            return true;
//        }
//
//        // /api/faq 경로 처리
//        if (path.startsWith("/api/faq")) {
//            // GET 요청만 필터 제외
//            return method.equalsIgnoreCase("GET");
//        }
//
//        if (path.startsWith("/api/inquiries")) {
//            return false;
//        }
//
//        if (path.startsWith("/api/qna")) {
//            return false; // 필터를 적용한다.
//        }
//
//        if (path.startsWith("/api/community/add")) {
//            return true;
//        }
//
//        if (path.startsWith("/api/community/list")) {
//            return true;
//        }
//
//        if (path.startsWith("/api/community/read")) {
//            return true;
//        }
//
//        if (path.startsWith("/api/community/view/{fileName}")) {
//            return true;
//        }
//
//        if (path.startsWith("/api/community")) {
//            return true;
//        }
//
//        if (path.startsWith("/api/community/read{comId}")) {
//            return true;
//        }
//
//        // /api/reviews 경로 필터링 제외
//        if (path.startsWith("/api/reviews")) {
//            return true;
//        }
//
//        // 로그인/회원가입 관련 경로만 체크 제외
//        if (path.startsWith("/api/player/login") ||
//                path.startsWith("/api/player/make")) {
//            return true;
//        }
//
//        if (path.startsWith("/api/news")) {
//            return true;
//        }
//
//        if (path.startsWith("/api/comments")) {
//            return true;
//        }
//
//        if (path.startsWith("/games/search")) {
//            return true;
//        }
//
//        return true;
//    }
//
//
//    @Override// validateToken()를 활용해서 예외의 발생여부를 확인.
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
//            throws ServletException, IOException {
//
//        log.info("------------------------JWTCheckFilter------------------");
//
//        String authHeaderStr = request.getHeader("Authorization");
//
//        try {
//            //Bearer accestoken...
//            String accessToken = authHeaderStr.substring(7);
//            Map<String, Object> claims = JWTUtil.validateToken(accessToken);
//
//            log.info("JWT claims: " + claims);
//
//            String email = (String) claims.get("email");
//            String pw = (String) claims.get("pw");
//            String nickname = (String) claims.get("nickname");
//            Boolean social = (Boolean) claims.get("social");
//            List<String> roleNames = (List<String>) claims.get("roleNames");
//
//
//            PlayerDTO playerDTO = new PlayerDTO(email, pw, nickname, social.booleanValue(), roleNames);
//
//            log.info("-----------------------------------");
//            log.info(playerDTO);
//            log.info(playerDTO.getAuthorities());
//
//            UsernamePasswordAuthenticationToken authenticationToken
//                    = new UsernamePasswordAuthenticationToken(playerDTO, pw, playerDTO.getAuthorities());
//
//            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
//
//            filterChain.doFilter(request, response);
//
//        }catch(Exception e){
//
//            log.error("JWT Check Error..............");
//            log.error(e.getMessage());
//
//            Gson gson = new Gson();
//            String msg = gson.toJson(Map.of("error", "ERROR_ACCESS_TOKEN"));
//
//            response.setContentType("application/json");
//            PrintWriter printWriter = response.getWriter();
//            printWriter.println(msg);
//            printWriter.close();
//
//        }
//    }
//}