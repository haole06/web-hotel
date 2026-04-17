package com.hotel.backend_java.controller;

import com.hotel.backend_java.entity.DichVu;
import com.hotel.backend_java.repository.DichVuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/service") // 💡 Chú ý: Nếu React báo lỗi 404, bạn thử thêm chữ 's' thành "/api/services"
                                // nhé!
public class DichVuController {

    @Autowired
    private DichVuRepository dichVuRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 1. Quản lý danh sách dịch vụ
    @GetMapping("/managementservices")
    public List<DichVu> layDanhSachDichVu() {
        return dichVuRepository.findAll();
    }

    // 2. Thêm dịch vụ mới
    @PostMapping("/addservice")
    public ResponseEntity<?> themDichVu(@RequestBody DichVu dichVu) {
        if (dichVuRepository.existsById(dichVu.getMaDV())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mã dịch vụ đã tồn tại"));
        }
        DichVu savedDichVu = dichVuRepository.save(dichVu);
        return ResponseEntity.ok(savedDichVu); // Node.js cũ trả về chính object vừa tạo
    }

    // 3. Cập nhật dịch vụ
    @PutMapping("/updateservice")
    public ResponseEntity<?> capNhatDichVu(@RequestBody DichVu dichVu) {
        if (dichVu.getMaDV() == null || !dichVuRepository.existsById(dichVu.getMaDV())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không tìm thấy dịch vụ để cập nhật"));
        }
        DichVu updatedDichVu = dichVuRepository.save(dichVu);
        return ResponseEntity.ok(updatedDichVu);
    }

    // 4. Xóa dịch vụ
    @DeleteMapping("/deleteservice")
    public ResponseEntity<?> xoaDichVu(@RequestBody Map<String, String> payload) {
        String maDV = payload.get("MaDV");
        if (maDV == null || !dichVuRepository.existsById(maDV)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không tìm thấy dịch vụ để xóa"));
        }
        dichVuRepository.deleteById(maDV);
        return ResponseEntity.ok(Map.of("MaDV", maDV, "message", "Xóa dịch vụ thành công"));
    }

    // 5. Báo cáo dịch vụ (Tạm thời trả về dữ liệu ảo chờ xây xong bảng sudungdv)
    @GetMapping("/reportservice")
    public ResponseEntity<?> report() {
        // Lấy tổng số lượng dịch vụ đang có trong menu
        Long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM dichvu", Long.class);
        if (total == null)
            total = 0L;

        // Dịch vụ dùng NHIỀU nhất (Giống hệt SQL của Node.js: MaDV, TenDV, TongSD)
        String sqlMax = "SELECT dv.MaDV, dv.TenDV, SUM(sd.SoLuong) AS TongSD " +
                "FROM dichvu dv JOIN sudungdv sd ON dv.MaDV = sd.MaDV " +
                "GROUP BY dv.MaDV, dv.TenDV " +
                "ORDER BY TongSD DESC LIMIT 1";
        List<Map<String, Object>> maxList = jdbcTemplate.queryForList(sqlMax);
        Object maxDV = maxList.isEmpty() ? "Chưa có dữ liệu" : maxList.get(0);

        // Dịch vụ dùng ÍT nhất
        String sqlMin = "SELECT dv.MaDV, dv.TenDV, SUM(sd.SoLuong) AS TongSD " +
                "FROM dichvu dv JOIN sudungdv sd ON dv.MaDV = sd.MaDV " +
                "GROUP BY dv.MaDV, dv.TenDV " +
                "ORDER BY TongSD ASC LIMIT 1";
        List<Map<String, Object>> minList = jdbcTemplate.queryForList(sqlMin);
        Object minDV = minList.isEmpty() ? "Chưa có dữ liệu" : minList.get(0);

        return ResponseEntity.ok(Map.of(
                "Tổng số dịch vụ", total,
                "Dịch vụ dùng nhiều nhất", maxDV,
                "Dịch vụ dùng ít nhất", minDV));
    }
}