const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  courseName: { type: String, required: true, maxlength: 200 },
  courseDescription: { type: String, required: true, maxlength: 200 },
  bankDescription: { type: String, maxlength: 200 },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.QuestionBank || mongoose.model('QuestionBank', questionBankSchema);
