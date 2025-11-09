package com.example.baochung_st22a.repository;

import com.example.baochung_st22a.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {

    // 🔹 Lấy danh sách đặt bàn theo người dùng
    List<Reservation> findByUserId(Integer userId);

    // 🔹 Lấy danh sách đặt bàn theo bàn và trạng thái (BOOKED / COMPLETED / CANCELED)
    List<Reservation> findByTableIdAndStatus(Integer tableId, String status);

    // 🔹 Xóa đặt bàn khi xóa bàn
    void deleteByTableId(Integer tableId);

    // 🔹 Cập nhật trạng thái tất cả Reservation của một bàn nhất định
    @Transactional
    @Modifying
    @Query("UPDATE Reservation r SET r.status = :status WHERE r.table.id = :tableId AND r.status = 'BOOKED'")
    void updateStatusByTableId(@Param("tableId") Integer tableId, @Param("status") String status);
}
