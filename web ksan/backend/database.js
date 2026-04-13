const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "123456789",   // đổi theo mật khẩu MySQL của bạn
  database: "qly",
  port: 3306,           // đúng vì bạn cài MySQL chạy trên 3306
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
