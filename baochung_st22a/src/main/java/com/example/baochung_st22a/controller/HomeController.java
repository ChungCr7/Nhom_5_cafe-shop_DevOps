package com.example.baochung_st22a.controller;

import com.example.baochung_st22a.config.JwtService;
import com.example.baochung_st22a.model.Category;
import com.example.baochung_st22a.model.Product;
import com.example.baochung_st22a.model.UserDtls;
import com.example.baochung_st22a.service.CartService;
import com.example.baochung_st22a.service.CategoryService;
import com.example.baochung_st22a.service.ProductService;
import com.example.baochung_st22a.service.UserService;
import com.example.baochung_st22a.util.CommonUtil;
import io.micrometer.common.util.StringUtils;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.file.*;
import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/home")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class HomeController {

    @Autowired private CategoryService categoryService;
    @Autowired private ProductService productService;
    @Autowired private UserService userService;
    @Autowired private CommonUtil commonUtil;
    @Autowired private BCryptPasswordEncoder passwordEncoder;
    @Autowired private CartService cartService;
    @Autowired private JwtService jwtService; // ✅ sinh JWT

    /** 🏠 Trang chủ: danh mục + sản phẩm nổi bật (mẫu) */
    @GetMapping("/index")
    public ResponseEntity<?> getHomeData() {
        List<Category> categories = categoryService.getAllCategory().stream()
                .sorted((c1, c2) -> c2.getId().compareTo(c1.getId()))
                .limit(6)
                .collect(Collectors.toList());

        List<Product> products = productService.getAllActiveProducts("").stream()
                .sorted((p1, p2) -> p2.getId().compareTo(p1.getId()))
                .limit(8)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("categories", categories, "products", products));
    }

    /** 🗂️ Danh mục (cho HomePage) */
    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories() {
        List<Category> categories = categoryService.getAllCategory();
        return ResponseEntity.ok(categories);
    }

    /**
     * 🧭 Sản phẩm theo Category ID
     * Frontend gọi: GET /api/home/category/{id}/products
     * Triển khai bằng cách tìm tên category từ ID, sau đó dùng service lọc theo category (string)
     */
    @GetMapping("/category/{id}/products")
    public ResponseEntity<?> getProductsByCategoryId(
            @PathVariable Integer id,
            @RequestParam(name = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(name = "pageSize", defaultValue = "50") Integer pageSize) {

        // Tìm category theo id (không giả định service có getById)
        Optional<Category> opt = categoryService.getAllCategory()
                .stream().filter(c -> Objects.equals(c.getId(), id)).findFirst();

        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Category not found"));
        }

        String categoryName = opt.get().getName();
        Page<Product> page = productService.getAllActiveProductPagination(pageNo, pageSize, categoryName);
        return ResponseEntity.ok(page.getContent());
    }

    /** 🛍️ Danh sách sản phẩm có phân trang + tìm kiếm */
    @GetMapping("/products")
    public ResponseEntity<?> getProducts(
            @RequestParam(value = "category", defaultValue = "") String category,
            @RequestParam(name = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(name = "pageSize", defaultValue = "12") Integer pageSize,
            @RequestParam(defaultValue = "") String ch) {

        Page<Product> page = StringUtils.isEmpty(ch)
                ? productService.getAllActiveProductPagination(pageNo, pageSize, category)
                : productService.searchActiveProductPagination(pageNo, pageSize, category, ch);

        Map<String, Object> data = new HashMap<>();
        data.put("products", page.getContent());
        data.put("totalElements", page.getTotalElements());
        data.put("totalPages", page.getTotalPages());
        data.put("isFirst", page.isFirst());
        data.put("isLast", page.isLast());
        return ResponseEntity.ok(data);
    }

    /** 🔍 Xem chi tiết sản phẩm */
    @GetMapping("/product/{id}")
    public ResponseEntity<?> getProductById(@PathVariable int id) {
        Product product = productService.getProductById(id);
        if (product == null)
            return ResponseEntity.status(404).body(Map.of("error", "Product not found"));
        return ResponseEntity.ok(product);
    }

    /** 🔐 Đăng nhập (sinh JWT) */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email hoặc mật khẩu không được để trống"));
        }

        UserDtls user = userService.getUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(400).body(Map.of("error", "Email không tồn tại"));
        }
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(400).body(Map.of("error", "Sai mật khẩu"));
        }
        if (!Boolean.TRUE.equals(user.getIsEnable())) {
            return ResponseEntity.status(403).body(Map.of("error", "Tài khoản chưa được kích hoạt"));
        }

        String jwtToken = jwtService.generateToken(user.getEmail(), user.getRole());

        // ✅ Thêm id vào response
        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());              // ✅ dòng thêm mới
        data.put("username", user.getName());
        data.put("email", user.getEmail());
        data.put("role", user.getRole());
        data.put("token", jwtToken);

        return ResponseEntity.ok(data);
    }


    /** 🧾 Đăng ký người dùng */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@ModelAttribute UserDtls user,
                                          @RequestParam(value = "img", required = false) MultipartFile file)
            throws IOException {

        if (userService.existsEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        String imageName = (file == null || file.isEmpty()) ? "default.jpg" : file.getOriginalFilename();
        user.setProfileImage(imageName);
        UserDtls saved = userService.saveUser(user);

        if (!ObjectUtils.isEmpty(saved) && file != null && !file.isEmpty()) {
            File saveDir = new ClassPathResource("static/img").getFile();
            Path path = Paths.get(saveDir.getAbsolutePath(), "profile_img", file.getOriginalFilename());
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        }

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    /** 🔑 Quên mật khẩu (gửi email reset) */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email, HttpServletRequest request)
            throws UnsupportedEncodingException, MessagingException {

        UserDtls user = userService.getUserByEmail(email);
        if (ObjectUtils.isEmpty(user)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email"));
        }

        String resetToken = UUID.randomUUID().toString();
        userService.updateUserResetToken(email, resetToken);
        String resetUrl = CommonUtil.generateUrl(request) + "/reset-password?token=" + resetToken;

        if (commonUtil.sendMail(resetUrl, email)) {
            return ResponseEntity.ok(Map.of("message", "Reset link sent to email"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send email"));
        }
    }

    /** ✅ Đặt lại mật khẩu */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String password) {
        UserDtls user = userService.getUserByToken(token);
        if (user == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired token"));

        user.setPassword(passwordEncoder.encode(password));
        user.setResetToken(null);
        userService.updateUser(user);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    /** 🔎 Tìm kiếm sản phẩm */
    @GetMapping("/search")
    public ResponseEntity<?> searchProduct(@RequestParam String ch) {
        List<Product> products = productService.searchProduct(ch);
        List<Category> categories = categoryService.getAllCategory();
        return ResponseEntity.ok(Map.of("products", products, "categories", categories));
    }

    /** 👤 Thông tin user đăng nhập */
    @GetMapping("/me")
    public ResponseEntity<?> getUserInfo(Principal p) {
        if (p == null)
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        UserDtls user = userService.getUserByEmail(p.getName());
        Integer cartCount = cartService.getCountCart(user.getId());
        return ResponseEntity.ok(Map.of("user", user, "cartCount", cartCount));
    }
}
