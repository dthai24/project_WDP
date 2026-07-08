const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['payment', 'streak', 'ai-grading', 'course', 'system'],
    default: 'system'
  },
  title: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 500 },
  link: String, // đường dẫn frontend để điều hướng khi click
  metadata: mongoose.Schema.Types.Mixed, // vd: { paymentId, courseId }
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
