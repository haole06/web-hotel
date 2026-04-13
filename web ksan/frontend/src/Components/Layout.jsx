import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header trên cùng */}
      <Header />

      {/* Thân trang: Sidebar + Nội dung */}
      <div className="flex flex-1">
        <Sidebar /> {/* Sidebar bên trái */}

        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet /> {/* Render các trang con */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
