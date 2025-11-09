import React from "react";
import { priceWithSign } from "@/utils/helper";
import { useModal } from "@/hooks/useModal";
import { ProductCardProps } from "./type";

export default function ProductCardBgImage({ coffee }: ProductCardProps) {
  const { showProductModal } = useModal();

  // ✅ Mở modal chi tiết sản phẩm khi click
  const handleClick = () => {
    showProductModal(coffee);
  };

  // ✅ Ưu tiên giá Size M → S → L
  const displayPrice =
    coffee.priceMedium ?? coffee.priceSmall ?? coffee.priceLarge ?? 0;

  // ✅ Xử lý URL ảnh (nếu backend chỉ trả tên file)
  // Dùng localhost (thay vì 127.0.0.1) để tránh lỗi 403
  const imageUrl = coffee.image?.startsWith("http")
    ? coffee.image
    : `http://localhost:8080/product_img/${coffee.image}`;

  // ✅ Fallback ảnh khi bị lỗi (ảnh không tồn tại)
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/no-image.png";
  };

  return (
    <button
      onClick={handleClick}
      className="group relative w-full h-48 bg-gray-200 rounded-2xl overflow-hidden"
    >
      {/* 🖼️ Ảnh sản phẩm */}
      <img
        src={imageUrl}
        alt={coffee.displayName || coffee.title}
        onError={handleImgError}
        className="w-full h-full object-cover bg-gray-300 scale-100 group-hover:scale-110 ease-in duration-200"
      />

      {/* 📋 Overlay: tên sản phẩm */}
      <div className="absolute top-0 left-0 right-0 p-3 pb-10 bg-gradient-to-b from-black/60">
        <span className="text-left text-xl font-semibold text-white line-clamp-2">
          {coffee.displayName || coffee.title}
        </span>
      </div>

      {/* 💰 Hiển thị giá */}
      <div className="absolute bottom-0 right-0 p-3">
        <span className="bg-white text-sm text-black font-semibold border rounded-xl px-1.5 py-0.5">
          Size M: {priceWithSign(displayPrice)}
        </span>
      </div>
    </button>
  );
}
