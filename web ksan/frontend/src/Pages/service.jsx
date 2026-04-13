import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../Components/Table";

const Service = () => {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ MaDV: "", TenDV: "", GiaDV: "" });
  const [search, setSearch] = useState({ MaDV: "", TenDV: "", GiaDV: "" });
  const [report, setReport] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const apiBase = "http://localhost:5000/api/service";

  // Lấy danh sách dịch vụ
  const fetchServices = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(search).filter(([_, v]) => v)
      );
      const res = await axios.get(`${apiBase}/managementservices`, { params });
      setServices(res.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách dịch vụ");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Thêm / Cập nhật dịch vụ
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.MaDV || !form.TenDV || !form.GiaDV) {
      alert("Vui lòng nhập đầy đủ thông tin dịch vụ");
      return;
    }

    try {
      if (editMode) {
        // PUT sửa dịch vụ
        const res = await axios.put(`${apiBase}/updateservice`, form);
        // Cập nhật state ngay với dữ liệu mới
        setServices((prev) =>
          prev.map((s) => (s.MaDV === form.MaDV ? res.data : s))
        );
        alert("💾 Cập nhật dịch vụ thành công");
        setEditMode(false);
      } else {
        // POST thêm dịch vụ
        const res = await axios.post(`${apiBase}/addservice`, form);
        // Thêm vào state ngay
        setServices((prev) => [...prev, res.data]);
        alert("➕ Thêm dịch vụ thành công");
      }
      setForm({ MaDV: "", TenDV: "", GiaDV: "" });
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  // Xóa dịch vụ
  const handleDelete = async (MaDV) => {
    if (!window.confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;
    try {
      await axios.delete(`${apiBase}/deleteservice`, { data: { MaDV } });
      setServices((prev) => prev.filter((s) => s.MaDV !== MaDV));
      alert("🗑 Xóa dịch vụ thành công");
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  // Chọn sửa dịch vụ
  const handleEdit = (service) => {
    setForm(service);
    setEditMode(true);
  };

  // Lấy báo cáo tổng hợp dịch vụ
  const fetchReport = async () => {
    try {
      const res = await axios.get(`${apiBase}/reportservice`);
      setReport(res.data);
    } catch (err) {
      alert("Lỗi khi lấy báo cáo dịch vụ");
    }
  };

  const columns = [
    { key: "MaDV", label: "Mã DV" },
    { key: "TenDV", label: "Tên DV" },
    { key: "GiaDV", label: "Giá DV" },
    { key: "actions", label: "Hành động" },
  ];

  const tableData = services.map((s) => ({
  ...s,
  key: s.MaDV,
  GiaDV: Number(s.GiaDV).toLocaleString("vi-VN"),
  actions: (
    <div className="flex justify-center items-center gap-2">
      <button
        onClick={() => handleEdit(s)}
        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow flex items-center gap-1"
      >
        ✏️ Sửa
      </button>
      <div className="border-l h-6 mx-1"></div>
      <button
        onClick={() => handleDelete(s.MaDV)}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow flex items-center gap-1"
      >
        🗑 Xóa
      </button>
    </div>
  ),
}));


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Quản lý dịch vụ</h1>

      {/* Form Thêm/Cập nhật */}
      <form className="mb-4 space-y-2" onSubmit={handleSubmit}>
        <input
          placeholder="Mã DV"
          value={form.MaDV}
          onChange={(e) => setForm({ ...form, MaDV: e.target.value })}
          className="border p-2 w-full rounded"
          disabled={editMode}
        />
        <input
          placeholder="Tên DV"
          value={form.TenDV}
          onChange={(e) => setForm({ ...form, TenDV: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <input
          placeholder="Giá DV"
          value={form.GiaDV}
          onChange={(e) => setForm({ ...form, GiaDV: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          className={`px-4 py-2 rounded text-white shadow ${
            editMode ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {editMode ? "💾 Cập nhật" : "➕ Thêm dịch vụ"}
        </button>
      </form>

      {/* Tìm kiếm */}
      <div className="mb-4 space-y-2">
        <h2 className="font-semibold">Tìm kiếm dịch vụ</h2>
        {["MaDV", "TenDV", "GiaDV"].map((key) => (
          <input
            key={key}
            placeholder={key === "TenDV" ? "Tên DV" : key}
            value={search[key]}
            onChange={(e) => setSearch({ ...search, [key]: e.target.value })}
            className="border p-2 w-full rounded"
          />
        ))}
        <button
          onClick={fetchServices}
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
          📊 Xem báo cáo dịch vụ
        </button>
        {report && (
          <div className="mb-2">
            <p>
              <strong>Tổng số dịch vụ:</strong> {report["Tổng số dịch vụ"]}
            </p>
            <p>
              <strong>Dịch vụ dùng nhiều nhất:</strong>{" "}
              {report["Dịch vụ dùng nhiều nhất"] !== "Chưa có dữ liệu"
                ? `${report["Dịch vụ dùng nhiều nhất"].TenDV} (${report["Dịch vụ dùng nhiều nhất"].TongSD})`
                : "Chưa có dữ liệu"}
            </p>
            <p>
              <strong>Dịch vụ dùng ít nhất:</strong>{" "}
              {report["Dịch vụ dùng ít nhất"] !== "Chưa có dữ liệu"
                ? `${report["Dịch vụ dùng ít nhất"].TenDV} (${report["Dịch vụ dùng ít nhất"].TongSD})`
                : "Chưa có dữ liệu"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Service;
