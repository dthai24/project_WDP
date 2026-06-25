const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      default: "123456"
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["Admin", "Mentor", "Student"],
      default: "Student"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
