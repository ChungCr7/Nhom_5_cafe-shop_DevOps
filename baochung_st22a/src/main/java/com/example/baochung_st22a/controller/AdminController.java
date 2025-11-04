package com.example.baochung_st22a.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.baochung_st22a.model.Category;
import com.example.baochung_st22a.model.Product;
import com.example.baochung_st22a.model.ProductOrder;
import com.example.baochung_st22a.model.UserDtls;
import com.example.baochung_st22a.service.CategoryService;
import com.example.baochung_st22a.service.OrderService;
import com.example.baochung_st22a.service.ProductService;
import com.example.baochung_st22a.service.UserService;
import com.example.baochung_st22a.util.CommonUtil;
import com.example.baochung_st22a.util.OrderStatus;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true") 
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AdminController.class);

    @Autowired private CategoryService categoryService;
    @Autowired private ProductService productService;
    @Autowired private UserService userService;
    @Autowired private OrderService orderService;
    @Autowired private CommonUtil commonUtil;
    @Autowired private PasswordEncoder passwordEncoder;

    // ====================== CATEGORY MANAGEMENT ======================
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories(@RequestParam(defaultValue = "0") Integer pageNo,
                                           @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<Category> page = categoryService.getAllCategorPagination(pageNo, pageSize);
        return ResponseEntity.ok(Map.of(
                "categories", page.getContent(),
                "totalPages", page.getTotalPages(),
                "totalElements", page.getTotalElements()
        ));
    }

    @PostMapping("/categories")
    public ResponseEntity<?> saveCategory(@ModelAttribute Category category) {
        if (categoryService.existCategory(category.getName())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Category already exists"));
        }
        Category saved = categoryService.saveCategory(category);
        return ResponseEntity.ok(Map.of("message", "Category saved successfully", "data", saved));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable int id, @ModelAttribute Category category) {
        Category old = categoryService.getCategoryById(id);
        if (old == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Category not found"));
        old.setName(category.getName());
        Category updated = categoryService.saveCategory(old);
        return ResponseEntity.ok(Map.of("message", "Category updated successfully", "data", updated));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable int id) {
        boolean deleted = categoryService.deleteCategory(id);
        return deleted
                ? ResponseEntity.ok(Map.of("message", "Category deleted successfully"))
                : ResponseEntity.internalServerError().body(Map.of("error", "Failed to delete category"));
    }

    // ====================== PRODUCT MANAGEMENT ======================
    @GetMapping("/products")
    public ResponseEntity<?> getProducts(@RequestParam(defaultValue = "") String ch,
                                         @RequestParam(defaultValue = "0") Integer pageNo,
                                         @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<Product> page = ch.isBlank()
                ? productService.getAllProductsPagination(pageNo, pageSize)
                : productService.searchProductPagination(pageNo, pageSize, ch);

        return ResponseEntity.ok(Map.of(
                "products", page.getContent(),
                "totalPages", page.getTotalPages(),
                "totalElements", page.getTotalElements()
        ));
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<?> getProductById(@PathVariable int id) {
        Product product = productService.getProductById(id);
        if (product == null)
            return ResponseEntity.status(404).body(Map.of("error", "Product not found"));
        return ResponseEntity.ok(product);
    }

    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> saveProduct(@ModelAttribute Product product,
                                         @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {

        String imageName = (file != null && !file.isEmpty()) ? file.getOriginalFilename() : "default.jpg";
        product.setImage(imageName);
        product.calculateDiscountPrices();

        String uploadDir = System.getProperty("user.dir") + "/uploads/product_img";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        if (file != null && !file.isEmpty()) {
            Path path = Paths.get(uploadDir, imageName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        }

        product.setImage("/product_img/" + imageName);
        Product saved = productService.saveProduct(product);
        return ResponseEntity.ok(Map.of("message", "Product saved successfully", "data", saved));
    }

    @PutMapping(value = "/products/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProduct(@PathVariable int id,
                                           @ModelAttribute Product product,
                                           @RequestPart(required = false) MultipartFile file) throws IOException {
        Product old = productService.getProductById(id);
        if (old == null)
            return ResponseEntity.status(404).body(Map.of("error", "Product not found"));

        old.setTitle(product.getTitle());
        old.setDescription(product.getDescription());
        old.setIngredients(product.getIngredients());
        old.setCategory(product.getCategory());
        old.setPriceSmall(product.getPriceSmall());
        old.setPriceMedium(product.getPriceMedium());
        old.setPriceLarge(product.getPriceLarge());
        old.setDiscount(product.getDiscount());
        old.setStock(product.getStock());
        old.setActive(product.getActive());
        old.calculateDiscountPrices();

        if (file != null && !file.isEmpty()) {
            String uploadDir = System.getProperty("user.dir") + "/uploads/product_img";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = file.getOriginalFilename();
            Path path = Paths.get(uploadDir, fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            old.setImage("/product_img/" + fileName);
        }

        Product updated = productService.saveProduct(old);
        return ResponseEntity.ok(Map.of("message", "Product updated successfully", "data", updated));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable int id) {
        return productService.deleteProduct(id)
                ? ResponseEntity.ok(Map.of("message", "Product deleted"))
                : ResponseEntity.internalServerError().body(Map.of("error", "Delete failed"));
    }

    // ====================== USER MANAGEMENT ======================
    @GetMapping("/users")
    public ResponseEntity<?> getUsers(@RequestParam Integer type) {
        List<UserDtls> users = (type == 1)
                ? userService.getUsers("ROLE_USER")
                : userService.getUsers("ROLE_ADMIN");
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Integer id, @RequestParam Boolean status) {
        return userService.updateAccountStatus(id, status)
                ? ResponseEntity.ok(Map.of("message", "Account status updated"))
                : ResponseEntity.internalServerError().body(Map.of("error", "Failed to update status"));
    }

    // ====================== ORDER MANAGEMENT ======================
// ====================== ORDER MANAGEMENT ======================

@GetMapping("/orders")
public ResponseEntity<?> getOrders(@RequestParam(defaultValue = "0") Integer pageNo,
                                   @RequestParam(defaultValue = "10") Integer pageSize) {
    Page<ProductOrder> page = orderService.getAllOrdersPagination(pageNo, pageSize);
    List<Map<String, Object>> list = new ArrayList<>();

    for (ProductOrder o : page.getContent()) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", o.getId());
        map.put("orderId", o.getOrderId());
        map.put("orderDate", o.getOrderDate());
        map.put("status", o.getStatus());
        map.put("quantity", o.getQuantity());
        map.put("size", o.getSize());

        // ✅ Giá & tổng tiền
        map.put("priceBySize", o.getPriceBySize());
        map.put("shippingFee", o.getShippingFee());
        map.put("totalPrice", o.getTotalPrice());

        // ✅ Loại thanh toán
        map.put("paymentType", o.getPaymentType());
        
        // ✅ Thông tin sản phẩm
        if (o.getProduct() != null) {
            map.put("product", Map.of(
                    "title", o.getProduct().getTitle(),
                    "category", o.getProduct().getCategory(),
                    "image", o.getProduct().getImage()
            ));
        }

        // ✅ Thông tin địa chỉ giao hàng
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

    return ResponseEntity.ok(Map.of(
            "orders", list,
            "totalPages", page.getTotalPages(),
            "totalElements", page.getTotalElements()
    ));
}


// ✅ Cập nhật trạng thái đơn hàng
@PutMapping("/update-status")
public ResponseEntity<?> updateOrderStatus(@RequestParam Integer id, @RequestParam Integer st) {
    ProductOrder order = orderService.getOrderById(id);
    if (order == null)
        return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy đơn hàng"));

    // ❌ Nếu đã hủy → không cho cập nhật nữa
    if ("Cancelled".equalsIgnoreCase(order.getStatus())) {
        return ResponseEntity.badRequest().body(Map.of("error", "Đơn hàng đã hủy, không thể cập nhật"));
    }

    // ✅ Map status theo ID
    OrderStatus[] values = OrderStatus.values();
    String status = Arrays.stream(values)
            .filter(v -> v.getId().equals(st))
            .map(OrderStatus::getName)
            .findFirst()
            .orElse(null);

    if (status == null)
        return ResponseEntity.badRequest().body(Map.of("error", "Trạng thái không hợp lệ"));

    ProductOrder updated = orderService.updateOrderStatus(id, status);

    try {
        commonUtil.sendMailForProductOrder(updated, status);
    } catch (Exception e) {
        log.error("Error sending order status update email", e);
    }

    return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công", "data", updated));
}


// ✅ Xóa đơn hàng đã hủy
@DeleteMapping("/orders/{id}")
public ResponseEntity<?> deleteCancelledOrder(@PathVariable Integer id) {
    ProductOrder order = orderService.getOrderById(id);
    if (order == null)
        return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy đơn hàng"));

    if (!"Cancelled".equalsIgnoreCase(order.getStatus())) {
        return ResponseEntity.badRequest().body(Map.of("error", "Chỉ được xóa đơn hàng đã hủy"));
    }

    orderService.deleteOrder(id);
    return ResponseEntity.ok(Map.of("message", "Đã xóa đơn hàng hủy thành công"));
}


    // ====================== PROFILE + PASSWORD ======================
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Principal p) {
        if (p == null)
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        UserDtls user = userService.getUserByEmail(p.getName());
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@ModelAttribute UserDtls user, @RequestParam(required = false) MultipartFile img) {
        UserDtls updated = userService.updateUserProfile(user, img);
        return ObjectUtils.isEmpty(updated)
                ? ResponseEntity.internalServerError().body(Map.of("error", "Profile not updated"))
                : ResponseEntity.ok(Map.of("message", "Profile updated", "data", updated));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestParam String currentPassword,
                                            @RequestParam String newPassword,
                                            Principal p) {
        if (p == null)
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        UserDtls loggedIn = userService.getUserByEmail(p.getName());

        boolean matches = passwordEncoder.matches(currentPassword, loggedIn.getPassword());
        if (!matches)
            return ResponseEntity.badRequest().body(Map.of("error", "Current password incorrect"));

        loggedIn.setPassword(passwordEncoder.encode(newPassword));
        userService.updateUser(loggedIn);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    // ====================== DASHBOARD STATS ======================
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalProducts = productService.countProducts();
        int totalOrders = (int) orderService.countOrders();
        int totalUsers = userService.getUsers("ROLE_USER").size();
        double todayRevenue = orderService.calculateTodayRevenue();

        stats.put("totalProducts", totalProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("totalUsers", totalUsers);
        stats.put("todayRevenue", todayRevenue);

        return ResponseEntity.ok(stats);
    }
    // ====================== REVENUE STATISTICS ======================
    @GetMapping("/revenue/monthly")
    public ResponseEntity<?> getMonthlyRevenue() {
        // 🔹 Tạo dữ liệu mẫu cho 12 tháng (nếu chưa có DB thực)
        List<Map<String, Object>> monthly = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            double revenue = orderService.getMonthlyRevenue(month); // gọi service tính theo tháng
            monthly.add(Map.of(
                    "month", "Tháng " + month,
                    "revenue", revenue
            ));
        }

        return ResponseEntity.ok(monthly);
    }

}
