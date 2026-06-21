const mongoose = require("mongoose");

const categoryHistorySchema = new mongoose.Schema(
  {
    action: { type: String, required: true, enum: ["CREATE", "UPDATE", "CREATED", "UPDATED"] },
    categoryName: { type: String, required: true },
    target: { type: String, required: true },
    actorName: { type: String, default: "Admin Minh" },
    actor: { type: String, default: "admin@gmail.com" },
    timestamp: { type: String, default: () => new Date().toLocaleString("vi-VN") }
  }
);

module.exports = mongoose.model("CategoryHistory", categoryHistorySchema);
