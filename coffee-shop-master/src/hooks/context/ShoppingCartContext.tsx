import { createContext } from "react";
import { CartItem, DeliOption, PaymentMethod } from "@/types";

export interface ShoppingCartContextProps {
  // 🛒 Cart Item
  items: CartItem[];
  addToCart: (productId: number, size?: string) => Promise<void>; // ✅ productId + size (gọi API backend)
  updateQuantity: (symbol: "in" | "de", cartId: number) => Promise<void>; // ✅ backend dùng sy=in/de
  removeFromCart: (cartId: number) => Promise<void>; // ✅ gọi API delete
  clearCart: () => Promise<void>; // ✅ xoá toàn bộ giỏ hàng

  // 🚚 Delivery Option
  deliOption: DeliOption;
  updateDeliOption: (value: DeliOption) => void;

  // 💳 Payment Method
  paymentMethod: PaymentMethod;
  updatePaymentMethod: (value: PaymentMethod) => void;

  // 📊 Summary
  itemCount: number;
  subTotal: number;
  deliFee: number;
  totalPayment: number;

  // 🔄 Đồng bộ với server
  fetchCart: () => Promise<void>;
}

const ShoppingCartContext = createContext<ShoppingCartContextProps | null>(null);
export default ShoppingCartContext;
