package com.moneytree_back.config.admin;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

public class AdminAuthenticationProvider implements AuthenticationProvider {

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String password = (String) authentication.getCredentials();

        // 아이디와 비밀번호가 맞으면 인증 성공 처리
        if ("admin@admin".equals(username) && "123456".equals(password)) {
            return new UsernamePasswordAuthenticationToken(username, password,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));
        }
        // 인증 실패시 예외 던지기
        throw new BadCredentialsException("아이디 또는 비밀번호가 올바르지 않습니다.");
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
