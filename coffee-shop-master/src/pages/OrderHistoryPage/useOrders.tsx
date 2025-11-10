import { useEffect, useState } from "react";
import { DeliveryOrder } from "@/types";

export default function useOrders() {
  const [data, setData] = useState<DeliveryOrder[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const tokenData = localStorage.getItem("coffee-shop-auth-user");
        const token = tokenData ? JSON.parse(tokenData).token : null;

        const res = await fetch("${import.meta.env.VITE_API_BASE}/api/user/orders", {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include", // nếu backend dùng allowCredentials=true
        });

        if (!res.ok) throw new Error("Không thể tải đơn hàng");
        const result = await res.json();
        setData(result || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải đơn hàng:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { data, isLoading };
}
