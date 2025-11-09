package com.example.baochung_st22a.service.impl;

import com.example.baochung_st22a.model.CafeTable;
import com.example.baochung_st22a.model.TableOrderItem;
import com.example.baochung_st22a.repository.TableOrderItemRepository;
import com.example.baochung_st22a.repository.TableRepository;
import com.example.baochung_st22a.repository.ReservationRepository; // ✅ thêm repo này
import com.example.baochung_st22a.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class TableServiceImpl implements TableService {

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private TableOrderItemRepository itemRepository;

    @Autowired(required = false)
    private ReservationRepository reservationRepository; // ✅ nếu có bảng reservations

    // 🔹 Lấy toàn bộ bàn
    @Override
    public List<CafeTable> getAllTables() {
        return tableRepository.findAll();
    }

    // 🔹 Lấy chi tiết 1 bàn
    @Override
    public CafeTable getTableById(Integer id) {
        return tableRepository.findById(id).orElse(null);
    }

    // 🔹 Lưu bàn mới hoặc cập nhật
    @Override
    public CafeTable saveTable(CafeTable table) {
        if (table.getStatus() == null) table.setStatus("EMPTY");
        if (table.getTotalAmount() == null) table.setTotalAmount(0.0);
        return tableRepository.save(table);
    }

    // 🔹 Cập nhật bàn theo ID
    @Override
    public CafeTable updateTable(Integer id, CafeTable newTable) {
        Optional<CafeTable> optional = tableRepository.findById(id);
        if (optional.isPresent()) {
            CafeTable existing = optional.get();
            existing.setTableName(newTable.getTableName());
            existing.setPosition(newTable.getPosition());
            existing.setCapacity(newTable.getCapacity());
            existing.setStatus(newTable.getStatus());
            existing.setNote(newTable.getNote());
            existing.setTotalAmount(newTable.getTotalAmount());
            return tableRepository.save(existing);
        }
        return null;
    }

    // 🔹 Xóa bàn — FIX lỗi Foreign Key Constraint
    @Override
    public boolean deleteTable(Integer id) {
        Optional<CafeTable> optional = tableRepository.findById(id);
        if (optional.isEmpty()) return false;

        CafeTable table = optional.get();

        try {
            // ✅ Xóa toàn bộ order items liên quan
            if (table.getItems() != null && !table.getItems().isEmpty()) {
                for (TableOrderItem item : table.getItems()) {
                    itemRepository.delete(item);
                }
            }

            // ✅ Nếu có bảng reservations, xóa hết các đặt chỗ liên quan
            if (reservationRepository != null) {
                reservationRepository.deleteByTableId(id);
            }

            // ✅ Sau đó xóa bàn
            tableRepository.deleteById(id);
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // 🔹 Cập nhật trạng thái bàn
    @Override
    public boolean updateTableStatus(Integer id, String status) {
        Optional<CafeTable> optional = tableRepository.findById(id);
        if (optional.isEmpty()) return false;

        CafeTable table = optional.get();
        table.setStatus(status);
        tableRepository.save(table);
        return true;
    }

    // 🔹 Lấy danh sách bàn trống
    @Override
    public List<CafeTable> getAvailableTables() {
        return tableRepository.findByStatus("EMPTY");
    }

    // 🔹 Thêm món vào bàn
    @Override
    public CafeTable addItemToTable(Integer tableId, TableOrderItem item) {
        CafeTable table = getTableById(tableId);
        if (table == null) throw new RuntimeException("Không tìm thấy bàn!");

        item.setTable(table);
        itemRepository.save(item);

        double total = table.getTotalAmount() != null ? table.getTotalAmount() : 0.0;
        table.setTotalAmount(total + item.getTotal());
        table.setStatus("OCCUPIED");
        return tableRepository.save(table);
    }

    // 🔹 Xóa món khỏi bàn
    @Override
    public boolean removeItemFromTable(Integer tableId, Integer itemId) {
        CafeTable table = getTableById(tableId);
        if (table == null) return false;

        Optional<TableOrderItem> optItem = itemRepository.findById(itemId);
        if (optItem.isPresent()) {
            TableOrderItem item = optItem.get();
            if (Objects.equals(item.getTable().getId(), tableId)) {
                double currentTotal = table.getTotalAmount() != null ? table.getTotalAmount() : 0.0;
                table.setTotalAmount(Math.max(0, currentTotal - item.getTotal()));
                itemRepository.delete(item);
                tableRepository.save(table);
                return true;
            }
        }
        return false;
    }

    // 🔹 Reset bàn sau khi thanh toán
    @Override
    public void resetTableAfterPayment(Integer id) {
        CafeTable table = getTableById(id);
        if (table == null) return;

        if (table.getItems() != null && !table.getItems().isEmpty()) {
            for (TableOrderItem item : table.getItems()) {
                itemRepository.delete(item);
            }
        }

        table.setStatus("EMPTY");
        table.setTotalAmount(0.0);
        table.setNote("");
        tableRepository.save(table);
    }
}
