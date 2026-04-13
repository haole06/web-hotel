import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const roleName =
    role === "admin" ? "Admin" : role === "letan" ? "Lễ tân" : "User";

  return (
    <header className="w-full bg-blue-600 text-white shadow-md px-6 py-4 flex justify-between items-center relative z-40">
      {/* Tiêu đề căn giữa */}
      <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
        Quản Lý Đặt Phòng Khách Sạn
      </h1>

      {/* Thông tin người dùng + logout */}
      <div className="flex items-center gap-4 ml-auto">
        <span className="font-medium">{roleName}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
