import { useState, useEffect } from "react";

interface Category {
  id: number;
  name: string;
}

const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ✅ Lấy token từ localStorage
  const getToken = () => {
    const storedUser = localStorage.getItem("coffee-shop-auth-user");
    try {
      return storedUser ? JSON.parse(storedUser).token : null;
    } catch {
      return null;
    }
  };

  // ✅ Tải danh sách danh mục khi load trang
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const token = getToken();
    if (!token) {
      setMessage({ type: "error", text: "Không tìm thấy token. Vui lòng đăng nhập lại!" });
      return;
    }

    try {
      const res = await fetch(`${API}/api/admin/categories`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) throw new Error("Token hết hạn hoặc chưa đăng nhập!");
      if (res.status === 403) throw new Error("Bạn không có quyền truy cập danh mục!");
      if (!res.ok) throw new Error("Lỗi khi tải danh mục!");

      const data = await res.json();
      setCategories(data.categories || []);
      setMessage(null);
    } catch (err: any) {
      console.error("❌ Lỗi khi tải danh mục:", err.message);
      setMessage({ type: "error", text: err.message || "Không thể tải danh mục!" });
    }
  };

  // ✅ Thêm danh mục mới
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      setMessage({ type: "error", text: "Không tìm thấy token. Vui lòng đăng nhập lại!" });
      return;
    }

    if (!name.trim()) {
      setMessage({ type: "error", text: "Tên danh mục không được để trống!" });
      return;
    }

    const formData = new FormData();
    formData.append("name", name);

    try {
      const res = await fetch(`${API}/api/admin/categories`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.status === 401) throw new Error("Token hết hạn hoặc chưa đăng nhập!");
      if (res.status === 403) throw new Error("Bạn không có quyền thêm danh mục!");
      if (!res.ok) throw new Error("Lỗi khi thêm danh mục!");

      setMessage({ type: "success", text: "✅ Thêm danh mục thành công!" });
      setName("");
      fetchCategories();
    } catch (err: any) {
      console.error("❌ Lỗi khi thêm danh mục:", err.message);
      setMessage({ type: "error", text: err.message || "Không thể thêm danh mục!" });
    }
  };

  // ✅ Xóa danh mục
  const handleDelete = async (id: number) => {
    const token = getToken();
    if (!token) {
      setMessage({ type: "error", text: "Không tìm thấy token. Vui lòng đăng nhập lại!" });
      return;
    }

    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    try {
      const res = await fetch(`${API}/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) throw new Error("Token hết hạn hoặc chưa đăng nhập!");
      if (res.status === 403) throw new Error("Bạn không có quyền xóa danh mục!");
      if (!res.ok) throw new Error("Lỗi khi xóa danh mục!");

      setMessage({ type: "success", text: "🗑️ Xóa danh mục thành công!" });
      fetchCategories();
    } catch (err: any) {
      console.error("❌ Lỗi khi xóa danh mục:", err.message);
      setMessage({ type: "error", text: err.message || "Không thể xóa danh mục!" });
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Quản Lý Danh Mục</h2>

        {/* 🔔 Thông báo */}
        {message && (
          <div
            className={`mb-6 text-center font-semibold ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 🧩 Form thêm danh mục */}
        <form
          onSubmit={handleAdd}
          className="bg-white shadow-md rounded-lg p-5 mb-8 flex gap-4 items-end"
        >
          <div className="flex-1">
            <label className="block font-medium text-gray-700 mb-1">Tên danh mục</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên danh mục..."
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ➕ Thêm
          </button>
        </form>

        {/* 🧾 Danh sách danh mục */}
        <div className="bg-white shadow-md rounded-lg p-5 overflow-x-auto">
          <h4 className="text-xl font-semibold mb-4 text-gray-700 text-center">
            Danh Sách Danh Mục
          </h4>
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="border px-4 py-2">STT</th>
                <th className="border px-4 py-2">Tên Danh Mục</th>
                <th className="border px-4 py-2">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-3 text-gray-500">
                    Không có danh mục nào.
                  </td>
                </tr>
              ) : (
                categories.map((cat, index) => (
                  <tr key={cat.id} className="text-center border-t">
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2 font-medium">{cat.name}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
