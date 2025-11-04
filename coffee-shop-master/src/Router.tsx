import { Route, Routes } from "react-router-dom";

// -------- Layouts --------
import AppLayout from "@/components/layout/AppLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// -------- Auth Guard --------
import AdminRoute from "@/components/auth/AdminRoute";

// -------- Main User Pages --------
import HomePage from "@/pages/HomePage";
import ProductListPage from "@/pages/ProductListPage";
import OrderHistoryPage from "@/pages/OrderHistoryPage";
import OrderDetailPage from "@/pages/OrderDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsAndConditions from "@/pages/TermsAndConditions";
import NotFoundPage from "@/pages/NotFoundPage";

// -------- User Reservation Pages --------
import UserBookTablePage from "@/pages/user/UserBookTablePage";
import UserMyReservationPage from "@/pages/user/UserMyReservationPage";
import EditProfilePage from "./pages/ProfilePage/EditProfilePage";

// -------- Auth Pages --------
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

// -------- Admin Pages --------
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminAddProductPage from "@/pages/admin/AdminAddProductPage";
import AdminEditProductPage from "@/pages/admin/AdminEditProductPage";
import AdminCategoryPage from "@/pages/admin/AdminCategoryPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminAddAdminPage from "@/pages/admin/AdminAddAdminPage";
import AdminProfilePage from "@/pages/admin/AdminProfilePage";
import AdminStatisticsPage from "@/pages/admin/AdminStatisticsPage";

// ✅ Trang quản lý bàn & đặt bàn hợp nhất
import AdminManagePage from "@/pages/admin/AdminManagePage";
import AdminTablesPage from "./pages/admin/AdminTablesPage";

export default function Router() {
  return (
    <Routes>
      {/* ======================= 👨‍💻 TRANG NGƯỜI DÙNG ======================= */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/book-table" element={<UserBookTablePage />} />
        <Route path="/my-reservations" element={<UserMyReservationPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* ======================= 🛠️ TRANG ADMIN ======================= */}
      <Route element={<AdminRoute />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/add-product" element={<AdminAddProductPage />} />
        <Route path="/admin/edit-product/:id" element={<AdminEditProductPage />} />
        <Route path="/admin/category" element={<AdminCategoryPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/add-admin" element={<AdminAddAdminPage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
        <Route path="/admin/statistics" element={<AdminStatisticsPage />} />

        {/* ✅ Quản lý bàn riêng */}
        <Route path="/admin/tables" element={<AdminTablesPage />} />

        {/* ✅ Trang hợp nhất quản lý bàn & đặt bàn */}
        <Route path="/admin/manage" element={<AdminManagePage />} />
      </Route>
    </Route>

      {/* ======================= 🔐 TRANG XÁC THỰC (LOGIN / REGISTER) ======================= */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 🔹 Trang lỗi cho toàn bộ (fallback ngoài layout) */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
