package com.example.baochung_st22a.controller;

import com.example.baochung_st22a.model.Reservation;
import com.example.baochung_st22a.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin/reservations")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AdminReservationController {

    @Autowired
    private ReservationService reservationService;

    // 🔹 Lấy tất cả đặt bàn (chỉ Admin)
    @GetMapping
    public ResponseEntity<?> getAllReservations() {
        List<Reservation> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(Map.of("reservations", reservations));
    }

    // 🔹 Lấy chi tiết đặt bàn theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getReservationDetail(@PathVariable Integer id) {
        Reservation reservation = reservationService.getReservationById(id);
        if (reservation == null)
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy thông tin đặt bàn"));
        return ResponseEntity.ok(reservation);
    }

    // 🔹 Hoàn tất (sau thanh toán)
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeReservation(@PathVariable Integer id) {
        boolean completed = reservationService.completeReservation(id);
        if (completed)
            return ResponseEntity.ok(Map.of("message", "Bàn đã được thanh toán, sẵn sàng phục vụ khách mới."));
        return ResponseEntity.badRequest().body(Map.of("error", "Không thể hoàn tất bàn."));
    }
}
