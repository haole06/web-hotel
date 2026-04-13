package com.hotel.backend_java.repository;

import com.hotel.backend_java.entity.SuDungDV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface SuDungDVRepository extends JpaRepository<SuDungDV, Integer> {

    // Ép Java chạy câu lệnh SQL JOIN y hệt Node.js để lấy tên Dịch vụ và tính Thành
    // tiền
    @Query(value = "SELECT s.MaSD as MaSD, s.PhongSo as PhongSo, s.MaDV as MaDV, d.TenDV as TenDV, s.SoLuong as SoLuong, "
            +
            "(s.SoLuong * d.GiaDV) AS ThanhTien, " +
            "DATE_FORMAT(s.NgayNhan, '%Y-%m-%d') AS NgayNhan, " +
            "DATE_FORMAT(s.NgayTra, '%Y-%m-%d') AS NgayTra " +
            "FROM sudungdv s JOIN dichvu d ON s.MaDV = d.MaDV", nativeQuery = true)
    List<Map<String, Object>> layTatCaDichVuDaDung();

    // Tính tổng tiền dịch vụ theo số phòng và khoảng thời gian
    @Query(value = "SELECT SUM(s.SoLuong * d.GiaDV) FROM sudungdv s JOIN dichvu d ON s.MaDV = d.MaDV " +
            "WHERE s.PhongSo = :phongSo AND s.NgayNhan >= :ngayNhan AND s.NgayTra <= :ngayTra", nativeQuery = true)
    Long tinhTongTienDichVu(@Param("phongSo") String phongSo, @Param("ngayNhan") String ngayNhan,
            @Param("ngayTra") String ngayTra);
}