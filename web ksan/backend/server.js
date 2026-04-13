const express = require("express");
const cors = require("cors");
require("dotenv").config(); // để dùng JWT_SECRET trong .env
const reportRouter = require('./routes/report');

const pool = require("./database");
const { router: authRouter, authenticate, authorize } = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- Test API ----------------
app.get("/", (req, res) => {
  res.send("Backend server is running...");
});

// ---------------- Auth routes ----------------
app.use("/api/auth", authRouter);

// ---------------- API chính ----------------
app.use("/api/rooms", require("./routes/room"));
app.use("/api/client", require("./routes/client"));
app.use("/api/service", require("./routes/service"));
app.use("/api/bill", require("./routes/bill"));
app.use("/api/booking", require("./routes/booking"));
app.use("/api/usedservice", require("./routes/usedservice"));

//-------------------API báo cáo phòng--------------
app.use('/api/report', reportRouter);

// ---------------- Route có phân quyền ----------------
// Chỉ admin mới vào
app.get("/admin-only", authenticate, authorize(["admin"]), (req, res) => {
  res.json({ message: "Xin chào admin!" });
});

// Admin và lễ tân đều vào
app.get("/letan", authenticate, authorize(["admin", "letan"]), (req, res) => {
  res.json({ message: "Xin chào lễ tân hoặc admin!" });
});

// ---------------- Khởi động server ----------------
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
