import React, { useEffect, useState } from "react";
import axios from "axios";

const Report = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [yearlyRevenue, setYearlyRevenue] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [roomUsage, setRoomUsage] = useState([]);
  const [viewMode, setViewMode] = useState("monthly"); // "monthly" hoặc "yearly"

  const apiBase = "http://localhost:5000/api/report";

  useEffect(() => {
    fetchRevenue();
    fetchTopCustomers();
    fetchRoomUsage();
  }, []);

  const fetchRevenue = async () => {
    try {
      const res = await axios.get(`${apiBase}/revenue`);
      setMonthlyRevenue(res.data.monthly);
      setYearlyRevenue(res.data.yearly);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải báo cáo doanh thu");
    }
  };

  const fetchTopCustomers = async () => {
    try {
      const res = await axios.get(`${apiBase}/topcustomer`);
      setTopCustomers(res.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải top khách hàng");
    }
  };

  const fetchRoomUsage = async () => {
    try {
      const res = await axios.get(`${apiBase}/roomusage`);
      setRoomUsage(res.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải công suất phòng");
    }
  };

  const renderRevenueTable = () => {
    if (viewMode === "monthly") {
      return monthlyRevenue.length === 0 ? (
        <p className="p-2">Chưa có dữ liệu</p>
      ) : (
        <table className="w-full border-collapse border text-left">
          <thead>
            <tr className="bg-blue-100">
              <th className="border px-3 py-1">Năm</th>
              <th className="border px-3 py-1">Tháng</th>
              <th className="border px-3 py-1">Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {monthlyRevenue.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-100">
                <td className="border px-3 py-1">{row.Nam}</td>
                <td className="border px-3 py-1">{row.Thang}</td>
                <td className="border px-3 py-1">{row.DoanhThu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (viewMode === "yearly") {
      return yearlyRevenue.length === 0 ? (
        <p className="p-2">Chưa có dữ liệu</p>
      ) : (
        <table className="w-full border-collapse border text-left">
          <thead>
            <tr className="bg-blue-100">
              <th className="border px-3 py-1">Năm</th>
              <th className="border px-3 py-1">Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {yearlyRevenue.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-100">
                <td className="border px-3 py-1">{row.Nam}</td>
                <td className="border px-3 py-1">{row.DoanhThu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  const Card = ({ title, children }) => (
    <div className="border rounded shadow p-4 mb-6 bg-white">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Báo cáo tổng hợp</h1>

      {/* Doanh thu */}
      <Card title="Doanh thu">
        <div className="mb-4">
          <label className="mr-2 font-semibold">Xem theo:</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="monthly">Tháng</option>
            <option value="yearly">Năm</option>
          </select>
        </div>
        {renderRevenueTable()}
      </Card>

      {/* Top khách hàng */}
      <Card title="Top khách hàng">
        {topCustomers.length === 0 ? (
          <p>Chưa có dữ liệu</p>
        ) : (
          <table className="w-full border-collapse border text-left">
            <thead>
              <tr className="bg-green-100">
                <th className="border px-3 py-1">Mã KH</th>
                <th className="border px-3 py-1">Họ tên</th>
                <th className="border px-3 py-1">Số lần đặt</th>
                <th className="border px-3 py-1">Tổng chi tiêu</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-100">
                  <td className="border px-3 py-1">{row.MaKH}</td>
                  <td className="border px-3 py-1">{row.HoTen}</td>
                  <td className="border px-3 py-1">{row.SoLanDat}</td>
                  <td className="border px-3 py-1">{row.TongChiTieu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Công suất phòng */}
      <Card title="Công suất phòng">
        {roomUsage.length === 0 ? (
          <p>Chưa có dữ liệu</p>
        ) : (
          <table className="w-full border-collapse border text-left">
            <thead>
              <tr className="bg-yellow-100">
                <th className="border px-3 py-1">Phòng số</th>
                <th className="border px-3 py-1">Số lần thuê</th>
              </tr>
            </thead>
            <tbody>
              {roomUsage.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-100">
                  <td className="border px-3 py-1">{row.PhongSo}</td>
                  <td className="border px-3 py-1">{row.SoLanThue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default Report;
