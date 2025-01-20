//package com.moneytree_back.config;
//
//import com.gamestore_back.security.filter.JWTCheckFilter;
//import com.gamestore_back.security.handler.APILoginFailHandler;
//import com.gamestore_back.security.handler.APILoginSuccessHandler;
//import com.gamestore_back.security.handler.CustomAccessDeniedHandler;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.log4j.Log4j2;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.HttpMethod;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//
//import java.util.Arrays;
//
//@Configuration
//@Log4j2
//@RequiredArgsConstructor
//@EnableMethodSecurity
//public class MemberSecurityConfig {
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        log.info("---------------------security config---------------------------");
//
//        // CORS 설정 통합
//        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
//
//        // 세션을 상태 저장하지 않도록 설정
//        http.sessionManagement(sessionConfig ->
//                sessionConfig.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
//
//
//        // 폼 로그인 설정
//        http.formLogin(config -> {
//            config.loginPage("/api/player/login");
//            config.successHandler(new APILoginSuccessHandler());
//            config.failureHandler(new APILoginFailHandler());
//        });
//
//        http
//                .csrf(csrf -> csrf.disable())
//                .authorizeHttpRequests(auth -> {
//                    auth.requestMatchers("/api/player/login", "/api/player/make").permitAll()
//                            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // OPTIONS 요청 허용
//                            .requestMatchers("/api/player/*/modify-pw").authenticated()
//                            .anyRequest().permitAll();
//                })
//                .sessionManagement(session ->
//                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
//
//        // JWT 필터 추가
//        http.addFilterBefore(new JWTCheckFilter(), UsernamePasswordAuthenticationFilter.class);
//
//        // 접근 거부 핸들러 추가
//        http.exceptionHandling(config ->
//                config.accessDeniedHandler(new CustomAccessDeniedHandler()));
//
//        return http.build();
//    }
//
//    @Bean
//    public CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration configuration = new CorsConfiguration();
//        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000")); // Frontend 도메인 명시
//        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
//        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
//        configuration.setAllowCredentials(true);
//        configuration.setExposedHeaders(Arrays.asList("Authorization", "Refresh-Token"));
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", configuration);
//        return source;
//    }
//
//}