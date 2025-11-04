package com.example.baochung_st22a.dto;

import java.time.LocalDateTime;

public class ReservationResponse {
    private Integer id;
    private String tableName;
    private String status;
    private LocalDateTime timeStart;
    private Double totalPrice;

    public ReservationResponse(Integer id, String tableName, String status, LocalDateTime timeStart, Double totalPrice) {
        this.id = id;
        this.tableName = tableName;
        this.status = status;
        this.timeStart = timeStart;
        this.totalPrice = totalPrice;
    }

    // ✅ Getter
    public Integer getId() {
        return id;
    }

    public String getTableName() {
        return tableName;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getTimeStart() {
        return timeStart;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }
}
