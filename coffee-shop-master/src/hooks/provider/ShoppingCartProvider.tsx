import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { CartItem, DeliOption, PaymentMethod } from "@/types";
import ShoppingCartContext from "../context/ShoppingCartContext";

interface ShoppingCartProviderProps {
  children: ReactNode;
}

const ShoppingCartProvider: React.FC<ShoppingCartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliOption, setDeliOption] = useState<DeliOption>(DeliOption.DELIVER);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [subTotal, setSubTotal] = useState(0);
  const [deliFee, setDeliFee] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // 🧠 Helper: Lấy token & userId từ localStorage (TƯƠNG THÍCH VỚI AuthContext mới)
  const getAuth = () => {
    const stored = localStorage.getItem("coffee-shop-auth-user");
    if (!stored) return { token: null, userId: null };

    try {
      const parsed = JSON.parse(stored);
      const token = parsed.token || parsed.user?.token || null;
      const userId = parsed.user?.id || parsed.id || null;
      return { token, userId };
    } catch (err) {
      console.error("❌ Error parsing auth data:", err);
      return { token: null, userId: null };
    }
  };

  // 🧾 Lấy danh sách giỏ hàng từ backend
  const fetchCart = useCallback(async () => {
    const { token } = getAuth();
    if (!token) return;

    try {
      const res = await fetch("http://localhost:8080/api/user/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.warn("⚠️ fetchCart failed:", res.status);
        return;
      }

      const data = await res.json();
      setItems(data.carts || []);
      setSubTotal(data.totalOrderPrice || 0);
      setItemCount((data.carts || []).length);

      const deliveryFee = deliOption === DeliOption.DELIVER ? 15000 : 0;
      setDeliFee(deliveryFee);
      setTotalPayment((data.totalOrderPrice || 0) + deliveryFee);
    } catch (err) {
      console.error("❌ fetchCart error:", err);
    }
  }, [deliOption]);

  // 🧩 Lấy giỏ hàng khi load trang
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 🛒 Thêm sản phẩm vào giỏ
  const addToCart = async (productId: number, size: string = "medium") => {
    const { token, userId } = getAuth();
    if (!token || !userId) {
      alert("Please log in first!");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/user/add-cart?pid=${productId}&uid=${userId}&size=${size}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 403) {
        alert("You are not authorized. Please log in again.");
        return;
      }

      await fetchCart();
    } catch (err) {
      console.error("❌ addToCart error:", err);
    }
  };

  // 🔁 Cập nhật số lượng (+/-)
  const updateQuantity = async (symbol: "in" | "de", cartId: number) => {
    const { token } = getAuth();
    if (!token) return;

    try {
      await fetch(`http://localhost:8080/api/user/cart/update?sy=${symbol}&cid=${cartId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart();
    } catch (err) {
      console.error("❌ updateQuantity error:", err);
    }
  };

  // ❌ Xoá sản phẩm khỏi giỏ
  const removeFromCart = async (cartId: number) => {
    const { token } = getAuth();
    if (!token) return;

    try {
      await fetch(`http://localhost:8080/api/user/cart/delete?cid=${cartId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart();
    } catch (err) {
      console.error("❌ removeFromCart error:", err);
    }
  };

  // 🧹 Xoá toàn bộ giỏ
  const clearCart = useCallback(async () => {
    const { token } = getAuth();
    if (!token) return;

    try {
      await fetch("http://localhost:8080/api/user/cart/clear", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart();
    } catch (err) {
      console.error("❌ clearCart error:", err);
    }
  }, [fetchCart]);

  // 🚚 Cập nhật phương thức giao hàng
  const updateDeliOption = useCallback((value: DeliOption) => {
    setDeliOption(value);
    setDeliFee(value === DeliOption.DELIVER ? 15000 : 0);
  }, []);

  // 💳 Cập nhật phương thức thanh toán
  const updatePaymentMethod = useCallback((value: PaymentMethod) => {
    setPaymentMethod(value);
  }, []);

  // 🧮 Tổng hợp giá trị context
  const value = useMemo(
    () => ({
      items,
      itemCount,
      addToCart,
      updateQuantity,
      removeFromCart,
      deliOption,
      updateDeliOption,
      subTotal,
      deliFee,
      totalPayment,
      paymentMethod,
      updatePaymentMethod,
      clearCart,
      fetchCart,
    }),
    [
      items,
      itemCount,
      deliOption,
      paymentMethod,
      subTotal,
      deliFee,
      totalPayment,
      clearCart,
      fetchCart,
    ]
  );

  return (
    <ShoppingCartContext.Provider value={value}>
      {children}
    </ShoppingCartContext.Provider>
  );
};

export default ShoppingCartProvider;
