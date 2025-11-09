package com.example.baochung_st22a.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.baochung_st22a.model.CafeTable;

/**
 * Repository thao tác với bảng "cafe_tables".
 * 
 * Cung cấp các phương thức mặc định (CRUD) và mở rộng thêm:
 *  - findByStatus(String status): Lọc theo trạng thái bàn
 *  - findByTableNameContainingIgnoreCase(String keyword): Tìm bàn theo tên gần đúng
 */
@Repository
public interface TableRepository extends JpaRepository<CafeTable, Integer> {

    // 🔹 Lấy danh sách bàn theo trạng thái (AVAILABLE, OCCUPIED, PAID)
    List<CafeTable> findByStatus(String status);

    // 🔹 Tìm bàn theo tên (phục vụ tìm kiếm nhanh)
    List<CafeTable> findByTableNameContainingIgnoreCase(String keyword);
}
