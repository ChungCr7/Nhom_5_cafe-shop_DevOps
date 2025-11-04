// ======================= ĐỊNH NGHĨA CHUNG =======================
export interface LatLng {
  lat: number;
  lng: number;
}

export interface UserAddress {
  fullAddress: string;
  coordinates: LatLng;
}

// ======================= NGƯỜI DÙNG =======================
export interface AuthUser {
  id?: string | number;
  name: string;
  email: string;

  // ✅ Đổi từ image → profileImage để khớp backend (UserDtls.java)
  profileImage?: string;

  role?: string;
  mobileNumber?: string; // Số điện thoại
  address?: string;      // Địa chỉ
  city?: string;         // Thành phố / Quận
  state?: string;        // Tỉnh / Thành phố
  pincode?: string;      // Mã bưu điện
}

export interface UserWithAddress extends AuthUser {
  addressDetail?: UserAddress; // Chi tiết có tọa độ
}

// ======================= ENUM =======================
export enum CoffeeType {
  Hot = "hot",
  Iced = "iced",
}

export enum CoffeeSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export enum DeliOption {
  DELIVER = "delivery",
  PICK_UP = "pick-up",
}

export enum PaymentMethod {
  CASH = "cash",
  MOMO = "momo",
  ZALO_PAY = "zalo-pay",
  BANK = "bank-transfer",
}

// ======================= SẢN PHẨM (Đồng bộ backend Product.java) =======================
export interface CoffeeProduct {
  id: number;
  title: string;            // ✅ Tên sản phẩm
  description?: string;     // ✅ Mô tả chi tiết
  category?: string;        // ✅ Danh mục: "Hot Drink", "Cold Drink"...
  image?: string;           // ✅ Link ảnh
  active?: boolean;         // ✅ Còn bán không
  priceSmall?: number;      // ✅ Giá size nhỏ
  priceMedium?: number;     // ✅ Giá size vừa
  priceLarge?: number;      // ✅ Giá size lớn
  discount?: number;        // ✅ % giảm giá
  discountPriceSmall?: number;
  discountPriceMedium?: number;
  discountPriceLarge?: number;
  stock?: number;           // ✅ Tồn kho
  type?: CoffeeType;        // ✅ Hot / Iced

  // ⚙️ Giữ lại field cũ để tránh lỗi UI
  displayName?: string;
  price?: number;
}

// ======================= GIỎ HÀNG (Đồng bộ Cart.java) =======================
export interface CartItem {
  id: number;                 // 🆔 ID trong bảng Cart
  product: CoffeeProduct;     // 🧾 Sản phẩm
  quantity: number;           // 🔢 Số lượng
  size: string;               // 🧩 small | medium | large
  totalPrice: number;         // 💰 Tổng giá (1 sản phẩm × số lượng)
  totalOrderPrice?: number;   // 💵 Tổng toàn bộ đơn hàng (nếu có)
}

// ======================= KHÁCH HÀNG & ĐƠN HÀNG =======================
export interface Customer {
  id: string | number;
  name: string;
  phone?: string;       // ✅ Số điện thoại
  address?: string;     // ✅ Địa chỉ giao hàng
  coordinates?: LatLng;
}

export interface OrderItem {
  productId: string | number;
  productName: string;
  quantity: number;
  price: number;
}

// ======================= ĐƠN HÀNG (Đồng bộ ProductOrder.java) =======================
export interface DeliveryOrder {
  id: string | number;
  orderId: string;            // ✅ Mã đơn hàng (ORD-XXXXXX)
  orderDate: string;          // ✅ Ngày đặt
  status: string;             // ✅ Trạng thái: "In Progress", "Delivered", ...
  quantity: number;           // ✅ Số lượng
  size: string;               // ✅ Kích thước (Small, Medium, Large)
  priceBySize: number;        // ✅ Giá theo size
  totalPrice: number;         // ✅ Tổng tiền của đơn
  paymentType: string;        // ✅ Kiểu thanh toán (Cash, Momo,...)

  // Liên kết với sản phẩm
  product?: {
    title: string;
    category?: string;
    image?: string;
  };

  // Địa chỉ giao hàng
  orderAddress?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNo?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  // Cũ từ UI (tùy chọn)
  customer?: Customer;
  items?: OrderItem[];
  deliOption?: DeliOption;
  paymentMethod?: PaymentMethod;
  totalPayment?: number;
  date?: string;
  image?: string;
}

// ======================= ICON =======================
export type HeroIcon = React.ComponentType<
  React.PropsWithoutRef<React.ComponentProps<"svg">> & {
    title?: string | undefined;
    titleId?: string | undefined;
  }
>;
