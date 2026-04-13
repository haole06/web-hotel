const express = require("express");
const pool = require("../database");
const router = express.Router();

// Hàm helper ép ngày về string 'YYYY-MM-DD'
const formatDate = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

//////// 1. Thêm dịch vụ khách đã dùng
router.post("/addusedservice", async (req, res) => {
  try {
    let { PhongSo, MaDV, SoLuong, NgayNhan, NgayTra } = req.body;
    if (!PhongSo || !MaDV || !SoLuong || !NgayNhan || !NgayTra) {
      return res.status(400).json({ error: "Thiếu dữ liệu bắt buộc" });
    }

    NgayNhan = formatDate(NgayNhan);
    NgayTra = formatDate(NgayTra);

    if (new Date(NgayTra) < new Date(NgayNhan)) {
      return res.status(400).json({ error: "Ngày trả phải lớn hơn hoặc bằng ngày nhận" });
    }

    // Kiểm tra phòng
    const [checkPhong] = await pool.query("SELECT * FROM phong WHERE PhongSo=?", [PhongSo]);
    if (checkPhong.length === 0) return res.status(400).json({ error: "Phòng không tồn tại" });

    // Kiểm tra dịch vụ
    const [checkDV] = await pool.query("SELECT * FROM dichvu WHERE MaDV=?", [MaDV]);
    if (checkDV.length === 0) return res.status(400).json({ error: "Dịch vụ không tồn tại" });

    // Kiểm tra ngày dịch vụ nằm trong khoảng booking
    const [booking] = await pool.query(
      "SELECT * FROM datphong WHERE PhongSo=? AND NgayNhan<=? AND NgayTra>=?",
      [PhongSo, NgayNhan, NgayTra]
    );
    if (booking.length === 0) {
      return res.status(400).json({ error: "Ngày dịch vụ không nằm trong khoảng đặt phòng" });
    }

    // Thêm dịch vụ
    await pool.query(
      "INSERT INTO sudungdv (PhongSo, MaDV, SoLuong, NgayNhan, NgayTra) VALUES (?, ?, ?, ?, ?)",
      [PhongSo, MaDV, SoLuong, NgayNhan, NgayTra]
    );

    res.json({ message: "Thêm dịch vụ sử dụng thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 2. Sửa số lượng/dữ liệu dịch vụ
router.put("/updateusedservice", async (req, res) => {
  try {
    let { MaSD, SoLuong, NgayNhan, NgayTra } = req.body;
    if (!MaSD) return res.status(400).json({ error: "Thiếu mã sử dụng dịch vụ (MaSD)" });

    if (NgayNhan) NgayNhan = formatDate(NgayNhan);
    if (NgayTra) NgayTra = formatDate(NgayTra);

    if (NgayNhan && NgayTra && new Date(NgayTra) < new Date(NgayNhan)) {
      return res.status(400).json({ error: "Ngày trả phải lớn hơn hoặc bằng ngày nhận" });
    }

    // Lấy PhongSo của dịch vụ đang update
    const [existing] = await pool.query("SELECT PhongSo FROM sudungdv WHERE MaSD=?", [MaSD]);
    if (existing.length === 0) return res.status(404).json({ error: "Không tìm thấy dịch vụ để cập nhật" });
    const PhongSo = existing[0].PhongSo;

    // Kiểm tra ngày mới có hợp lệ với booking
    if (NgayNhan && NgayTra) {
      const [booking] = await pool.query(
        "SELECT * FROM datphong WHERE PhongSo=? AND NgayNhan<=? AND NgayTra>=?",
        [PhongSo, NgayNhan, NgayTra]
      );
      if (booking.length === 0) {
        return res.status(400).json({ error: "Ngày dịch vụ không nằm trong khoảng đặt phòng" });
      }
    }

    await pool.query(
      "UPDATE sudungdv SET SoLuong=?, NgayNhan=?, NgayTra=? WHERE MaSD=?",
      [SoLuong, NgayNhan, NgayTra, MaSD]
    );

    res.json({ message: "Cập nhật dịch vụ thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 3. Xóa dịch vụ đã dùng
router.delete("/deleteusedservice", async (req, res) => {
  try {
    const { MaSD } = req.body;
    if (!MaSD) return res.status(400).json({ error: "Thiếu mã sử dụng dịch vụ (MaSD)" });

    const [result] = await pool.query("DELETE FROM sudungdv WHERE MaSD=?", [MaSD]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Không tìm thấy dịch vụ để xóa" });

    res.json({ message: "Xóa dịch vụ thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 4. Xem tất cả dịch vụ đã dùng
router.get("/all", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.MaSD, s.PhongSo, s.MaDV, d.TenDV, s.SoLuong, 
             (s.SoLuong * d.GiaDV) AS ThanhTien,
             DATE_FORMAT(s.NgayNhan, '%Y-%m-%d') AS NgayNhan,
             DATE_FORMAT(s.NgayTra, '%Y-%m-%d') AS NgayTra
      FROM sudungdv s
      JOIN dichvu d ON s.MaDV = d.MaDV
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 5. Tổng tiền dịch vụ theo phòng trong khoảng ngày
router.get("/total", async (req, res) => {
  try {
    const { PhongSo, NgayNhan, NgayTra } = req.query;
    if (!PhongSo || !NgayNhan || !NgayTra) {
      return res.status(400).json({ error: "Cần truyền PhongSo, NgayNhan và NgayTra" });
    }

    const [rows] = await pool.query(
      `SELECT SUM(s.SoLuong * d.GiaDV) AS TongTien
       FROM sudungdv s
       JOIN dichvu d ON s.MaDV = d.MaDV
       WHERE s.PhongSo = ?
         AND s.NgayNhan >= ?
         AND s.NgayTra <= ?`,
      [PhongSo, formatDate(NgayNhan), formatDate(NgayTra)]
    );

    res.json({ PhongSo, TongTien: rows[0]?.TongTien || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
