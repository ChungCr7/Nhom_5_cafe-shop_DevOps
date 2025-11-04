package com.example.baochung_st22a.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "product_orders")
public class ProductOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Mã đơn hàng (VD: ORD-20251022-0001)
    private String orderId;

    private LocalDate orderDate;

    // Sản phẩm được mua
    @ManyToOne
    private Product product;

    // ✅ Size mà khách chọn (small, medium, large)
    @Column(length = 10)
    private String size;

    // ✅ Giá theo size tại thời điểm đặt
    private Double priceBySize;

    // ✅ Số lượng sản phẩm đặt
    private Integer quantity;

    // Tổng tiền của sản phẩm này
    private Double totalPrice;

    // Người đặt
    @ManyToOne
    private UserDtls user;

    // Trạng thái đơn hàng
    private String status;

    // Hình thức thanh toán (COD, Momo, v.v.)
    private String paymentType;

    // Địa chỉ giao hàng
    @OneToOne(cascade = CascadeType.ALL)
    private OrderAddress orderAddress;
    // ✅ Phí ship (VNĐ)
    private Double shippingFee = 0.0;

    // 🧮 Tính tổng tiền bao gồm phí ship
    public void calculateTotalPrice() {
        if (priceBySize != null && quantity != null) {
            double subtotal = priceBySize * quantity;
            double shipping = (shippingFee != null) ? shippingFee : 0.0;
            this.totalPrice = subtotal + shipping;
        }
    }


    // Getter & Setter thủ công
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public Double getPriceBySize() { return priceBySize; }
    public void setPriceBySize(Double priceBySize) { this.priceBySize = priceBySize; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public UserDtls getUser() { return user; }
    public void setUser(UserDtls user) { this.user = user; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentType() { return paymentType; }
    public void setPaymentType(String paymentType) { this.paymentType = paymentType; }

    public OrderAddress getOrderAddress() { return orderAddress; }
    public void setOrderAddress(OrderAddress orderAddress) { this.orderAddress = orderAddress; }

    // 🔹 Hàm hỗ trợ cho CommonUtil
    public Double getPrice() {
        return this.priceBySize;
    }

    public Double getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(Double shippingFee) {
        this.shippingFee = shippingFee;
    }
}
