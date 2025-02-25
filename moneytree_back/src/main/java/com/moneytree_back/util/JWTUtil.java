package com.moneytree_back.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.ZonedDateTime;
import java.util.*;

@Component
@Log4j2
public class JWTUtil {
    private static final String SECRET_KEY = "1234567890123456789012345678901234567890"; // 30자 이상
    private static final Set<String> BLACKLISTED_TOKENS = Collections.synchronizedSet(new HashSet<>());

    // JWT 토큰 생성 메서드
    public static String generateToken(Map<String, Object> valueMap, int min) {
        SecretKey key = getSecretKey();

        return Jwts.builder()
                .setHeader(Map.of("typ", "JWT"))
                .setClaims(valueMap)
                .setIssuedAt(Date.from(ZonedDateTime.now().toInstant()))
                .setExpiration(Date.from(ZonedDateTime.now().plusMinutes(min).toInstant()))
                .signWith(key)
                .compact();
    }

    // 새로운 access token 생성 메서드 추가
    public static String generateAccessToken(String memberId, String memberName, String membershipType) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("memberId", memberId);
        claims.put("member_name", memberName);
        claims.put("membershipType", membershipType);
        return generateToken(claims, 60 * 24);
    }

    // JWT 검증 메서드
    public static Map<String, Object> validateToken(String token) {
        if (isTokenBlacklisted(token)) {
            throw new MemberJWTException("Token is blacklisted");
        }

        try {
            SecretKey key = getSecretKey();

            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token) // 파싱 및 검증
                    .getBody();
        } catch (MalformedJwtException e) {
            throw new MemberJWTException("MalFormed");
        } catch (ExpiredJwtException e) {
            throw new MemberJWTException("Expired");
        } catch (InvalidClaimException e) {
            throw new MemberJWTException("Invalid");
        } catch (JwtException e) {
            throw new MemberJWTException("JWTError");
        } catch (Exception e) {
            throw new MemberJWTException("Error");
        }
    }

    // 토큰 갱신 메서드
    public static String refreshToken(String token, int newExpiryMinutes) {
        try {
            Map<String, Object> claims = validateToken(token);
            return generateToken(claims, newExpiryMinutes);
        } catch (Exception e) {
            throw new MemberJWTException("Error refreshing token: " + e.getMessage());
        }
    }

    // 토큰 만료 여부 확인 메서드
    public static boolean isTokenExpired(String token) {
        try {
            SecretKey key = getSecretKey();

            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return false; // 만료되지 않음
        } catch (ExpiredJwtException e) {
            return true; // 만료됨
        } catch (Exception e) {
            throw new MemberJWTException("Error checking token expiry: " + e.getMessage());
        }
    }

    // 토큰 블랙리스트에 추가
    public static void blacklistToken(String token) {
        BLACKLISTED_TOKENS.add(token);
    }

    // 블랙리스트에 있는 토큰인지 확인
    private static boolean isTokenBlacklisted(String token) {
        return BLACKLISTED_TOKENS.contains(token);
    }

    // SecretKey 생성 메서드
    private static SecretKey getSecretKey() {
        try {
            return Keys.hmacShaKeyFor(SECRET_KEY.getBytes("UTF-8"));
        } catch (Exception e) {
            throw new RuntimeException("Error generating secret key: " + e.getMessage());
        }
    }
}
