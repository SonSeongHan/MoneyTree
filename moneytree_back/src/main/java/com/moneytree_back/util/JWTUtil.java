package com.moneytree_back.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.log4j.Log4j2;

import javax.crypto.SecretKey;
import java.time.ZonedDateTime;
import java.util.*;

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



    // JWT 검증 메서드
    public static Map<String, Object> validateToken(String token) {
        if (isTokenBlacklisted(token)) {
            throw new PlayerJWTException("Token is blacklisted");
        }

        try {
            SecretKey key = getSecretKey();

            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token) // 파싱 및 검증
                    .getBody();
        } catch (MalformedJwtException e) {
            throw new PlayerJWTException("MalFormed");
        } catch (ExpiredJwtException e) {
            throw new PlayerJWTException("Expired");
        } catch (InvalidClaimException e) {
            throw new PlayerJWTException("Invalid");
        } catch (JwtException e) {
            throw new PlayerJWTException("JWTError");
        } catch (Exception e) {
            throw new PlayerJWTException("Error");
        }
    }

    // 토큰 갱신 메서드
    public static String refreshToken(String token, int newExpiryMinutes) {
        try {
            Map<String, Object> claims = validateToken(token);
            return generateToken(claims, newExpiryMinutes);
        } catch (Exception e) {
            throw new PlayerJWTException("Error refreshing token: " + e.getMessage());
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
            throw new PlayerJWTException("Error checking token expiry: " + e.getMessage());
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