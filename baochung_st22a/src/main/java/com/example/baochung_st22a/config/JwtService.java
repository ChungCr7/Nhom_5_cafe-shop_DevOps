package com.example.baochung_st22a.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET_KEY = "mysecretkeyforcoffeeappjwt2025verylongandsecure"; // 🔑
    private static final long EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 1 ngày

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // ✅ Sinh token (email + role)
    public String generateToken(String email, String role) {
        // Bảo đảm format role đúng (ROLE_USER, ROLE_ADMIN)
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Lấy email từ token
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    // ✅ Lấy role từ token
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    // ✅ Kiểm tra token hợp lệ
    public boolean isTokenValid(String token, String email) {
        try {
            final String username = extractEmail(token);
            return (username.equals(email) && !isTokenExpired(token));
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("❌ Invalid JWT: " + e.getMessage());
            return false;
        }
    }

    // 🔹 Kiểm tra hết hạn
    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    // 🔹 Giải mã claims
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
