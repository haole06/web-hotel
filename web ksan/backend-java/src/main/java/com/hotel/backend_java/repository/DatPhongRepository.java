package com.hotel.backend_java.repository;

import com.hotel.backend_java.entity.DatPhong;
import com.hotel.backend_java.entity.DatPhongId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface DatPhongRepository extends JpaRepository<DatPhong, DatPhongId> { // Truyền DatPhongId vào đây

    // Ép trả ngày về chuẩn String YYYY-MM-DD cho React dễ đọc
    @Query(value = "SELECT PhongSo, MaKH, DATE_FORMAT(NgayDat, '%Y-%m-%d') AS NgayDat, " +
            "DATE_FORMAT(NgayNhan, '%Y-%m-%d') AS NgayNhan, DATE_FORMAT(NgayTra, '%Y-%m-%d') AS NgayTra, " +
            "SoNguoi, TinhTrang FROM datphong ORDER BY NgayDat DESC", nativeQuery = true)
    List<Map<String, Object>> layTatCaDatPhong();

    // Tìm kiếm trạng thái theo PhongSo, MaKH và NgayDat
    @Query(value = "SELECT PhongSo, MaKH, DATE_FORMAT(NgayDat, '%Y-%m-%d') AS NgayDat, " +
            "DATE_FORMAT(NgayNhan, '%Y-%m-%d') AS NgayNhan, DATE_FORMAT(NgayTra, '%Y-%m-%d') AS NgayTra, " +
            "SoNguoi, TinhTrang FROM datphong WHERE PhongSo=:phongSo AND MaKH=:maKH AND NgayDat=:ngayDat", nativeQuery = true)
    Optional<Map<String, Object>> timKiemTrangThai(@Param("phongSo") String phongSo, @Param("maKH") String maKH,
            @Param("ngayDat") String ngayDat);

    // Lấy booking mới nhất của 1 phòng
    @Query(value = "SELECT PhongSo, MaKH, DATE_FORMAT(NgayDat, '%Y-%m-%d') AS NgayDat, " +
            "DATE_FORMAT(NgayNhan, '%Y-%m-%d') AS NgayNhan, DATE_FORMAT(NgayTra, '%Y-%m-%d') AS NgayTra, " +
            "SoNguoi, TinhTrang FROM datphong WHERE PhongSo=:phongSo ORDER BY NgayDat DESC LIMIT 1", nativeQuery = true)
    Optional<Map<String, Object>> layDatPhongMoiNhatCuaPhong(@Param("phongSo") String phongSo);
}