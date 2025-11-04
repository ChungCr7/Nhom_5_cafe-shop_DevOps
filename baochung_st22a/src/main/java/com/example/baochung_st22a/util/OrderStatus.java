package com.example.baochung_st22a.util;

/**
 * Danh sách trạng thái đơn hàng chuẩn hóa dùng cho cả hệ thống.
 * Mỗi trạng thái có ID và tên hiển thị tương ứng.
 */
public enum OrderStatus {

    // 🔹 Khi khách đặt hàng, đơn sẽ ở trạng thái PENDING
    PENDING(0, "Pending"),

    // 🔹 Đơn đang được xử lý (xác nhận, chuẩn bị hàng)
    IN_PROGRESS(1, "In Progress"),

    // 🔹 Đơn đã được xác nhận / tiếp nhận
    ORDER_RECEIVED(2, "Order Received"),

    // 🔹 Sản phẩm đã được đóng gói
    PRODUCT_PACKED(3, "Product Packed"),

    // 🔹 Đơn đang giao
    OUT_FOR_DELIVERY(4, "Out for Delivery"),

    // 🔹 Giao thành công
    DELIVERED(5, "Delivered"),

    // 🔹 Đơn đã bị hủy
    CANCELLED(6, "Cancelled"),

    // 🔹 Thanh toán / hoàn tất (ví dụ thanh toán online thành công)
    SUCCESS(7, "Success");

    // ---------------------------------------------------------------

    private final Integer id;
    private final String name;

    private OrderStatus(Integer id, String name) {
        this.id = id;
        this.name = name;
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}
