import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type MonthlyRevenue = { month: string; revenue: number };
type DashboardStats = {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  todayRevenue: number;
};

const API = "${import.meta.env.VITE_API_BASE}";

function getToken() {
  const raw = localStorage.getItem("coffee-shop-auth-user");
  try {
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
}

export default function AdminStatisticsPage() {
  const [monthly, setMonthly] = useState<MonthlyRevenue[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = useMemo(getToken, []);

  // Load dashboard + 12 tháng
  useEffect(() => {
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    setError(null);

    // Dashboard
    fetch(`${API}/api/admin/dashboard`, { headers })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => setStats(data as DashboardStats))
      .catch(() => setError("Không thể tải dữ liệu tổng quan (dashboard)"));

    // Doanh thu 12 tháng
    fetch(`${API}/api/admin/revenue/monthly`, { headers })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => setMonthly(data as MonthlyRevenue[]))
      .catch(() => setError("Không thể tải dữ liệu doanh thu 12 tháng"));
  }, [token]);

  return (
    <section className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Thống kê & Doanh thu
        </h1>

        {error && (
          <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3">
            {error}
          </div>
        )}

        {/* Cards tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Sản phẩm" value={stats?.totalProducts ?? 0} />
          <StatCard label="Đơn hàng" value={stats?.totalOrders ?? 0} />
          <StatCard label="Người dùng" value={stats?.totalUsers ?? 0} />
          <StatCard
            label="Doanh thu hôm nay"
            value={(stats?.todayRevenue ?? 0).toLocaleString("vi-VN") + "₫"}
          />
        </div>

        {/* Biểu đồ doanh thu 12 tháng */}
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Doanh thu 12 tháng gần nhất
            </h2>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => v.toLocaleString("vi-VN")} />
                <Tooltip
                  formatter={(val: number) => [`${val.toLocaleString("vi-VN")}₫`, "Doanh thu"]}
                />
                <Legend />
                <Bar dataKey="revenue" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
