package com.example.baochung_st22a.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.baochung_st22a.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {

    // ✅ Kiểm tra xem danh mục có tồn tại theo tên hay chưa
    Boolean existsByName(String name);

    // ✅ Nếu chỉ có 2 thuộc tính (id, name), thì KHÔNG cần các phương thức khác
    // Có thể thêm nếu cần lấy tất cả danh mục theo thứ tự:
    List<Category> findAllByOrderByIdAsc();
}
