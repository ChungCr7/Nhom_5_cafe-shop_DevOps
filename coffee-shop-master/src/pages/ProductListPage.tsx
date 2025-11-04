import { useEffect, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ProductCardHorizontal from "@/components/shared/card/ProductCardHorizontal";
import { CoffeeProduct } from "@/types";

// ======================= TRANG DANH SÁCH SẢN PHẨM (PUBLIC) =======================
export default function ProductListPage() {
  const [allProducts, setAllProducts] = useState<CoffeeProduct[]>([]);
  const [filtered, setFiltered] = useState<CoffeeProduct[]>([]);
  const [keyword, setKeyword] = useState("");

  // ✅ Gọi API backend lấy danh sách sản phẩm hoạt động
  useEffect(() => {
    fetch("http://localhost:8080/api/home/products")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        // ✅ Backend trả về dạng { products: [...], totalPages, ... }
        if (Array.isArray(data.products)) {
          setAllProducts(data.products);
          setFiltered(data.products);
        } else {
          console.warn("⚠️ Không tìm thấy mảng products trong response:", data);
        }
      })
      .catch((err) => console.error("❌ Error loading products:", err));
  }, []);

  // ✅ Lọc sản phẩm theo từ khóa tìm kiếm
  useEffect(() => {
    if (!keyword.trim()) {
      setFiltered(allProducts);
    } else {
      const lower = keyword.toLowerCase();
      const result = allProducts.filter(
        (p) =>
          p.title?.toLowerCase().includes(lower) ||
          p.category?.toLowerCase().includes(lower)
      );
      setFiltered(result);
    }
  }, [keyword, allProducts]);

  // ✅ Gom nhóm sản phẩm theo danh mục (category)
  const categories = Array.from(new Set(filtered.map((p) => p.category))).sort();

  // ✅ Xử lý ô nhập
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };
  const handleClear = () => setKeyword("");

  return (
    <div className="p-3">
      {/* 🔍 Ô tìm kiếm sản phẩm */}
      <div className="flex items-center w-full sm:w-96 bg-gray-100 text-gray-900 text-sm rounded-xl border border-gray-300 px-3 py-2 mb-4">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Tìm đồ uống hoặc danh mục..."
          value={keyword}
          onChange={handleInputChange}
          className="flex-1 bg-transparent outline-none placeholder-gray-500"
        />
        {keyword && (
          <button
            onClick={handleClear}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 🏷️ Hiển thị sản phẩm theo từng danh mục */}
      {categories.length === 0 ? (
        <p className="text-gray-500 italic">Không tìm thấy sản phẩm nào.</p>
      ) : (
        categories.map((cat) => (
          <div key={cat} className="mt-6">
            <h2 className="text-lg font-semibold mb-2 text-amber-800">
              {cat}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered
                .filter((p) => p.category === cat)
                .map((coffee) => (
                  <ProductCardHorizontal key={coffee.id} coffee={coffee} />
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
