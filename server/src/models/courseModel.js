const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String },
    courseName: { type: String },
    description: { type: String },
    category: { type: String },
    categoryId: { type: Number },
    levelId: { type: Number },
    status: { type: String, enum: ["Active", "Inactive", "Pending"], default: "Pending" },
    isPublished: { type: Boolean },
    mentorName: { type: String },
    mentorEmail: { type: String },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    thumbnail: { type: String },
    price: { type: Number },
    freeLessonsCount: { type: Number },
    isPaid: { type: Boolean },
    rating: { type: Number },
    totalLessons: { type: Number },
    tags: [
      {
        tagId: { type: mongoose.Schema.Types.ObjectId },
        tagName: { type: String }
      }
    ],
    paths: { type: Array },
    rejectReason: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
