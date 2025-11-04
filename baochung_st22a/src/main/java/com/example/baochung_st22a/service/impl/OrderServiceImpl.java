package com.example.baochung_st22a.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.baochung_st22a.model.Cart;
import com.example.baochung_st22a.model.OrderAddress;
import com.example.baochung_st22a.model.OrderRequest;
import com.example.baochung_st22a.model.Product;
import com.example.baochung_st22a.model.ProductOrder;
import com.example.baochung_st22a.model.UserDtls;
import com.example.baochung_st22a.repository.CartRepository;
import com.example.baochung_st22a.repository.ProductOrderRepository;
import com.example.baochung_st22a.repository.ProductRepository;
import com.example.baochung_st22a.repository.UserRepository;
import com.example.baochung_st22a.service.OrderService;
import com.example.baochung_st22a.util.CommonUtil;
import com.example.baochung_st22a.util.OrderStatus;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired private ProductOrderRepository orderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CommonUtil commonUtil;

    // 💰 Biến cộng dồn doanh thu trong ngày (RAM)
    private double todayExtraRevenue = 0.0;

    // 💰 Lưu đơn hàng khi khách đặt (chưa cộng doanh thu)
    @Override
    @Transactional
    public void saveOrder(Integer userId, OrderRequest orderRequest) throws Exception {
        List<Cart> carts = cartRepository.findByUserId(userId);
        if (carts.isEmpty()) throw new Exception("Giỏ hàng trống, không thể đặt hàng!");

        for (Cart cart : carts) {
            Product product = cart.getProduct();
            UserDtls user = cart.getUser();

            String size = (orderRequest.getSize() != null) ? orderRequest.getSize() : "medium";
            Double price = product.getPriceBySize(size);

            ProductOrder order = new ProductOrder();
            order.setOrderId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            order.setOrderDate(LocalDate.now());
            order.setProduct(product);
            order.setUser(user);
            order.setQuantity(cart.getQuantity());
            order.setSize(size);
            order.setPriceBySize(price);
            order.setShippingFee(15000.0); // ✅ Phí ship cố định
            order.calculateTotalPrice();
            order.setStatus(OrderStatus.PENDING.getName());
            order.setPaymentType(orderRequest.getPaymentType());

            // ✅ Địa chỉ giao hàng
            OrderAddress address = new OrderAddress();
            address.setFirstName(orderRequest.getFirstName());
            address.setLastName(orderRequest.getLastName());
            address.setEmail(orderRequest.getEmail());
            address.setMobileNo(orderRequest.getMobileNo());
            address.setAddress(orderRequest.getAddress());
            address.setCity(orderRequest.getCity());
            address.setState(orderRequest.getState());
            address.setPincode(orderRequest.getPincode());
            order.setOrderAddress(address);

            // ✅ Trừ tồn kho
            if (product.getStock() != null && product.getStock() >= cart.getQuantity()) {
                product.setStock(product.getStock() - cart.getQuantity());
                productRepository.save(product);
            } else {
                throw new Exception("Sản phẩm '" + product.getTitle() + "' không đủ số lượng tồn kho!");
            }

            ProductOrder savedOrder = orderRepository.save(order);
            commonUtil.sendMailForProductOrder(savedOrder, "success");

            // ❌ Không cộng doanh thu ở đây nữa — chỉ cộng khi đơn hàng được giao thành công
            // addRevenueToday(order.getTotalPrice());
        }

        cartRepository.deleteAll(carts);
    }

    // 📦 Lấy danh sách đơn hàng theo người dùng
    @Override
    public List<ProductOrder> getOrdersByUser(Integer userId) {
        return orderRepository.findByUserId(userId);
    }

    // ⚙️ Cập nhật trạng thái đơn hàng (Admin)
    @Override
    @Transactional
    public ProductOrder updateOrderStatus(Integer id, String status) {
        Optional<ProductOrder> optional = orderRepository.findById(id);
        if (optional.isEmpty()) return null;

        ProductOrder order = optional.get();

        if ("Cancelled".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Đơn hàng đã hủy, không thể cập nhật");
        }

        order.setStatus(status);

        // ✅ Chỉ cộng doanh thu khi đơn hàng giao thành công
        if ("Delivered".equalsIgnoreCase(status) || "Hoàn tất".equalsIgnoreCase(status)) {
            addRevenueToday(order.getTotalPrice());
            System.out.println("💰 Đơn hàng #" + order.getId() + " đã giao → cộng doanh thu: " + order.getTotalPrice());
        }

        return orderRepository.save(order);
    }

    // 📋 Lấy toàn bộ đơn hàng (Admin)
    @Override
    public List<ProductOrder> getAllOrders() {
        return orderRepository.findAll();
    }

    // 📄 Lấy danh sách đơn hàng có phân trang
    @Override
    public Page<ProductOrder> getAllOrdersPagination(Integer pageNo, Integer pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        return orderRepository.findAll(pageable);
    }

    // 🔍 Tìm đơn theo mã
    @Override
    public ProductOrder getOrdersByOrderId(String orderId) {
        return orderRepository.findByOrderId(orderId);
    }

    // 📊 Tổng số đơn hàng
    @Override
    public long countOrders() {
        return orderRepository.count();
    }

    // 📊 Tính doanh thu hôm nay (gồm cả bàn cà phê)
    @Override
    public double calculateTodayRevenue() {
        LocalDate today = LocalDate.now();
        List<ProductOrder> orders = orderRepository.findAll();

        double dbRevenue = orders.stream()
                .filter(o -> o.getOrderDate() != null && o.getOrderDate().equals(today))
                .filter(o -> "Delivered".equalsIgnoreCase(o.getStatus()) || "Hoàn tất".equalsIgnoreCase(o.getStatus()))
                .mapToDouble(o -> {
                    double productTotal = (o.getPriceBySize() != null && o.getQuantity() != null)
                            ? o.getPriceBySize() * o.getQuantity()
                            : 0.0;
                    double ship = (o.getShippingFee() != null) ? o.getShippingFee() : 0.0;
                    return productTotal + ship;
                })
                .sum();

        return dbRevenue + todayExtraRevenue;
    }

    // 📅 Tính doanh thu theo ngày cụ thể
    @Override
    public double calculateRevenueByDate(LocalDate date) {
        List<ProductOrder> orders = orderRepository.findAll();
        return orders.stream()
                .filter(o -> o.getOrderDate() != null && o.getOrderDate().equals(date))
                .filter(o -> "Delivered".equalsIgnoreCase(o.getStatus()) || "Hoàn tất".equalsIgnoreCase(o.getStatus()))
                .mapToDouble(o -> o.getTotalPrice() != null ? o.getTotalPrice() : 0.0)
                .sum();
    }

    // 💵 Cộng doanh thu tạm (RAM)
    @Override
    public void addRevenueToday(Double amount) {
        todayExtraRevenue += (amount != null ? amount : 0.0);
    }

    // ❌ Hủy đơn hàng (User)
    @Override
    @Transactional
    public boolean cancelOrder(Integer id) {
        Optional<ProductOrder> optional = orderRepository.findById(id);
        if (optional.isEmpty()) return false;

        ProductOrder order = optional.get();

        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng đang chờ xử lý!");
        }

        order.setStatus("Cancelled");
        orderRepository.save(order);

        try {
            commonUtil.sendMailForProductOrder(order, "cancelled");
        } catch (Exception e) {
            e.printStackTrace();
        }

        return true;
    }

    // 🔍 Lấy đơn hàng theo ID
    @Override
    public ProductOrder getOrderById(Integer id) {
        return orderRepository.findById(id).orElse(null);
    }

    // 🗑 Xóa đơn hàng (Admin)
    @Override
    @Transactional
    public boolean deleteOrder(Integer id) {
        if (!orderRepository.existsById(id)) return false;
        orderRepository.deleteById(id);
        return true;
    }

    // 📈 Doanh thu theo tháng (biểu đồ)
    @Override
    public double getMonthlyRevenue(int month) {
        try {
            List<ProductOrder> orders = orderRepository.findAll();
            return orders.stream()
                    .filter(o -> o.getOrderDate() != null
                            && o.getOrderDate().getMonthValue() == month
                            && (
                                "Delivered".equalsIgnoreCase(o.getStatus()) ||
                                "Hoàn tất".equalsIgnoreCase(o.getStatus())
                            )
                    )
                    .mapToDouble(o -> o.getTotalPrice() != null ? o.getTotalPrice() : 0.0)
                    .sum();
        } catch (Exception e) {
            e.printStackTrace();
            return 0.0;
        }
    }

    // 💾 Lưu doanh thu bàn cafe vào DB (để không mất khi restart)
    @Override
    @Transactional
    public void saveTableRevenue(ProductOrder tableOrder) {
        if (tableOrder.getOrderDate() == null) {
            tableOrder.setOrderDate(LocalDate.now());
        }
        tableOrder.setStatus("Delivered");
        orderRepository.save(tableOrder);
        addRevenueToday(tableOrder.getTotalPrice());
    }
}
