import { priceWithSign } from "@/utils/helper";
import { Link } from "react-router-dom";

// ✅ Khai báo đúng kiểu dữ liệu cho sản phẩm trong đơn hàng
interface ProductInfo {
  id?: number;
  title?: string;
  image?: string;
  category?: string;
}

interface OrderCardProps {
  order: {
    id: number | string;
    orderId: string;
    orderDate: string;
    status: string;
    quantity: number;
    size?: string;
    totalPrice: number;
    product?: ProductInfo;
  };
}

export default function OrderCard({ order }: OrderCardProps) {
  const product = order.product || {};

  // ✅ Xử lý ảnh: loại bỏ dấu "/" thừa và nối domain đúng chuẩn
  const imageUrl = product.image
    ? `http://localhost:8080/${product.image.replace(/^\/+/, "")}`
    : "/images/no-image.png";

  return (
    <Link
      to={`/orders/${order.id}`}
      className="w-full flex gap-2 bg-white hover:bg-primary-50 p-2 rounded-lg transition-all"
    >
      {/* 🖼️ Ảnh sản phẩm */}
      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={imageUrl}
          alt={product.title || "Sản phẩm"}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/no-image.png";
          }}
        />
      </div>

      {/* 🧾 Thông tin đơn hàng */}
      <div className="flex flex-col justify-between w-full">
        <div className="flex justify-between items-center">
          <h6 className="text-gray-800 font-semibold">{`#${order.orderId}`}</h6>
          <p className="text-primary text-sm font-bold">
            {priceWithSign(order.totalPrice)}
          </p>
        </div>

        <p className="text-gray-500 text-xs">
          Ngày đặt: {order.orderDate} — {order.status}
        </p>

        <p className="text-gray-600 text-sm line-clamp-2">
          {order.quantity}× {product.title || "Sản phẩm"} ({order.size})
        </p>
      </div>
    </Link>
  );
}
