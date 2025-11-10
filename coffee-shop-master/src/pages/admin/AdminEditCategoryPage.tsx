import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminEditCategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    isActive: "true",
    imageName: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 🧩 Lấy token đăng nhập
  const getToken = () => {
    const storedUser = localStorage.getItem("coffee-shop-auth-user");
    return storedUser ? JSON.parse(storedUser).token : null;
  };

  // 🔹 Lấy thông tin danh mục cần sửa
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setMessage({ type: "error", text: "Vui lòng đăng nhập lại!" });
      return;
    }

    fetch(`${import.meta.env.VITE_API_BASE}/api/admin/categories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải dữ liệu danh mục!");
        return res.json();
      })
      .then((data) => {
        setForm({
          name: data.name,
          isActive: data.isActive ? "true" : "false",
          imageName: data.imageName || "",
        });
      })
      .catch((err) => setMessage({ type: "error", text: err.message }));
  }, [id]);

  // 🔹 Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Xử lý chọn ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFile(selected || null);
    if (selected) {
      const url = URL.createObjectURL(selected);
      setPreview(url);
    }
  };

  // 🔹 Gửi cập nhật danh mục
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setMessage({ type: "error", text: "Không tìm thấy token đăng nhập!" });
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("isActive", form.isActive);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Không thể cập nhật danh mục!");
      setMessage({ type: "success", text: "✅ Cập nhật danh mục thành công!" });

      setTimeout(() => navigate("/admin/category"), 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-6">
          Chỉnh Sửa Danh Mục
        </h2>

        {/* 🔹 Thông báo */}
        {message && (
          <div
            className={`mb-6 text-center font-semibold ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 🔹 Tên danh mục */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Tên danh mục</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 🔹 Trạng thái */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Trạng thái</label>
            <div className="flex space-x-6">
              {[
                { value: "true", label: "Hoạt động" },
                { value: "false", label: "Không hoạt động" },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="isActive"
                    value={value}
                    checked={form.isActive === value}
                    onChange={handleChange}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 🔹 Upload ảnh */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Tải lên hình ảnh</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border rounded-lg px-3 py-2 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:bg-blue-100 hover:file:bg-blue-200"
            />
          </div>

          {/* 🔹 Ảnh hiện tại */}
          {form.imageName && !preview && (
            <div className="text-center mt-3">
              <img
                src={`${import.meta.env.VITE_API_BASE}/img/category_img/${form.imageName}`}
                alt="Category"
                className="w-28 h-28 object-cover mx-auto rounded-lg border"
              />
              <p className="text-gray-500 text-sm mt-1">Ảnh hiện tại</p>
            </div>
          )}

          {/* 🔹 Ảnh mới preview */}
          {preview && (
            <div className="text-center mt-3">
              <img
                src={preview}
                alt="preview"
                className="w-28 h-28 object-cover mx-auto rounded-lg border"
              />
              <p className="text-gray-500 text-sm mt-1">Ảnh mới (chưa lưu)</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full border border-blue-600 text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-600 hover:text-white transition"
          >
            Cập nhật danh mục
          </button>
        </form>
      </div>
    </section>
  );
}
