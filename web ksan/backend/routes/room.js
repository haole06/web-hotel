const express = require("express");
const cors = require("cors");
const pool = require("../database"); // file database.js kết nối MySQL

const router = express.Router();

////////1. Quản lý danh sách phòng
router.get("/managementrooms", async (req, res) => {
  try {
    let sql = "SELECT * FROM phong WHERE 1=1";
    const params = [];

    // lọc theo loại phòng
   if (req.query.LoaiPhong) {
     sql += " AND LoaiPhong LIKE ?";
     params.push(`%${req.query.LoaiPhong}%`);
   }

    // lọc theo tình trạng
    if (req.query.TinhTrang) {
      sql += " AND TinhTrang = ?";
      params.push(req.query.TinhTrang);
    }

    // sắp xếp
    if (req.query.sort) {
      const allowedSort = ["GiaPhong", "LoaiPhong", "TinhTrang"];
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


//////** 2. Thêm phòng mới
router.post("/addroom", async (req, res) => {
  try {
    const { PhongSo, LoaiPhong, GiaPhong, TinhTrang } = req.body;

    const [check] = await pool.query("SELECT * FROM phong WHERE PhongSo = ?", [PhongSo]);
    if (check.length > 0) {
      return res.status(400).json({ error: "Số phòng đã tồn tại" });
    }

    await pool.query(
      "INSERT INTO phong (PhongSo, LoaiPhong, GiaPhong, TinhTrang) VALUES (?, ?, ?, ?)",
      [PhongSo, LoaiPhong, GiaPhong, TinhTrang || "trong"]
    );

    res.json({ message: "Thêm phòng thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


///////////// 3. Cập nhật thông tin phòng 
router.put("/updateroom", async (req, res) => {
  try {
    const { PhongSo, LoaiPhong, GiaPhong, TinhTrang } = req.body;

    if (!PhongSo) {
      return res.status(400).json({ error: "Thiếu mã số phòng (PhongSo)" });
    }

    const [result] = await pool.query(
      "UPDATE phong SET LoaiPhong = ?, GiaPhong = ?, TinhTrang = ? WHERE PhongSo = ?",
      [LoaiPhong, GiaPhong, TinhTrang, PhongSo]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy phòng để cập nhật" });
    }

    res.json({ message: "Cập nhật phòng thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//////////// 4. Xóa phòng
router.delete("/deleteroom", async (req, res) => {
  try {
    const { PhongSo } = req.body;

    if (!PhongSo) {
      return res.status(400).json({ error: "Thiếu mã phòng (PhongSo)" });
    }

    // kiểm tra phòng có booking chưa checkout
    const [check] = await pool.query(
      "SELECT * FROM datphong WHERE PhongSo = ? AND TinhTrang IN ('dadat')",
      [PhongSo]
    );
    if (check.length > 0) {
      return res.status(400).json({ error: "Không thể xóa phòng đã được đặt" });
    }

    const [result] = await pool.query("DELETE FROM phong WHERE PhongSo = ?", [PhongSo]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy phòng để xóa" });
    }

    res.json({ message: "Xóa phòng thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



///////////// 5. Quản lý tình trạng phòng
router.put("/statusroom", async (req, res) => {
  try {
    const { PhongSo, TinhTrang } = req.body; // ví dụ: "dadat", "trong"

    if (!PhongSo || !TinhTrang) {
      return res.status(400).json({ error: "Thiếu thông tin PhongSo hoặc TinhTrang" });
    }

    const [result] = await pool.query(
      "UPDATE phong SET TinhTrang = ? WHERE PhongSo = ?",
      [TinhTrang, PhongSo]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy phòng để cập nhật" });
    }

    res.json({ message: "Cập nhật trạng thái phòng thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// 6. Báo cáo phòng
router.get("/reportroom", async (req, res) => {
  try {
    // 1. Số lượng phòng theo tình trạng
    const [SoLuongPhongTheoTT] = await pool.query(
      "SELECT TinhTrang, COUNT(*) AS TongSo FROM phong GROUP BY TinhTrang"
    );

    // 2. Doanh thu theo loại phòng
    const [DoanhThuPhong] = await pool.query(
      `SELECT p.LoaiPhong, SUM(h.TongTien) AS TongDoanhThu
       FROM hoadon h
       JOIN phong p ON h.PhongSo = p.PhongSo
       GROUP BY p.LoaiPhong`
    );

    // 3. Tỷ lệ lấp đầy phòng
    const [PhongSuDung] = await pool.query(
      "SELECT COUNT(DISTINCT PhongSo) AS SoPhongSuDung FROM datphong WHERE TinhTrang = 'dadat'"
    );
    const [TongPhong] = await pool.query(
      "SELECT COUNT(*) AS TongSoPhong FROM phong"
    );

    const TyLeLapDay =
      TongPhong[0].TongSoPhong > 0
        ? ((PhongSuDung[0].SoPhongSuDung / TongPhong[0].TongSoPhong) * 100).toFixed(2) + "%"
        : "0%";

    res.json({
      "Số lượng phòng theo tình trạng": SoLuongPhongTheoTT,
      "Doanh thu theo loại phòng": DoanhThuPhong,
      "Tỷ lệ lấp đầy": TyLeLapDay
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;
