import { useEffect, useState } from "react";
import { CheckCircleIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Table {
  id: number;
  tableName: string;
  position: string;
  capacity: number;
  status: string;
  totalAmount: number;
  note?: string;
  items?: TableItem[];
}

interface TableItem {
  id: number;
  productName: string;
  size: string;
  quantity: number;
  price: number;
  total: number;
}

const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function AdminReservationsPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    try {
      const stored = localStorage.getItem("coffee-shop-auth-user");
      return stored ? JSON.parse(stored).token : null;
    } catch {
      return null;
    }
  };

  // 🔹 Tải danh sách tất cả bàn
  const fetchTables = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/admin/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Fetch tables failed");

      const data = await res.json();
      setTables(data.tables || []);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách bàn:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Hoàn tất thanh toán bàn (reset trạng thái, xóa món)
  const handleComplete = async (tableId: number) => {
    const token = getToken();
    if (!window.confirm("Xác nhận đã thanh toán và reset bàn này?")) return;

    try {
      const res = await fetch(`${API_BASE}/admin/tables/${tableId}/reset`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("✅ Bàn đã được reset sau khi thanh toán!");
        fetchTables();
      } else {
        const msg = await res.text();
        alert(`⚠️ Lỗi: ${msg}`);
      }
    } catch (err) {
      console.error("❌ Lỗi khi reset bàn:", err);
    }
  };

  // ❌ Xóa bàn hoàn toàn (chỉ khi quản trị muốn)
  const handleDelete = async (tableId: number) => {
    const token = getToken();
    if (!window.confirm("Bạn có chắc muốn xóa bàn này?")) return;

    try {
      const res = await fetch(`${API_BASE}/admin/tables/${tableId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("🗑️ Đã xóa bàn thành công!");
        fetchTables();
      }
    } catch (err) {
      console.error("Lỗi khi xóa bàn:", err);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  if (loading) return <p className="text-center text-gray-500 py-6">Đang tải dữ liệu...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-amber-800 mb-5 text-center">
        ☕ Quản lý bàn & đơn tại quán
      </h1>

      <div className="overflow-x-auto shadow rounded-lg bg-white">
        <table className="min-w-full border border-gray-200 text-center">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border px-4 py-2">STT</th>
              <th className="border px-4 py-2">Tên bàn</th>
              <th className="border px-4 py-2">Vị trí</th>
              <th className="border px-4 py-2">Sức chứa</th>
              <th className="border px-4 py-2">Trạng thái</th>
              <th className="border px-4 py-2">Tổng tiền</th>
              <th className="border px-4 py-2">Ghi chú</th>
              <th className="border px-4 py-2">Danh sách món</th>
              <th className="border px-4 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {tables.length > 0 ? (
              tables.map((t, index) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2 font-semibold">{t.tableName}</td>
                  <td className="border px-4 py-2 text-sm">{t.position}</td>
                  <td className="border px-4 py-2">{t.capacity}</td>
                  <td className="border px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        t.status === "EMPTY"
                          ? "bg-green-100 text-green-700"
                          : t.status === "OCCUPIED"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {t.status === "EMPTY"
                        ? "Trống"
                        : t.status === "OCCUPIED"
                        ? "Đang phục vụ"
                        : "Đã thanh toán"}
                    </span>
                  </td>
                  <td className="border px-4 py-2 text-right">
                    {t.totalAmount?.toLocaleString()} ₫
                  </td>
                  <td className="border px-4 py-2 text-sm text-gray-500">
                    {t.note || "-"}
                  </td>
                  <td className="border px-4 py-2 text-left">
                    {t.items && t.items.length > 0 ? (
                      <ul className="text-sm list-disc pl-5">
                        {t.items.map((i) => (
                          <li key={i.id}>
                            {i.productName} ({i.size}) × {i.quantity} ={" "}
                            <b>{i.total.toLocaleString()}₫</b>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400 italic">Không có món</span>
                    )}
                  </td>
                  <td className="border px-4 py-2 space-x-2">
                    {t.status === "OCCUPIED" && (
                      <button
                        onClick={() => handleComplete(t.id)}
                        className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Hoàn tất
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-4 text-gray-500 italic">
                  Chưa có dữ liệu bàn
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
