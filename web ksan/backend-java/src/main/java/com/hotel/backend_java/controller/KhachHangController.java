package com.hotel.backend_java.controller;

import com.hotel.backend_java.entity.KhachHang;
import com.hotel.backend_java.repository.KhachHangRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/client") // Hoặc /api/clients nếu báo 404 nhé
public class KhachHangController {

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate; // 🌟 "Vũ khí" để chạy SQL thuần như Node.js

    // 1. Quản lý danh sách & TÌM KIẾM ĐỘNG
    @GetMapping("/managementclients")
    public ResponseEntity<?> getClients(
            @RequestParam(required = false) String MaKH,
            @RequestParam(required = false) String CMND,
            @RequestParam(required = false) String HoTen,
            @RequestParam(required = false) String DienThoai) {

        // Xây dựng câu lệnh SQL y hệt file Node.js
        StringBuilder sql = new StringBuilder("SELECT * FROM khachhang WHERE 1=1"); // của bạn có dấu gạch dưới nhé
        List<Object> params = new ArrayList<>();

        if (MaKH != null && !MaKH.trim().isEmpty()) {
            sql.append(" AND MaKH = ?");
            params.add(MaKH.trim());
        }
        if (CMND != null && !CMND.trim().isEmpty()) {
            sql.append(" AND CMND LIKE ?");
            params.add("%" + CMND.trim() + "%");
        }
        if (HoTen != null && !HoTen.trim().isEmpty()) {
            sql.append(" AND HoTen LIKE ?");
            params.add("%" + HoTen.trim() + "%");
        }
        if (DienThoai != null && !DienThoai.trim().isEmpty()) {
            sql.append(" AND DienThoai LIKE ?");
            params.add("%" + DienThoai.trim() + "%");
        }

        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return ResponseEntity.ok(result);
    }

    // 2. Thêm khách hàng
    @PostMapping("/addclient")
    public ResponseEntity<?> addClient(@RequestBody KhachHang kh) {
        if (khachHangRepository.existsById(kh.getMaKH())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mã khách hàng đã tồn tại"));
        }
        khachHangRepository.save(kh);
        return ResponseEntity.ok(Map.of("message", "Thêm khách hàng thành công"));
    }

    // 3. Cập nhật khách hàng
    @PutMapping("/updateclient")
    public ResponseEntity<?> updateClient(@RequestBody KhachHang kh) {
        if (kh.getMaKH() == null || !khachHangRepository.existsById(kh.getMaKH())) {
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy khách hàng để cập nhật"));
        }
        khachHangRepository.save(kh);
        return ResponseEntity.ok(Map.of("message", "Cập nhật khách hàng thành công"));
    }

    // 4. Xóa khách hàng (Bảo mật: Check bảng datphong trước khi xóa)
    @DeleteMapping("/deleteclient")
    public ResponseEntity<?> deleteClient(@RequestBody Map<String, String> payload) {
        String maKH = payload.get("MaKH");
        if (maKH == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Thiếu mã khách hàng"));

        // Chặn xóa nếu khách đã có hóa đơn đặt phòng
        Integer checkBooking = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM datphong WHERE MaKH = ?",
                Integer.class, maKH);
        if (checkBooking != null && checkBooking > 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không thể xóa khách hàng đã có đặt phòng"));
        }

        if (!khachHangRepository.existsById(maKH)) {
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy khách hàng để xóa"));
        }

        khachHangRepository.deleteById(maKH);
        return ResponseEntity.ok(Map.of("message", "Xóa khách hàng thành công"));
    }

    // 5. Báo cáo khách hàng (Top 3 Booking)
    @GetMapping("/reportclient")
    public ResponseEntity<?> reportClient() {
        // Lấy tổng số khách hàng
        Integer tongKH = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM khachhang", Integer.class);

        // Lấy Top 3 bằng lệnh JOIN y hệt Node.js
        String sqlTop = "SELECT k.MaKH, k.HoTen, COUNT(d.MaKH) AS SoLanDat " +
                "FROM datphong d JOIN khachhang k ON d.MaKH = k.MaKH " +
                "GROUP BY d.MaKH, k.HoTen, k.MaKH " +
                "ORDER BY SoLanDat DESC LIMIT 3";
        List<Map<String, Object>> topKH = jdbcTemplate.queryForList(sqlTop);

        // Trả về đúng cấu trúc JSON mà React đang chờ đợi
        return ResponseEntity.ok(Map.of(
                "Tổng số khách hàng đã đặt", tongKH != null ? tongKH : 0,
                "Khách hàng đặt nhiều nhất", topKH));
    }
}
