import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      if (!res.data.token || !res.data.role) {
        setError("Đăng nhập thất bại, dữ liệu server không hợp lệ.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role.toLowerCase());

      const role = res.data.role.toLowerCase();
      console.log("Đăng nhập thành công với role:", role);

      switch (role) {
        case "admin":
          navigate("/admin", { replace: true });
          break;
        case "letan":
          navigate("/letan", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Đã xảy ra lỗi server. Vui lòng thử lại!"
      );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage: "url('/background.jpg')", // ảnh ở public/background.jpg
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "320px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          backgroundColor: "rgba(255, 255, 255, 0.9)", // trắng mờ để nổi bật
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Đăng nhập
        </h2>

        {error && (
          <p
            style={{
              color: "red",
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            {error}
          </p>
        )}

        <label>Tài khoản</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            marginBottom: "15px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
          placeholder="Nhập username"
        />

        <label>Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            marginBottom: "20px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
          placeholder="Nhập mật khẩu"
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Đăng nhập
        </button>

        <p style={{ textAlign: "center", marginTop: "15px", color: "#666" }}>
          Chưa có tài khoản?{" "}
          <span
            style={{
              color: "#007bff",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => navigate("/register")}
          >
            Đăng ký
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
