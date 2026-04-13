import React, { useEffect, useState } from "react";

function Booking() {
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    PhongSo: "",
    MaKH: "",
    NgayDat: "",
    NgayNhan: "",
    NgayTra: "",
    SoNguoi: "",
    TinhTrang: "dadat",
  });
  const [editMode, setEditMode] = useState(false);

  // ----------- Lấy tất cả booking (sắp xếp theo Phòng số) -----------
  const fetchAllBookings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/booking/allbooking");
      const data = await res.json();
      setBookings(data.sort((a, b) => Number(a.PhongSo) - Number(b.PhongSo)));
    } catch {
      alert("❌ Lỗi khi tải danh sách booking");
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ----------- Thêm booking -----------
  const handleAddBooking = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/booking/addbooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      alert(res.ok ? `➕ ${data.message}` : `⚠️ ${data.error}`);
      if (res.ok) {
        setForm({ PhongSo: "", MaKH: "", NgayDat: "", NgayNhan: "", NgayTra: "", SoNguoi: "", TinhTrang: "dadat" });
        fetchAllBookings();
      }
    } catch {
      alert("❌ Lỗi khi thêm booking");
    }
  };

  // ----------- Cập nhật booking -----------
  const handleUpdateBooking = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/booking/updatebooking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      alert(res.ok ? `💾 ${data.message}` : `⚠️ ${data.error}`);
      if (res.ok) {
        setEditMode(false);
        setForm({ PhongSo: "", MaKH: "", NgayDat: "", NgayNhan: "", NgayTra: "", SoNguoi: "", TinhTrang: "dadat" });
        fetchAllBookings();
      }
    } catch {
      alert("❌ Lỗi khi cập nhật booking");
    }
  };

  // ----------- Hủy booking -----------
  const handleDeleteBooking = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/booking/deletebooking", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ PhongSo: form.PhongSo, NgayDat: form.NgayDat }),
      });
      const data = await res.json();
      alert(res.ok ? `🗑 ${data.message}` : `⚠️ ${data.error}`);
      if (res.ok) {
        setEditMode(false);
        setForm({ PhongSo: "", MaKH: "", NgayDat: "", NgayNhan: "", NgayTra: "", SoNguoi: "", TinhTrang: "dadat" });
        fetchAllBookings();
      }
    } catch {
      alert("❌ Lỗi khi hủy booking");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Quản lý booking</h1>

      <div className="flex gap-6">
        {/* Form thêm/sửa booking */}
        <div className="w-1/3 p-6 border rounded-2xl shadow bg-white">
          <h2 className="font-semibold mb-4 text-lg">{editMode ? "Sửa booking" : "Thêm booking mới"}</h2>
          <div className="flex flex-col gap-3">
            <input type="text" name="PhongSo" placeholder="Phòng số" value={form.PhongSo} onChange={handleChange} disabled={editMode} className="border p-2 rounded" />
            <input type="text" name="MaKH" placeholder="Mã khách hàng" value={form.MaKH} onChange={handleChange} className="border p-2 rounded" />
            <input type="date" name="NgayDat" value={form.NgayDat} onChange={handleChange} className="border p-2 rounded" />
            <input type="date" name="NgayNhan" value={form.NgayNhan} onChange={handleChange} className="border p-2 rounded" />
            <input type="date" name="NgayTra" value={form.NgayTra} onChange={handleChange} className="border p-2 rounded" />
            <input type="number" name="SoNguoi" placeholder="Số người" value={form.SoNguoi} onChange={handleChange} className="border p-2 rounded" />
            <select
  name="TinhTrang"
  value={form.TinhTrang}
  onChange={handleChange}
  className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
>
  <option value="" disabled hidden>
    Tình trạng
  </option>
  <option value="trong">🔴 Trống</option>
  <option value="dadat">🟢 Đã đặt</option>
</select>

            {editMode ? (
              <div className="flex gap-2 mt-2">
                <button onClick={handleUpdateBooking} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-1">💾 Lưu</button>
                <button onClick={handleDeleteBooking} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-1">🗑 Hủy</button>
                <button onClick={() => { setEditMode(false); setForm({ PhongSo: "", MaKH: "", NgayDat: "", NgayNhan: "", NgayTra: "", SoNguoi: "", TinhTrang: "dadat" }); }} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-1">❌ Hủy edit</button>
              </div>
            ) : (
              <div className="flex gap-2 mt-2">
                <button onClick={handleAddBooking} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1">➕ Thêm</button>
              </div>
            )}
          </div>
        </div>

        {/* Table hiển thị booking hàng ngang */}
        <div className="w-2/3 overflow-x-auto shadow rounded-2xl">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-blue-100 text-blue-800">
                <th className="border p-2">Phòng số</th>
                <th className="border p-2">Mã KH</th>
                <th className="border p-2">Ngày đặt</th>
                <th className="border p-2">Ngày nhận</th>
                <th className="border p-2">Ngày trả</th>
                <th className="border p-2">Số người</th>
                <th className="border p-2">Tình trạng</th>
                <th className="border p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, idx) => (
                <tr key={`${b.PhongSo}-${b.NgayDat}`} className={idx % 2 === 0 ? "bg-white hover:bg-gray-100" : "bg-gray-50 hover:bg-gray-100"}>
                  <td className="border p-2 text-center">{b.PhongSo}</td>
                  <td className="border p-2 text-center">{b.MaKH}</td>

                  {/* Ngày đặt */}
                  <td className="border p-2 text-center">
                    <input
                      type="date"
                      value={b.NgayDat ? new Date(b.NgayDat).toISOString().split("T")[0] : ""}
                      readOnly
                      className="bg-transparent text-center"
                    />
                  </td>

                  {/* Ngày nhận */}
                  <td className="border p-2 text-center">
                    <input
                      type="date"
                      value={b.NgayNhan ? new Date(b.NgayNhan).toISOString().split("T")[0] : ""}
                      readOnly
                      className="bg-transparent text-center"
                    />
                  </td>

                  {/* Ngày trả */}
                  <td className="border p-2 text-center">
                    <input
                      type="date"
                      value={b.NgayTra ? new Date(b.NgayTra).toISOString().split("T")[0] : ""}
                      readOnly
                      className="bg-transparent text-center"
                    />
                  </td>

                  <td className="border p-2 text-center">{b.SoNguoi}</td>
                  <td className={`border p-2 text-center font-semibold ${b.TinhTrang === "trong" ? "text-red-500" : "text-green-600"}`}>
                    {b.TinhTrang === "trong" ? "🔴 Trống" : "🟢 Đã đặt"}
                  </td>
                  <td className="border p-2 flex justify-center items-center gap-1">
                    <button onClick={() => { setEditMode(true); setForm(b); }} className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow flex items-center gap-1">✏️ Sửa</button>
                    <div className="border-l h-6 mx-1"></div>
                    <button onClick={() => { setForm(b); handleDeleteBooking(); }} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow flex items-center gap-1">🗑 Xóa</button>
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

export default Booking;
