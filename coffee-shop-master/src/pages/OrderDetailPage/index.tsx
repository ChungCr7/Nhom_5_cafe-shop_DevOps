import { useParams, useNavigate } from "react-router-dom";
import Title1 from "@/components/shared/typo/Title1";
import PageLoading from "@/components/shared/PageLoading";
import { priceWithSign } from "@/utils/helper";
import { useEffect, useState } from "react";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Lấy token theo cấu trúc mới của AuthContext
  const getToken = () => {
    const stored = localStorage.getItem("coffee-shop-auth-user");
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return parsed.token || parsed.user?.token || null;
    } catch (err) {
      console.error("❌ Lỗi khi đọc token:", err);
      return null;
    }
  };
  const token = getToken();

  useEffect(() => {
    if (!id || !token) return;
    const fetchOrderDetail = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/user/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Không thể tải chi tiết đơn hàng");
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("❌ Lỗi khi tải đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, token]);

  if (loading) return <PageLoading show={true} />;
  if (!order)
    return <p className="text-center text-gray-500 mt-10">Không tìm thấy đơn hàng.</p>;

  const {
    product,
    orderAddress,
    quantity,
    size,
    totalPrice,
    status,
    orderDate,
    paymentType,
  } = order;

  const imageUrl =
    product?.image?.startsWith("http")
      ? product.image
      : `http://localhost:8080${product?.image || "/images/no-image.png"}`;

  return (
    <div className="p-4 placeholder-neutral-800">
      <Title1>Chi tiết đơn hàng #{id ?? ""}</Title1>

      <div className="w-full max-w-lg bg-white p-4 mt-4 border border-primary-200 rounded-2xl mx-auto shadow-sm">
        <div className="flex gap-3">
          <img
            src={imageUrl as string}
            alt={(product?.title ?? "Sản phẩm") as string}
            className="w-24 h-24 object-cover rounded-lg border"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/no-image.png";
            }}
          />
          <div>
            <h3 className="text-lg font-semibold">{product?.title ?? "Sản phẩm"}</h3>
            <p className="text-gray-600">{product?.category ?? "Không có danh mục"}</p>
            {size && <p className="text-sm text-gray-500">Size: {size}</p>}
            {quantity && <p className="text-sm text-gray-500">Số lượng: {quantity}</p>}
            {totalPrice && (
              <p className="text-lg font-bold text-primary mt-1">
                Tổng tiền: {priceWithSign(totalPrice)}
              </p>
            )}
          </div>
        </div>

        <hr className="my-4" />

        {orderAddress && (
          <div>
            <h4 className="font-semibold mb-2">Thông tin giao hàng</h4>
            <p>
              {orderAddress.firstName} {orderAddress.lastName}
            </p>
            <p>SĐT: {orderAddress.mobileNo}</p>
            <p>Địa chỉ: {orderAddress.address}</p>
            <p>Tỉnh/TP: {orderAddress.state}</p>
            <p>Mã bưu chính: {orderAddress.pincode}</p>
          </div>
        )}

        <hr className="my-4" />

        <div>
          <h4 className="font-semibold mb-2">Chi tiết đơn hàng</h4>
          {orderDate && <p>Ngày đặt: {orderDate}</p>}
          {paymentType && <p>Phương thức thanh toán: {paymentType}</p>}
          {status && (
            <p>
              Trạng thái:{" "}
              <span
                className={`px-2 py-1 rounded text-sm font-medium ${
                  status === "Cancelled"
                    ? "bg-gray-200 text-gray-600"
                    : status === "Delivered"
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {status}
              </span>
            </p>
          )}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/orders")}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-all"
          >
            ← Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}
