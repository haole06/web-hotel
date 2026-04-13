package com.hotel.backend_java.repository;

import com.hotel.backend_java.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {
    // Viết thêm 1 dòng này để bảo Java: "Hãy tìm User theo cột Username cho tôi"
    Optional<Users> findByUsername(String username);
}