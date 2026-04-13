package com.hotel.backend_java.controller;

import com.hotel.backend_java.entity.DatPhong;
import com.hotel.backend_java.entity.DatPhongId;
import com.hotel.backend_java.repository.DatPhongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/booking") // 👈 Nhớ đường dẫn này, nếu 404 thì check lại tab Network
public class DatPhongController {

    @Autowired
    private DatPhongRepository datPhongRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 1. Lấy tất cả
    @GetMapping("/allbooking")
    public ResponseEntity<?> layTatCaBooking() {
        return ResponseEntity.ok(datPhongRepository.layTatCaDatPhong());
    }

    // 2. Thêm đặt phòng
    @PostMapping("/addbooking")
    public ResponseEntity<?> themDatPhong(@RequestBody DatPhong dp) {
        if (dp.getNgayTra().isBefore(dp.getNgayNhan())) {
            return ResponseEntity.badRequest().body(Map.of("error", "NgayTra phải lớn hơn hoặc bằng NgayNhan"));
        }

        if (dp.getTinhTrang() == null || dp.getTinhTrang().isEmpty()) {
            dp.setTinhTrang("dadat");
        }

        // Kiểm tra phòng
        Integer pCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM phong WHERE PhongSo = ?", Integer.class,
                dp.getPhongSo());
        if (pCount == null || pCount == 0)
            return ResponseEntity.badRequest().body(Map.of("error", "Phòng không tồn tại"));

        // Kiểm tra khách
        Integer kCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM khachhang WHERE MaKH = ?", Integer.class,
                dp.getMaKH());
        if (kCount == null || kCount == 0)
            return ResponseEntity.badRequest().body(Map.of("error", "Khách hàng không tồn tại"));

        // Kiểm tra trùng lặp
        String overlapSql = "SELECT COUNT(*) FROM datphong WHERE PhongSo = ? AND TinhTrang != 'huy' AND (? < NgayTra AND ? > NgayNhan)";
        Integer overlap = jdbcTemplate.queryForObject(overlapSql, Integer.class, dp.getPhongSo(), dp.getNgayNhan(),
                dp.getNgayTra());
        if (overlap != null && overlap > 0)
            return ResponseEntity.badRequest().body(Map.of("error", "Phòng đã được đặt trùng ngày"));

        datPhongRepository.save(dp);
        return ResponseEntity.ok(Map.of("message", "Đặt phòng thành công", "PhongSo", dp.getPhongSo(), "NgayDat",
                dp.getNgayDat(), "TinhTrang", dp.getTinhTrang()));
    }

    // 3. Cập nhật đặt phòng
    @PutMapping("/updatebooking")
    public ResponseEntity<?> capNhatDatPhong(@RequestBody DatPhong dp) {
        DatPhongId id = new DatPhongId(dp.getPhongSo(), dp.getNgayDat());
        if (!datPhongRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy đặt phòng"));
        }
        datPhongRepository.save(dp); // Java tự hiểu update đè lên khóa kép
        return ResponseEntity.ok(Map.of("message", "Cập nhật đặt phòng thành công"));
    }

    // 4. Xóa đặt phòng
    @DeleteMapping("/deletebooking")
    public ResponseEntity<?> xoaDatPhong(@RequestBody Map<String, String> payload) {
        String phongSo = payload.get("PhongSo");
        String ngayDatStr = payload.get("NgayDat");

        if (phongSo == null || ngayDatStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Thiếu định danh (PhongSo và NgayDat)"));
        }

        DatPhongId id = new DatPhongId(phongSo, LocalDate.parse(ngayDatStr));
        if (!datPhongRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy đặt phòng"));
        }

        datPhongRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Hủy đặt phòng thành công"));
    }

    // 5. Xem trạng thái
    @GetMapping("/statusbooking")
    public ResponseEntity<?> xemTrangThai(@RequestParam String PhongSo, @RequestParam(required = false) String MaKH,
            @RequestParam(required = false) String NgayDat) {
        Optional<Map<String, Object>> result;
        if (MaKH != null && NgayDat != null) {
            result = datPhongRepository.timKiemTrangThai(PhongSo, MaKH, NgayDat);
        } else {
            result = datPhongRepository.layDatPhongMoiNhatCuaPhong(PhongSo);
        }

        if (result.isEmpty())
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy đặt phòng"));
        return ResponseEntity.ok(result.get());
    }
}