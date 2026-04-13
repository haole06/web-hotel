import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./Pages/login";
import Register from "./Pages/register";
import Room from "./Pages/room";
import Booking from "./Pages/booking";
import Client from "./Pages/client";
import Service from "./Pages/service";
import Usedservice from "./Pages/usedservice";
import Bill from "./Pages/bill";
import Report from "./Pages/report";

//Components
import Layout from "./Components/Layout";
import Table from "./Components/Table";

// Route bảo vệ
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang login */}
        <Route path="/" element={<Login />} />

        {/* Trang đăng ký */}
        <Route path="/register" element={<Register />} />

        {/* Admin layout */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="room" element={<Room />} />
          <Route path="booking" element={<Booking />} />
          <Route path="client" element={<Client />} />
          <Route path="service" element={<Service />} />
          <Route path="usedservice" element={<Usedservice />} />
          <Route path="bill" element={<Bill />} />
          <Route path="report" element={<Report />} />
        </Route>

        {/* Reception layout */}
        <Route
          path="/letan"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="room" element={<Room />} />
          <Route path="booking" element={<Booking />} />
          <Route path="client" element={<Client />} />
          <Route path="service" element={<Service />} />
          <Route path="usedservice" element={<Usedservice />} />
          <Route path="bill" element={<Bill />} />
        </Route>

        {/* Nếu đường dẫn không hợp lệ */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}


export default App;


