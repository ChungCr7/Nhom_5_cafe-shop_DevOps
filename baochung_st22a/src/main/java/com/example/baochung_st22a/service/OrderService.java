package com.example.baochung_st22a.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;

import com.example.baochung_st22a.model.OrderRequest;
import com.example.baochung_st22a.model.ProductOrder;

public interface OrderService {

    // 💰 Đặt hàng (lưu đơn hàng từ userId và thông tin đơn hàng)
    void saveOrder(Integer userId, OrderRequest orderRequest) throws Exception;

    // 📦 Lấy danh sách đơn hàng theo người dùng
    List<ProductOrder> getOrdersByUser(Integer userId);

    // ⚙️ Cập nhật trạng thái đơn hàng (Admin cập nhật)
    ProductOrder updateOrderStatus(Integer id, String status);

    // 📋 Lấy tất cả đơn hàng (dùng cho Admin)
    List<ProductOrder> getAllOrders();

    // 📄 Lấy danh sách đơn hàng có phân trang (dành cho dashboard admin)
    Page<ProductOrder> getAllOrdersPagination(Integer pageNo, Integer pageSize);

    // 🔍 Tìm đơn hàng theo mã OrderId
    ProductOrder getOrdersByOrderId(String orderId);

    // 📊 --- Các hàm phục vụ thống kê dashboard ---
    long countOrders();                           // Tổng số đơn hàng
    double calculateTodayRevenue();               // Doanh thu hôm nay
    double calculateRevenueByDate(LocalDate date); // Doanh thu theo ngày

    // 🧾 --- Tích lũy doanh thu theo thời gian thực ---
    void addRevenueToday(Double amount);          // Cộng doanh thu thủ công (VD: thanh toán bàn)

    // ❌ Hủy đơn hàng (User)
    boolean cancelOrder(Integer id) throws Exception;

    // 🔍 Lấy đơn hàng theo ID
    ProductOrder getOrderById(Integer id);

    // 🗑 Xóa đơn hàng (Admin)
    boolean deleteOrder(Integer id);
    double getMonthlyRevenue(int month);
    void saveTableRevenue(ProductOrder tableOrder);

}
