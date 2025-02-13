//package com.moneytree_back.config;
//
//import com.moneytree_back.util.JWTUtil;
//import com.moneytree_back.util.MemberJWTException;
//import com.google.gson.Gson;
//import com.google.gson.reflect.TypeToken;
//import jakarta.servlet.http.Cookie;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.extern.log4j.Log4j2;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.lang.reflect.Type;
//import java.net.URLDecoder;
//import java.nio.charset.StandardCharsets;
//import java.util.HashMap;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/auth")
//@Log4j2
//public class Refresh {
//
//    @GetMapping("/refresh")
//    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
//        String refreshToken = null;
//        Cookie[] cookies = request.getCookies();
//
//        if (cookies != null) {
//            // 우선, 별도의 refreshToken 쿠키가 있는지 확인
//            for (Cookie cookie : cookies) {
//                if ("refreshToken".equals(cookie.getName())) {
//                    refreshToken = cookie.getValue();
//                    break;
//                }
//            }
//
//            // 만약 refreshToken 쿠키가 없다면, "member" 쿠키 내부에서 추출
//            if (refreshToken == null) {
//                for (Cookie cookie : cookies) {
//                    if ("member".equals(cookie.getName())) {
//                        String cookieValue = cookie.getValue();
//                        // URL 디코딩
//                        cookieValue = URLDecoder.decode(cookieValue, StandardCharsets.UTF_8);
//
//                        // 외부 큰따옴표 제거 (예: "\"{...}\"" → "{...}")
//                        if (cookieValue.startsWith("\"") && cookieValue.endsWith("\"") && cookieValue.length() > 1) {
//                            cookieValue = cookieValue.substring(1, cookieValue.length() - 1);
//                        }
//                        // 내부 백슬래시 제거
//                        cookieValue = cookieValue.replace("\\", "");
//
//                        try {
//                            Gson gson = new Gson();
//                            Type type = new TypeToken<Map<String, Object>>() {}.getType();
//                            Map<String, Object> memberData = gson.fromJson(cookieValue, type);
//                            if (memberData != null && memberData.get("refreshToken") != null) {
//                                refreshToken = memberData.get("refreshToken").toString();
//                            }
//                        } catch (Exception ex) {
//                            log.error("member 쿠키 파싱 에러: " + ex.getMessage());
//                        }
//                        break;
//                    }
//                }
//            }
//        }
//
//        if (refreshToken == null) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                    .body("Refresh token not found");
//        }
//
//        try {
//            // JWTUtil.validateToken 메서드는 Map<String, Object>를 반환합니다.
//            Map<String, Object> claims = JWTUtil.validateToken(refreshToken);
//
//            // 필요시 claims에서 추가 정보를 확인할 수 있습니다.
//            // 예: String memberId = (String) claims.get("memberId");
//
//            // 새로운 access 토큰 생성 (유효기간 예시: 60분)
//            String newAccessToken = JWTUtil.generateToken(claims, 60);
//
//            Map<String, Object> responseData = new HashMap<>();
//            responseData.put("accessToken", newAccessToken);
//            log.info("새로운 Access Token 발급: {}", newAccessToken);
//            return ResponseEntity.ok(responseData);
//        } catch (MemberJWTException e) {
//            log.error("Refresh token 검증 실패", e);
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                    .body("Invalid or expired refresh token");
//        } catch (Exception e) {
//            log.error("알 수 없는 오류 발생", e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Server error");
//        }
//    }
//}
