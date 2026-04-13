import React from "react";

const TestTable = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center">Test Bảng Tailwind</h1>

      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-blue-100">
            <th className="border border-gray-300 px-3 py-1">Năm</th>
            <th className="border border-gray-300 px-3 py-1">Tháng</th>
            <th className="border border-gray-300 px-3 py-1">Doanh thu</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-200">
            <td className="border border-gray-300 px-3 py-1">2025</td>
            <td className="border border-gray-300 px-3 py-1">1</td>
            <td className="border border-gray-300 px-3 py-1">1000000</td>
          </tr>
          <tr className="hover:bg-gray-200">
            <td className="border border-gray-300 px-3 py-1">2025</td>
            <td className="border border-gray-300 px-3 py-1">2</td>
            <td className="border border-gray-300 px-3 py-1">1200000</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TestTable;
