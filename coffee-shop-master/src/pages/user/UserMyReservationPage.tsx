import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

// ✅ Biến môi trường linh hoạt (dùng cho local & production)
const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function UserMyReservationPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 🔹 Lấy token JWT từ localStorage
  const getToken = () => {
    const storedUser = localStorage.getItem("coffee-shop-auth-user");
    return storedUser ? JSON.parse(storedUser).token : null;
  };

  // 🔹 Gọi API lấy danh sách bàn đã đặt
  useEffect(() => {
    const fetchReservations = async () => {
      const token = getToken();
      if (!token) {
        setMessage({ type: "error", text: "Vui lòng đăng nhập lại!" });
        return;
      }

      try {
        const res = await fetch(`${API}/api/user/reservations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Không thể tải danh sách đặt bàn!");

        setReservations(data.reservations || []);
      } catch (err: any) {
        console.error("❌ Lỗi tải danh sách bàn:", err);
        setMessage({ type: "error", text: err.message || "Không thể tải danh sách đặt bàn!" });
      }
    };

    fetchReservations();
  }, []);

  // 🔹 Hủy bàn đã đặt
  const handleCancel = async (id: number) => {
    const token = getToken();
    if (!token) return setMessage({ type: "error", text: "Vui lòng đăng nhập lại!" });

    if (!window.confirm("Bạn có chắc muốn hủy bàn này không?")) return;

    try {
      const res = await fetch(`${API}/api/user/reservations/${id}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể hủy bàn!");

      setMessage({ type: "success", text: data.message || "✅ Đã hủy bàn thành công!" });

      // Cập nhật lại danh sách local (trạng thái bàn)
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "CANCELED" } : r))
      );
    } catch (err: any) {
      console.error("❌ Lỗi khi hủy bàn:", err);
      setMessage({ type: "error", text: err.message || "Không thể hủy bàn!" });
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Danh Sách Bàn Đã Đặt
        </h1>

        {/* 🔹 Thông báo */}
        {message && (
          <div
            className={`text-center mb-5 font-semibold ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 🔹 Nếu chưa có đặt bàn */}
        {reservations.length === 0 ? (
          <p className="text-center text-gray-500">Bạn chưa có bàn nào được đặt.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {reservations.map((r) => (
              <div
                key={r.id}
                className="border rounded-lg p-5 shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg text-gray-800">
                  Bàn: {r.table?.tableName || "Không rõ"}
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  Trạng thái:{" "}
                  <span
                    className={`font-semibold ${
                      r.status === "BOOKED"
                        ? "text-yellow-600"
                        : r.status === "COMPLETED"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {r.status === "BOOKED"
                      ? "Đang đặt"
                      : r.status === "COMPLETED"
                      ? "Đã hoàn tất"
                      : "Đã hủy"}
                  </span>
                </p>

                <p className="text-sm text-gray-600">
                  Giờ đặt: {new Date(r.timeStart).toLocaleString("vi-VN")}
                </p>

                <p className="text-sm text-gray-600">
                  Món đã gọi: {r.productIds?.length ? r.productIds.join(", ") : "Không có món"}
                </p>

                {/* 🔹 Nút hành động */}
                <div className="flex gap-3 mt-4">
                  {r.status === "BOOKED" && (
                    <button
                      onClick={() => handleCancel(r.id)}
                      className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      <XCircle className="w-4 h-4" /> Hủy
                    </button>
                  )}
                  {r.status === "COMPLETED" && (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-5 h-5" /> Đã thanh toán
                    </span>
                  )}
                  {r.status === "CANCELED" && (
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="w-5 h-5" /> Đã hủy
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
