import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  mobileNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  profileImage?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: any) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ✅ Khởi tạo user từ localStorage (nếu có)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("coffee-shop-auth-user");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return parsed.user || null;
    } catch {
      return null;
    }
  });

  // ✅ Khởi tạo token từ localStorage
  const [token, setToken] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem("coffee-shop-auth-user");
      if (!saved) return null;
      return JSON.parse(saved).token || null;
    } catch {
      return null;
    }
  });

  // ✅ Hàm gọi /api/user/me để đồng bộ thông tin user mới nhất
  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:8080/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newUser = res.data.user || res.data;
      setUser(newUser);

      // Lưu lại vào localStorage
      const saved = localStorage.getItem("coffee-shop-auth-user");
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.user = newUser;
      localStorage.setItem("coffee-shop-auth-user", JSON.stringify(parsed));

      console.log("✅ User cập nhật:", newUser);
    } catch (error) {
      console.error("❌ Lỗi khi gọi /api/user/me:", error);
    }
  };

  // ✅ Khi token thay đổi → luôn refresh user (kể cả có user cũ)
  useEffect(() => {
    if (token) refreshUser();
  }, [token]);

  // ✅ Đăng nhập
  const login = (userData: any) => {
    const { token: newToken, user } = userData;

    // Xóa dữ liệu cũ
    localStorage.removeItem("coffee-shop-auth-user");
    localStorage.removeItem("coffee-shop-token");
    localStorage.removeItem("coffee-shop-auth-user-address");

    // Lưu dữ liệu mới
    const newData = {
      user: {
        id: user?.id || null,
        name: user?.name || null,
        email: user?.email || null,
        role: user?.role || null,
      },
      token: newToken,
    };

    localStorage.setItem("coffee-shop-auth-user", JSON.stringify(newData));
    setToken(newToken);
    setUser(user || null);

    // Nếu backend chưa trả user → gọi lại /me
    if (!user) refreshUser();

    console.log("✅ Đăng nhập thành công:", newData);
  };

  // ✅ Đăng xuất
  const logout = () => {
    console.log("🚪 Đăng xuất và xoá toàn bộ LocalStorage...");
    setUser(null);
    setToken(null);
    localStorage.removeItem("coffee-shop-auth-user");
    localStorage.removeItem("coffee-shop-token");
    localStorage.removeItem("coffee-shop-auth-user-address");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
