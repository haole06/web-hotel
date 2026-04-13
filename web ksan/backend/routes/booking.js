const express = require("express");
const pool = require("../database"); // kết nối MySQL
const router = express.Router();

// chỉ cho phép 2 trạng thái này
const VALID_STATUS = ["trong", "dadat"];

//////// 1. Thêm đặt phòng
router.post("/addbooking", async (req, res) => {
  try {
    const { PhongSo, MaKH, NgayDat, NgayNhan, NgayTra, SoNguoi, TinhTrang } = req.body;

    if (!PhongSo || !MaKH || !NgayDat || !NgayNhan || !NgayTra) {
      return res.status(400).json({ error: "Thiếu dữ liệu bắt buộc (PhongSo, MaKH, NgayDat, NgayNhan, NgayTra)" });
    }

    const status = (TinhTrang || "dadat").toLowerCase(); // mặc định khi thêm là "dadat"
    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({ error: `TinhTrang không hợp lệ. Chỉ cho phép: ${VALID_STATUS.join(", ")}` });
    }

    // kiểm tra phòng tồn tại
    const [p] = await pool.query("SELECT * FROM phong WHERE PhongSo = ?", [PhongSo]);
    if (p.length === 0) return res.status(400).json({ error: "Phòng không tồn tại" });

    // kiểm tra khách hàng tồn tại
    const [k] = await pool.query("SELECT * FROM khachhang WHERE MaKH = ?", [MaKH]);
    if (k.length === 0) return res.status(400).json({ error: "Khách hàng không tồn tại" });

    // logic ngày
    if (new Date(NgayTra) < new Date(NgayNhan)) {
      return res.status(400).json({ error: "NgayTra phải lớn hơn hoặc bằng NgayNhan" });
    }

    // kiểm tra phòng đã được đặt trong khoảng thời gian này chưa
    const [overlap] = await pool.query(
      `SELECT COUNT(*) AS count 
      FROM datphong 
      WHERE PhongSo = ? AND TinhTrang != 'huy' 
      AND (? < NgayTra AND ? > NgayNhan)`,
      [PhongSo, NgayNhan, NgayTra]
    );

    if (overlap[0].count > 0) {
      return res.status(400).json({ error: "Phòng đã được đặt trùng ngày" });
    }

    // insert booking
    await pool.query(
      "INSERT INTO datphong (PhongSo, MaKH, NgayDat, NgayNhan, NgayTra, SoNguoi, TinhTrang) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [PhongSo, MaKH, NgayDat, NgayNhan, NgayTra, SoNguoi || null, status]
    );

    res.json({ message: "Đặt phòng thành công", PhongSo, NgayDat, TinhTrang: status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 2. Cập nhật đặt phòng
router.put("/updatebooking", async (req, res) => {
  try {
    const { PhongSo, NgayDat, NgayNhan, NgayTra, SoNguoi, TinhTrang } = req.body;

    if (!PhongSo || !NgayDat) {
      return res.status(400).json({ error: "Thiếu định danh đặt phòng (PhongSo và NgayDat)" });
    }

    // kiểm tra tồn tại
    const [exists] = await pool.query("SELECT * FROM datphong WHERE PhongSo=? AND NgayDat=?", [PhongSo, NgayDat]);
    if (exists.length === 0) return res.status(404).json({ error: "Không tìm thấy đặt phòng" });

    if (TinhTrang && !VALID_STATUS.includes(TinhTrang.toLowerCase())) {
      return res.status(400).json({ error: `TinhTrang không hợp lệ. Chỉ cho phép: ${VALID_STATUS.join(", ")}` });
    }

    if (NgayNhan && NgayTra && new Date(NgayTra) < new Date(NgayNhan)) {
      return res.status(400).json({ error: "NgayTra phải >= NgayNhan" });
    }

    const fields = [];
    const params = [];
    if (NgayNhan) { fields.push("NgayNhan=?"); params.push(NgayNhan); }
    if (NgayTra) { fields.push("NgayTra=?"); params.push(NgayTra); }
    if (SoNguoi !== undefined) { fields.push("SoNguoi=?"); params.push(SoNguoi); }
    if (TinhTrang) { fields.push("TinhTrang=?"); params.push(TinhTrang.toLowerCase()); }

    if (fields.length === 0) return res.status(400).json({ error: "Không có dữ liệu để cập nhật" });

    const sql = `UPDATE datphong SET ${fields.join(", ")} WHERE PhongSo=? AND NgayDat=?`;
    params.push(PhongSo, NgayDat);

    await pool.query(sql, params);
    res.json({ message: "Cập nhật đặt phòng thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 3. Hủy đặt phòng
router.delete("/deletebooking", async (req, res) => {
  try {
    const { PhongSo, NgayDat } = req.body;

    if (!PhongSo || !NgayDat) {
      return res.status(400).json({ error: "Thiếu định danh (PhongSo và NgayDat)" });
    }

    const [result] = await pool.query("DELETE FROM datphong WHERE PhongSo=? AND NgayDat=?", [PhongSo, NgayDat]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Không tìm thấy đặt phòng" });

    res.json({ message: "Hủy đặt phòng thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 4. Xem trạng thái đặt phòng
router.get("/statusbooking", async (req, res) => {
  try {
    const { PhongSo, MaKH, NgayDat } = req.query;
    if (!PhongSo) return res.status(400).json({ error: "Thiếu PhongSo" });

    let sql, params;
    if (MaKH && NgayDat) {
      sql = `SELECT PhongSo, MaKH,
                DATE_FORMAT(NgayDat, '%Y-%m-%d') AS NgayDat,
                DATE_FORMAT(NgayNhan, '%Y-%m-%d') AS NgayNhan,
                DATE_FORMAT(NgayTra, '%Y-%m-%d') AS NgayTra,
                SoNguoi, TinhTrang
             FROM datphong
             WHERE PhongSo=? AND MaKH=? AND NgayDat=?`;
      params = [PhongSo, MaKH, NgayDat];
    } else {
      // nếu chỉ có PhongSo, lấy booking mới nhất
      sql = `SELECT PhongSo, MaKH,
                DATE_FORMAT(NgayDat, '%Y-%m-%d') AS NgayDat,
                DATE_FORMAT(NgayNhan, '%Y-%m-%d') AS NgayNhan,
                DATE_FORMAT(NgayTra, '%Y-%m-%d') AS NgayTra,
                SoNguoi, TinhTrang
             FROM datphong
             WHERE PhongSo=? 
             ORDER BY NgayDat DESC 
             LIMIT 1`;
      params = [PhongSo];
    }

    const [rows] = await pool.query(sql, params);
    if (rows.length === 0) return res.status(404).json({ error: "Không tìm thấy đặt phòng" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 5. Lấy tất cả booking
router.get("/allbooking", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT PhongSo, MaKH,
              DATE_FORMAT(NgayDat, '%Y-%m-%d') AS NgayDat,
              DATE_FORMAT(NgayNhan, '%Y-%m-%d') AS NgayNhan,
              DATE_FORMAT(NgayTra, '%Y-%m-%d') AS NgayTra,
              SoNguoi, TinhTrang
       FROM datphong
       ORDER BY NgayDat DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
