import { XMarkIcon } from "@heroicons/react/24/outline";
import { CoffeeProduct } from "@/types";

interface ProductImageProps {
  product: CoffeeProduct;
  onClose: () => void;
}

export default function ProductImage({ product, onClose }: ProductImageProps) {
  const API_BASE = import.meta.env.VITE_API_BASE; // ✅ Lấy base URL từ env

  // ✅ Xử lý URL ảnh từ backend (tự động)
  const imageUrl = (() => {
    if (!product.image) return "/no-image.png";
    if (product.image.startsWith("http")) return product.image;
    if (product.image.includes("product_img/"))
      return `${API_BASE}/${product.image.replace(/^\/+/, "")}`;
    return `${API_BASE}/product_img/${product.image}`;
  })();


  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/no-image.png";
  };

  return (
    <div className="relative w-full h-56 bg-gray-100 overflow-hidden rounded-t-2xl flex items-center justify-center">
      <img
        src={imageUrl}
        alt={product?.displayName || product?.title}
        onError={handleImgError}
        className="w-auto h-full object-contain transition-transform duration-300 ease-in-out hover:scale-105"
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 inline-flex items-center justify-center w-8 h-8 bg-white hover:bg-primary-50 text-primary rounded-full shadow-md"
      >
        <XMarkIcon className="h-5 w-5 stroke-2" />
      </button>
    </div>
  );
}
