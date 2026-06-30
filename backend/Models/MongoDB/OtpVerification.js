const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, maxlength: 150 },
  fullName: { type: String, required: true, maxlength: 100 },
  phone: { type: String, required: true, maxlength: 20 },
  password: { type: String, required: true, maxlength: 255 },
  dateOfBirth: { type: Date, required: true },
  otpCode: { type: String, required: true, maxlength: 6 },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('OtpVerification', otpVerificationSchema);
