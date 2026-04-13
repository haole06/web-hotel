const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../database"); // ⚡ bạn đổi thành ../db nếu file bạn đặt tên là db.js
const router = express.Router();

// ---------------- REGISTER ----------------
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: "Thiếu thông tin" });
    }

    // Mã hóa mật khẩu
    const hash = await bcrypt.hash(password, 10);

    // Thêm user vào DB
    await pool.query(
      "INSERT INTO users (Username, PasswordHash, Role) VALUES (?, ?, ?)",
      [username, hash, role]
    );

    res.json({ message: "Tạo tài khoản thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Thiếu username hoặc password" });
    }

    // Lấy user từ DB
    const [rows] = await pool.query("SELECT * FROM users WHERE Username = ?", [username]);
    if (rows.length === 0) return res.status(401).json({ error: "Sai tài khoản" });

    const user = rows[0];

    // So sánh mật khẩu
    const valid = await bcrypt.compare(password, user.PasswordHash);
    if (!valid) return res.status(401).json({ error: "Sai mật khẩu" });

    // Sinh token
    const token = jwt.sign(
      { userId: user.UserID, role: user.Role },
      process.env.JWT_SECRET || "secret_key", // ⚠️ nhớ đặt biến môi trường
      { expiresIn: "2h" }
    );

    res.json({ message: "Đăng nhập thành công", token, role: user.Role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// Middleware xác thực token
function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Chưa đăng nhập" });

  jwt.verify(token, process.env.JWT_SECRET || "secret_key", (err, user) => {
    if (err) return res.status(403).json({ error: "Token không hợp lệ" });
    req.user = user; // user = { userId, role }
    next();
  });
}

// Middleware phân quyền
function authorize(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Không có quyền truy cập" });
    }
    next();
  };
}

module.exports = { router, authenticate, authorize };