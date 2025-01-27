package com.moneytree_back.config;

import com.moneytree_back.config.CustomAuthenticationProvider;
import com.moneytree_back.config.CustomLoginFilter;
import com.moneytree_back.security.handler.APILoginFailHandler;
import com.moneytree_back.security.handler.APILoginSuccessHandler;
import com.moneytree_back.security.handler.CustomAccessDeniedHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@Log4j2
@RequiredArgsConstructor
@EnableMethodSecurity
public class MemberSecurityConfig {

    private final CustomAuthenticationProvider customAuthenticationProvider;

    /**
     * Spring Security 6.x 에서 AuthenticationManager를 직접 빈으로 얻어오기 위한 설정
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    /**
     * 우리가 만든 CustomLoginFilter 등록
     */
    @Bean
    public CustomLoginFilter customLoginFilter(AuthenticationManager authenticationManager) throws Exception {
        CustomLoginFilter customLoginFilter = new CustomLoginFilter();

        // 이 필터가 동작할 URL
        customLoginFilter.setFilterProcessesUrl("/api/members/login");

        // 폼 파라미터 이름 설정
        // (기본 UsernamePasswordAuthenticationFilter는 username/password만 읽음)
        customLoginFilter.setUsernameParameter("memberId");
        customLoginFilter.setPasswordParameter("memberpassword");

        // 인증 매니저 주입
        customLoginFilter.setAuthenticationManager(authenticationManager);

        // 로그인 성공/실패 시 동작할 핸들러 설정
        customLoginFilter.setAuthenticationSuccessHandler(new APILoginSuccessHandler());
        customLoginFilter.setAuthenticationFailureHandler(new APILoginFailHandler());

        return customLoginFilter;
    }

    /**
     * CORS 설정 (필요시 수정)
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 허용할 프론트 주소
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000"));
        // 허용할 HTTP Method들
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        // 허용할 헤더들
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        // 인증 정보(쿠키 등) 허용 여부
        configuration.setAllowCredentials(true);
        // 노출할 헤더들
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Refresh-Token"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Spring Security FilterChain 구성
     */
    @Bean
    public SecurityFilterChain filterChain(org.springframework.security.config.annotation.web.builders.HttpSecurity http) throws Exception {

        log.info(">>>>> Security config init <<<<<");

        // 세션 사용 X
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.csrf(csrf -> csrf.disable());
        http.httpBasic(basic -> basic.disable());

        // CORS 적용
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        // 기본 formLogin을 disable
        http.formLogin(form -> form.disable());

        // 커스텀 Provider 등록
        http.authenticationProvider(customAuthenticationProvider);

        // CustomLoginFilter를 UsernamePasswordAuthenticationFilter 이전에 등록
        http.addFilterBefore(
                customLoginFilter(authenticationManager(null)),
                org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class
        );

        // 요청 허용 범위
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().permitAll()
        );

        // 접근 거부 핸들러
        http.exceptionHandling(config ->
                config.accessDeniedHandler(new CustomAccessDeniedHandler())
        );

        return http.build();
    }
}
