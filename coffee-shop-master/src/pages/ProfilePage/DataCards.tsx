import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import DataCard from './DataCard';
// src/pages/profile/DataCards.tsx
import { useEffect, useState } from "react";
import { getOrderCount } from "@/service/order";

export default function DataCards() {
  const [orderCount, setOrderCount] = useState<number>(0);

  // ✅ Gọi API hoặc service để lấy số lượng đơn hàng người dùng
  useEffect(() => {
    async function fetchOrderCount() {
      try {
        const count = await getOrderCount();
        setOrderCount(count);
      } catch (err) {
        console.error("❌ Lỗi khi tải số lượng đơn hàng:", err);
      }
    }

    fetchOrderCount();
  }, []);

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mt-8">
      {/* 🛍️ Thẻ thống kê đơn hàng */}
      <DataCard label="Order Count" value={orderCount} Icon={ShoppingBagIcon} />

      {/* ❤️ Thẻ yêu thích (ví dụ tĩnh, sau này có thể thay bằng API getFavorites) */}
      <DataCard label="Favorite Items" value={1024} Icon={HeartIcon} />
    </div>
  );
}
