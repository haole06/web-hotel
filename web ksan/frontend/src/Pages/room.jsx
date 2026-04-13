import React, { useEffect, useState } from "react";

function Room() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    PhongSo: "",
    LoaiPhong: "",
    GiaPhong: "",
    TinhTrang: "",
  });
  const [editMode, setEditMode] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/rooms/managementrooms");
      const data = await res.json();
      setRooms(data.sort((a, b) => Number(a.PhongSo) - Number(b.PhongSo)));
      setLoading(false);
    } catch (err) {
      setError("Lỗi khi tải dữ liệu");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddRoom = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/rooms/addroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      alert(res.ok ? `➕ ${data.message}` : `⚠️ ${data.error}`);
      if (res.ok) {
        setForm({ PhongSo: "", LoaiPhong: "", GiaPhong: "", TinhTrang: "" });
        fetchRooms();
      }
    } catch {
      alert("❌ Lỗi khi thêm phòng");
    }
  };

  const handleUpdateRoom = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/rooms/updateroom", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      alert(res.ok ? `💾 ${data.message}` : `⚠️ ${data.error}`);
      if (res.ok) {
        setEditMode(false);
        setForm({ PhongSo: "", LoaiPhong: "", GiaPhong: "", TinhTrang: "" });
        fetchRooms();
      }
    } catch {
      alert("❌ Lỗi khi cập nhật phòng");
    }
  };

  const handleDelete = async (PhongSo) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phòng ${PhongSo}?`)) return;
    try {
      const res = await fetch("http://localhost:5000/api/rooms/deleteroom", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ PhongSo }),
      });
      const data = await res.json();
      alert(res.ok ? `🗑 ${data.message}` : `⚠️ ${data.error}`);
      if (res.ok) fetchRooms();
    } catch {
      alert("❌ Lỗi khi xóa phòng");
    }
  };

  const handleChangeStatus = async (PhongSo, TinhTrang) => {
    const newStatus = TinhTrang === "trong" ? "dadat" : "trong";
    try {
      const res = await fetch("http://localhost:5000/api/rooms/statusroom", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ PhongSo, TinhTrang: newStatus }),
      });
      const data = await res.json();
      if (res.ok) fetchRooms();
      else alert(`⚠️ ${data.error}`);
    } catch {
      alert("❌ Lỗi khi cập nhật trạng thái");
    }
  };

  if (loading) return <p className="text-center mt-5">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-600"> Quản lý phòng</h1>

      <div className="flex gap-6">
        {/* Form inline ngang */}
<div className="w-1/3 p-6 border rounded-2xl shadow bg-white">
  <h2 className="font-semibold mb-4 text-lg">{editMode ? "Sửa phòng" : "Thêm phòng mới"}</h2>
  <div className="flex flex-wrap gap-3 items-center">
    <input
      type="text"
      name="PhongSo"
      placeholder="Số phòng"
      value={form.PhongSo}
      onChange={handleChange}
      className={`border p-2 rounded focus:ring-2 focus:ring-blue-400 ${editMode ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={editMode}
    />
    <select
      name="LoaiPhong"
      value={form.LoaiPhong}
      onChange={handleChange}
      className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
    >
      <option value="" disabled hidden>Loại phòng</option>
      <option value="binhthuong(nho)">Bình thường (nhỏ)</option>
      <option value="binhthuong(to)">Bình thường (to)</option>
      <option value="caocap(nho)">Cao cấp (nhỏ)</option>
      <option value="caocap(to)">Cao cấp (to)</option>
      <option value="sangtrong">Sang trọng</option>
    </select>
    <input
      type="number"
      name="GiaPhong"
      placeholder="Giá phòng"
      value={form.GiaPhong}
      onChange={handleChange}
      className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
    />
    <select
      name="TinhTrang"
      value={form.TinhTrang}
      onChange={handleChange}
      className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
    >
      <option value="" disabled hidden>Tình trạng</option>
      <option value="trong">🔴 Trống</option>
      <option value="dadat">🟢 Đã đặt</option>
    </select>
    {editMode ? (
      <>
        <button onClick={handleUpdateRoom} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow flex items-center gap-1">
          💾 Lưu
        </button>
        <button
          onClick={() => { setEditMode(false); setForm({ PhongSo: "", LoaiPhong: "", GiaPhong: "", TinhTrang: "" }); }}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded shadow flex items-center gap-1"
        >
          ❌ Hủy
        </button>
      </>
    ) : (
      <button onClick={handleAddRoom} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow flex items-center gap-1">
        ➕ Thêm phòng
      </button>
    )}
  </div>
</div>


        {/* Table bên phải */}
        <div className="w-2/3 overflow-x-auto shadow rounded-2xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-100 text-blue-800">
                <th className="border p-3">Phòng số</th>
                <th className="border p-3">Loại phòng</th>
                <th className="border p-3">Giá phòng</th>
                <th className="border p-3">Tình trạng</th>
                <th className="border p-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, idx) => (
                <tr key={room.PhongSo} className={idx % 2 === 0 ? "bg-white hover:bg-gray-100" : "bg-gray-50 hover:bg-gray-100"}>
                  <td className="border p-3 text-center">{room.PhongSo}</td>
                  <td className="border p-3 text-center">{room.LoaiPhong}</td>
                  <td className="border p-3 text-center">
  {Number(room.GiaPhong).toLocaleString("vi-VN")}
</td>

                  <td className={`border p-3 text-center font-semibold ${room.TinhTrang === "trong" ? "text-red-500" : "text-green-600"}`}>
                    {room.TinhTrang === "trong" ? "🔴 Trống" : "🟢 Đã đặt"}
                  </td>
                  <td className="border p-3 flex justify-center items-center gap-2">
                    <button onClick={() => { setEditMode(true); setForm(room); }} className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-l shadow flex items-center gap-1">
                      ✏️ Sửa
                    </button>
                    <div className="border-l h-6 mx-1"></div>
                    <button onClick={() => handleDelete(room.PhongSo)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 shadow flex items-center gap-1">
                      🗑 Xóa
                    </button>
                    <div className="border-l h-6 mx-1"></div>
                    <button onClick={() => handleChangeStatus(room.PhongSo, room.TinhTrang)} className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-r shadow flex items-center gap-1">
                      🔄 Đổi trạng thái
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Room;
