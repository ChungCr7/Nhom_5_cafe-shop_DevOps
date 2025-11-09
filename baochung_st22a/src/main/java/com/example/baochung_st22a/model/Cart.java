package com.example.baochung_st22a.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // 🔹 Người dùng
    @ManyToOne
    private UserDtls user;

    // 🔹 Sản phẩm
    @ManyToOne
    private Product product;

    // 🔹 Số lượng mua
    private Integer quantity;

    // 🔹 Size (small / medium / large)
    @Column(length = 20)
    private String size;

    // 🔹 Tổng giá cho sản phẩm này (theo size + số lượng)
    @Transient
    private Double totalPrice;

    // 🔹 Tổng tiền toàn đơn (khi cần)
    @Transient
    private Double totalOrderPrice;

    // ✅ Tự tính tổng giá cho sản phẩm
    public Double getTotalPrice() {
        if (product == null) return 0.0;
        Double price = product.getPriceBySize(size);
        return (price != null ? price : 0.0) * (quantity != null ? quantity : 1);
    }
    // ✅ Setter dùng khi muốn override (ít khi dùng)
    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    // ✅ Getters/Setters mặc định vẫn để Lombok xử lý

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public UserDtls getUser() {
        return user;
    }

    public void setUser(UserDtls user) {
        this.user = user;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Double getTotalOrderPrice() {
        return totalOrderPrice;
    }

    public void setTotalOrderPrice(Double totalOrderPrice) {
        this.totalOrderPrice = totalOrderPrice;
    }
}
