package com.example.baochung_st22a.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "cafe_tables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CafeTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 100, nullable = false)
    private String tableName; // Tên bàn

    @Column(length = 100)
    private String position; // Vị trí bàn trong quán

    private Integer capacity; // Số người tối đa

    @Column(length = 50)
    private String status = "EMPTY"; // EMPTY / OCCUPIED
    private Double totalAmount = 0.0; // Tổng tiền hiện tại của bàn

    @Column(length = 1000)
    private String note; // Ghi chú món / khách

    private LocalDateTime lastUpdated = LocalDateTime.now();

    // ✅ Liên kết với các món đang phục vụ
    @OneToMany(mappedBy = "table", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnore   // 🔥 Ngăn vòng lặp khi trả JSON (Table → Item → Table → ...)
    private List<TableOrderItem> items;

    // ✅ Nếu có thêm danh sách Reservation liên kết (ví dụ bạn thêm sau này)
    // @OneToMany(mappedBy = "table")
    // @JsonIgnore
    // private List<Reservation> reservations;
private Double tablePrice = 0.0;

public Double getTablePrice() {
    return tablePrice;
}

public void setTablePrice(Double tablePrice) {
    this.tablePrice = tablePrice;
}

    @PreUpdate
    public void preUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public List<TableOrderItem> getItems() {
        return items;
    }

    public void setItems(List<TableOrderItem> items) {
        this.items = items;
    }
}
