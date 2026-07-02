const mongoose = require('mongoose');

const courseCommentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5 },
  content: { type: String, required: true, maxlength: 255 },
  replyContent: String,
  replyAt: Date,
  replyByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.models.CourseComment || mongoose.model('CourseComment', courseCommentSchema);
