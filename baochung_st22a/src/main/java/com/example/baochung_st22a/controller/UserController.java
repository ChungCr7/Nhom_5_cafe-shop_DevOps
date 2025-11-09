package com.example.baochung_st22a.controller;

import com.example.baochung_st22a.model.Cart;
import com.example.baochung_st22a.model.Category;
import com.example.baochung_st22a.model.UserDtls;
import com.example.baochung_st22a.model.OrderRequest;
import com.example.baochung_st22a.model.ProductOrder;
import com.example.baochung_st22a.service.CartService;
import com.example.baochung_st22a.service.CategoryService;
import com.example.baochung_st22a.service.OrderService;
import com.example.baochung_st22a.service.UserService;
import com.example.baochung_st22a.util.CommonUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {

    @Autowired private UserService userService;
    @Autowired private CategoryService categoryService;
    @Autowired private CartService cartService;
    @Autowired private OrderService orderService;
    @Autowired private CommonUtil commonUtil;
    @Autowired private PasswordEncoder passwordEncoder;

    // 🟢 Lấy thông tin người dùng hiện tại
    @GetMapping("/me")
    public ResponseEntity<?> getUserDetails(Principal p) {
        if (p == null)
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));

        String email = p.getName();
        UserDtls user = userService.getUserByEmail(email);
        Integer countCart = cartService.getCountCart(user.getId());
        List<Category> categories = categoryService.getAllCategory();

        Map<String, Object> data = new HashMap<>();
        data.put("user", user);
        data.put("countCart", countCart);
        data.put("categories", categories);
        return ResponseEntity.ok(data);
    }

    // 🛒 Thêm sản phẩm vào giỏ hàng
    @PostMapping("/add-cart")
    public ResponseEntity<?> addToCart(
            @RequestParam Integer pid,
            @RequestParam Integer uid,
            @RequestParam(defaultValue = "medium") String size) {

        Cart cart = cartService.saveCart(pid, uid, size);
        if (ObjectUtils.isEmpty(cart))
            return ResponseEntity.badRequest().body(Map.of("error", "Không thể thêm vào giỏ hàng"));

        return ResponseEntity.ok(Map.of("message", "Đã thêm sản phẩm vào giỏ hàng", "cart", cart));
    }

    // 🛒 Lấy danh sách giỏ hàng
    @GetMapping("/cart")
    public ResponseEntity<?> loadCartPage(Principal p) {
        if (p == null)
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));

        UserDtls user = userService.getUserByEmail(p.getName());
        List<Cart> carts = cartService.getCartsByUser(user.getId());
        Double totalOrderPrice = carts.isEmpty() ? 0.0 : carts.get(carts.size() - 1).getTotalOrderPrice();

        return ResponseEntity.ok(Map.of(
                "carts", carts,
                "totalOrderPrice", totalOrderPrice
        ));
    }

    // 🛒 Cập nhật số lượng sản phẩm trong giỏ hàng
    @PutMapping("/cart/update")
    public ResponseEntity<?> updateCartQuantity(@RequestParam String sy, @RequestParam Integer cid) {
        cartService.updateQuantity(sy, cid);
        return ResponseEntity.ok(Map.of("message", "Đã cập nhật số lượng"));
    }

    // 🗑 Xóa 1 sản phẩm khỏi giỏ hàng
    @DeleteMapping("/cart/delete")
    public ResponseEntity<?> deleteCartItem(@RequestParam Integer cid) {
        try {
            cartService.deleteCartItem(cid);
            return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm khỏi giỏ hàng"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // 🧹 Xóa toàn bộ giỏ hàng
    @DeleteMapping("/cart/clear")
    public ResponseEntity<?> clearCart(Principal p) {
        if (p == null)
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));

        try {
            UserDtls user = userService.getUserByEmail(p.getName());
            cartService.clearCartByUser(user.getId());
            return ResponseEntity.ok(Map.of("message", "Đã xóa toàn bộ giỏ hàng"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // 🧾 Lấy danh sách đơn hàng của user
    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(Principal p) {
        if (p == null)
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));

        UserDtls user = userService.getUserByEmail(p.getName());
        List<ProductOrder> orders = orderService.getOrdersByUser(user.getId());

        List<Map<String, Object>> list = new ArrayList<>();
        for (ProductOrder o : orders) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", o.getId());
            map.put("orderId", o.getOrderId());
            map.put("orderDate", o.getOrderDate());
            map.put("status", o.getStatus());
            map.put("quantity", o.getQuantity());
            map.put("size", o.getSize());
            map.put("priceBySize", o.getPriceBySize());
            map.put("totalPrice", o.getTotalPrice());
            map.put("paymentType", o.getPaymentType());

            if (o.getProduct() != null) {
                map.put("product", Map.of(
                        "title", o.getProduct().getTitle(),
                        "category", o.getProduct().getCategory(),
                        "image", o.getProduct().getImage()
                ));
            }

            if (o.getOrderAddress() != null) {
                map.put("orderAddress", Map.of(
                        "firstName", o.getOrderAddress().getFirstName(),
                        "lastName", o.getOrderAddress().getLastName(),
                        "email", o.getOrderAddress().getEmail(),
                        "mobileNo", o.getOrderAddress().getMobileNo(),
                        "address", o.getOrderAddress().getAddress(),
                        "city", o.getOrderAddress().getCity(),
                        "state", o.getOrderAddress().getState(),
                        "pincode", o.getOrderAddress().getPincode()
                ));
            }
            list.add(map);
        }

        return ResponseEntity.ok(list);
    }

    // 🟢 Lưu đơn hàng (Checkout)
    @PostMapping("/save-order")
    public ResponseEntity<?> saveOrder(@RequestBody OrderRequest request, Principal p) {
        if (p == null)
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));

        UserDtls user = userService.getUserByEmail(p.getName());
        try {
            orderService.saveOrder(user.getId(), request);
            return ResponseEntity.ok(Map.of("message", "Đã lưu đơn hàng thành công"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
// 🟢 Lấy chi tiết 1 đơn hàng theo ID
@GetMapping("/orders/{id}")
public ResponseEntity<?> getOrderById(@PathVariable Integer id, Principal p) {
    if (p == null)
        return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));

    try {
        ProductOrder order = orderService.getOrderById(id);
        if (order == null)
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy đơn hàng"));

        Map<String, Object> map = new HashMap<>();
        map.put("id", order.getId());
        map.put("orderId", order.getOrderId());
        map.put("orderDate", order.getOrderDate());
        map.put("status", order.getStatus());
        map.put("quantity", order.getQuantity());
        map.put("size", order.getSize());
        map.put("priceBySize", order.getPriceBySize());
        map.put("totalPrice", order.getTotalPrice());
        map.put("paymentType", order.getPaymentType());

        if (order.getProduct() != null) {
            map.put("product", Map.of(
                    "title", order.getProduct().getTitle(),
                    "category", order.getProduct().getCategory(),
                    "image", order.getProduct().getImage()
            ));
        }

        if (order.getOrderAddress() != null) {
            map.put("orderAddress", Map.of(
                    "firstName", order.getOrderAddress().getFirstName(),
                    "lastName", order.getOrderAddress().getLastName(),
                    "email", order.getOrderAddress().getEmail(),
                    "mobileNo", order.getOrderAddress().getMobileNo(),
                    "address", order.getOrderAddress().getAddress(),
                    "city", order.getOrderAddress().getCity(),
                    "state", order.getOrderAddress().getState(),
                    "pincode", order.getOrderAddress().getPincode()
            ));
        }

        return ResponseEntity.ok(map);

    } catch (Exception e) {
        return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
    }
}


    // 🟠 Hủy đơn hàng (User)
    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable("id") Integer id, Principal p) {
        if (p == null)
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));

        try {
            boolean canceled = orderService.cancelOrder(id);
            if (canceled) {
                return ResponseEntity.ok(Map.of("message", "Đã hủy đơn hàng thành công"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Không thể hủy đơn hàng này"));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // 👤 Cập nhật hồ sơ người dùng
    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(@ModelAttribute UserDtls user,
                                           @RequestParam(required = false) MultipartFile img,
                                           Principal p) {
        if (p == null)
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));

        UserDtls existingUser = userService.getUserByEmail(p.getName());
        if (existingUser == null)
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy người dùng"));

        user.setId(existingUser.getId());

        UserDtls updated = userService.updateUserProfile(user, img);
        if (ObjectUtils.isEmpty(updated))
            return ResponseEntity.badRequest().body(Map.of("error", "Không thể cập nhật hồ sơ"));

        return ResponseEntity.ok(Map.of("message", "Cập nhật hồ sơ thành công"));
    }

    // 🔐 Đổi mật khẩu
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestParam String newPassword,
            @RequestParam String currentPassword,
            Principal p) {

        if (p == null)
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));

        UserDtls loggedInUser = userService.getUserByEmail(p.getName());
        boolean matches = passwordEncoder.matches(currentPassword, loggedInUser.getPassword());

        if (!matches)
            return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu hiện tại không đúng"));

        loggedInUser.setPassword(passwordEncoder.encode(newPassword));
        UserDtls updated = userService.updateUser(loggedInUser);

        if (ObjectUtils.isEmpty(updated))
            return ResponseEntity.internalServerError().body(Map.of("error", "Không thể cập nhật mật khẩu"));

        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }
}
