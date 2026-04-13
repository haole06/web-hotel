import React, { useState, useEffect } from "react";
import axios from "axios";

const Bill = () => {
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({
    MaHD: "",
    PhongSo: "",
    NgayNhan: "",
    NgayTra: "",
    PhuongThucTT: "",
  });
  const [report, setReport] = useState(null);

  const apiBase = "http://localhost:5000/api/bill";

  // Lấy tất cả hóa đơn
  const fetchAllBills = async () => {
    try {
      const res = await axios.get(`${apiBase}/allbills`);
      setBills(res.data);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    fetchAllBills();
  }, []);

  // Format ngày dd/mm/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  // Format tiền
  const formatMoney = (num) => {
    return Number(num || 0).toLocaleString("vi-VN");
  };

  // Chuyển ngày sang dạng input yyyy-MM-dd
  const toInputDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toISOString().split("T")[0];
  };

  // Hàm sửa (setForm với ngày đúng format)
  const handleEdit = (bill) => {
    setForm({
      ...bill,
      NgayNhan: toInputDate(bill.NgayNhan),
      NgayTra: toInputDate(bill.NgayTra),
    });
  };

  // Thêm/cập nhật hóa đơn
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const exists = bills.find((b) => b.MaHD === form.MaHD);
      if (exists) {
        await axios.put(`${apiBase}/updatebill`, form);
        alert("💾 Cập nhật hóa đơn thành công");
      } else {
        await axios.post(`${apiBase}/addbill`, form);
        alert("➕ Thêm hóa đơn thành công");
      }

      setForm({
        MaHD: "",
        PhongSo: "",
        NgayNhan: "",
        NgayTra: "",
        PhuongThucTT: "",
      });
      fetchAllBills();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  // Xóa hóa đơn
  const handleDelete = async (MaHD) => {
    if (!window.confirm("❓ Bạn có chắc muốn xóa hóa đơn này?")) return;
    try {
      await axios.delete(`${apiBase}/deletebill`, { data: { MaHD } });
      alert("🗑 Xóa hóa đơn thành công");
      fetchAllBills();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  // Báo cáo
  const fetchReport = async () => {
    try {
      const res = await axios.get(`${apiBase}/reportbill`);
      setReport(res.data);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">📑 Quản lý hóa đơn</h1>

      {/* Form thêm/sửa hóa đơn */}
      <form className="mb-4 space-y-2 p-4 border rounded-xl shadow bg-white" onSubmit={handleSubmit}>
        <input
          placeholder="Mã HD"
          value={form.MaHD}
          onChange={(e) => setForm({ ...form, MaHD: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <input
          placeholder="Phòng số"
          value={form.PhongSo}
          onChange={(e) => setForm({ ...form, PhongSo: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <input
          type="date"
          value={form.NgayNhan}
          onChange={(e) => setForm({ ...form, NgayNhan: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <input
          type="date"
          value={form.NgayTra}
          onChange={(e) => setForm({ ...form, NgayTra: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <select
          value={form.PhuongThucTT}
          onChange={(e) => setForm({ ...form, PhuongThucTT: e.target.value })}
          className="border p-2 w-full rounded"
        >
          <option value="">Phương thức thanh toán</option>
          <option value="Tiền mặt">Tiền mặt</option>
          <option value="Chuyển khoản">Chuyển khoản</option>
        </select>

        <button
          type="submit"
          className={`px-4 py-2 rounded text-white ${bills.find((b) => b.MaHD === form.MaHD) ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}`}
        >
          {bills.find((b) => b.MaHD === form.MaHD) ? "💾 Cập nhật" : "➕ Thêm hóa đơn"}
        </button>
      </form>

      {/* Danh sách hóa đơn */}
      <table className="border w-full text-left mb-4 shadow rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-blue-100 text-blue-800">
            <th className="border px-2 py-1">Mã HD</th>
            <th className="border px-2 py-1">Phòng số</th>
            <th className="border px-2 py-1">Ngày nhận</th>
            <th className="border px-2 py-1">Ngày trả</th>
            <th className="border px-2 py-1">Giá phòng</th>
            <th className="border px-2 py-1">Tổng DV</th>
            <th className="border px-2 py-1">Tổng tiền</th>
            <th className="border px-2 py-1">Phương thức TT</th>
            <th className="border px-2 py-1">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b, idx) => (
            <tr
              key={b.MaHD}
              className={idx % 2 === 0 ? "bg-white hover:bg-gray-100" : "bg-gray-50 hover:bg-gray-100"}
            >
              <td className="border px-2 py-1 text-center">{b.MaHD}</td>
              <td className="border px-2 py-1 text-center">{b.PhongSo}</td>
              <td className="border px-2 py-1 text-center">{formatDate(b.NgayNhan)}</td>
              <td className="border px-2 py-1 text-center">{formatDate(b.NgayTra)}</td>
              <td className="border px-2 py-1 text-right">{formatMoney(b.GiaPhong)}</td>
              <td className="border px-2 py-1 text-right">{formatMoney(b.TongDV)}</td>
              <td className="border px-2 py-1 text-right font-bold text-blue-600">{formatMoney(b.TongTien)}</td>
              <td className="border px-2 py-1 text-center">{b.PhuongThucTT}</td>
              <td className="border px-2 py-1 flex justify-center gap-2">
                <button
                  onClick={() => handleEdit(b)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  ✏️ Sửa
                </button>
                <div className="border-l h-6 mx-1"></div>
                <button
                  onClick={() => handleDelete(b.MaHD)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  🗑 Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Báo cáo */}
{/* Báo cáo */}
<div className="mt-6">
  <button
    onClick={fetchReport}
    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded mb-2 flex items-center gap-1 shadow"
  >
    📊 Xem báo cáo hóa đơn
  </button>

  {report && (
    <div className="bg-gray-50 p-4 rounded-lg shadow mt-3 space-y-3">
      {/* Tổng số hóa đơn */}
      <div>
        <strong>Tổng số hóa đơn:</strong> {report["Tổng số hóa đơn"]}
      </div>

      {/* Tổng doanh thu */}
      <div>
        <strong>Tổng doanh thu:</strong> {report["Tổng doanh thu"]}
      </div>

      {/* Tổng tiền theo phương thức thanh toán */}
      {report["Doanh thu theo phương thức"] && (
        <div className="mt-2 space-y-1">
          <strong>Doanh thu theo phương thức thanh toán:</strong>
          <div className="ml-4">
            Tiền mặt: {report["Doanh thu theo phương thức"].tienMat}
          </div>
          <div className="ml-4">
            Chuyển khoản: {report["Doanh thu theo phương thức"].chuyenKhoan}
          </div>
        </div>
      )}

      {/* Hóa đơn cao nhất */}
      {report["Hóa đơn cao nhất"] && (
        <div className="mt-2">
          <strong>Hóa đơn có giá trị cao nhất:</strong>{" "}
          {report["Hóa đơn cao nhất"].MaHD
            ? `${report["Hóa đơn cao nhất"].MaHD} (${report["Hóa đơn cao nhất"].TongTien})`
            : "Không có"}
        </div>
      )}
    </div>
  )}
</div>


    </div>
  )}


export default Bill;
