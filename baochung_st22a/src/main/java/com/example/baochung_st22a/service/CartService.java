package com.example.baochung_st22a.service;

import java.util.List;
import com.example.baochung_st22a.model.Cart;

public interface CartService {

    Cart saveCart(Integer productId, Integer userId, String size);

    List<Cart> getCartsByUser(Integer userId);

    Integer getCountCart(Integer userId);

    void updateQuantity(String action, Integer cartId);
	void deleteCartItem(Integer cartId);
	void clearCartByUser(Integer userId);

}
