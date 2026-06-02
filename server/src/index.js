const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running smoothly",
    timestamp: new Date()
  });
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/learning_path";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB.");
    // Start listening only when DB connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
  });
