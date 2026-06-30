const mongoose = require('mongoose');

const mentorApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make it optional for guest applications
  },
  name: { type: String, required: false },
  email: { type: String, required: true },
  age: { type: Number, required: false },
  levels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level'
  }],
  evidence: { type: String, required: false }, // file path or URL
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionTags: [{ type: String }],
  rejectionComment: { type: String },
  
  // Compatibility fields for old Become a Mentor feature
  fullName: { type: String },
  portfolioUrl: { type: String },
  bio: { type: String },
  certificatePath: { type: String },
  isReadByAdmin: { type: Boolean, default: false },
  adminComment: { type: String },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MentorApplication', mentorApplicationSchema);
