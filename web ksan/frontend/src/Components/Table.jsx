const Table = ({ columns, data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-gray-500 italic p-4 border rounded bg-white shadow-md">
        Không có dữ liệu
      </div>
    );
  }

  return (
    <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
      <thead className="bg-gray-200">
        <tr>
          {columns.map((col) => (
            <th key={col.key} className="py-2 px-4 text-left">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="border-b hover:bg-gray-50">
            {columns.map((col) => (
              <td key={col.key} className="py-2 px-4">
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
