import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";

export default function AdminAddProductPage() {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    ingredients: "",
    category: "",
    priceSmall: "",
    priceMedium: "",
    priceLarge: "",
    discount: "",
    stock: "",
    active: "true",
  });

  // 🧩 Lấy token đăng nhập
  const getToken = () => {
    const storedUser = localStorage.getItem("coffee-shop-auth-user");
    return storedUser ? JSON.parse(storedUser).token : null;
  };

  // 🔹 Lấy danh mục từ backend
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setMessage({ type: "error", text: "Vui lòng đăng nhập lại!" });
      return;
    }

    fetch("${import.meta.env.VITE_API_BASE}/api/admin/categories", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setMessage({ type: "error", text: "Không thể tải danh mục!" }));
  }, []);

  // 🔹 Cập nhật form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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

  // 🔹 Gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setMessage({ type: "error", text: "Không tìm thấy token đăng nhập!" });
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (file) formData.append("file", file);

    try {
      const res = await fetch("${import.meta.env.VITE_API_BASE}/api/admin/products", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.status === 403) throw new Error("Bạn không có quyền thêm sản phẩm!");
      if (!res.ok) throw new Error("Lỗi khi thêm sản phẩm!");

      setMessage({ type: "success", text: "✅ Thêm sản phẩm thành công!" });
      setForm({
        title: "",
        description: "",
        ingredients: "",
        category: "",
        priceSmall: "",
        priceMedium: "",
        priceLarge: "",
        discount: "",
        stock: "",
        active: "true",
      });
      setFile(null);
      setPreview(null);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Không thể thêm sản phẩm!" });
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
        <h2 className="text-center text-3xl font-bold mb-6 text-gray-800 flex items-center justify-center gap-2">
          <PlusCircle className="w-6 h-6 text-blue-600" /> Thêm Sản Phẩm Mới
        </h2>

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
          {/* 🔹 Tên sản phẩm */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Tên sản phẩm</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 🔹 Mô tả */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* 🔹 Thành phần */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Thành phần</label>
            <textarea
              name="ingredients"
              rows={2}
              value={form.ingredients}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* 🔹 Danh mục */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Danh mục</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 Giá theo size */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "priceSmall", label: "Giá Size Nhỏ (S)" },
              { name: "priceMedium", label: "Giá Size Vừa (M)" },
              { name: "priceLarge", label: "Giá Size Lớn (L)" },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="number"
                  name={name}
                  value={(form as any)[name]}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          {/* 🔹 Giảm giá */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Giảm giá (%)</label>
            <input
              type="number"
              name="discount"
              value={form.discount}
              onChange={handleChange}
              min="0"
              max="100"
              placeholder="Nhập phần trăm giảm (vd: 10)"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 🔹 Trạng thái */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Trạng thái</label>
            <div className="flex space-x-6">
              {[
                { value: "true", label: "Hoạt động" },
                { value: "false", label: "Ẩn" },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="active"
                    value={value}
                    checked={form.active === value}
                    onChange={handleChange}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 🔹 Tồn kho & Hình ảnh */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Tồn kho</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Hình ảnh</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border rounded-lg px-3 py-2 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:bg-blue-100 hover:file:bg-blue-200"
              />
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="w-28 h-28 object-cover rounded-md mt-2 border"
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full border border-blue-600 text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-600 hover:text-white transition"
          >
            Thêm sản phẩm
          </button>
        </form>
      </div>
    </section>
  );
}
