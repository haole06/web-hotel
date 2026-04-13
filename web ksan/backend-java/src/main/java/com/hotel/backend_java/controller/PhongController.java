package com.hotel.backend_java.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/rooms")
public class PhongController {

    @Autowired
    private JdbcTemplate jdbcTemplate; // 🌟 Dùng 100% vũ khí SQL thuần cho mọi hàm

    // 1. Quản lý danh sách phòng
    @GetMapping("/managementrooms")
    public ResponseEntity<?> layDanhSachPhong(
            @RequestParam(required = false) String LoaiPhong,
            @RequestParam(required = false) String TinhTrang,
            @RequestParam(required = false) String sort) {

        StringBuilder sql = new StringBuilder("SELECT * FROM phong WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if (LoaiPhong != null && !LoaiPhong.isEmpty()) {
            sql.append(" AND LoaiPhong LIKE ?");
            params.add("%" + LoaiPhong + "%");
        }
        if (TinhTrang != null && !TinhTrang.isEmpty()) {
            sql.append(" AND TinhTrang = ?");
            params.add(TinhTrang);
        }
        if (sort != null && (sort.equals("GiaPhong") || sort.equals("LoaiPhong") || sort.equals("TinhTrang"))) {
            sql.append(" ORDER BY ").append(sort);
        }

        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return ResponseEntity.ok(result);
    }

    // 2. Thêm phòng (🌟 Bỏ qua Entity, dùng Map ép nhận diện 100%)
    @PostMapping("/addroom")
    public ResponseEntity<?> themPhong(@RequestBody Map<String, Object> payload) {
        try {
            String phongSo = String.valueOf(payload.get("PhongSo"));
            String loaiPhong = String.valueOf(payload.get("LoaiPhong"));
            String giaPhong = String.valueOf(payload.get("GiaPhong"));
            String tinhTrang = payload.get("TinhTrang") != null ? String.valueOf(payload.get("TinhTrang")) : "trong";

            // Kiểm tra trùng mã
            Integer check = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM phong WHERE PhongSo = ?", Integer.class,
                    phongSo);
            if (check != null && check > 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Số phòng đã tồn tại"));
            }

            // Insert thẳng vào DB
            jdbcTemplate.update("INSERT INTO phong (PhongSo, LoaiPhong, GiaPhong, TinhTrang) VALUES (?, ?, ?, ?)",
                    phongSo, loaiPhong, Double.parseDouble(giaPhong), tinhTrang);

            return ResponseEntity.ok(Map.of("message", "Thêm phòng thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // 3. Cập nhật phòng (🌟 Dùng Map)
    @PutMapping("/updateroom")
    public ResponseEntity<?> capNhatPhong(@RequestBody Map<String, Object> payload) {
        if (payload.get("PhongSo") == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Thiếu mã số phòng"));
        }

        String phongSo = String.valueOf(payload.get("PhongSo"));
        String loaiPhong = String.valueOf(payload.get("LoaiPhong"));
        String giaPhong = String.valueOf(payload.get("GiaPhong"));
        String tinhTrang = String.valueOf(payload.get("TinhTrang"));

        int updated = jdbcTemplate.update(
                "UPDATE phong SET LoaiPhong = ?, GiaPhong = ?, TinhTrang = ? WHERE PhongSo = ?",
                loaiPhong, Double.parseDouble(giaPhong), tinhTrang, phongSo);

        if (updated == 0) {
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy phòng để cập nhật"));
        }

        return ResponseEntity.ok(Map.of("message", "Cập nhật phòng thành công"));
    }

    // 4. Xóa phòng
    @DeleteMapping("/deleteroom")
    public ResponseEntity<?> xoaPhong(@RequestBody Map<String, String> payload) {
        String phongSo = payload.get("PhongSo");
        if (phongSo == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Thiếu mã phòng"));

        Integer checkBooking = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM datphong WHERE PhongSo = ? AND TinhTrang = 'dadat'", Integer.class, phongSo);
        if (checkBooking != null && checkBooking > 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không thể xóa phòng đã được đặt"));
        }

        int deleted = jdbcTemplate.update("DELETE FROM phong WHERE PhongSo = ?", phongSo);
        if (deleted == 0)
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy phòng để xóa"));

        return ResponseEntity.ok(Map.of("message", "Xóa phòng thành công"));
    }

    // 5. Đổi trạng thái
    @PutMapping("/statusroom")
    public ResponseEntity<?> doiTrangThai(@RequestBody Map<String, String> payload) {
        String phongSo = payload.get("PhongSo");
        String tinhTrang = payload.get("TinhTrang");

        if (phongSo == null || tinhTrang == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Thiếu thông tin PhongSo hoặc TinhTrang"));
        }

        int updated = jdbcTemplate.update("UPDATE phong SET TinhTrang = ? WHERE PhongSo = ?", tinhTrang, phongSo);
        if (updated == 0)
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy phòng để cập nhật"));

        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công"));
    }

    // 6. Báo cáo
    @GetMapping("/reportroom")
    public ResponseEntity<?> baoCaoPhong() {
        List<Map<String, Object>> soLuongTheoTT = jdbcTemplate
                .queryForList("SELECT TinhTrang, COUNT(*) AS TongSo FROM phong GROUP BY TinhTrang");
        List<Map<String, Object>> doanhThuTheoLoai = jdbcTemplate.queryForList(
                "SELECT p.LoaiPhong, SUM(h.TongTien) AS TongDoanhThu FROM hoadon h JOIN phong p ON h.PhongSo = p.PhongSo GROUP BY p.LoaiPhong");
        Integer phongSuDung = jdbcTemplate.queryForObject(
                "SELECT COUNT(DISTINCT PhongSo) FROM datphong WHERE TinhTrang = 'dadat'", Integer.class);
        Integer tongPhong = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM phong", Integer.class);

        String tyLeLapDay = "0%";
        if (tongPhong != null && tongPhong > 0) {
            double phanTram = (double) (phongSuDung != null ? phongSuDung : 0) / tongPhong * 100;
            tyLeLapDay = String.format("%.2f%%", phanTram);
        }

        return ResponseEntity.ok(Map.of(
                "Số lượng phòng theo tình trạng", soLuongTheoTT,
                "Doanh thu theo loại phòng", doanhThuTheoLoai,
                "Tỷ lệ lấp đầy", tyLeLapDay));
    }
}