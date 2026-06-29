const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const UserCourse = require('./MongoDB/UserCourse');
const User = require('./MongoDB/User');
const UserNode = require('./MongoDB/UserNode');

const getStudentsInCourseModel = async (courseId) => {
  const enrollments = await UserCourse.find({ courseId: new ObjectId(courseId) })
    .populate('userId', 'fullName email')
    .sort({ enrollmentDate: -1 })
    .lean();

  return enrollments.map(uc => ({
    UserId: uc.userId?._id?.toString() || uc.userId?.toString(),
    FullName: uc.userId?.fullName || '',
    Email: uc.userId?.email || '',
    CourseId: uc.courseId?.toString(),
    ProgressPercentage: uc.progressPercentage,
    EnrollmentDate: uc.enrollmentDate,
  }));
};

async function getCompletionDates(userId) {
  const nodes = await UserNode.find({
    userId: new ObjectId(userId),
    isCompleted: true,
  })
    .select('completedAt')
    .lean();

  const dateSet = new Set();
  nodes.forEach(n => {
    if (n.completedAt) {
      const d = new Date(n.completedAt);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dateSet.add(`${y}-${m}-${day}`);
    }
  });

  return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
}

module.exports = {
  getStudentsInCourseModel,
  getCompletionDates,
};
