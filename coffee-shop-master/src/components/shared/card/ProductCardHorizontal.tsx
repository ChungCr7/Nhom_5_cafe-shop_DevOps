import { PlusIcon } from "@heroicons/react/24/solid";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { useModal } from "@/hooks/useModal";
import { classNames, priceWithSign } from "@/utils/helper";
import { ProductCardProps } from "./type";

export default function ProductCardHorizontal({ coffee }: ProductCardProps) {
  const { items } = useShoppingCart();
  const isSameItem = items?.find((i) => i.product.id === coffee.id);
  const { showProductModal } = useModal();

  const handleClick = () => {
    showProductModal(coffee);
  };

  // ✅ Ưu tiên hiển thị giá Size M → S → L
  const displayPrice =
    coffee.priceMedium ?? coffee.priceSmall ?? coffee.priceLarge ?? 0;

  // ✅ Tự động nhận diện link ảnh đúng định dạng
  const imageUrl = (() => {
    if (!coffee.image) return "/no-image.png";

    // Nếu ảnh đã là link tuyệt đối (có http)
    if (coffee.image.startsWith("http")) return coffee.image;

    // Nếu backend trả dạng "product_img/filename.jpg"
    if (coffee.image.includes("product_img/"))
      return `http://localhost:8080/${coffee.image.replace(/^\/+/, "")}`;

    // Nếu backend chỉ trả tên file, thêm prefix đầy đủ
    return `http://localhost:8080/product_img/${coffee.image}`;
  })();

  // ✅ Fallback khi ảnh lỗi
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/no-image.png";
  };

  // ✅ Debug (bạn có thể bật tạm để xem link thực tế)
  // console.log("🧠 Image URL:", imageUrl);

  return (
    <button
      onClick={handleClick}
      className="relative flex flex-row bg-white hover:bg-primary-50 border rounded-2xl p-2 ease-in transition"
    >
      {/* 🖼️ Ảnh sản phẩm */}
      <img
        src={imageUrl}
        alt={coffee.displayName || coffee.title}
        onError={handleImgError}
        className="w-24 h-24 object-cover bg-gray-200 rounded-xl"
      />

      {/* 📋 Nội dung sản phẩm */}
      <div className="flex flex-col justify-between h-full pl-2 flex-1 text-left">
        <div>
          <p className="text-lg font-bold text-neutral-800 line-clamp-1">
            {coffee.displayName || coffee.title}
          </p>
          <p className="text-xs font-medium text-neutral-500 line-clamp-2">
            {coffee.description || "Sản phẩm đồ uống tại Love Coffee Shop"}
          </p>
        </div>
        <p className="font-semibold text-teal-900">
          Size M: {priceWithSign(displayPrice)}
        </p>
      </div>

      {/* ➕ Nút thêm giỏ hàng */}
      <div className="absolute bottom-2 right-2">
        <div
          className={classNames(
            "inline-flex items-center justify-center w-7 h-7 rounded-full shadow-sm",
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
