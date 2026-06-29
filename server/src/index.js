const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env"), override: true });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
console.log("==> [BACKEND CORS] Secure pipeline opened for http://localhost:3000");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
const mentorRoutes = require("./routes/mentorRoutes");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use("/api/mentor", mentorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);

// Simple health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running smoothly",
    timestamp: new Date(),
  });
});

// Error handling middleware (để luôn trả về JSON thay vì HTML lỗi)
app.use((err, req, res, next) => {
  console.error("Lỗi hệ thống Express:", err);
  res.status(err.status || 500).json({
    message: err.message || "Đã xảy ra lỗi hệ thống."
  });
});

// Database connection
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wdp_english";
if (MONGODB_URI.includes("/learning_path")) {
  MONGODB_URI = MONGODB_URI.replace("/learning_path", "/wdp_english");
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`Successfully connected to MongoDB — DB: wdp_english`);
  })
  .catch((error) => {
    console.warn("MongoDB connection failed:", error.message);
  });

const fs = require("fs");
const https = require("https");

const keyPath = path.join(__dirname, "../cert/server.key");
const certPath = path.join(__dirname, "../cert/server.crt");

if (fs.existsSync(keyPath) && fs.existsSync(certPath) && process.env.NODE_ENV === 'production') {
  try {
    const options = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    https.createServer(options, app).listen(PORT, () => {
      console.log(`HTTPS Server running on https://localhost:${PORT}`);
    });

    // Create an HTTP server on PORT + 1 to redirect to HTTPS
    const HTTP_PORT = parseInt(PORT, 10) + 1;
    const http = require("http");
    http.createServer((req, res) => {
      const host = req.headers.host ? req.headers.host.split(":")[0] : "localhost";
      res.writeHead(301, { Location: `https://${host}:${PORT}${req.url}` });
      res.end();
    }).listen(HTTP_PORT, () => {
      console.log(`HTTP Redirect Server running on http://localhost:${HTTP_PORT} -> https://localhost:${PORT}`);
    });
  } catch (sslErr) {
    console.error("Failed to start HTTPS, falling back to HTTP:", sslErr.message);
    app.listen(PORT, () => {
      console.log(`HTTP Server running on http://localhost:${PORT}`);
    });
  }
} else {
  app.listen(PORT, () => {
    console.log(`HTTP Server running on http://localhost:${PORT}`);
  });
}
