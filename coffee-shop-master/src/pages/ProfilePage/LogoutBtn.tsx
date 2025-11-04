import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import { useUserAddress } from "@/hooks/useUserAddress";
import { removeAllOrders } from "@/service/order";
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog";

export default function LogoutBtn() {
  // ✅ Lấy các hàm từ context
  const { logout: logoutFromApp } = useAuth();
  const { removeAddress } = useUserAddress();
  const navigate = useNavigate();

  // ✅ Kiểm soát hiển thị dialog xác nhận
  const [showLogoutCD, setShowLogoutCD] = useState(false);

  // ✅ Mở dialog xác nhận
  const showLogoutConfirmDialog = () => setShowLogoutCD(true);

  // ✅ Xử lý khi người dùng xác nhận đăng xuất
  const handleLogoutConfirm = () => {
    setShowLogoutCD(false);
    // Xóa dữ liệu người dùng và localStorage
    logoutFromApp();
    removeAddress();
    removeAllOrders();
    // Điều hướng về trang chủ
    navigate("/");
  };

  return (
    <>
      {/* 🚪 Nút logout ở góc phải */}
      <button
        onClick={showLogoutConfirmDialog}
        className="absolute top-4 right-4 w-10 h-10 bg-white text-gray-500 hover:text-red-500 hover:rotate-12 transition-transform rounded-full p-2 shadow"
        title="Đăng xuất"
      >
        <ArrowRightStartOnRectangleIcon />
      </button>

      {/* 💬 Hộp thoại xác nhận */}
      <ConfirmDialog
        show={showLogoutCD}
        title="Xác nhận đăng xuất"
        leftBtnClick={() => setShowLogoutCD(false)}
        rightBtnClick={handleLogoutConfirm}
      >
        Bạn có chắc chắn muốn đăng xuất không?
      </ConfirmDialog>
    </>
  );
}
