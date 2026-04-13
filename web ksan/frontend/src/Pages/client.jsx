import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../Components/Table";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ MaKH: "", HoTen: "", CMND: "", DienThoai: "" });
  const [search, setSearch] = useState({ MaKH: "", HoTen: "", CMND: "", DienThoai: "" });
  const [report, setReport] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const apiBase = "http://localhost:5000/api/client";

  const fetchClients = async () => {
    try {
      const params = Object.fromEntries(Object.entries(search).filter(([_, v]) => v));
      const res = await axios.get(`${apiBase}/managementclients`, { params });
      setClients(res.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách khách hàng");
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`${apiBase}/updateclient`, form);
        alert("Cập nhật khách hàng thành công");
      } else {
        await axios.post(`${apiBase}/addclient`, form);
        alert("Thêm khách hàng thành công");
      }
      setForm({ MaKH: "", HoTen: "", CMND: "", DienThoai: "" });
      setEditMode(false);
      fetchClients();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async (MaKH) => {
    if (!window.confirm("Bạn có chắc muốn xóa khách hàng này?")) return;
    try {
      await axios.delete(`${apiBase}/deleteclient`, { data: { MaKH } });
      fetchClients();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleEdit = (client) => {
    setForm(client);
    setEditMode(true);
  };

  const fetchReport = async () => {
    try {
      const res = await axios.get(`${apiBase}/reportclient`);
      setReport(res.data);
    } catch (err) {
      alert("Lỗi khi lấy báo cáo khách hàng");
    }
  };

  const columns = [
    { key: "MaKH", label: "Mã KH" },
    { key: "HoTen", label: "Họ Tên" },
    { key: "CMND", label: "CMND" },
    { key: "DienThoai", label: "Điện Thoại" },
    { key: "actions", label: "Hành động" },
  ];

  const tableData = clients.map(c => ({
    ...c,
    actions: (
      <div className="flex justify-center items-center">
        <button
          onClick={() => handleEdit(c)}
          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-l shadow flex items-center gap-1"
        >
          ✏️ Sửa
        </button>
        {/* Phân cách giữa hai nút */}
        <div className="border-l h-6 mx-1"></div>
        <button
          onClick={() => handleDelete(c.MaKH)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-r shadow flex items-center gap-1"
        >
          🗑 Xóa
        </button>
      </div>
    ),
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Quản lý khách hàng</h1>

      {/* Form thêm/sửa */}
      <form className="mb-4 space-y-2" onSubmit={handleSubmit}>
        <input
          placeholder="Mã KH"
          value={form.MaKH}
          onChange={e => setForm({ ...form, MaKH: e.target.value })}
          className="border p-2 w-full rounded"
          disabled={editMode}
        />
        <input
          placeholder="Họ Tên"
          value={form.HoTen}
          onChange={e => setForm({ ...form, HoTen: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <input
          placeholder="CMND"
          value={form.CMND}
          onChange={e => setForm({ ...form, CMND: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <input
          placeholder="Điện Thoại"
          value={form.DienThoai}
          onChange={e => setForm({ ...form, DienThoai: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          className={`px-4 py-2 rounded text-white shadow ${
            editMode ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {editMode ? '💾 Cập nhật' : '➕ Thêm khách hàng'}
        </button>
      </form>

      {/* Tìm kiếm */}
      <div className="mb-4 space-y-2">
        <h2 className="font-semibold">Tìm kiếm khách hàng</h2>
        {["MaKH", "HoTen", "CMND", "DienThoai"].map(key => (
          <input
            key={key}
            placeholder={key === "HoTen" ? "Họ Tên" : key}
            value={search[key]}
            onChange={e => setSearch({ ...search, [key]: e.target.value })}
            className="border p-2 w-full rounded"
          />
        ))}
        <button
          onClick={fetchClients}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          🔍 Tìm kiếm
        </button>
      </div>

      {/* Table */}
      <Table columns={columns} data={tableData} />

      {/* Báo cáo */}
      <div className="mt-4">
        <button
          onClick={fetchReport}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded mb-2 flex items-center gap-1 shadow"
        >
          📊 Xem báo cáo khách hàng
        </button>
        {report && report["Tổng số khách hàng đã đặt"] && (
          <div className="mb-2">
            <strong>Tổng số khách hàng đã đặt:</strong> {report["Tổng số khách hàng đã đặt"]}
          </div>
        )}
        {report && Array.isArray(report["Khách hàng đặt nhiều nhất"]) && (
          <div>
            <h3 className="font-semibold">Top khách hàng đặt nhiều nhất:</h3>
            <ul className="list-disc ml-5">
              {report["Khách hàng đặt nhiều nhất"].map(k => (
                <li key={k.MaKH}>
                  {k.HoTen} ({k.MaKH}) - {k.SoLanDat} lần đặt
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;
