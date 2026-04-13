package com.hotel.backend_java.repository;

import com.hotel.backend_java.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, String> {

    // Lấy danh sách hóa đơn kèm giá phòng để tính toán trên React
    @Query(value = "SELECT h.*, p.GiaPhong FROM hoadon h JOIN phong p ON h.PhongSo = p.PhongSo", nativeQuery = true)
    List<Map<String, Object>> layDanhSachHoaDonKemGiaPhong();

    // Tính tổng tiền dịch vụ trong khoảng thời gian khách ở
    @Query(value = "SELECT SUM(s.SoLuong * d.GiaDV) FROM sudungdv s " +
            "JOIN dichvu d ON s.MaDV = d.MaDV " +
            "WHERE s.PhongSo = :phongSo AND s.NgayNhan <= :ngayTra AND s.NgayTra >= :ngayNhan", nativeQuery = true)
    Double tinhTongTienDichVu(@Param("phongSo") String phongSo, @Param("ngayNhan") String ngayNhan,
            @Param("ngayTra") String ngayTra);

    // Thống kê doanh thu theo phương thức thanh toán
    @Query(value = "SELECT PhuongThucTT, SUM(TongTien) as DoanhThu FROM hoadon GROUP BY PhuongThucTT", nativeQuery = true)
    List<Map<String, Object>> thongKeDoanhThuTheoPTTT();
}