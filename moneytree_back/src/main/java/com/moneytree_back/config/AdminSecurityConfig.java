package com.moneytree_back.config;

import com.moneytree_back.security.filter.CookieAuthenticationFilter;
import com.moneytree_back.security.handler.APILoginFailHandler;
import com.moneytree_back.security.handler.APILoginSuccessHandler;
import com.moneytree_back.security.handler.CustomAccessDeniedHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@Log4j2
@RequiredArgsConstructor
@EnableMethodSecurity
public class AdminSecurityConfig {

    // 공통으로 사용되는 AuthenticationProvider를 주입받습니다.
    private final CustomAuthenticationProvider customAuthenticationProvider;
    private final CertificateAuthenticationProvider certificateAuthenticationProvider;

    // 로그인 성공 및 실패 핸들러
    private final APILoginSuccessHandler apiLoginSuccessHandler;
    private final APILoginFailHandler apiLoginFailHandler;

    /**
     * 관리자용 AuthenticationManager 생성
     */
    @Bean
    public AuthenticationManager adminAuthenticationManager() {
        // CustomAuthenticationProvider 대신 AdminAuthenticationProvider를 사용
        return new ProviderManager(Arrays.asList(new AdminAuthenticationProvider()));
    }


    /**
     * 비밀번호 인코더 (예제에서는 NoOpPasswordEncoder 사용 - 실제 운영환경에서는 안전한 인코더 사용)
     */


    /**
     * 관리자 로그인용 AdminLoginFilter 등록 (엔드포인트: /api/admin/login)
     */
    @Bean
    public AdminLoginFilter adminLoginFilter(AuthenticationManager adminAuthenticationManager) {
        AdminLoginFilter filter = new AdminLoginFilter(adminAuthenticationManager, apiLoginSuccessHandler, apiLoginFailHandler);
        // 로그인 요청 URL을 /api/admin/login으로 지정
        filter.setFilterProcessesUrl("/api/admin/login");
        // 필요에 따라 파라미터 이름도 설정 (기본값이 이미 memberId, memberpassword라면 생략 가능)
        // filter.setUsernameParameter("memberId");
        // filter.setPasswordParameter("memberpassword");
        return filter;
    }

    /**
     * CORS 설정 (필요에 따라 조정)
     */
    @Bean
    public CorsConfigurationSource adminCorsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Refresh-Token"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // CORS 설정 적용 경로를 /api/admin/**로 지정
        source.registerCorsConfiguration("/api/admin/**", configuration);
        return source;
    }

    /**
     * 관리자 전용 SecurityFilterChain 구성
     */
    @Bean
    public SecurityFilterChain adminFilterChain(org.springframework.security.config.annotation.web.builders.HttpSecurity http,
                                                AuthenticationManager adminAuthenticationManager) throws Exception {
        log.info(">>>>> Admin Security config init <<<<<");

        http
                .securityMatcher("/api/admin/**")
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(csrf -> csrf.disable())
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .cors(cors -> cors.configurationSource(adminCorsConfigurationSource()));

        // 관리자 로그인 필터 추가
        http.addFilterBefore(adminLoginFilter(adminAuthenticationManager), UsernamePasswordAuthenticationFilter.class);

        // 새로 추가한 쿠키 인증 필터를 UsernamePasswordAuthenticationFilter 이전에 추가
        http.addFilterBefore(new CookieAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated()
        );

        http.exceptionHandling(exception ->
                exception.accessDeniedHandler(new CustomAccessDeniedHandler())
        );

        return http.build();
    }

}
