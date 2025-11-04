package com.example.baochung_st22a.controller;

import com.example.baochung_st22a.model.CafeTable;
import com.example.baochung_st22a.model.Product;
import com.example.baochung_st22a.model.ProductOrder;
import com.example.baochung_st22a.model.Reservation;
import com.example.baochung_st22a.model.TableOrderItem;
import com.example.baochung_st22a.repository.ProductOrderRepository;
import com.example.baochung_st22a.repository.ReservationRepository;
import com.example.baochung_st22a.service.OrderService;
import com.example.baochung_st22a.service.ProductService;
import com.example.baochung_st22a.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/admin/tables")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTableController {

    @Autowired
    private TableService tableService;

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductOrderRepository orderRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    // 🔹 Lấy tất cả bàn
    @GetMapping
    public ResponseEntity<?> getAllTables() {
        List<CafeTable> tables = tableService.getAllTables();
        return ResponseEntity.ok(Map.of("tables", tables));
    }

    // 🔹 Cập nhật trạng thái bàn (EMPTY / OCCUPIED / PAID)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTableStatus(@PathVariable Integer id, @RequestParam String status) {
        CafeTable table = tableService.getTableById(id);
        if (table == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy bàn"));
        }

        table.setStatus(status);

        // ✅ Khi bàn được thanh toán
        if ("PAID".equalsIgnoreCase(status)) {
            double totalRevenue = table.getTotalAmount() != null ? table.getTotalAmount() : 0.0;

            // ✅ Tạo bản ghi đơn hàng tương ứng với doanh thu bàn
            ProductOrder tableOrder = new ProductOrder();
            tableOrder.setOrderId("TABLE-" + table.getId() + "-" + System.currentTimeMillis());
            tableOrder.setOrderDate(LocalDate.now());
            tableOrder.setStatus("Delivered");
            tableOrder.setTotalPrice(totalRevenue);
            tableOrder.setPaymentType("Tại quán");
            tableOrder.setShippingFee(0.0);
            tableOrder.setQuantity(1);
            tableOrder.setSize("M");
            tableOrder.setPriceBySize(totalRevenue);

            try {
                // ✅ Lưu doanh thu bàn vào DB
                orderRepository.save(tableOrder);

                // ✅ Cập nhật doanh thu realtime (cho Dashboard)
                orderService.addRevenueToday(totalRevenue);

                System.out.println("💰 Đã lưu doanh thu bàn vào DB: " + totalRevenue + "₫ từ " + table.getTableName());
            } catch (Exception e) {
                System.err.println("❌ Lỗi lưu doanh thu bàn: " + e.getMessage());
            }

            // ✅ Cập nhật reservation liên quan → COMPLETED
            try {
                List<Reservation> reservations =
                        reservationRepository.findByTableIdAndStatus(table.getId(), "BOOKED");

                for (Reservation r : reservations) {
                    r.setStatus("COMPLETED");
                    reservationRepository.save(r);
                    System.out.println("✅ Reservation #" + r.getId() + " → COMPLETED");
                }
            } catch (Exception e) {
                System.err.println("⚠️ Lỗi khi cập nhật trạng thái Reservation: " + e.getMessage());
            }

            // ✅ Reset bàn
            table.setStatus("EMPTY");
            table.setTotalAmount(0.0);
            table.setNote("");
            if (table.getItems() != null) table.getItems().clear();
        }

        CafeTable updated = tableService.saveTable(table);
        return ResponseEntity.ok(Map.of(
                "message", "Đã cập nhật trạng thái bàn: " + status,
                "table", updated
        ));
    }

    // 🔹 Thêm món vào bàn
    @PostMapping("/{id}/add-item")
    public ResponseEntity<?> addItemToTable(@PathVariable Integer id, @RequestBody Map<String, Object> req) {
        CafeTable table = tableService.getTableById(id);
        if (table == null)
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy bàn"));

        Integer productId = (Integer) req.get("productId");
        Integer quantity = (Integer) req.getOrDefault("quantity", 1);
        String size = (String) req.getOrDefault("size", "medium");

        Product product = productService.getProductById(productId);
        if (product == null)
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy sản phẩm"));

        double price = product.getPriceBySize(size);
        double total = price * quantity;

        TableOrderItem item = new TableOrderItem();
        item.setTable(table);
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setSize(size);
        item.setPrice(price);
        item.setTotal(total);

        double newTotal = (table.getTotalAmount() != null ? table.getTotalAmount() : 0.0) + total;
        table.setTotalAmount(newTotal);
        table.setStatus("OCCUPIED");

        if (table.getItems() == null)
            table.setItems(new ArrayList<>());
        table.getItems().add(item);

        tableService.saveTable(table);
        return ResponseEntity.ok(Map.of("message", "Đã thêm món vào bàn", "table", table));
    }

    // 🔹 Xóa món khỏi bàn
    @DeleteMapping("/{id}/remove-item/{itemId}")
    public ResponseEntity<?> removeItem(@PathVariable Integer id, @PathVariable Integer itemId) {
        boolean removed = tableService.removeItemFromTable(id, itemId);
        if (!removed)
            return ResponseEntity.badRequest().body(Map.of("error", "Không thể xóa món khỏi bàn"));
        return ResponseEntity.ok(Map.of("message", "Đã xóa món khỏi bàn"));
    }
}
