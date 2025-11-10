import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

import Title3 from "@/components/shared/typo/Title3";
import ProductCardBgImage from "@/components/shared/card/ProductCardBgImage";
import ProductCardHorizontal from "@/components/shared/card/ProductCardHorizontal";
import AddressCard from "@/components/shared/AddressCard";
import { useModal } from "@/hooks/useModal";
import { useUserAddress } from "@/hooks/useUserAddress";

// ======================= INTERFACES =======================
interface Category {
  id: number;
  name: string;
  image?: string;
}

interface Product {
  id: number;
  title: string;
  description?: string;
  category?: string;
  image?: string;
  priceSmall?: number;
  priceMedium?: number;
  priceLarge?: number;
  discount?: number;
  active?: boolean;
}

// ======================= XỬ LÝ ẢNH =======================
const resolveImageUrl = (img?: string, type: "product" | "category" = "product") => {
  if (!img) return "/no-image.png";
  if (img.startsWith("http")) return img;
  if (img.includes(`${type}_img/`))
    return `${import.meta.env.VITE_API_BASE}/${img.replace(/^\/+/, "")}`;
  return `${import.meta.env.VITE_API_BASE}/${type}_img/${img}`;
};

// ======================= HOME PAGE =======================
export default function HomePage() {
  const { address } = useUserAddress();
  const { showAddressModal } = useModal();

  const [hotDrinks, setHotDrinks] = useState<Product[]>([]);
  const [coldDrinks, setColdDrinks] = useState<Product[]>([]);
  const [popularDrinks, setPopularDrinks] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // ===== LẤY DANH MỤC =====
        const catRes = await fetch("${import.meta.env.VITE_API_BASE}/api/home/categories");
        if (!catRes.ok) throw new Error("Không thể tải danh mục");
        const categories: Category[] = await catRes.json();

        // 🔥 Match linh hoạt: “Hot” hoặc “Nóng” | “Cold” hoặc “Lạnh”
        const hotCategory = categories.find(
          (c) =>
            c.name?.toLowerCase().includes("hot") ||
            c.name?.toLowerCase().includes("nóng")
        );
        const coldCategory = categories.find(
          (c) =>
            c.name?.toLowerCase().includes("cold") ||
            c.name?.toLowerCase().includes("lạnh")
        );

        // ===== LẤY DANH SÁCH SẢN PHẨM =====
        const prodRes = await fetch("${import.meta.env.VITE_API_BASE}/api/home/products?page=0&size=12");
        if (!prodRes.ok) throw new Error("Không thể tải sản phẩm");
        const prodData = await prodRes.json();
        const allProducts: Product[] = prodData.products || prodData;

        // ===== POPULAR DRINKS =====
        const popular = allProducts.filter((p) => p.discount && p.discount > 0).slice(0, 4);
        setPopularDrinks(popular.length ? popular : allProducts.slice(0, 4));

        // ===== HOT DRINKS =====
        if (hotCategory) {
          const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/home/category/${hotCategory.id}/products`);
          if (res.ok) {
            const data = await res.json();
            setHotDrinks(data);
          }
        }

        // ===== COLD DRINKS =====
        if (coldCategory) {
          const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/home/category/${coldCategory.id}/products`);
          if (res.ok) {
            const data = await res.json();
            setColdDrinks(data);
          }
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu HomePage:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen space-y-6">
      {/* 🏷️ Địa chỉ */}
      <AddressCard>
        <div className="relative w-full h-full">
          <div className="w-full h-full flex flex-col justify-end p-4">
            <span className="bg-primary-600 text-xs font-semibold text-white rounded-md px-2 py-1 w-fit">
              Location
            </span>
            <span className="font-semibold text-white line-clamp-2 mt-2">
              {address?.fullAddress ? (
                address.fullAddress
              ) : (
                <button onClick={showAddressModal} className="underline">
                  Add your location
                </button>
              )}
            </span>
          </div>

          {address?.fullAddress && (
            <button
              onClick={showAddressModal}
              className="absolute top-2 right-2 text-primary bg-white/70 hover:bg-white rounded-full p-1.5 shadow"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </AddressCard>

      {/* 🔍 Thanh tìm kiếm */}
      <Link
        to="/products"
        className="w-full flex justify-between items-center bg-gray-100 hover:bg-primary-50 border border-gray-200 text-gray-500 rounded-2xl py-2 px-3 transition"
      >
        <div className="flex items-center gap-2">
          <MagnifyingGlassIcon className="h-5 w-5" />
          <span>Search your drink...</span>
        </div>
      </Link>

      {/* ☕ Popular Drinks */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Title3>Popular Drinks</Title3>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-primary-600"
          >
            <span>All</span>
            <ChevronRightIcon className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {popularDrinks.map((coffee) => (
            <ProductCardBgImage
              key={coffee.id}
              coffee={{
                ...coffee,
                image: resolveImageUrl(coffee.image),
                category: coffee.category ?? "",
                active: coffee.active ?? true,
              }}
            />
          ))}
        </div>
      </div>

      {/* 🔥 Đồ uống nóng */}
      {hotDrinks.length > 0 && (
        <div>
          <Title3>Đồ uống nóng</Title3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            {hotDrinks.map((coffee) => (
              <ProductCardHorizontal
                key={coffee.id}
                coffee={{
                  ...coffee,
                  image: resolveImageUrl(coffee.image),
                  category: coffee.category ?? "",
                  active: coffee.active ?? true,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 🧊 Đồ uống lạnh */}
      {coldDrinks.length > 0 && (
        <div>
          <Title3>Đồ uống lạnh</Title3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            {coldDrinks.map((coffee) => (
              <ProductCardHorizontal
                key={coffee.id}
                coffee={{
                  ...coffee,
                  image: resolveImageUrl(coffee.image),
                  category: coffee.category ?? "",
                  active: coffee.active ?? true,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
