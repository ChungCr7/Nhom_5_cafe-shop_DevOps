package com.example.baochung_st22a.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import com.example.baochung_st22a.model.Cart;
import com.example.baochung_st22a.model.Product;
import com.example.baochung_st22a.model.UserDtls;
import com.example.baochung_st22a.repository.CartRepository;
import com.example.baochung_st22a.repository.ProductRepository;
import com.example.baochung_st22a.repository.UserRepository;
import com.example.baochung_st22a.service.CartService;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public Cart saveCart(Integer productId, Integer userId, String size) {
        UserDtls user = userRepository.findById(userId).orElse(null);
        Product product = productRepository.findById(productId).orElse(null);

        if (user == null || product == null) {
            return null;
        }

        if (size == null || size.isBlank()) {
            size = "medium"; // ✅ mặc định size Medium
        }

        // ✅ Kiểm tra cart tồn tại theo size
        Cart existingCart = cartRepository.findByProductIdAndUserIdAndSize(productId, userId, size);
        Cart cart;

        double productPrice = product.getPriceBySize(size);

        if (ObjectUtils.isEmpty(existingCart)) {
            cart = new Cart();
            cart.setProduct(product);
            cart.setUser(user);
            cart.setSize(size);
            cart.setQuantity(1);
        } else {
            cart = existingCart;
            cart.setQuantity(cart.getQuantity() + 1);
        }

        // ✅ Tính tổng tiền chính xác
        cart.setTotalPrice(productPrice * cart.getQuantity());
        return cartRepository.save(cart);
    }

    @Override
    public List<Cart> getCartsByUser(Integer userId) {
        List<Cart> carts = cartRepository.findByUserId(userId);
        List<Cart> updatedCarts = new ArrayList<>();

        double totalOrderPrice = 0.0;

        for (Cart c : carts) {
            double totalPrice = c.getTotalPrice();
            totalOrderPrice += totalPrice;
            c.setTotalOrderPrice(totalOrderPrice);
            updatedCarts.add(c);
        }

        return updatedCarts;
    }

    @Override
    public Integer getCountCart(Integer userId) {
        return cartRepository.countByUserId(userId);
    }

    @Override
    public void updateQuantity(String action, Integer cartId) {
        Cart cart = cartRepository.findById(cartId).orElse(null);
        if (cart == null) return;

        Product product = cart.getProduct();
        double price = product.getPriceBySize(cart.getSize());

        int updatedQuantity = cart.getQuantity();

        if ("de".equalsIgnoreCase(action)) {
            updatedQuantity--;
            if (updatedQuantity <= 0) {
                cartRepository.delete(cart);
                return;
            }
        } else {
            updatedQuantity++;
        }

        cart.setQuantity(updatedQuantity);
        cart.setTotalPrice(price * updatedQuantity);
        cartRepository.save(cart);
    }

    // 🗑 Xóa 1 sản phẩm khỏi giỏ
    @Override
    public void deleteCartItem(Integer cartId) {
        cartRepository.deleteById(cartId);
    }

    // 🧹 Xóa toàn bộ giỏ hàng của user
    @Override
    public void clearCartByUser(Integer userId) {
        List<Cart> carts = cartRepository.findByUserId(userId);
        cartRepository.deleteAll(carts);
    }
}
