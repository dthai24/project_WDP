require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
const mentorRoutes = require("./routes/mentorRoutes");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

app.use("/api/mentor", mentorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

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
const User = require("./models/User");

const seedUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      await User.create([
        {
          email: "admin@gmail.com",
          password: "123456",
          name: "Admin User",
          role: "Admin"
        },
        {
          email: "student@gmail.com",
          password: "123456",
          name: "Student User",
          role: "Learner"
        },
        {
          email: "mentor@gmail.com",
          password: "123456",
          name: "Mentor User",
          role: "Mentor"
        }
      ]);
      console.log("Database seeded successfully with default accounts.");
    }
  } catch (err) {
    console.error("Error seeding default users:", err);
  }
};

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("Successfully connected to MongoDB.");
    await seedUsers();
  })
  .catch((error) => {
    console.warn("MongoDB connection skipped:", error.message);
  });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
