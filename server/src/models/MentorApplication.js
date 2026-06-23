const mongoose = require("mongoose");

const mentorApplicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    portfolioUrl: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      required: true,
    },
    certificatePath: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminComment: {
      type: String,
      default: "",
    },
    isReadByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MentorApplication", mentorApplicationSchema);
