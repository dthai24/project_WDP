const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true, maxlength: 200 },
  description: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  levelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Level' },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  thumbnail: { type: String, maxlength: 500 },
  rating: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive'],
    default: 'pending'
  },
  rejectionTags: [{ type: String }],
  rejectionComment: { type: String },
  hasPendingUpdates: { type: Boolean, default: false },
  tempContent: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
