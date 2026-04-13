package com.hotel.backend_java.controller;

import com.hotel.backend_java.entity.Users;
import com.hotel.backend_java.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsersRepository usersRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> payload) {
        System.out.println("===========================================");
        System.out.println("🔍 BƯỚC 1: CÓ NGƯỜI BẤM NÚT ĐĂNG NHẬP TRÊN WEB!");
        System.out.println("📦 Dữ liệu web gửi sang: " + payload);

        // Lấy username từ web gửi lên
        String username = (String) payload.get("username");

        // Tìm user trong MySQL
        Optional<Users> userOpt = usersRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            System.out.println("❌ BƯỚC 2: Thất bại! Không tìm thấy tài khoản: " + username);
            return ResponseEntity.status(401).body(Map.of("error", "Sai tài khoản"));
        }

        Users user = userOpt.get();
        System.out.println(
                "✅ BƯỚC 2: Thành công! Đã tìm thấy tài khoản: " + user.getUsername() + " | Role: " + user.getRole());

        try {
            // Tạo vé JWT giả
            String header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
            String payloadJson = String.format("{\"userId\": %d, \"role\": \"%s\", \"exp\": 1999999999}",
                    user.getUserId(), user.getRole());
            String payloadBase64 = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.getBytes());
            String fakeSignature = "chuKygiaLapCuaSinhVienOOP12345";

            String fakeJwtToken = header + "." + payloadBase64 + "." + fakeSignature;

            System.out.println("🎟️ BƯỚC 3: Đã tạo vé thành công, đang gửi về cho React!");
            System.out.println("===========================================");

            return ResponseEntity.ok(Map.of(
                    "message", "Đăng nhập thành công",
                    "token", fakeJwtToken,
                    "role", user.getRole()));
        } catch (Exception e) {
            System.out.println("🚨 BƯỚC 3 BỊ LỖI: Cú pháp tạo vé bị sập!");
            e.printStackTrace(); // In ra chi tiết lỗi đỏ
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi tạo token"));
        }
    }
}