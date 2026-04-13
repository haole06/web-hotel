package com.hotel.backend_java.repository;

import com.hotel.backend_java.entity.Phong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhongRepository extends JpaRepository<Phong, String> {
    // Để trống thế này thôi, Spring Boot sẽ tự động viết sẵn lệnh SELECT, INSERT,
    // DELETE cho mình!
}