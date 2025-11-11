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
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://15.134.111.154:9001" // 👈 Cho phép frontend trên EC2
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        config.addAllowedHeader("*");
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ✅ Cấu hình bảo mật chính
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(req -> req
                // 🟢 PUBLIC API - ai cũng truy cập được
                .requestMatchers(
                    "/api/home/**",
                    "/api/public/**",
                    "/product_img/**",
                    "/category_img/**",
                    "/uploads/**",
                    "/profile_img/**",
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/actuator/**"     // 👈 Thêm dòng này để Prometheus có thể truy cập
                ).permitAll()

                // 🟡 USER API - cần đăng nhập (ROLE_USER hoặc ROLE_ADMIN)
                .requestMatchers(
                    "/api/user/**",
                    "/api/user/reservations/**",
                    "/api/user/reservations/book"
                ).hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                // 🔴 ADMIN API - chỉ Admin
                .requestMatchers(
                    "/api/admin/**",
                    "/api/admin/reservations/**"
                ).hasAuthority("ROLE_ADMIN")

                // ⚪ Còn lại: phải xác thực
                .anyRequest().authenticated()
            )

            // ✅ Kích hoạt filter JWT
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // ✅ Cho phép hiển thị H2 console (hoặc iframe nếu cần)
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }
}
