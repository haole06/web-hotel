const express = require("express");
const pool = require("../database"); 
const router = express.Router();

////// Helper: tính số ngày giữa 2 ngày
const calcDays = (start, end) => {
  if (!start || !end) return 0;
  const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
  return diff > 0 ? diff : 0;
};

//////// 1. Báo cáo doanh thu theo tháng và năm
router.get("/revenue", async (req, res) => {
  try {
    // Doanh thu theo tháng
    const [monthly] = await pool.query(`
      SELECT 
        YEAR(NgayNhan) AS Nam,
        MONTH(NgayNhan) AS Thang,
        SUM(TongTien) AS DoanhThu
      FROM hoadon
      GROUP BY YEAR(NgayNhan), MONTH(NgayNhan)
      ORDER BY YEAR(NgayNhan), MONTH(NgayNhan)
    `);

    // Doanh thu theo năm
    const [yearly] = await pool.query(`
      SELECT 
        YEAR(NgayNhan) AS Nam,
        SUM(TongTien) AS DoanhThu
      FROM hoadon
      GROUP BY YEAR(NgayNhan)
      ORDER BY YEAR(NgayNhan)
    `);

    res.json({ monthly, yearly });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 2. Top khách hàng (từ datphong + hoadon)
router.get("/topcustomer", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        kh.MaKH, kh.HoTen,
        COUNT(dp.PhongSo) AS SoLanDat,
        SUM(h.TongTien) AS TongChiTieu
      FROM datphong dp
      JOIN khachhang kh ON dp.MaKH = kh.MaKH
      LEFT JOIN hoadon h 
        ON dp.PhongSo = h.PhongSo 
       AND dp.NgayNhan = h.NgayNhan
      WHERE dp.TinhTrang = 'dadat'
      GROUP BY kh.MaKH, kh.HoTen
      ORDER BY TongChiTieu DESC
      LIMIT 5
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////// 3. Công suất phòng (số lần thuê từng phòng)
router.get("/roomusage", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT PhongSo, COUNT(*) AS SoLanThue
      FROM datphong
      WHERE TinhTrang = 'dadat'
      GROUP BY PhongSo
      ORDER BY SoLanThue DESC
      LIMIT 5
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

