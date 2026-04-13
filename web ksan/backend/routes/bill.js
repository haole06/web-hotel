const express = require("express");
const pool = require("../database");
const router = express.Router();

////// Helper: tính số ngày giữa 2 ngày
const calcDays = (start, end) => {
  if (!start || !end) return 0;
  const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
  return diff > 0 ? diff : 0;
};

////// Helper: kiểm tra phòng có booking hợp lệ
const checkBookingValid = async (PhongSo, NgayNhan, NgayTra) => {
  const [booking] = await pool.query(
    `SELECT * FROM datphong 
     WHERE PhongSo = ? 
       AND TinhTrang != 'huy'
       AND NgayNhan <= ? 
       AND NgayTra >= ?`,
    [PhongSo, NgayTra, NgayNhan]
  );
  return booking.length > 0;
};

////// 1. Quản lý danh sách hóa đơn
router.get("/managementbill", async (req, res) => {
  try {
    let sql = `
      SELECT h.*, p.GiaPhong
      FROM hoadon h
      JOIN phong p ON h.PhongSo = p.PhongSo
      WHERE 1=1
    `;
    const params = [];

    if (req.query.PhongSo) {
      sql += " AND h.PhongSo LIKE ?";
      params.push(`%${req.query.PhongSo}%`);
    }
    if (req.query.PhuongThucTT) {
      sql += " AND h.PhuongThucTT = ?";
      params.push(req.query.PhuongThucTT);
    }

    const [rows] = await pool.query(sql, params);

    const result = rows.map((r) => {
      const soNgay = calcDays(r.NgayNhan, r.NgayTra);
      return {
        ...r,
        GiaPhong: Number(r.GiaPhong),
        SoNgay: soNgay,
        TongDV: Number(r.TongDV),
        TongTien: Number(r.TongTien),
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

////// 2. Xem tất cả hóa đơn + dịch vụ kèm theo
router.get("/allbills", async (req, res) => {
  try {
    const [bills] = await pool.query(`
      SELECT h.*, p.GiaPhong
      FROM hoadon h
      JOIN phong p ON h.PhongSo = p.PhongSo
      ORDER BY h.NgayNhan DESC
    `);

    const billsWithServices = await Promise.all(
      bills.map(async (b) => {
        const [services] = await pool.query(
          `SELECT s.MaDV, d.TenDV, d.GiaDV, s.SoLuong, (s.SoLuong * d.GiaDV) AS ThanhTien
           FROM sudungdv s
           JOIN dichvu d ON s.MaDV = d.MaDV
           WHERE s.PhongSo = ?
             AND s.NgayNhan <= ? 
             AND s.NgayTra >= ?`,
          [b.PhongSo, b.NgayTra, b.NgayNhan]
        );

        const soNgay = calcDays(b.NgayNhan, b.NgayTra);

        return {
          ...b,
          GiaPhong: Number(b.GiaPhong),
          Services: services.map(s => ({
            ...s,
            GiaDV: Number(s.GiaDV),
            ThanhTien: Number(s.ThanhTien)
          })),
          TongDV: Number(b.TongDV),
          SoNgay: soNgay,
          TongTien: Number(b.TongTien),
        };
      })
    );

    res.json(billsWithServices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

////// 3. Thêm hóa đơn mới
router.post("/addbill", async (req, res) => {
  try {
    const { MaHD, PhongSo, NgayNhan, NgayTra, PhuongThucTT } = req.body;

    if (!MaHD || !PhongSo || !NgayNhan || !NgayTra || !PhuongThucTT) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    const start = new Date(NgayNhan);
    const end = new Date(NgayTra);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Ngày nhận hoặc ngày trả không hợp lệ" });
    }
    if (end <= start) {
      return res.status(400).json({ error: "Ngày trả phải sau ngày nhận" });
    }

    const [check] = await pool.query("SELECT * FROM hoadon WHERE MaHD = ?", [MaHD]);
    if (check.length > 0) return res.status(400).json({ error: "Mã hóa đơn đã tồn tại" });

    const [room] = await pool.query("SELECT GiaPhong FROM phong WHERE PhongSo = ?", [PhongSo]);
    if (room.length === 0) return res.status(404).json({ error: "Không tìm thấy phòng" });

    const hasBooking = await checkBookingValid(PhongSo, NgayNhan, NgayTra);
    if (!hasBooking) {
      return res.status(400).json({ error: "Phòng này chưa được đặt trong khoảng thời gian trên" });
    }

    const GiaPhong = Number(room[0].GiaPhong);
    const soNgay = calcDays(NgayNhan, NgayTra);

    const [dv] = await pool.query(
      `SELECT SUM(s.SoLuong * d.GiaDV) as TongDV
       FROM sudungdv s
       JOIN dichvu d ON s.MaDV = d.MaDV
       WHERE s.PhongSo = ? 
         AND s.NgayNhan <= ? 
         AND s.NgayTra >= ?`,
      [PhongSo, NgayTra, NgayNhan]
    );

    const TongDV = Number(dv[0].TongDV || 0);
    const TongTien = GiaPhong * soNgay + TongDV;

    await pool.query(
      "INSERT INTO hoadon (MaHD, PhongSo, NgayNhan, NgayTra, PhuongThucTT, TongDV, TongTien) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [MaHD, PhongSo, NgayNhan, NgayTra, PhuongThucTT, TongDV, TongTien]
    );

    res.json({ message: "Thêm hóa đơn thành công", SoNgay: soNgay, TongDV, TongTien });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

////// 4. Cập nhật hóa đơn
router.put("/updatebill", async (req, res) => {
  try {
    const { MaHD, PhongSo, NgayNhan, NgayTra, PhuongThucTT } = req.body;

    if (!MaHD || !PhongSo || !NgayNhan || !NgayTra || !PhuongThucTT) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    const start = new Date(NgayNhan);
    const end = new Date(NgayTra);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Ngày nhận hoặc ngày trả không hợp lệ" });
    }
    if (end <= start) {
      return res.status(400).json({ error: "Ngày trả phải sau ngày nhận" });
    }

    const [exist] = await pool.query("SELECT * FROM hoadon WHERE MaHD = ?", [MaHD]);
    if (exist.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy hóa đơn để cập nhật" });
    }

    const [room] = await pool.query("SELECT GiaPhong FROM phong WHERE PhongSo = ?", [PhongSo]);
    if (room.length === 0) return res.status(404).json({ error: "Không tìm thấy phòng" });

    const hasBooking = await checkBookingValid(PhongSo, NgayNhan, NgayTra);
    if (!hasBooking) {
      return res.status(400).json({ error: "Phòng này chưa được đặt trong khoảng thời gian trên" });
    }

    const GiaPhong = Number(room[0].GiaPhong);
    const soNgay = calcDays(NgayNhan, NgayTra);

    const [dv] = await pool.query(
      `SELECT SUM(s.SoLuong * d.GiaDV) as TongDV
       FROM sudungdv s
       JOIN dichvu d ON s.MaDV = d.MaDV
       WHERE s.PhongSo = ? 
         AND s.NgayNhan <= ? 
         AND s.NgayTra >= ?`,
      [PhongSo, NgayTra, NgayNhan]
    );

    const TongDV = Number(dv[0].TongDV || 0);
    const TongTien = GiaPhong * soNgay + TongDV;

    await pool.query(
      "UPDATE hoadon SET PhongSo = ?, NgayNhan = ?, NgayTra = ?, PhuongThucTT = ?, TongDV = ?, TongTien = ? WHERE MaHD = ?",
      [PhongSo, NgayNhan, NgayTra, PhuongThucTT, TongDV, TongTien, MaHD]
    );

    res.json({ message: "Cập nhật hóa đơn thành công", SoNgay: soNgay, TongDV, TongTien });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

////// 5. Xóa hóa đơn
router.delete("/deletebill", async (req, res) => {
  try {
    const { MaHD } = req.body;
    if (!MaHD) return res.status(400).json({ error: "Thiếu mã hóa đơn (MaHD)" });

    const [result] = await pool.query("DELETE FROM hoadon WHERE MaHD = ?", [MaHD]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Không tìm thấy hóa đơn để xóa" });

    res.json({ message: "Xóa hóa đơn thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

////// ✅ 6. Báo cáo hóa đơn (hiển thị có dấu chấm ngăn cách)
router.get("/reportbill", async (req, res) => {
  try {
    // 🔹 Hàm định dạng số có dấu chấm, không có ký hiệu tiền
    const formatNumber = (num) => Number(num || 0).toLocaleString("de-DE");

    const [bills] = await pool.query("SELECT * FROM hoadon");
    if (!bills.length) {
      return res.json({
        "Tổng số hóa đơn": 0,
        "Tổng doanh thu": "0",
        "Doanh thu theo phương thức": { tienMat: "0", chuyenKhoan: "0" },
        "Hóa đơn cao nhất": {},
      });
    }

    const tongSoHD = bills.length;
    const tongDoanhThu = bills.reduce((sum, b) => sum + Number(b.TongTien || 0), 0);
    const tienMat = bills
      .filter((b) => b.PhuongThucTT === "Tiền mặt")
      .reduce((sum, b) => sum + Number(b.TongTien || 0), 0);
    const chuyenKhoan = bills
      .filter((b) => b.PhuongThucTT === "Chuyển khoản")
      .reduce((sum, b) => sum + Number(b.TongTien || 0), 0);
    const hoaDonMax = bills.reduce(
      (max, b) => (Number(b.TongTien) > Number(max.TongTien || 0) ? b : max),
      {}
    );

    res.json({
      "Tổng số hóa đơn": tongSoHD,
      "Tổng doanh thu": formatNumber(tongDoanhThu),
      "Doanh thu theo phương thức": {
        tienMat: formatNumber(tienMat),
        chuyenKhoan: formatNumber(chuyenKhoan),
      },
      "Hóa đơn cao nhất": {
        MaHD: hoaDonMax.MaHD,
        TongTien: formatNumber(hoaDonMax.TongTien),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


////// 7. Lấy giá phòng
router.get("/getRoomPrice/:PhongSo", async (req, res) => {
  try {
    const { PhongSo } = req.params;
    const [rows] = await pool.query("SELECT GiaPhong FROM phong WHERE PhongSo = ?", [PhongSo]);
    if (rows.length === 0) return res.status(404).json({ error: "Không tìm thấy phòng" });
    res.json({ GiaPhong: Number(rows[0].GiaPhong) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
