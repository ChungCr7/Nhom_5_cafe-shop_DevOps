package com.example.baochung_st22a.controller;

import com.example.baochung_st22a.dto.OrderItemRequest;
import com.example.baochung_st22a.dto.ReservationResponse;
import com.example.baochung_st22a.model.Reservation;
import com.example.baochung_st22a.model.UserDtls;
import com.example.baochung_st22a.service.ReservationService;
import com.example.baochung_st22a.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/reservations")
@CrossOrigin(
        origins = {"http://localhost:5173", "http://127.0.0.1:5173"},
        allowCredentials = "true"
)
public class UserReservationController {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private UserService userService;

    // 🟢 Lấy danh sách đặt bàn của user hiện tại
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<?> getMyReservations(Principal principal) {
        if (principal == null)
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));

        UserDtls user = userService.getUserByEmail(principal.getName());
        if (user == null)
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy người dùng"));

        List<Reservation> reservations = reservationService.getReservationsByUser(user.getId());

        // ✅ Dùng DTO tránh vòng lặp JSON
        List<ReservationResponse> responseList = reservations.stream()
                .map(r -> new ReservationResponse(
                        r.getId(),
                        r.getTable() != null ? r.getTable().getTableName() : "Không rõ",
                        r.getStatus(),
                        r.getTimeStart(),
                        r.getTotalPrice() != null ? r.getTotalPrice() : 0.0
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("reservations", responseList));
    }

    // 🟡 Đặt bàn kèm món ăn
    @PostMapping("/book")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<?> bookTable(
            @RequestParam Integer tableId,
            @RequestBody List<OrderItemRequest> items,
            Principal principal) {

        if (principal == null)
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));

        UserDtls user = userService.getUserByEmail(principal.getName());
        if (user == null)
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy người dùng"));

        if (items == null || items.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Chưa chọn món nào!"));

        Reservation reservation = reservationService.bookTableWithItems(user.getId(), tableId, items);
        if (reservation == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Bàn đã có khách hoặc không tồn tại!"));

        return ResponseEntity.ok(Map.of(
                "message", "Đặt bàn thành công!",
                "reservation", Map.of(
                        "id", reservation.getId(),
                        "status", reservation.getStatus(),
                        "totalPrice", reservation.getTotalPrice(),
                        "tableName", reservation.getTable() != null ? reservation.getTable().getTableName() : "Không rõ"
                )
        ));
    }

    // 🔴 Hủy đặt bàn
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<?> cancelReservation(@PathVariable Integer id, Principal principal) {
        if (principal == null)
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));

        UserDtls user = userService.getUserByEmail(principal.getName());
        if (user == null)
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy người dùng"));

        boolean canceled = reservationService.cancelReservation(id);
        if (canceled)
            return ResponseEntity.ok(Map.of("message", "Hủy bàn thành công!"));

        return ResponseEntity.badRequest().body(Map.of("error", "Không thể hủy bàn!"));
    }
}
