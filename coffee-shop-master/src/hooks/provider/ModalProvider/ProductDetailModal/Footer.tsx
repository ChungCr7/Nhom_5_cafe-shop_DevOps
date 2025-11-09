import { useState } from "react";
import { CoffeeProduct } from "@/types";
import ButtonFilled from "@/components/shared/button/ButtonFilled";
import CounterInput from "@/components/shared/CounterInput";
import { useShoppingCart } from "@/hooks/useShoppingCart";

interface ProductDetailModalProps {
  product: CoffeeProduct;
  onClose: () => void;
}

export default function Footer({ product, onClose }: ProductDetailModalProps) {
  const { addToCart } = useShoppingCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("medium"); // ✅ default size

  const handleQuantityChange = (value: number) => {
    if (value >= 1) setQuantity(value);
  };

  const handleAddToCart = async () => {
    try {
      // ✅ Gọi API backend (truyền productId + size)
      for (let i = 0; i < quantity; i++) {
        await addToCart(product.id, selectedSize);
      }
      onClose();
    } catch (err) {
      console.error("❌ Add to cart failed:", err);
    }
  };

  return (
    <div className="flex items-center justify-between w-full bg-white border-t p-4">
      {/* Bộ chọn size */}
      <select
        value={selectedSize}
        onChange={(e) => setSelectedSize(e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm font-medium"
      >
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>

      {/* Bộ đếm số lượng */}
      <CounterInput value={quantity} onChange={handleQuantityChange} />

      {/* Nút thêm vào giỏ */}
      <ButtonFilled onClick={handleAddToCart}>Add to Cart</ButtonFilled>
    </div>
  );
}
