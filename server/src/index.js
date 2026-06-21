const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { seedDatabase } = require("./controllers/authController");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Simple health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running smoothly",
    timestamp: new Date()
  });
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/LearningPath";

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("Successfully connected to MongoDB.");
    
    // Seed test database
    await seedDatabase();

    // Start listening only when DB connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
  });

