import { Link, useNavigate } from "react-router-dom";
import {
  PlusCircleIcon,
  Squares2X2Icon,
  TableCellsIcon,
  CubeIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  todayRevenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        // 🔑 Lấy token
        const storedUser = localStorage.getItem("coffee-shop-auth-user");
        const token = storedUser ? JSON.parse(storedUser).token : null;

        if (!token) {
          setError("Không tìm thấy token! Vui lòng đăng nhập lại.");
          setLoading(false);
          return navigate("/login");
        }

        // 🔹 Gọi API Dashboard
        const res = await fetch("http://127.0.0.1:8080/api/admin/dashboard", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) throw new Error("Chưa đăng nhập hoặc token hết hạn!");
        if (res.status === 403) throw new Error("Bạn không có quyền truy cập trang quản trị!");
        if (!res.ok) throw new Error("Lỗi khi tải dữ liệu dashboard");

        const data = await res.json();
        setStats({
          totalProducts: data.totalProducts ?? 0,
          totalOrders: data.totalOrders ?? 0,
          totalUsers: data.totalUsers ?? 0,
          todayRevenue: data.todayRevenue ?? 0,
        });
      } catch (err: any) {
        console.error("❌ Lỗi Dashboard:", err);
        setError(err.message || "Không thể tải dữ liệu thống kê hệ thống!");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-8">
          📊 Trang Quản Trị Hệ Thống Coffee Shop
        </h2>

        {/* ✅ Loading / Error / Dashboard */}
        {loading ? (
          <div className="text-center text-gray-500 py-10 animate-pulse">
            Đang tải dữ liệu thống kê...
          </div>
        ) : error ? (
          <p className="text-center text-red-600 font-semibold py-4">{error}</p>
        ) : (
          stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-10">
              <StatCard
                title="Tổng sản phẩm"
                value={stats.totalProducts}
                color="from-blue-500 to-blue-300"
                icon={<Squares2X2Icon className="w-8 h-8 text-blue-700" />}
              />
              <StatCard
                title="Tổng đơn hàng"
                value={stats.totalOrders}
                color="from-green-500 to-green-300"
                icon={<CubeIcon className="w-8 h-8 text-green-700" />}
              />
              <StatCard
                title="Tổng người dùng"
                value={stats.totalUsers}
                color="from-yellow-500 to-yellow-300"
                icon={<UsersIcon className="w-8 h-8 text-yellow-700" />}
              />
              <StatCard
                title="Doanh thu hôm nay"
                value={stats.todayRevenue.toLocaleString("vi-VN") + " ₫"}
                color="from-pink-500 to-pink-300"
                icon={<ChartBarIcon className="w-8 h-8 text-pink-700" />}
              />
            </div>
          )
        )}

        {/* ✅ Menu chức năng quản trị */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <DashboardCard
            to="/admin/add-product"
            icon={<PlusCircleIcon className="w-10 h-10 text-blue-600" />}
            title="Thêm sản phẩm mới"
          />
          <DashboardCard
            to="/admin/category"
            icon={<Squares2X2Icon className="w-10 h-10 text-green-600" />}
            title="Danh mục sản phẩm"
          />
          <DashboardCard
            to="/admin/products"
            icon={<ClipboardDocumentListIcon className="w-10 h-10 text-purple-600" />}
            title="Danh sách sản phẩm"
          />
          <DashboardCard
            to="/admin/tables"
            icon={<TableCellsIcon className="w-10 h-10 text-orange-600" />}
            title="Quản lý bàn & đặt bàn"
          />
          <DashboardCard
            to="/admin/orders"
            icon={<CubeIcon className="w-10 h-10 text-amber-600" />}
            title="Quản lý đơn hàng"
          />
          <DashboardCard
            to="/admin/users?type=1"
            icon={<UserIcon className="w-10 h-10 text-teal-600" />}
            title="Khách hàng"
          />
          <DashboardCard
            to="/admin/add-admin"
            icon={<UserPlusIcon className="w-10 h-10 text-red-600" />}
            title="Thêm Quản trị viên"
          />
          <DashboardCard
            to="/admin/users?type=2"
            icon={<UsersIcon className="w-10 h-10 text-indigo-600" />}
            title="Danh sách Quản trị viên"
          />
          <DashboardCard
            to="/admin/statistics"
            icon={<ChartBarIcon className="w-10 h-10 text-pink-600" />}
            title="Thống kê doanh thu"
          />
        </div>
      </div>
    </section>
  );
}

/* 🧩 Thẻ thống kê */
interface StatCardProps {
  title: string;
  value: string | number;
  color: string;
  icon?: React.ReactNode;
}

function StatCard({ title, value, color, icon }: StatCardProps) {
  return (
    <div
      className={`rounded-xl p-5 shadow-md border border-gray-200 bg-gradient-to-br ${color} transition-transform hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-gray-800 text-sm font-semibold">{title}</h4>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

/* 🧩 Thẻ menu quản trị */
interface DashboardCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
}

function DashboardCard({ to, icon, title }: DashboardCardProps) {
  return (
    <Link
      to={to}
      className="block bg-white hover:bg-amber-50 shadow-md border border-gray-200 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg hover:scale-105"
    >
      <div className="flex flex-col items-center justify-center space-y-3">
        {icon}
        <h4 className="font-semibold text-gray-700">{title}</h4>
      </div>
    </Link>
  );
}
