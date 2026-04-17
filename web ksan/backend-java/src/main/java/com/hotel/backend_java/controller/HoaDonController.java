package com.hotel.backend_java.controller;

import com.hotel.backend_java.entity.HoaDon;
import com.hotel.backend_java.repository.HoaDonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/bill") // 💡 CHÚ Ý: Nếu lát nữa web vẫn báo lỗi, bạn sửa dòng này thành "/api/bills"
                             // (thêm chữ s) nhé!
public class HoaDonController {

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 1. Quản lý danh sách
    @GetMapping("/managementbill")
    public List<Map<String, Object>> getAll() {
        return hoaDonRepository.layDanhSachHoaDonKemGiaPhong();
    }

    // 🌟 BỔ SUNG 1: Trả nợ API lấy tất cả hóa đơn + dịch vụ cho React
    @GetMapping("/allbills")
    public ResponseEntity<?> getAllBillsWithServices() {
        List<Map<String, Object>> bills = hoaDonRepository.layDanhSachHoaDonKemGiaPhong();
        List<Map<String, Object>> result = new java.util.ArrayList<>();

        for (Map<String, Object> b : bills) {
            java.util.Map<String, Object> billMap = new java.util.HashMap<>(b);
            String phongSo = (String) b.get("PhongSo");
            String ngayNhan = b.get("NgayNhan").toString();
            String ngayTra = b.get("NgayTra").toString();

            // Tìm các dịch vụ dùng trong hóa đơn này
            String sqlServices = "SELECT s.MaDV, d.TenDV, d.GiaDV, s.SoLuong, (s.SoLuong * d.GiaDV) AS ThanhTien " +
                    "FROM sudungdv s JOIN dichvu d ON s.MaDV = d.MaDV " +
                    "WHERE s.PhongSo = ? AND s.NgayNhan <= ? AND s.NgayTra >= ?";
            List<Map<String, Object>> services = jdbcTemplate.queryForList(sqlServices, phongSo, ngayTra, ngayNhan);
            billMap.put("Services", services);
            result.add(billMap);
        }
        return ResponseEntity.ok(result);
    }

    // 🌟 BỔ SUNG 2: Trả nợ API lấy giá phòng để React tính toán
    @GetMapping("/getRoomPrice/{PhongSo}")
    public ResponseEntity<?> getRoomPrice(@PathVariable String PhongSo) {
        try {
            Double giaPhong = jdbcTemplate.queryForObject("SELECT GiaPhong FROM phong WHERE PhongSo = ?", Double.class,
                    PhongSo);
            return ResponseEntity.ok(Map.of("GiaPhong", giaPhong));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy phòng"));
        }
    }

    // 3. Thêm hóa đơn
    @PostMapping("/addbill")
    public ResponseEntity<?> addBill(@RequestBody HoaDon hd) {
        long soNgay = ChronoUnit.DAYS.between(hd.getNgayNhan(), hd.getNgayTra());
        if (soNgay <= 0)
            return ResponseEntity.badRequest().body(Map.of("error", "Ngày trả phải sau ngày nhận"));

        String sqlCheck = "SELECT COUNT(*) FROM datphong WHERE PhongSo=? AND TinhTrang != 'huy' AND NgayNhan <= ? AND NgayTra >= ?";
        Integer hasBooking = jdbcTemplate.queryForObject(sqlCheck, Integer.class, hd.getPhongSo(), hd.getNgayTra(),
                hd.getNgayNhan());
        if (hasBooking == null || hasBooking == 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phòng chưa được đặt trong khoảng thời gian này"));
        }

        Double giaPhong = jdbcTemplate.queryForObject("SELECT GiaPhong FROM phong WHERE PhongSo=?", Double.class,
                hd.getPhongSo());
        Double tongDV = hoaDonRepository.tinhTongTienDichVu(hd.getPhongSo(), hd.getNgayNhan().toString(),
                hd.getNgayTra().toString());
        if (tongDV == null)
            tongDV = 0.0;

        hd.setTongDV(tongDV);
        hd.setTongTien((giaPhong * soNgay) + tongDV);

        hoaDonRepository.save(hd);
        return ResponseEntity.ok(Map.of("message", "Thêm hóa đơn thành công", "TongTien", hd.getTongTien()));
    }

