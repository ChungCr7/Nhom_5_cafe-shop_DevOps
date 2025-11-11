import Title3 from "@/components/shared/typo/Title3";
import { AuthUser } from "@/types";

interface UserInfoProps {
  user: AuthUser;
}

const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function UserInfo({ user }: UserInfoProps) {
  // ✅ Xử lý ảnh đại diện theo backend API và môi trường build
  const avatarUrl =
    user?.profileImage && user.profileImage.startsWith("http")
      ? user.profileImage
      : user?.profileImage
      ? `${API}/profile_img/${user.profileImage}`
      : "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  return (
    <div className="flex flex-col items-center text-center">
      {/* 🧑 Ảnh đại diện */}
      <div className="w-32 h-32 rounded-full bg-gray-300 overflow-hidden shadow-md">
        <img
          src={avatarUrl}
          alt={`${user?.name || "User"} Profile`}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://cdn-icons-png.flaticon.com/512/847/847969.png";
          }}
        />
      </div>

      {/* 🧾 Thông tin người dùng */}
      <div className="mt-6">
        <Title3>{user?.name || "Người dùng"}</Title3>
        <p className="text-gray-500 mt-2 text-sm">
          {user?.email || "Chưa có email"}
        </p>
      </div>
    </div>
  );
}
