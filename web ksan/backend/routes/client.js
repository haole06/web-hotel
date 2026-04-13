const express = require("express");
const pool = require("../database"); // kết nối MySQL
const router = express.Router();

//////// 1. Quản lý danh sách khách hàng
router.get("/managementclients", async (req, res) => {
  try {
    let sql = "SELECT * FROM khachhang WHERE 1=1";
    const params = [];

    if (req.query.MaKH) {
      sql += " AND MaKH = ?";
      params.push(req.query.MaKH.trim());
    }

    if (req.query.CMND) {
      sql += " AND CMND LIKE ?";
      params.push(`%${req.query.CMND.trim()}%`);
    }

    if (req.query.HoTen) {
      sql += " AND HoTen LIKE ?";
      params.push(`%${req.query.HoTen.trim()}%`);
    }

    if (req.query.DienThoai) {
      sql += " AND DienThoai LIKE ?";
      params.push(`%${req.query.DienThoai.trim()}%`);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/////// 2. Thêm khách hàng mới
router.post("/addclient", async (req, res) => {
  try {
    const { MaKH, HoTen, CMND, DienThoai } = req.body;

    const [check] = await pool.query("SELECT * FROM khachhang WHERE MaKH = ?", [MaKH]);
    if (check.length > 0) {
      return res.status(400).json({ error: "Mã khách hàng đã tồn tại" });
    }

    await pool.query(
      "INSERT INTO khachhang (MaKH, HoTen, CMND, DienThoai) VALUES (?, ?, ?, ?)",
      [MaKH, HoTen, CMND, DienThoai]
    );

    res.json({ message: "Thêm khách hàng thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 3. Cập nhật thông tin khách hàng
router.put("/updateclient", async (req, res) => {
  try {
    const { MaKH, HoTen, CMND, DienThoai } = req.body;

    if (!MaKH) {
      return res.status(400).json({ error: "Thiếu mã khách hàng (MaKH)" });
    }

    const [result] = await pool.query(
      "UPDATE khachhang SET HoTen=?, CMND=?, DienThoai=? WHERE MaKH=?",
      [HoTen, CMND, DienThoai, MaKH]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy khách hàng để cập nhật" });
    }

    res.json({ message: "Cập nhật khách hàng thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 4. Xóa khách hàng
router.delete("/deleteclient", async (req, res) => {
  try {
    const { MaKH } = req.body;

    if (!MaKH) {
      return res.status(400).json({ error: "Thiếu mã khách hàng (MaKH)" });
    }

    const [check] = await pool.query("SELECT * FROM datphong WHERE MaKH = ?", [MaKH]);
    if (check.length > 0) {
      return res.status(400).json({ error: "Không thể xóa khách hàng đã có đặt phòng" });
    }

    const [result] = await pool.query("DELETE FROM khachhang WHERE MaKH = ?", [MaKH]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy khách hàng để xóa" });
    }

    res.json({ message: "Xóa khách hàng thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 5. Báo cáo khách hàng
router.get("/reportclient", async (req, res) => {
  try {
    // 1. Tổng số khách hàng
    const [TongKH] = await pool.query("SELECT COUNT(*) AS SoLuongKH FROM khachhang");

    // 2. Top 3 khách hàng có nhiều booking nhất
    const [TopKH] = await pool.query(
      `SELECT k.MaKH, k.HoTen, COUNT(d.MaKH) AS SoLanDat
       FROM datphong d
       JOIN khachhang k ON d.MaKH = k.MaKH
       GROUP BY d.MaKH, k.HoTen, k.MaKH
       ORDER BY SoLanDat DESC
       LIMIT 3`
    );

    // ✅ Gửi toàn bộ mảng TopKH cho frontend
    res.json({
      "Tổng số khách hàng đã đặt": TongKH[0]?.SoLuongKH || 0,
      "Khách hàng đặt nhiều nhất": TopKH.length > 0 ? TopKH : [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
