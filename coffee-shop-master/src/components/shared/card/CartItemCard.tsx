import React from "react";
import CounterInputSm from "@/components/shared/CounterInputSm";
import { CartItem } from "@/types";
import { priceWithSign } from "@/utils/helper";
import { useShoppingCart } from "@/hooks/useShoppingCart";

interface CartItemCardProps {
  cartItem: CartItem;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ cartItem }) => {
  const { updateQuantity, removeFromCart } = useShoppingCart();
  const { id, product, quantity, totalPrice, size } = cartItem;

  // ✅ Tính giá trung bình 1 sản phẩm
  const displayPrice = totalPrice && quantity > 0 ? totalPrice / quantity : 0;

  // ✅ Xử lý đường dẫn ảnh: loại bỏ "product_img/" trùng
  const imagePath = product?.image
    ? product.image.replace(/^\/?product_img\//, "")
    : "default.jpg";

  const imageUrl = `http://127.0.0.1:8080/product_img/${imagePath}`;

  // ✅ Fallback ảnh khi lỗi
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/no-image.png";
  };

  // ✅ Cập nhật số lượng — gọi API qua context
  const handleQuantityChange = (value: number) => {
    if (value > quantity) updateQuantity("in", id);
    else if (value < quantity) updateQuantity("de", id);
    else if (value <= 0) removeFromCart(id);
  };


  return (
    <div className="flex justify-between items-center border-b py-2">
      {/* 🖼️ Ảnh sản phẩm */}
      <div className="flex gap-3 items-center">
        <img
          src={imageUrl}
          alt={product?.title || "Product image"}
          onError={handleImgError}
          className="w-16 h-16 bg-gray-100 object-cover rounded-lg"
        />

        {/* 📋 Thông tin sản phẩm */}
        <div className="flex flex-col justify-between">
          <p className="text-primary-700 font-semibold line-clamp-1">
            {product?.title}
          </p>
          <p className="text-sm text-gray-500">Size: {size?.toUpperCase()}</p>
          <CounterInputSm value={quantity} onChange={handleQuantityChange} />
        </div>
      </div>

      {/* 💰 Giá tiền */}
      <div className="text-right">
        <p className="text-primary font-semibold">
          {priceWithSign(totalPrice)}
        </p>
        {quantity > 1 && (
          <span className="text-gray-400 text-xs">
            {`${priceWithSign(displayPrice)} / sp`}
          </span>
        )}
      </div>
    </div>
  );
};

export default CartItemCard;
