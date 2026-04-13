const express = require("express");
const pool = require("../database"); // file database.js kết nối MySQL
const router = express.Router();

//////// 1. Quản lý danh sách dịch vụ
router.get("/managementservices", async (req, res) => {
  try {
    let sql = "SELECT * FROM dichvu WHERE 1=1";
    const params = [];

    if (req.query.MaDV) {
      sql += " AND MaDV = ?";
      params.push(req.query.MaDV);
    }

    if (req.query.TenDV) {
      sql += " AND TenDV LIKE ?";
      params.push(`%${req.query.TenDV}%`);
    }

    if (req.query.GiaDV) {
      sql += " AND GiaDV = ?";
      params.push(req.query.GiaDV);
    }

    if (req.query.sort) {
      const allowedSort = ["GiaDV", "TenDV"];
      if (allowedSort.includes(req.query.sort)) {
        sql += ` ORDER BY ${req.query.sort}`;
      }
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 2. Thêm dịch vụ mới
router.post("/addservice", async (req, res) => {
  try {
    const { MaDV, TenDV, GiaDV } = req.body;

    const [check] = await pool.query("SELECT * FROM dichvu WHERE MaDV = ?", [MaDV]);
    if (check.length > 0) {
      return res.status(400).json({ error: "Mã dịch vụ đã tồn tại" });
    }

    await pool.query(
      "INSERT INTO dichvu (MaDV, TenDV, GiaDV) VALUES (?, ?, ?)",
      [MaDV, TenDV, GiaDV]
    );

    // Trả về toàn bộ dịch vụ vừa thêm
    const [newService] = await pool.query("SELECT * FROM dichvu WHERE MaDV = ?", [MaDV]);
    res.json(newService[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 3. Cập nhật dịch vụ
router.put("/updateservice", async (req, res) => {
  try {
    const { MaDV, TenDV, GiaDV } = req.body;

    if (!MaDV) {
      return res.status(400).json({ error: "Thiếu mã dịch vụ (MaDV)" });
    }

    const [result] = await pool.query(
      "UPDATE dichvu SET TenDV = ?, GiaDV = ? WHERE MaDV = ?",
      [TenDV, GiaDV, MaDV]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy dịch vụ để cập nhật" });
    }

    // Trả về dịch vụ vừa cập nhật
    const [updatedService] = await pool.query("SELECT * FROM dichvu WHERE MaDV = ?", [MaDV]);
    res.json(updatedService[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 4. Xóa dịch vụ
router.delete("/deleteservice", async (req, res) => {
  try {
    const { MaDV } = req.body;

    if (!MaDV) {
      return res.status(400).json({ error: "Thiếu mã dịch vụ (MaDV)" });
    }

    const [result] = await pool.query("DELETE FROM dichvu WHERE MaDV = ?", [MaDV]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy dịch vụ để xóa" });
    }

    res.json({ MaDV, message: "Xóa dịch vụ thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 5. Báo cáo dịch vụ
router.get("/reportservice", async (req, res) => {
  try {
    const [total] = await pool.query("SELECT COUNT(*) AS TotalService FROM dichvu");

    const [mostUsed] = await pool.query(`
      SELECT dv.MaDV, dv.TenDV, SUM(sd.SoLuong) AS TongSD
      FROM dichvu dv
      JOIN sudungdv sd ON dv.MaDV = sd.MaDV
      GROUP BY dv.MaDV, dv.TenDV
      ORDER BY TongSD DESC
      LIMIT 1
    `);

    const [leastUsed] = await pool.query(`
      SELECT dv.MaDV, dv.TenDV, SUM(sd.SoLuong) AS TongSD
      FROM dichvu dv
      JOIN sudungdv sd ON dv.MaDV = sd.MaDV
      GROUP BY dv.MaDV, dv.TenDV
      ORDER BY TongSD ASC
      LIMIT 1
    `);

    res.json({
      "Tổng số dịch vụ": total[0].TotalService,
      "Dịch vụ dùng nhiều nhất": mostUsed[0] || "Chưa có dữ liệu",
      "Dịch vụ dùng ít nhất": leastUsed[0] || "Chưa có dữ liệu"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
