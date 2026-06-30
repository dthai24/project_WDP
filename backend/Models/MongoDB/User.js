const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, maxlength: 100 },
  email: { type: String, maxlength: 150, lowercase: true, trim: true },
  phone: { type: String, maxlength: 20 },
  password: { type: String, maxlength: 255 },
  dateOfBirth: Date,
  isFirstLogin: { type: Boolean, default: true },
  resetOtpCode: { type: String, maxlength: 6 },
  resetOtpExpires: Date,
  currentLevelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Level' },
  learningGoal: { type: String, maxlength: 100 },
  avatarUrl: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
