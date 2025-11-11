package com.example.baochung_st22a.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // ⚡ Bỏ qua filter cho các endpoint public (frontend không cần token)
        String path = request.getRequestURI();
        if (path.startsWith("/api/home/") ||
            path.startsWith("/product_img/") ||
            path.startsWith("/category_img/") ||
            path.startsWith("/uploads/") ||
            path.startsWith("/profile_img/") ||
            path.startsWith("/actuator/")) { // 👈 Thêm dòng này
            filterChain.doFilter(request, response);
            return;
        }


        String authHeader = request.getHeader("Authorization");

        // ⛔ Nếu không có header Bearer thì bỏ qua
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 🔑 Lấy token JWT
        String jwt = authHeader.substring(7);
        String userEmail = jwtService.extractEmail(jwt);

        // 🔍 Nếu có email và chưa xác thực thì xử lý tiếp
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

            if (jwtService.isTokenValid(jwt, userDetails.getUsername())) {
                // ✅ Lấy role từ token (và đảm bảo có tiền tố ROLE_)
                String role = jwtService.extractRole(jwt);
                if (!role.startsWith("ROLE_")) {
                    role = "ROLE_" + role;
                }

                List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));

                // ✅ Tạo đối tượng Authentication để Spring Security nhận diện
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                authorities
                        );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);

                System.out.println("✅ Authenticated user: " + userEmail + " | ROLE: " + role);
            }
        }

        // ⏩ Tiếp tục filter chain
        filterChain.doFilter(request, response);
    }

}
