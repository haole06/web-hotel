package com.hotel.backend_java.controller;

import com.hotel.backend_java.entity.SuDungDV;
import com.hotel.backend_java.repository.DichVuRepository;
import com.hotel.backend_java.repository.PhongRepository;
import com.hotel.backend_java.repository.SuDungDVRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/usedservice") // 👈 Kiểm tra lại Network trên React xem có phải chữ này không nhé (hoặc
                                    // /api/usedservices)
public class SuDungDVController {

    @Autowired
    private SuDungDVRepository suDungDVRepository;

    @Autowired
    private PhongRepository phongRepository;

    @Autowired
    private DichVuRepository dichVuRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate; // Dùng để bắn SQL thuần y hệt pool.query của Node.js

    // 1. Xem tất cả dịch vụ đã dùng
    @GetMapping("/all")
    public ResponseEntity<?> layTatCa() {
        return ResponseEntity.ok(suDungDVRepository.layTatCaDichVuDaDung());
    }

    // 2. Thêm dịch vụ
    @PostMapping("/addusedservice")
    public ResponseEntity<?> themDichVu(@RequestBody SuDungDV sd) {
        if (sd.getNgayTra().isBefore(sd.getNgayNhan())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ngày trả phải lớn hơn hoặc bằng ngày nhận"));
        }

        if (!phongRepository.existsById(sd.getPhongSo())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phòng không tồn tại"));
        }

        if (!dichVuRepository.existsById(sd.getMaDV())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Dịch vụ không tồn tại"));
        }

        // Kiểm tra bảng datphong bằng SQL thuần
        String sqlCheck = "SELECT COUNT(*) FROM datphong WHERE PhongSo=? AND NgayNhan<=? AND NgayTra>=?";
        Integer count = jdbcTemplate.queryForObject(sqlCheck, Integer.class, sd.getPhongSo(), sd.getNgayNhan(),
                sd.getNgayTra());

        if (count != null && count == 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ngày dịch vụ không nằm trong khoảng đặt phòng"));
        }

        suDungDVRepository.save(sd);
        return ResponseEntity.ok(Map.of("message", "Thêm dịch vụ sử dụng thành công"));
    }

    // 3. Cập nhật dịch vụ
    @PutMapping("/updateusedservice")
    public ResponseEntity<?> capNhatDichVu(@RequestBody SuDungDV sd) {
        if (sd.getMaSD() == null || !suDungDVRepository.existsById(sd.getMaSD())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không tìm thấy dịch vụ để cập nhật"));
        }
        suDungDVRepository.save(sd);
        return ResponseEntity.ok(Map.of("message", "Cập nhật dịch vụ thành công"));
    }

    // 4. Xóa dịch vụ
    @DeleteMapping("/deleteusedservice")
    public ResponseEntity<?> xoaDichVu(@RequestBody Map<String, Integer> payload) {
        Integer maSD = payload.get("MaSD");
        if (maSD == null || !suDungDVRepository.existsById(maSD)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không tìm thấy dịch vụ để xóa"));
        }
        suDungDVRepository.deleteById(maSD);
        return ResponseEntity.ok(Map.of("message", "Xóa dịch vụ thành công"));
    }

    // 5. Tổng tiền dịch vụ
    @GetMapping("/total")
    public ResponseEntity<?> tongTien(@RequestParam String PhongSo, @RequestParam String NgayNhan,
            @RequestParam String NgayTra) {
        Long tongTien = suDungDVRepository.tinhTongTienDichVu(PhongSo, NgayNhan, NgayTra);
        return ResponseEntity.ok(Map.of(
                "PhongSo", PhongSo,
                "TongTien", tongTien != null ? tongTien : 0));
    }
}