package com.example.baochung_st22a.service;

import java.util.List;
import org.springframework.data.domain.Page;
import com.example.baochung_st22a.model.Category;

public interface CategoryService {

    // ✅ Thêm hoặc cập nhật danh mục
    Category saveCategory(Category category);

    // ✅ Kiểm tra xem danh mục đã tồn tại theo tên chưa
    Boolean existCategory(String name);

    // ✅ Lấy tất cả danh mục
    List<Category> getAllCategory();

    // ✅ Xóa danh mục theo ID
    Boolean deleteCategory(int id);

    // ✅ Lấy chi tiết danh mục theo ID
    Category getCategoryById(int id);

    // ✅ Lấy danh mục phân trang
    Page<Category> getAllCategorPagination(Integer pageNo, Integer pageSize);
}
