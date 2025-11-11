import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  title: string;
  category: string;
  image: string;
  discount: number;
  stock: number;
  active: boolean;
  priceSmall: number;
  priceMedium: number;
  priceLarge: number;
}

// ✅ Dùng biến môi trường linh hoạt
const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [pageNo]);

  // ✅ Lấy token đăng nhập
  const getToken = () => {
    const storedUser = localStorage.getItem("coffee-shop-auth-user");
    return storedUser ? JSON.parse(storedUser).token : null;
  };

  // ✅ Gọi API lấy danh sách sản phẩm
  const fetchProducts = async (query: string = "") => {
    try {
      const token = getToken();
      if (!token) {
        setMessage({ type: "error", text: "Không tìm thấy token đăng nhập!" });
        return;
      }

      const url = query
        ? `${API}/api/admin/products?ch=${query}&pageNo=${pageNo}`
        : `${API}/api/admin/products?pageNo=${pageNo}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (res.status === 403) throw new Error("Bạn không có quyền truy cập!");
      if (!res.ok) throw new Error("Lỗi khi tải danh sách sản phẩm!");

      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Không thể tải danh sách sản phẩm!" });
    }
  };

  // 🔍 Tìm kiếm sản phẩm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPageNo(0);
    fetchProducts(search);
  };

  // ❌ Xóa sản phẩm
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;

    try {
      const token = getToken();
      if (!token) {
        setMessage({ type: "error", text: "Không tìm thấy token đăng nhập!" });
        return;
      }

      const res = await fetch(`${API}/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error();
      setMessage({ type: "success", text: "✅ Đã xóa sản phẩm thành công!" });
      fetchProducts();
    } catch {
      setMessage({ type: "error", text: "Không thể xóa sản phẩm!" });
    }
  };

  // ✅ Tính giá sau khi giảm
  const calcDiscount = (price: number, discount: number) =>
    price && discount ? price - (price * discount) / 100 : price;

  // ✅ Chuẩn hóa đường dẫn ảnh
  const getImageUrl = (image: string) => {
    if (!image) return "/default.jpg";
    return image.startsWith("/product_img/")
      ? `${API}${image}`
      : `${API}/product_img/${image}`;
  };

  return (
    <section className="min-h-screen bg-gray-50 py-10 px-5">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-6">
          Quản Lý Sản Phẩm
        </h2>

        {message && (
          <div
            className={`text-center font-semibold mb-4 ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 🔍 Form tìm kiếm */}
        <form onSubmit={handleSearch} className="flex justify-center mb-6 gap-3">
          <input
            type="text"
            placeholder="Nhập tên hoặc danh mục..."
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

        {/* 📋 Bảng danh sách sản phẩm */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-5">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border px-3 py-2">STT</th>
                <th className="border px-3 py-2">Hình Ảnh</th>
                <th className="border px-3 py-2">Tên</th>
                <th className="border px-3 py-2">Danh Mục</th>
                <th className="border px-3 py-2">Giảm (%)</th>
                <th className="border px-3 py-2">Giá Size S</th>
                <th className="border px-3 py-2">Giá Size M</th>
                <th className="border px-3 py-2">Giá Size L</th>
                <th className="border px-3 py-2">Tồn Kho</th>
                <th className="border px-3 py-2">Trạng Thái</th>
                <th className="border px-3 py-2">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-4 text-gray-500">
                    Không có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                products.map((p, i) => (
                  <tr key={p.id} className="text-center border-t">
                    <td className="border px-2 py-2">{i + 1 + pageNo * 10}</td>
                    <td className="border px-2 py-2">
                      <img
                        src={getImageUrl(p.image)}
                        alt={p.title}
                        className="w-14 h-14 object-cover mx-auto rounded-md"
                        onError={(e) => (e.currentTarget.src = "/default.jpg")}
                      />
                    </td>
                    <td className="border px-2 py-2 font-semibold">{p.title}</td>
                    <td className="border px-2 py-2">{p.category}</td>
                    <td className="border px-2 py-2">{p.discount}%</td>
                    <td className="border px-2 py-2 text-blue-600 font-semibold">
                      {calcDiscount(p.priceSmall, p.discount)?.toLocaleString()}đ
                    </td>
                    <td className="border px-2 py-2 text-blue-600 font-semibold">
                      {calcDiscount(p.priceMedium, p.discount)?.toLocaleString()}đ
                    </td>
                    <td className="border px-2 py-2 text-blue-600 font-semibold">
                      {calcDiscount(p.priceLarge, p.discount)?.toLocaleString()}đ
                    </td>
                    <td className="border px-2 py-2">{p.stock}</td>
                    <td className="border px-2 py-2">
                      {p.active ? (
                        <span className="text-green-600 font-semibold">Hoạt động</span>
                      ) : (
                        <span className="text-red-500 font-semibold">Ẩn</span>
                      )}
                    </td>
                    <td className="border px-2 py-2 space-x-2">
                      <Link
                        to={`/admin/edit-product/${p.id}`}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
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

        {/* 🔸 Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPageNo(i)}
                className={`px-3 py-1 rounded-md border ${
                  i === pageNo
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-blue-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