    // 4. Cập nhật hóa đơn
    @PutMapping("/updatebill")
    public ResponseEntity<?> updateBill(@RequestBody HoaDon hd) {
        if (!hoaDonRepository.existsById(hd.getMaHD())) {
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy hóa đơn"));
        }
        long soNgay = ChronoUnit.DAYS.between(hd.getNgayNhan(), hd.getNgayTra());
        Double giaPhong = jdbcTemplate.queryForObject("SELECT GiaPhong FROM phong WHERE PhongSo=?", Double.class,
                hd.getPhongSo());
        Double tongDV = hoaDonRepository.tinhTongTienDichVu(hd.getPhongSo(), hd.getNgayNhan().toString(),
                hd.getNgayTra().toString());
        if (tongDV == null)
            tongDV = 0.0;

        hd.setTongDV(tongDV);
        hd.setTongTien((giaPhong * soNgay) + tongDV);
        hoaDonRepository.save(hd);
        return ResponseEntity.ok(Map.of("message", "Cập nhật thành công"));
    }

    // 5. Xóa hóa đơn
    @DeleteMapping("/deletebill")
    public ResponseEntity<?> deleteBill(@RequestBody Map<String, String> payload) {
        String maHD = payload.get("MaHD");
        if (maHD == null || !hoaDonRepository.existsById(maHD)) {
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy hóa đơn"));
        }
        hoaDonRepository.deleteById(maHD);
        return ResponseEntity.ok(Map.of("message", "Xóa hóa đơn thành công"));
    }

    // 6. Báo cáo
    @GetMapping("/reportbill")
    public ResponseEntity<?> report() {
        long tongSoHD = hoaDonRepository.count();

        // Tính tổng doanh thu toàn bộ
        Double tongDoanhThuNum = jdbcTemplate.queryForObject("SELECT SUM(TongTien) FROM hoadon", Double.class);
        if (tongDoanhThuNum == null)
            tongDoanhThuNum = 0.0;

        // Tính chi tiết theo phương thức
        Double tienMatNum = jdbcTemplate
                .queryForObject("SELECT SUM(TongTien) FROM hoadon WHERE PhuongThucTT = 'Tiền mặt'", Double.class);
        Double chuyenKhoanNum = jdbcTemplate
                .queryForObject("SELECT SUM(TongTien) FROM hoadon WHERE PhuongThucTT = 'Chuyển khoản'", Double.class);

        // Tìm hóa đơn lớn nhất
        List<Map<String, Object>> maxHDList = jdbcTemplate
                .queryForList("SELECT MaHD, TongTien FROM hoadon ORDER BY TongTien DESC LIMIT 1");

        // --- BẮT ĐẦU ĐỊNH DẠNG SỐ SANG CHUỖI CÓ DẤU CHẤM ---
        java.text.DecimalFormat df = new java.text.DecimalFormat("#,###"); // Định dạng số 1000 -> 1.000
        df.setDecimalFormatSymbols(new java.text.DecimalFormatSymbols(java.util.Locale.GERMAN)); // Dùng chuẩn Đức để
                                                                                                 // xài dấu chấm phân
                                                                                                 // cách

        String tongDoanhThu = df.format(tongDoanhThuNum);
        String tienMat = df.format(tienMatNum != null ? tienMatNum : 0);
        String chuyenKhoan = df.format(chuyenKhoanNum != null ? chuyenKhoanNum : 0);

        Map<String, Object> hoaDonMax = new java.util.HashMap<>();
        if (!maxHDList.isEmpty()) {
            hoaDonMax.put("MaHD", maxHDList.get(0).get("MaHD"));
            hoaDonMax.put("TongTien", df.format(maxHDList.get(0).get("TongTien")));
        }
        // ----------------------------------------------------

        // Gửi trả đúng y chang format của Node.js
        return ResponseEntity.ok(Map.of(
                "Tổng số hóa đơn", tongSoHD,
                "Tổng doanh thu", tongDoanhThu, // Đã biến thành chữ có dấu chấm!
                "Doanh thu theo phương thức", Map.of(
                        "tienMat", tienMat,
                        "chuyenKhoan", chuyenKhoan),
                "Hóa đơn cao nhất", hoaDonMax));
    }
}