import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import DataCards from "./DataCards";
import UserInfo from "./UserInfo";
import LogoutBtn from "./LogoutBtn";

export default function ProfilePage() {
  // ✅ Lấy thông tin người dùng từ context
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ Kiểm tra đăng nhập
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) {
    return <p className="text-center text-gray-500 mt-8">Error: Chưa đăng nhập</p>;
  }

  return (
    <div className="mx-2">
      <div className="relative flex flex-col items-center max-w-lg bg-gray-200 rounded-2xl p-4 sm:p-8 my-2 sm:my-8 mx-auto shadow-lg">
        {/* 🧑 Thông tin người dùng */}
        <UserInfo user={user} />

        {/* ✏️ Nút Edit Profile */}
        <button
          onClick={() => navigate("/profile/edit")}
          className="absolute top-4 left-4 w-10 h-10 bg-white text-gray-500 hover:text-gray-700 rounded-full p-2 shadow"
          title="Chỉnh sửa thông tin"
        >
          <PencilSquareIcon />
        </button>

        {/* 🚪 Nút Logout */}
        <LogoutBtn />

        {/* 📊 Thống kê đơn hàng */}
        <DataCards />
      </div>
    </div>
  );
}
