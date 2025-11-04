package com.example.baochung_st22a.service;

import com.example.baochung_st22a.dto.OrderItemRequest;
import com.example.baochung_st22a.model.*;
import com.example.baochung_st22a.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TableOrderItemRepository itemRepository;

    @Autowired
    private OrderService orderService;

    /**
     * 🟢 Khách đặt bàn (tính tổng tiền theo món, size, số lượng)
     */
    @Transactional
    public Reservation bookTableWithItems(Integer userId, Integer tableId, List<OrderItemRequest> items) {
        CafeTable table = tableRepository.findById(tableId).orElse(null);
        UserDtls user = userRepository.findById(userId).orElse(null);

        // ❌ Nếu bàn không tồn tại hoặc đang bận thì không cho đặt
        if (table == null || user == null || !"EMPTY".equalsIgnoreCase(table.getStatus())) {
            return null;
        }

        double total = 0.0;

        // ✅ Lặp qua từng món
        for (OrderItemRequest req : items) {
            Product product = productRepository.findById(req.getProductId()).orElse(null);
            if (product == null) continue;

            String size = (req.getSize() != null) ? req.getSize().toUpperCase() : "M";
            double price = switch (size) {
                case "S" -> product.getPriceSmall() != null ? product.getPriceSmall() : 0.0;
                case "L" -> product.getPriceLarge() != null ? product.getPriceLarge() : 0.0;
                default -> product.getPriceMedium() != null ? product.getPriceMedium() : 0.0;
            };

            int quantity = (req.getQuantity() != null && req.getQuantity() > 0) ? req.getQuantity() : 1;
            double itemTotal = price * quantity;
            total += itemTotal;

            // ✅ Lưu chi tiết món vào bảng TableOrderItem
            TableOrderItem item = new TableOrderItem();
            item.setTable(table);
            item.setProduct(product);
            item.setSize(size);
            item.setQuantity(quantity);
            item.setPrice(price);
            item.setTotal(itemTotal);
            itemRepository.save(item);
        }

        // ✅ Cập nhật trạng thái bàn
        table.setStatus("OCCUPIED");
        table.setTotalAmount(total);
        tableRepository.save(table);

        // ✅ Tạo bản ghi đặt bàn
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setTable(table);
        reservation.setTimeStart(LocalDateTime.now());
        reservation.setStatus("BOOKED");
        reservation.setTotalPrice(total);
        reservation.setCreatedBy(user.getEmail());

        return reservationRepository.save(reservation);
    }

    /**
     * 🔹 Lấy danh sách đặt bàn của 1 user
     */
    public List<Reservation> getReservationsByUser(Integer userId) {
        return reservationRepository.findByUserId(userId);
    }

    /**
     * 🔹 Hoàn tất bàn (Admin thanh toán)
     */
    @Transactional
    public boolean completeReservation(Integer id) {
        Reservation res = reservationRepository.findById(id).orElse(null);
        if (res == null) return false;

        if (!"COMPLETED".equalsIgnoreCase(res.getStatus())) {
            res.setStatus("COMPLETED");

            CafeTable table = res.getTable();
            double amount = table.getTotalAmount() != null ? table.getTotalAmount() : res.getTotalPrice();

            // ✅ Cộng doanh thu vào dashboard
            orderService.addRevenueToday(amount);

            // ✅ Reset bàn
            table.setStatus("EMPTY");
            table.setTotalAmount(0.0);
            tableRepository.save(table);

            reservationRepository.save(res);
            System.out.println("✅ Đã hoàn tất Reservation #" + id + " | +Doanh thu: " + amount);
        }

        return true;
    }

    /**
     * 🔹 Lấy toàn bộ đặt bàn (Admin)
     */
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    /**
     * 🔹 Lấy chi tiết đặt bàn theo ID
     */
    public Reservation getReservationById(Integer id) {
        return reservationRepository.findById(id).orElse(null);
    }

    /**
     * 🔹 Hủy đặt bàn (User)
     */
    @Transactional
    public boolean cancelReservation(Integer id) {
        Reservation res = reservationRepository.findById(id).orElse(null);
        if (res == null) return false;

        if (!"COMPLETED".equalsIgnoreCase(res.getStatus())) {
            res.setStatus("CANCELED");

            CafeTable table = res.getTable();
            table.setStatus("EMPTY");
            table.setTotalAmount(0.0);
            tableRepository.save(table);

            reservationRepository.save(res);
            System.out.println("🚫 Đã hủy Reservation #" + id);
            return true;
        }

        return false;
    }
}
