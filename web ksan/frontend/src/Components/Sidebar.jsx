import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const basePath = role === "admin" ? "/admin" : role === "letan" ? "/letan" : "";

  const allMenuItems = [
    { name: "Khách hàng", path: `${basePath}/client`, icon: "👤", roles: ["admin", "letan"] },
    { name: "Phòng", path: `${basePath}/room`, icon: "🛏️", roles: ["admin", "letan"] },
    { name: "Dịch vụ", path: `${basePath}/service`, icon: "🔔", roles: ["admin", "letan"] },
    { name: "Dịch vụ đã dùng", path: `${basePath}/usedservice`, icon: "📋", roles: ["admin", "letan"] },
    { name: "Booking", path: `${basePath}/booking`, icon: "📄", roles: ["admin", "letan"] },
    { name: "Hóa đơn", path: `${basePath}/bill`, icon: "💵", roles: ["admin", "letan"] },
    { name: "Báo cáo", path: `${basePath}/report`, icon: "📊", roles: ["admin"] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white shadow-lg flex flex-col p-4 space-y-2">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
              isActive ? "bg-blue-500" : "hover:bg-gray-700"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        );
      })}
    </aside>
  );
};

export default Sidebar;
