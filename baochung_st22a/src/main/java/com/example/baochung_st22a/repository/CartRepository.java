package com.example.baochung_st22a.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.baochung_st22a.model.Cart;

public interface CartRepository extends JpaRepository<Cart, Integer> {

    // ✅ Giỏ hàng theo user + product + size (để không trùng)
    Cart findByProductIdAndUserIdAndSize(Integer productId, Integer userId, String size);

    Integer countByUserId(Integer userId);

    List<Cart> findByUserId(Integer userId);
}
