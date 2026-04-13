package com.hotel.backend_java.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/report") // 💡 Chú ý: Nếu lát nữa vẫn lỗi, bạn thử thêm chữ 's' thành "/api/reports" nhé
public class ReportController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 1. Báo cáo doanh thu theo tháng và năm
    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenue() {
        // Query doanh thu theo tháng
        String sqlMonthly = "SELECT YEAR(NgayNhan) AS Nam, MONTH(NgayNhan) AS Thang, SUM(TongTien) AS DoanhThu " +
                "FROM hoadon " +
                "GROUP BY YEAR(NgayNhan), MONTH(NgayNhan) " +
                "ORDER BY YEAR(NgayNhan), MONTH(NgayNhan)";

        // Query doanh thu theo năm
        String sqlYearly = "SELECT YEAR(NgayNhan) AS Nam, SUM(TongTien) AS DoanhThu " +
                "FROM hoadon " +
                "GROUP BY YEAR(NgayNhan) " +
                "ORDER BY YEAR(NgayNhan)";

        List<Map<String, Object>> monthly = jdbcTemplate.queryForList(sqlMonthly);
        List<Map<String, Object>> yearly = jdbcTemplate.queryForList(sqlYearly);

        return ResponseEntity.ok(Map.of("monthly", monthly, "yearly", yearly));
    }

    // 2. Top khách hàng (Tính theo số tiền chi tiêu)
    @GetMapping("/topcustomer")
    public ResponseEntity<?> getTopCustomer() {
        String sql = "SELECT kh.MaKH, kh.HoTen, COUNT(dp.PhongSo) AS SoLanDat, SUM(h.TongTien) AS TongChiTieu " +
                "FROM datphong dp " +
                "JOIN khachhang kh ON dp.MaKH = kh.MaKH " +
                "LEFT JOIN hoadon h ON dp.PhongSo = h.PhongSo AND dp.NgayNhan = h.NgayNhan " +
                "WHERE dp.TinhTrang = 'dadat' " +
                "GROUP BY kh.MaKH, kh.HoTen " +
                "ORDER BY TongChiTieu DESC " +
                "LIMIT 5";

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(rows);
    }

    // 3. Công suất phòng (Top 5 phòng được thuê nhiều nhất)
    @GetMapping("/roomusage")
    public ResponseEntity<?> getRoomUsage() {
        String sql = "SELECT PhongSo, COUNT(*) AS SoLanThue " +
                "FROM datphong " +
                "WHERE TinhTrang = 'dadat' " +
                "GROUP BY PhongSo " +
                "ORDER BY SoLanThue DESC " +
                "LIMIT 5";

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(rows);
    }
}