import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from "../Components/Table";

const UsedService = () => {
  const [form, setForm] = useState({
    PhongSo: "",
    MaDV: "",
    SoLuong: "",
    NgayNhan: "",
    NgayTra: ""
  });
  const [updateForm, setUpdateForm] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  const [report, setReport] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({ PhongSo: "", NgayNhan: "", NgayTra: "" });

  const apiBase = "http://localhost:5000/api/usedservice";

  useEffect(() => {
    fetchAll();
  }, []);

  // Hàm chuyển yyyy-mm-dd -> dd/mm/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Thêm dịch vụ
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.PhongSo || !form.MaDV || !form.SoLuong || !form.NgayNhan || !form.NgayTra) {
      return alert("Vui lòng điền đầy đủ thông tin, bao gồm ngày nhận và ngày trả");
    }
    try {
      await axios.post(`${apiBase}/addusedservice`, form);
      alert("Thêm dịch vụ sử dụng thành công");
      setForm({ PhongSo: "", MaDV: "", SoLuong: "", NgayNhan: "", NgayTra: "" });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  // Cập nhật dịch vụ
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!updateForm.MaSD || !updateForm.SoLuong || !updateForm.NgayNhan || !updateForm.NgayTra) {
      return alert("Vui lòng điền đầy đủ số lượng và ngày nhận/trả");
    }
    try {
      await axios.put(`${apiBase}/updateusedservice`, updateForm);
      alert("Cập nhật dịch vụ thành công");

      // Cập nhật table
      setReport(prev =>
        prev.map(row =>
          row.MaSD === updateForm.MaSD ? { ...row, ...updateForm } : row
        )
      );

      setSelectedRow(null);
      setUpdateForm({});
      setEditMode(false);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  // Xóa dịch vụ
  const handleDelete = async (MaSD) => {
    if (!window.confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;
    try {
      await axios.delete(`${apiBase}/deleteusedservice`, { data: { MaSD } });
      setReport(prev => prev.filter(r => r.MaSD !== MaSD));
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  // Chọn dòng để sửa
  const handleEdit = (row) => {
    setSelectedRow(row);
    setUpdateForm({
      MaSD: row.MaSD,
      SoLuong: row.SoLuong,
      NgayNhan: row.NgayNhan,
      NgayTra: row.NgayTra
    });
    setEditMode(true);
  };

  // Lấy tất cả dịch vụ
  const fetchAll = async () => {
    try {
      const res = await axios.get(`${apiBase}/all`);
      const sorted = res.data.sort((a, b) => Number(a.PhongSo) - Number(b.PhongSo));
      setReport(sorted);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  // Tính tổng tiền
  const fetchTotal = async () => {
    if (!filter.PhongSo || !filter.NgayNhan || !filter.NgayTra) {
      return alert("Vui lòng điền Phòng số, Ngày nhận và Ngày trả để tính tổng tiền");
    }
    try {
      const res = await axios.get(`${apiBase}/total`, { params: filter });
      setTotal(res.data.TongTien);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  // Table columns với nhãn thân thiện
  const columns = report.length > 0
    ? [
        { key: "MaSD", label: "Mã SD" },
        { key: "PhongSo", label: "Phòng Số" },
        { key: "MaDV", label: "Mã DV" },
        { key: "TenDV", label: "Tên DV" },
        { key: "SoLuong", label: "Số Lượng" },
        { key: "ThanhTien", label: "Thành Tiền" },
        { key: "NgayNhan", label: "Ngày Nhận" },
        { key: "NgayTra", label: "Ngày Trả" },
        { key: "actions", label: "Hành Động" },
      ]
    : [];

  // Table data
  // Hàm định dạng số có dấu chấm ngăn cách
const formatNumber = (num) => Number(num || 0).toLocaleString("de-DE");

const tableData = report.map((row) => ({
  ...row,
  SoLuong: formatNumber(row.SoLuong),
  ThanhTien: formatNumber(row.ThanhTien),
  NgayNhan: formatDate(row.NgayNhan),
  NgayTra: formatDate(row.NgayTra),
  actions: (
    <div className="flex justify-center items-center">
      <button
        onClick={() => handleEdit(row)}
        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-l shadow flex items-center gap-1"
      >
        ✏️ Sửa
      </button>
      <div className="border-l h-6 mx-1"></div>
      <button
        onClick={() => handleDelete(row.MaSD)}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-r shadow flex items-center gap-1"
      >
        🗑 Xóa
      </button>
    </div>
  ),
}));


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Quản lý dịch vụ đã dùng</h1>

      {/* Thêm dịch vụ */}
      <form className="mb-4 space-y-2" onSubmit={handleAdd}>
        <h2 className="font-semibold">Thêm dịch vụ cho phòng</h2>
        <input placeholder="Phòng số" value={form.PhongSo} onChange={(e) => setForm({ ...form, PhongSo: e.target.value })} className="border p-2 w-full rounded" />
        <input placeholder="Mã DV" value={form.MaDV} onChange={(e) => setForm({ ...form, MaDV: e.target.value })} className="border p-2 w-full rounded" />
        <input placeholder="Số lượng" type="number" value={form.SoLuong} onChange={(e) => setForm({ ...form, SoLuong: e.target.value })} className="border p-2 w-full rounded" />
        <input type="date" value={form.NgayNhan} onChange={(e) => setForm({ ...form, NgayNhan: e.target.value })} className="border p-2 w-full rounded" />
        <input type="date" value={form.NgayTra} onChange={(e) => setForm({ ...form, NgayTra: e.target.value })} className="border p-2 w-full rounded" />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow">➕ Thêm dịch vụ</button>
      </form>

      {/* Cập nhật dịch vụ */}
      {editMode && selectedRow && (
        <form className="mb-4 space-y-2" onSubmit={handleUpdate}>
          <h2 className="font-semibold">Cập nhật dịch vụ</h2>

          <input placeholder="Mã SD" value={selectedRow.MaSD} className="border p-2 w-full rounded" disabled />
          <input placeholder="Phòng số" value={selectedRow.PhongSo} className="border p-2 w-full rounded bg-gray-100" disabled />
          <input placeholder="Tên DV" value={selectedRow.TenDV} className="border p-2 w-full rounded bg-gray-100" disabled />

          <label>Ngày nhận</label>
          <input type="date" value={updateForm.NgayNhan || ""} 
                 onChange={(e) => setUpdateForm({ ...updateForm, NgayNhan: e.target.value })}
                 className="border p-2 w-full rounded" />

          <label>Ngày trả</label>
          <input type="date" value={updateForm.NgayTra || ""} 
                 onChange={(e) => setUpdateForm({ ...updateForm, NgayTra: e.target.value })}
                 className="border p-2 w-full rounded" />

          <label>Số lượng</label>
          <input placeholder="Số lượng mới" type="number" value={updateForm.SoLuong || ""} 
                 onChange={(e) => setUpdateForm({ ...updateForm, SoLuong: e.target.value })} 
                 className="border p-2 w-full rounded" />

          <div className="flex gap-2 mt-2">
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow">
              💾 Cập nhật
            </button>
            <button type="button" onClick={() => setEditMode(false)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded shadow">
              ❌ Hủy
            </button>
          </div>
        </form>
      )}

      {/* Tổng tiền */}
      <div className="mb-4 p-4 border rounded shadow">
        <h2 className="font-semibold mb-2">Tính tổng tiền dịch vụ</h2>
        <div className="flex gap-2 mb-2">
          <input placeholder="Phòng số" value={filter.PhongSo} onChange={(e) => setFilter({ ...filter, PhongSo: e.target.value })} className="border p-2 rounded" />
          <input type="date" value={filter.NgayNhan} onChange={(e) => setFilter({ ...filter, NgayNhan: e.target.value })} className="border p-2 rounded" />
          <input type="date" value={filter.NgayTra} onChange={(e) => setFilter({ ...filter, NgayTra: e.target.value })} className="border p-2 rounded" />
          <button onClick={fetchTotal} className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded shadow">💰 Tính tổng tiền</button>
        </div>
        <div>Tổng tiền: <strong>{total.toLocaleString()} VND</strong></div>
      </div>

      {/* Table */}
      {report.length > 0 && <Table columns={columns} data={tableData} />}
    </div>
  );
};

export default UsedService;
