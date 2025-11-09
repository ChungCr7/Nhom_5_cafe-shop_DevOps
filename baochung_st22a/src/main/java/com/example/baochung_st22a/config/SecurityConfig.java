package com.example.baochung_st22a.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    @Lazy
    private JwtAuthFilter jwtAuthFilter;

    // ✅ Bỏ qua kiểm tra bảo mật cho tài nguyên tĩnh (ảnh, swagger, uploads...)
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(
                new AntPathRequestMatcher("/product_img/**"),
                new AntPathRequestMatcher("/category_img/**"),
                new AntPathRequestMatcher("/uploads/**"),
                new AntPathRequestMatcher("/profile_img/**"),
                new AntPathRequestMatcher("/favicon.ico"),
                new AntPathRequestMatcher("/swagger-ui/**"),
                new AntPathRequestMatcher("/v3/api-docs/**")
        );
    }

    // ✅ Mã hóa mật khẩu
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ✅ Service lấy thông tin user từ DB
    @Bean
    public UserDetailsService userDetailsService() {
        return new UserDetailsServiceImpl();
    }

    // ✅ Provider xác thực người dùng (dựa vào UserDetailsService)
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // ✅ Cấu hình CORS cho phép frontend React gọi API
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Cho phép các origins (có thể config từ environment variables)
        String allowedOrigins = System.getenv().getOrDefault("CORS_ALLOWED_ORIGINS", 
            "http://localhost:5173,http://127.0.0.1:5173,https://localhost:5173");
        config.setAllowedOriginPatterns(
            List.of(allowedOrigins.split(","))
        );
        
        // Cho phép các HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Cho phép các headers
        config.setAllowedHeaders(List.of(
            "Authorization", 
            "Content-Type", 
            "Accept", 
            "X-Requested-With",
            "X-CSRF-TOKEN",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Exposed headers
        config.setExposedHeaders(List.of("Authorization", "X-CSRF-TOKEN"));
        
        // Allow credentials (cookies, authorization headers)
        config.setAllowCredentials(true);
        
        // Cache preflight requests
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ✅ Cấu hình bảo mật chính
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 🔐 Security Headers
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin()) // Chỉ cho phép iframe từ cùng origin
                .httpStrictTransportSecurity(hsts -> hsts
                    .maxAgeInSeconds(31536000)
                )
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'self';")
                )
            )
            
            // 🛡️ CSRF Protection - Disable cho REST API (sử dụng JWT thay vì)
            .csrf(csrf -> csrf.disable())
            
            // 🌐 CORS Configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 📝 Session Management (Stateless với JWT)
            .sessionManagement(sess -> sess
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // 🔑 Authorization Rules
            .authorizeHttpRequests(req -> req
                // 🟢 PUBLIC API - ai cũng truy cập được
                .requestMatchers(
                    "/api/home/**",
                    "/api/public/**",
                    "/product_img/**",
                    "/category_img/**",
                    "/uploads/**",
                    "/profile_img/**",
                    "/favicon.ico",
                    "/actuator/health",
                    "/actuator/info"
                ).permitAll()

                // 🟡 Swagger - chỉ cho phép trong development
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-resources/**"
                ).permitAll() // ⚠️ Trong production nên restrict: .hasIpAddress("127.0.0.1")

                // 🟡 USER API - cần đăng nhập (ROLE_USER hoặc ROLE_ADMIN)
                .requestMatchers(
                    "/api/user/**",
                    "/api/user/reservations/**",
                    "/api/user/reservations/book"
                ).hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                // 🔴 ADMIN API - chỉ Admin
                .requestMatchers(
                    "/api/admin/**",
                    "/api/admin/reservations/**",
                    "/actuator/**"
                ).hasAuthority("ROLE_ADMIN")

                // ⚪ Còn lại: phải xác thực
                .anyRequest().authenticated()
            )

            // ✅ Kích hoạt filter JWT
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
