package com.example.baochung_st22a.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "table_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TableOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // ✅ Liên kết với bàn
    @ManyToOne
    @JoinColumn(name = "table_id")
    @JsonIgnore  // 🔥 Ngăn vòng lặp Table → Item → Table
    private CafeTable table;

    // ✅ Liên kết với sản phẩm
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private String size; // small / medium / large
    private Integer quantity = 1;
    private Double price; // Giá từng món theo size
    private Double total; // Tổng tiền của món (quantity * price)

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public CafeTable getTable() {
        return table;
    }

    public void setTable(CafeTable table) {
        this.table = table;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }
}
