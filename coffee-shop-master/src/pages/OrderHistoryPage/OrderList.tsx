import { useEffect, useState } from "react";
import PageLoading from "@/components/shared/PageLoading";
import { classNames } from "@/utils/helper";
import OrderCard from "./OrderCard";
import EmptyOrder from "./EmptyOrder";
import { DeliveryOrder } from "@/types";

export default function OrderList() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  // ✅ Lấy token đúng cách từ coffee-shop-auth-user
const getToken = () => {
  const storedUser = localStorage.getItem("coffee-shop-auth-user");
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser).token;
  } catch {
    return null;
  }
};

const token = getToken();


  // ✅ Gọi API lấy danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/user/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Lỗi khi tải danh sách đơn hàng");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("❌ Không thể tải danh sách đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Hủy đơn hàng (an toàn kiểu dữ liệu)
  const handleCancelOrder = async (id: string | number) => {
    const orderId = Number(id); // ép kiểu an toàn
    const confirmCancel = window.confirm("Bạn có chắc muốn hủy đơn hàng này không?");
    if (!confirmCancel) return;

    try {
      setCancelingId(orderId);
      const res = await fetch(`http://localhost:8080/api/user/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || "Đã hủy đơn hàng thành công!");
        await fetchOrders(); // Cập nhật lại danh sách
      } else {
        alert(result.error || "Không thể hủy đơn hàng!");
      }
    } catch (err) {
      console.error("❌ Lỗi khi hủy đơn:", err);
      alert("Đã xảy ra lỗi khi hủy đơn hàng!");
    } finally {
      setCancelingId(null);
    }
  };

  // 🟢 Gọi khi component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const orderCount = orders.length;

  return (
    <>
      {!loading && (
        <div className="w-full">
          {orderCount > 0 ? (
            <ul>
              {orders.map((order, index) => (
                <li
                  key={order.id}
                  className={classNames(
                    "py-3 px-2 border rounded-lg mb-3 bg-white shadow-sm hover:shadow-md transition-all",
                    index !== orderCount - 1 ? "border-primary-100" : ""
                  )}
                >
                  <OrderCard order={order} />

                  {/* ⚙️ Nút hành động */}
                  <div className="flex justify-end mt-2">
                    {order.status?.toLowerCase() === "pending" ||
                    order.status?.toLowerCase() === "in progress" ? (
                      <button
                        disabled={cancelingId === Number(order.id)}
                        onClick={() => handleCancelOrder(order.id)}
                        className={`px-3 py-1 text-sm rounded-md font-medium text-white transition-all ${
                          cancelingId === Number(order.id)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {cancelingId === Number(order.id)
                          ? "Đang hủy..."
                          : "Hủy đơn hàng"}
                      </button>
                    ) : (
                      <span
                        className={classNames(
                          "text-xs font-medium px-2 py-1 rounded",
                          order.status?.toLowerCase() === "cancelled"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-green-100 text-green-600"
                        )}
                      >
                        {order.status === "Cancelled"
                          ? "Đã hủy"
                          : order.status === "Delivered"
                          ? "Đã giao"
                          : order.status}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyOrder />
          )}
        </div>
      )}
      <PageLoading show={loading} />
    </>
  );
}
