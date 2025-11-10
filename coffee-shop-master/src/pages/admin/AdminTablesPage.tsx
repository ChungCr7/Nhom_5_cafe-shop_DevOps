import { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

interface CafeTable {
  id: number;
  tableName: string;
  position?: string;
  capacity?: number;
  status: string; // EMPTY / OCCUPIED / PAID
  totalAmount?: number;
}

export default function AdminTablesPage() {
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [tableName, setTableName] = useState("");
  const [position, setPosition] = useState("");
  const [capacity, setCapacity] = useState<number>(2);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState("EMPTY");

  // 🔑 Token đăng nhập
  const getToken = () => {
    const stored = localStorage.getItem("coffee-shop-auth-user");
    return stored ? JSON.parse(stored).token : null;
  };

  // 📦 Load danh sách bàn
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const token = getToken();
      const res = await fetch("${import.meta.env.VITE_API_BASE}/api/admin/tables", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("📋 Danh sách bàn:", data.tables);
      setTables(data.tables || []);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách bàn:", err);
    }
  };

  // 💾 Thêm / Cập nhật bàn (chuyển qua API /status)
  const handleSave = async () => {
    if (!tableName.trim()) return alert("Vui lòng nhập tên bàn!");
    const token = getToken();

    try {
      let url = "${import.meta.env.VITE_API_BASE}/api/admin/tables";
      let method = "POST";
      let body: any = { tableName, position, capacity, status };

      // ✅ Nếu là cập nhật bàn → gọi endpoint /status
      if (editingId) {
        method = "PUT";
        url = `${import.meta.env.VITE_API_BASE}/api/admin/tables/${editingId}/status?status=${status}`;
        body = null; // PUT /status không cần body
      }

      console.log(`📝 ${method} → ${url}`);

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("✅ Phản hồi:", data);
      alert(data.message || "Đã lưu thành công!");
      await fetchTables();
      resetForm();
    } catch (err) {
      console.error("❌ Lỗi lưu bàn:", err);
    }
  };

  // 🔁 Reset form
  const resetForm = () => {
    setTableName("");
    setPosition("");
    setCapacity(2);
    setStatus("EMPTY");
    setEditingId(null);
  };

  // 🗑 Xóa bàn
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa bàn này không?")) return;
    const token = getToken();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/admin/tables/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(data.message || data.error || "Đã xóa bàn!");
      fetchTables();
    } catch (err) {
      console.error("❌ Lỗi xóa bàn:", err);
    }
  };

  // ✏️ Sửa bàn
  const handleEdit = (table: CafeTable) => {
    setEditingId(table.id);
    setTableName(table.tableName);
    setPosition(table.position || "");
    setCapacity(table.capacity || 2);
    setStatus(table.status);
  };

  // 💰 Thanh toán bàn
  const handleMarkPaid = async (id: number) => {
    if (!window.confirm("Xác nhận bàn này đã thanh toán?")) return;
    const token = getToken();

    try {
      console.log(`💰 PUT /api/admin/tables/${id}/status?status=PAID`);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/admin/tables/${id}/status?status=PAID`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("✅ Phản hồi thanh toán:", data);
      alert(data.message || "Đã thanh toán thành công!");
      fetchTables();
    } catch (err) {
      console.error("❌ Lỗi cập nhật trạng thái bàn:", err);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Quản lý bàn cafe
        </h2>

        {/* Form thêm/sửa */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <input
            type="text"
            placeholder="Tên bàn (VD: Bàn 1)"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Vị trí (VD: Tầng 2 - Góc trong)"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            min={1}
            max={20}
            placeholder="Số ghế"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800"
          >
            <option value="EMPTY">Trống</option>
            <option value="OCCUPIED">Đang phục vụ</option>
            <option value="PAID">Đã thanh toán</option>
          </select>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleSave}
            className="flex items-center bg-blue-600 text-black px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            {editingId ? "Cập nhật bàn" : "Thêm bàn"}
          </button>
        </div>

        {/* Danh sách bàn */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-center text-gray-800">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">STT</th>
                <th className="border px-4 py-2">Tên bàn</th>
                <th className="border px-4 py-2">Vị trí</th>
                <th className="border px-4 py-2">Sức chứa</th>
                <th className="border px-4 py-2">Giá (VNĐ)</th>
                <th className="border px-4 py-2">Trạng thái</th>
                <th className="border px-4 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tables.length > 0 ? (
                tables.map((t, index) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2 font-medium">{t.tableName}</td>
                    <td className="border px-4 py-2">{t.position || "—"}</td>
                    <td className="border px-4 py-2">{t.capacity || 0}</td>
                    <td className="border px-4 py-2 text-amber-700 font-semibold">
                      {(t.totalAmount ?? 0).toLocaleString()}₫
                    </td>
                    <td className="border px-4 py-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          t.status === "EMPTY"
                            ? "bg-green-100 text-green-700"
                            : t.status === "OCCUPIED"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {t.status === "EMPTY"
                          ? "Trống"
                          : t.status === "OCCUPIED"
                          ? "Đang phục vụ"
                          : "Đã thanh toán"}
                      </span>
                    </td>
                    <td className="border px-4 py-2 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(t)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Chỉnh sửa"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Xóa bàn"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                      {t.status !== "EMPTY" && (
                        <button
                          onClick={() => handleMarkPaid(t.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Đánh dấu đã thanh toán"
                        >
                          <BanknotesIcon className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 text-gray-500 italic">
                    Chưa có bàn nào trong hệ thống
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
