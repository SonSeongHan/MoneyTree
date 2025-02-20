package com.moneytree_back.config;

import com.moneytree_back.config.certificate.CertificateAuthenticationProvider;
import com.moneytree_back.config.certificate.CertificateLoginFilter;
import com.moneytree_back.config.custom.CustomAuthenticationProvider;
import com.moneytree_back.config.custom.CustomLoginFilter;
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
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;

import java.util.Arrays;

@Configuration
@Log4j2
@RequiredArgsConstructor
@EnableMethodSecurity
public class MemberSecurityConfig {

    private final CustomAuthenticationProvider customAuthenticationProvider;
    private final CertificateAuthenticationProvider certificateAuthenticationProvider;
    private final APILoginSuccessHandler apiLoginSuccessHandler;

    @Bean
    public APILoginFailHandler apiLoginFailHandler() {
        return new APILoginFailHandler();
    }

    /**
     * 명시적으로 두 Provider를 포함하는 AuthenticationManager를 생성
     */
    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(Arrays.asList(customAuthenticationProvider, certificateAuthenticationProvider));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }

    /**
     * 일반 로그인용 CustomLoginFilter 등록 (엔드포인트: /api/members/login)
     */
    @Bean
    public CustomLoginFilter customLoginFilter(AuthenticationManager authenticationManager) throws Exception {
        CustomLoginFilter customLoginFilter = new CustomLoginFilter();
        customLoginFilter.setFilterProcessesUrl("/api/members/login");
        customLoginFilter.setUsernameParameter("memberId");
        customLoginFilter.setPasswordParameter("memberpassword");
        customLoginFilter.setAuthenticationManager(authenticationManager);
        customLoginFilter.setAuthenticationSuccessHandler(apiLoginSuccessHandler);
        customLoginFilter.setAuthenticationFailureHandler(apiLoginFailHandler());
        return customLoginFilter;
    }

    /**
     * 인증서 로그인용 CertificateLoginFilter 등록 (엔드포인트: /api/members/certificateLogin)
     */
    @Bean
    public CertificateLoginFilter certificateLoginFilter(AuthenticationManager authenticationManager) throws Exception {
        CertificateLoginFilter certificateLoginFilter = new CertificateLoginFilter();
        certificateLoginFilter.setAuthenticationManager(authenticationManager);
        certificateLoginFilter.setAuthenticationSuccessHandler(apiLoginSuccessHandler);
        certificateLoginFilter.setAuthenticationFailureHandler(apiLoginFailHandler());
        return certificateLoginFilter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Refresh-Token"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

//    // ─────────────────────────────────────────────────────
//// 아래 WebSecurityCustomizer 빈은 기존 설정을 수정하지 않고 정적 리소스에 대해
//// 보안 필터가 적용되지 않도록 추가하는 부분입니다.
//// 절대 다른 부분을 수정하지 말고 추가만 해주세요.
//    @Bean
//    public WebSecurityCustomizer webSecurityCustomizer() {
//        return (web) -> web.ignoring()
//                .requestMatchers("/**/*.html",
//                        "/favicon.ico", "/css/**", "/js/**", "/images/**");
//    }
//// ─────────────────────────────────────────────────────


    /**
     * SecurityFilterChain 구성
     */
    @Bean
    public SecurityFilterChain filterChain(org.springframework.security.config.annotation.web.builders.HttpSecurity http,
                                           AuthenticationManager authenticationManager) throws Exception {
        log.info(">>>>> Security config init <<<<<");

        // 세션 사용 안 함, CSRF, HTTP Basic, 폼 로그인 비활성화 및 CORS 설정 적용
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(csrf -> csrf.disable())
                .httpBasic(basic -> basic.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .formLogin(form -> form.disable());

        // 두 Provider 모두 등록은 이미 AuthenticationManager에 포함됨

        // 등록된 AuthenticationManager의 Provider 목록 출력 (ProviderManager로 캐스팅)
        if (authenticationManager instanceof ProviderManager) {
            ProviderManager pm = (ProviderManager) authenticationManager;
            log.info("Registered AuthenticationProviders: {}", pm.getProviders());
        }

//        // 🔥 JWTCheckFilter 추가!
//        http.addFilterBefore(
//                jwtCheckFilter(),  // ✅ JWT 토큰 검증 필터 추가
//                UsernamePasswordAuthenticationFilter.class
//        );

        // 필터 등록
        http.addFilterBefore(
                certificateLoginFilter(authenticationManager),
                UsernamePasswordAuthenticationFilter.class
        );
        http.addFilterBefore(
                customLoginFilter(authenticationManager),
                UsernamePasswordAuthenticationFilter.class
        );

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().permitAll()
        );

        http.exceptionHandling(config ->
                config.accessDeniedHandler(new CustomAccessDeniedHandler())
        );

        return http.build();
    }
}
