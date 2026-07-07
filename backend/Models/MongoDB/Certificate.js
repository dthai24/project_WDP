const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  certificateCode: { type: String, unique: true, required: true },
  issuedAt: { type: Date, default: Date.now },
  grade: { type: Number, default: 100 },
}, { timestamps: true });

certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
