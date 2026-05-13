const express = require('express');
const cors = require('cors');
const { connectDB, sql } = require('./config/db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Kết nối Database
connectDB();

// API Test bốc dữ liệu từ SQL Server
app.get('/api/test', async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query('SELECT * FROM Users');
    res.json({
      status: "success",
      data: result.recordset
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});