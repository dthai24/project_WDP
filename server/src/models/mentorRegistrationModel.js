const mongoose = require("mongoose");

const mentorRegistrationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    portfolioUrl: { type: String, default: "" },
    bio: { type: String },
    experience: { type: String },
    certificate: { type: String, default: "" },
    cvUrl: { type: String },
    status: { type: String, enum: ["Pending", "Approved", "Rejected", "approved", "pending", "rejected"], default: "Pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNote: { type: String },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    rejectReason: { type: String, default: "" }
  },
  { timestamps: true, collection: "mentor_applications" }
);

module.exports = mongoose.model("MentorRegistration", mentorRegistrationSchema);
