import { PlusIcon } from "@heroicons/react/24/solid";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { useModal } from "@/hooks/useModal";
import { classNames, priceWithSign } from "@/utils/helper";
import { ProductCardProps } from "./type";

export default function ProductCardSmall({ coffee }: ProductCardProps) {
  const { items } = useShoppingCart();
  const isSameItem = items?.find((i) => i.product.id === coffee.id);
  const { showProductModal } = useModal();

  const handleClick = () => {
    showProductModal(coffee);
  };

  // ✅ Ưu tiên hiển thị giá Size M → S → L
  const displayPrice =
    coffee.priceMedium ?? coffee.priceSmall ?? coffee.priceLarge ?? 0;

  // ✅ Xử lý URL ảnh đúng chuẩn (backend Spring Boot)
  const imageUrl = coffee.image?.startsWith("http")
    ? coffee.image
    : `http://localhost:8080/product_img/${coffee.image}`;

  // ✅ Fallback ảnh khi lỗi
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/no-image.png";
  };

  return (
    <button
      onClick={handleClick}
      className="relative w-full h-56 bg-white hover:bg-primary-50 border rounded-2xl p-2 ease-in transition"
    >
      {/* 🖼️ Ảnh sản phẩm */}
      <img
        src={imageUrl}
        alt={coffee.displayName || coffee.title}
        onError={handleImgError}
        className="w-full h-32 object-cover bg-gray-300 rounded-xl"
      />

      {/* 📋 Nội dung sản phẩm */}
      <div className="flex flex-col justify-between h-20 text-left py-1">
        <p className="font-bold text-neutral-800 line-clamp-2">
          {coffee.displayName || coffee.title}
        </p>
        <p className="font-semibold text-teal-900">
          Size M: {priceWithSign(displayPrice)}
        </p>
      </div>

      {/* ➕ Nút thêm sản phẩm */}
      <div className="absolute bottom-2 right-2">
        <div
          className={classNames(
            "inline-flex items-center justify-center w-7 h-7 rounded-full",
            isSameItem
              ? "text-primary border border-primary bg-white"
              : "bg-primary text-white"
          )}
        >
          {isSameItem ? (
            <span className="text-sm font-semibold">{isSameItem.quantity}</span>
          ) : (
            <PlusIcon className="h-5 w-5" />
          )}
        </div>
      </div>
    </button>
  );
}
