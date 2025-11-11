import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Product {
  id: number;
  title: string;
  description: string;
  ingredients: string;
  category: string;
  priceSmall: number;
  priceMedium: number;
  priceLarge: number;
  discount: number;
  stock: number;
  active: boolean;
  image: string;
}

// ✅ Dùng biến môi trường API linh hoạt
const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Lấy token từ localStorage
  const getToken = () => {
    const storedUser = localStorage.getItem("coffee-shop-auth-user");
    return storedUser ? JSON.parse(storedUser).token : null;
  };

  // ✅ Load sản phẩm & danh mục
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getToken();
        if (!token) return navigate("/login");

        const [resProd, resCat] = await Promise.all([
          fetch(`${API}/api/admin/product/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/admin/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!resProd.ok) throw new Error("Không thể tải sản phẩm!");
        const prodData = await resProd.json();
        setProduct(prodData);

        // ✅ Preview ảnh đúng domain backend
        if (prodData.image) {
          setPreview(
            prodData.image.startsWith("http")
              ? prodData.image
              : `${API}${prodData.image}`
          );
        }

        const catData = await resCat.json();
        setCategories(catData.categories || []);
      } catch (err: any) {
        setMessage(err.message || "Lỗi khi tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  // ✅ Cập nhật giá trị input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!product) return;
    const { name, value, type, checked } = e.target as any;
    setProduct({ ...product, [name]: type === "checkbox" ? checked : value });
  };

  // ✅ Xử lý chọn ảnh mới
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  // ✅ Gửi form cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const token = getToken();
      if (!token) return setMessage("Không tìm thấy token!");

      const formData = new FormData();
      formData.append("title", product.title);
      formData.append("description", product.description);
      formData.append("ingredients", product.ingredients);
      formData.append("category", product.category);
      formData.append("priceSmall", product.priceSmall.toString());
      formData.append("priceMedium", product.priceMedium.toString());
      formData.append("priceLarge", product.priceLarge.toString());
      formData.append("discount", product.discount.toString());
      formData.append("stock", product.stock.toString());
      formData.append("active", product.active ? "true" : "false");
      if (file) formData.append("file", file);

      const res = await fetch(`${API}/api/admin/products/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cập nhật thất bại!");

      setMessage("✅ Đã cập nhật sản phẩm thành công!");
      setTimeout(() => navigate("/admin/products"), 1500);
    } catch (err: any) {
      setMessage(err.message || "Lỗi khi cập nhật sản phẩm!");
    }
  };

  // ✅ Loading / Lỗi
  if (loading)
    return <div className="text-center mt-20 text-gray-600">Đang tải dữ liệu...</div>;
  if (!product)
    return <div className="text-center mt-20 text-red-600">Không tìm thấy sản phẩm!</div>;

  // ✅ Giao diện form cập nhật
  return (
    <section className="min-h-screen bg-gray-50 py-10 px-5">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-8 border border-gray-200">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-6">
          ✏️ Cập Nhật Sản Phẩm
        </h2>

        {message && (
          <div className="text-center text-blue-600 font-semibold mb-4">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 🔹 Tên sản phẩm */}
          <div>
            <label className="block font-medium mb-1">Tên sản phẩm</label>
            <input
              type="text"
              name="title"
              value={product.title || ""}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 🔹 Mô tả */}
          <div>
            <label className="block font-medium mb-1">Mô tả</label>
            <textarea
              name="description"
              value={product.description || ""}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            ></textarea>
          </div>

          {/* 🔹 Thành phần */}
          <div>
            <label className="block font-medium mb-1">Thành phần</label>
            <textarea
              name="ingredients"
              value={product.ingredients || ""}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            ></textarea>
          </div>

          {/* 🔹 Danh mục */}
          <div>
            <label className="block font-medium mb-1">Danh mục</label>
            <select
              name="category"
              value={product.category || ""}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded-lg"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 Giá theo size */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "priceSmall", label: "Giá Size S" },
              { name: "priceMedium", label: "Giá Size M" },
              { name: "priceLarge", label: "Giá Size L" },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block font-medium mb-1">{label}</label>
                <input
                  type="number"
                  name={name}
                  value={(product as any)[name] || 0}
                  onChange={handleChange}
                  className="border w-full px-3 py-2 rounded-lg"
                />
              </div>
            ))}
          </div>

          {/* 🔹 Giảm giá */}
          <div>
            <label className="block font-medium mb-1">Giảm giá (%)</label>
            <input
              type="number"
              name="discount"
              value={product.discount || 0}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded-lg"
            />
          </div>

          {/* 🔹 Trạng thái */}
          <div>
            <label className="block font-medium mb-1">Trạng thái</label>
            <div className="flex gap-4">
              <label>
                <input
                  type="radio"
                  name="active"
                  checked={product.active === true}
                  onChange={() => setProduct({ ...product, active: true })}
                />{" "}
                Hoạt động
              </label>
              <label>
                <input
                  type="radio"
                  name="active"
                  checked={product.active === false}
                  onChange={() => setProduct({ ...product, active: false })}
                />{" "}
                Ẩn
              </label>
            </div>
          </div>

          {/* 🔹 Tồn kho & ảnh */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Tồn kho</label>
              <input
                type="number"
                name="stock"
                value={product.stock || 0}
                onChange={handleChange}
                className="border w-full px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Ảnh sản phẩm</label>
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="w-28 h-28 object-cover rounded-md mb-2 border"
                  onError={(e) => (e.currentTarget.src = "/images/no-image.png")}
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border rounded-lg px-2 py-1 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:bg-blue-100 hover:file:bg-blue-200"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            💾 Cập nhật sản phẩm
          </button>
        </form>
      </div>
    </section>
  );
}
