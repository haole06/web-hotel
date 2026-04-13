package com.hotel.backend_java.repository;

import com.hotel.backend_java.entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, String> {
    // Chỉ cần kế thừa JpaRepository, Java sẽ tự động "đẻ" ra các hàm lấy danh sách,
    // thêm, sửa, xóa!
}