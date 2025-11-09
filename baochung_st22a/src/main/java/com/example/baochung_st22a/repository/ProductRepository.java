package com.example.baochung_st22a.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.baochung_st22a.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    // ✅ Lấy sản phẩm đang active (true)
    List<Product> findByActiveTrue();

    // ✅ Lấy sản phẩm active có phân trang
    Page<Product> findByActiveTrue(Pageable pageable);

    // ✅ Lọc theo danh mục
    List<Product> findByCategory(String category);

    // ✅ Tìm kiếm theo tên hoặc danh mục
    List<Product> findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(String ch, String ch2);

    // ✅ Lọc theo danh mục có phân trang
    Page<Product> findByCategory(Pageable pageable, String category);

    // ✅ Tìm kiếm có phân trang
    Page<Product> findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(String ch, String ch2, Pageable pageable);

    // ✅ Kết hợp điều kiện active + tìm kiếm
    Page<Product> findByActiveTrueAndTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(
            String ch, String ch2, Pageable pageable);
}
