package com.example.baochung_st22a.config;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.baochung_st22a.model.UserDtls;

/**
 * ✅ CustomUser implements UserDetails
 * - Dùng để Spring Security hiểu được thông tin user của bạn (email, password, role, trạng thái)
 * - Tự động thêm prefix ROLE_ nếu trong DB lưu "USER" hoặc "ADMIN"
 * - Tương thích hoàn toàn với JwtAuthFilter và SecurityConfig
 */
public class CustomUser implements UserDetails {

    private final UserDtls user;

    public CustomUser(UserDtls user) {
        this.user = user;
    }

    // 🟢 Trả về quyền của user (role)
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String role = user.getRole();

        // ✅ Đảm bảo format chuẩn: ROLE_USER / ROLE_ADMIN
        if (role != null && !role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        return List.of(new SimpleGrantedAuthority(role));
    }

    // 🟢 Password để Spring Security so sánh khi login
    @Override
    public String getPassword() {
        return user.getPassword();
    }

    // 🟢 Username chính là email
    @Override
    public String getUsername() {
        return user.getEmail();
    }

    // 🟢 Mặc định account không hết hạn
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    // 🟢 Kiểm tra account có bị khóa không
    @Override
    public boolean isAccountNonLocked() {
        return user.getAccountNonLocked() != null ? user.getAccountNonLocked() : true;
    }

    // 🟢 Mặc định credentials không hết hạn
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // 🟢 Kiểm tra user có được bật hay không (isEnable = true)
    @Override
    public boolean isEnabled() {
        return user.getIsEnable() != null ? user.getIsEnable() : true;
    }

    // 🔍 Getter để truy cập thông tin chi tiết của user
    public UserDtls getUser() {
        return this.user;
    }
}
