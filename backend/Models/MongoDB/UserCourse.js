const mongoose = require('mongoose');

const userCourseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progressPercentage: { type: Number, default: 0 },
  enrollmentDate: { type: Date, default: Date.now },
});

userCourseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('UserCourse', userCourseSchema);
