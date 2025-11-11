import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BaseModal from "@/components/shared/modal/BaseModal";
import PageLoading from "@/components/shared/PageLoading";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { AuthUser, Customer, OrderItem } from "@/types";
import { fakeTimer, priceWithSign } from "@/utils/helper";

interface CheckoutModalProps {
  show: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ show, onClose }: CheckoutModalProps) {
  const navigate = useNavigate();

  // ✅ Lấy user từ AuthContext
  const { user, refreshUser } = useAuth() as {
    user: AuthUser;
    refreshUser: () => Promise<void>;
  };

  const { items: cartItems, totalPayment, clearCart } = useShoppingCart();
  const { closeCartModal } = useModal();
  const [loading, setLoading] = useState(false);

  // ✅ Khi modal mở, luôn tải lại thông tin user mới nhất
  useEffect(() => {
    if (show) refreshUser();
  }, [show]);

  // ✅ Chuẩn bị dữ liệu đơn hàng gửi lên backend
  const getOrderData = () => {
    const customer: Customer = {
      id: user?.id || 0,
      name: user?.name || "Khách hàng",
      phone: user?.mobileNumber || "",
      address: user?.address || "",
    };

    const orderItems: OrderItem[] = cartItems.map((ci) => ({
      productId: ci.product.id,
      productName: ci.product.title || "Sản phẩm",
      quantity: ci.quantity,
      price:
        (ci.product.priceMedium ??
          ci.product.priceSmall ??
          ci.product.priceLarge ??
          ci.product.price ??
          0) * ci.quantity,
    }));

    return {
      customer,
      items: orderItems,
      paymentMethod: "cash",
      totalPayment,
    };
  };

  // ✅ Khi nhấn nút "Thanh toán"
  const handleOrderClick = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập trước khi đặt hàng!");
      return;
    }

    setLoading(true);

    try {
      // 🧾 Chuẩn bị dữ liệu gửi sang backend
      const orderData = {
        firstName: user.name.split(" ")[0] || "Khách",
        lastName: user.name.split(" ").slice(1).join(" ") || "",
        email: user.email,
        mobileNo: user.mobileNumber,
        address: user.address,
        city: user.city || "Quảng Bình",
        state: user.state || "Việt Nam",
        pincode: user.pincode || "51000",
        paymentType: "cash",
      };

      // 🪪 Lấy token đăng nhập từ localStorage
      const storedUser = localStorage.getItem("coffee-shop-auth-user");
      const token = storedUser ? JSON.parse(storedUser).token : null;

      if (!token) {
        alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
        navigate("/login");
        return;
      }

      // 🚀 Gửi request sang Spring Boot API
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/user/save-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await res.json();
      console.log("✅ Kết quả lưu đơn hàng:", result);

      if (res.ok) {
        alert("Đặt hàng thành công!");
        clearCart();
        onClose();
        closeCartModal();
        navigate("/orders");
      } else {
        alert(result.error || "Không thể đặt hàng, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi đặt hàng:", error);
      alert("Đã xảy ra lỗi khi gửi đơn hàng!");
    }

    setLoading(false);
  };

  // ✅ Kiểm tra thông tin bắt buộc
  const missingInfo = !user?.mobileNumber || !user?.address;

  return (
    <BaseModal show={show} onClose={onClose} fullScreen>
      <div className="flex flex-col h-full justify-between p-4">
        {/* 🔝 Tiêu đề */}
        <h2 className="text-center text-2xl font-bold text-primary mb-4">
          Xác nhận đơn hàng
        </h2>

        {/* 🧍 Thông tin khách hàng */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm">
          <p className="font-semibold text-primary">
            👤 Khách hàng: {user?.name || "Chưa đăng nhập"}
          </p>
          <p className="text-gray-600">📧 Email: {user?.email || "Không có"}</p>
          <p className="text-gray-600">
            📞 SĐT: {user?.mobileNumber || "Chưa có số điện thoại"}
          </p>
          <p className="text-gray-600">
            🏠 Địa chỉ: {user?.address || "Chưa có địa chỉ giao hàng"}
          </p>

          {missingInfo && (
            <p className="text-red-500 text-sm mt-2">
              ⚠️ Vui lòng cập nhật số điện thoại và địa chỉ trước khi đặt hàng.
            </p>
          )}

          <button
            className="text-blue-600 mt-2 underline text-sm"
            onClick={() => navigate("/profile")}
          >
            Cập nhật thông tin
          </button>
        </div>

        {/* 💳 Phương thức thanh toán */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm">
          <p className="font-semibold text-primary mb-2">
            💰 Phương thức thanh toán:
          </p>
          <p className="text-gray-700 font-medium">Tiền mặt khi nhận hàng</p>
        </div>

        {/* 🛒 Chi tiết đơn hàng */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <p className="font-semibold text-primary mb-2">🧾 Chi tiết đơn hàng:</p>
          <ul className="space-y-2 text-gray-700">
            {cartItems.map((item) => (
              <li key={item.product.id}>
                {item.product.title} × {item.quantity} —{" "}
                {priceWithSign(
                  (item.product.priceMedium ?? item.product.price ?? 0) *
                    item.quantity
                )}
              </li>
            ))}
          </ul>
          <hr className="my-2" />
          <p className="text-right font-bold text-lg text-primary">
            Tổng cộng: {priceWithSign(totalPayment)}
          </p>
        </div>

        {/* 🔘 Nút xác nhận */}
        {!missingInfo ? (
          <button
            onClick={handleOrderClick}
            className="w-full mt-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-700 transition-all"
          >
            Thanh toán
          </button>
        ) : (
          <button
            disabled
            className="w-full mt-6 py-3 rounded-lg bg-gray-400 text-white font-semibold cursor-not-allowed"
          >
            Cần cập nhật thông tin trước khi đặt hàng
          </button>
        )}
      </div>

      <PageLoading show={loading} />
    </BaseModal>
  );
}
