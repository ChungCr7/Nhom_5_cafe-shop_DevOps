import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function AdminRoute() {
  const { user } = useAuth();

  // ✅ Nếu chưa đăng nhập → chuyển về login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Nếu không phải admin → chuyển về trang chủ
  if (user.role !== "ROLE_ADMIN") {
    return <Navigate to="/" replace />;
  }

  // ✅ Nếu là admin thì cho phép vào các route con
  return <Outlet />;
}
