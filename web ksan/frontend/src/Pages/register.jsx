import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("letan"); // mặc định lễ tân
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username,
        password,
        role,
      });

      setSuccess(res.data.message);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Đăng ký thất bại");
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
        onSubmit={handleRegister}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "320px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          backgroundColor: "rgba(255, 255, 255, 0.9)", // trắng mờ
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Đăng ký tài khoản
        </h2>

        {error && (
          <p style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>
            {error}
          </p>
        )}
        {success && (
          <p
            style={{
              color: "green",
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            {success}
          </p>
        )}

        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            marginBottom: "10px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            marginBottom: "10px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        <label>Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            marginBottom: "20px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          <option value="admin">Admin</option>
          <option value="letan">Lễ tân</option>
        </select>

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
          Đăng ký
        </button>

        <p style={{ textAlign: "center", marginTop: "15px", color: "#666" }}>
          Đã có tài khoản?{" "}
          <span
            style={{
              color: "#007bff",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => navigate("/")}
          >
            Đăng nhập
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
