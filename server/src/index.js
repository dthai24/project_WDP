require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
const mentorRoutes = require("./routes/mentorRoutes");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/mentor", mentorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);
app.use("/api/admin", adminRoutes);

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
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/learning_path";
const { seedDatabase } = require("./controllers/authController");

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("Successfully connected to MongoDB.");
    await seedDatabase();
  })
  .catch((error) => {
    console.warn("MongoDB connection failed:", error.message);
  });

const fs = require("fs");
const https = require("https");

const keyPath = path.join(__dirname, "../cert/server.key");
const certPath = path.join(__dirname, "../cert/server.crt");

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
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
