package com.example.baochung_st22a.controller;

import com.example.baochung_st22a.model.CafeTable;
import com.example.baochung_st22a.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/tables")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class PublicTableController {

    @Autowired
    private TableService tableService;

    // 🟢 Public - lấy danh sách bàn trống (không cần đăng nhập)
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableTables() {
        List<CafeTable> tables = tableService.getAvailableTables();
        return ResponseEntity.ok(Map.of("availableTables", tables));
    }
}
