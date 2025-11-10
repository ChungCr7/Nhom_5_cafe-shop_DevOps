import { useState, useEffect } from "react";

interface Order {
  id: number;
  orderId: string;
  orderDate?: string;
  status?: string;
  quantity?: number;
  priceBySize?: number;
  shippingFee?: number;
  totalPrice?: number;
  product?: { title?: string };
  orderAddress?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNo?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // ✅ Lấy token đăng nhập admin
  const getToken = () => {
    try {
      const stored = localStorage.getItem("coffee-shop-auth-user");
      return stored ? JSON.parse(stored).token : null;
    } catch {
      return null;
    }
  };

  // ✅ Load danh sách đơn hàng
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("Token không hợp lệ");

      const res = await fetch("${import.meta.env.VITE_API_BASE}/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) throw new Error("Không có quyền truy cập (403)");
      if (!res.ok) throw new Error("Lỗi tải danh sách đơn hàng");

      const data = await res.json();
      setOrders(data.orders || data || []);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không thể tải danh sách đơn hàng!" });
    }
  };

  // ✅ Tìm kiếm đơn hàng
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return fetchOrders();
    try {
      const token = getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/admin/orders/search?orderId=${search}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(data ? [data] : []);
      } else {
        setOrders([]);
        setMessage({ type: "error", text: "Không tìm thấy đơn hàng!" });
      }
    } catch {
      setMessage({ type: "error", text: "Lỗi tìm kiếm đơn hàng!" });
    }
  };

  // ✅ Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (id: number, status: string) => {
    const order = orders.find((o) => o.id === id);
    if (order?.status === "Cancelled") {
      setMessage({ type: "error", text: "❌ Không thể cập nhật đơn đã hủy!" });
      return;
    }

    try {
      const token = getToken();
      if (!token) throw new Error("Token not found");

      const statusMap: Record<string, number> = {
        "Đang Xử Lý": 1,
        "Đã Nhận Đơn": 2,
        "Đã Đóng Gói": 3,
        "Đang Giao Hàng": 4,
        "Đã Giao": 5,
        "Đã Hủy": 6,
      };
      const st = statusMap[status] || 0;

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/admin/update-status?id=${id}&st=${st}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Không thể cập nhật trạng thái!");
      }

      setMessage({ type: "success", text: "✅ Cập nhật trạng thái thành công!" });
      fetchOrders();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không thể cập nhật trạng thái!" });
    }
  };

  // 🗑 Xóa đơn hàng (Admin)
  const handleDeleteCancelledOrder = async (id: number) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Token not found");

      if (!window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) return;

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/admin/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Không thể xóa đơn hàng!");
      setMessage({ type: "success", text: "🗑 Đã xóa đơn hàng hủy thành công!" });
      fetchOrders();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi khi xóa đơn hàng!" });
    }
  };

  // ✅ Format giá & ngày
  const formatPrice = (value?: number) => (value ? value.toLocaleString("vi-VN") + "₫" : "—");
  const formatDate = (value?: string) => (value ? new Date(value).toLocaleString("vi-VN") : "—");

  return (
    <section className="min-h-screen bg-gray-50 py-10 px-5">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-8">
          Quản Lý Đơn Hàng
        </h2>

        {message && (
          <div
            className={`mb-5 text-center font-semibold ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form tìm kiếm */}
        <form onSubmit={handleSearch} className="flex justify-center mb-6 gap-3">
          <input
            type="text"
            placeholder="Nhập mã đơn hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-72 focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Bảng đơn hàng */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-5">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="border px-3 py-2">Mã đơn</th>
                <th className="border px-3 py-2">Thông tin giao hàng</th>
                <th className="border px-3 py-2">Ngày</th>
                <th className="border px-3 py-2">Sản phẩm</th>
                <th className="border px-3 py-2">Giá</th>
                <th className="border px-3 py-2">Trạng thái</th>
                <th className="border px-3 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-4">
                    Không có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.id}
                    className={`text-center border-t ${
                      o.status === "Cancelled"
                        ? "bg-red-50"
                        : o.status === "Delivered"
                        ? "bg-green-50"
                        : o.status === "Đang Giao Hàng"
                        ? "bg-yellow-50"
                        : ""
                    }`}
                  >
                    <td className="border px-3 py-2 font-semibold">{o.orderId || "—"}</td>

                    <td className="border px-3 py-2 text-left text-sm">
                      <p>
                        <b>Tên:</b> {o.orderAddress?.firstName || ""}{" "}
                        {o.orderAddress?.lastName || ""}
                      </p>
                      <p>
                        <b>Email:</b> {o.orderAddress?.email || "—"}
                      </p>
                      <p>
                        <b>ĐT:</b> {o.orderAddress?.mobileNo || "—"}
                      </p>
                      <p>
                        <b>Địa chỉ:</b> {o.orderAddress?.address || "—"},{" "}
                        {o.orderAddress?.city || ""}
                      </p>
                      <p>
                        <b>Tỉnh:</b> {o.orderAddress?.state || ""},{" "}
                        {o.orderAddress?.pincode || ""}
                      </p>
                    </td>

                    <td className="border px-3 py-2">{formatDate(o.orderDate)}</td>
                    <td className="border px-3 py-2">{o.product?.title || "—"}</td>

                  <td className="border px-3 py-2 text-sm">
                    {(() => {
                      const price = o.priceBySize || 0;
                      const quantity = o.quantity || 0;
                     const shippingFee = o.shippingFee ?? 0;
                      const total = o.totalPrice ?? price * quantity + shippingFee;

                      return (
                        <>
                           SL: {o.quantity || 0} <br />
                          Giá: {formatPrice(o.priceBySize)} <br />
                          Ship: {formatPrice(o.shippingFee)} <br />
                          <b>Tổng:</b> {formatPrice(o.totalPrice)}
                        </>
                      );
                    })()}
                  </td>


                    <td className="border px-3 py-2 font-medium">
                      <span
                        className={`${
                          o.status === "Delivered"
                            ? "text-green-600"
                            : o.status === "Cancelled"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {o.status || "Chưa xác định"}
                      </span>
                    </td>

                    {/* 🧩 Thao tác */}
                    <td className="border px-3 py-2">
                      {o.status === "Cancelled" ? (
                        <button
                          onClick={() => handleDeleteCancelledOrder(o.id)}
                          className="bg-red-500 hover:bg-red-600 text-black font-semibold px-3 py-1 rounded shadow-md"
                        >
                          🗑 Xóa đơn
                        </button>
                      ) : o.status === "Delivered" ? (
                        <button
                          disabled
                          className="bg-gray-400 text-white px-3 py-1 rounded cursor-not-allowed"
                        >
                          Đã giao
                        </button>
                      ) : (
                        <select
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                          defaultValue=""
                          className="border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="">-- Cập nhật --</option>
                          <option value="Đang Xử Lý">Đang Xử Lý</option>
                          <option value="Đã Nhận Đơn">Đã Nhận Đơn</option>
                          <option value="Đã Đóng Gói">Đã Đóng Gói</option>
                          <option value="Đang Giao Hàng">Đang Giao Hàng</option>
                          <option value="Đã Giao">Đã Giao</option>
                          <option value="Đã Hủy">Đã Hủy</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-gray-600 mt-4 text-sm text-center">
          Tổng số đơn hàng: {orders.length}
        </p>
      </div>
    </section>
  );
}
