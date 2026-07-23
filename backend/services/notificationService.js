const Notification = require('../Models/MongoDB/Notification');
const Course = require('../Models/MongoDB/Course');
const Role = require('../Models/MongoDB/Role');
const UserRole = require('../Models/MongoDB/UserRole');

async function createNotification({ userId, type = 'system', title, message, link, metadata }) {
  return Notification.create({ userId, type, title, message, link, metadata });
}

async function notifyAdminsAndMentor({ courseId, studentId, type = 'system', title, message, link, metadata }) {
  try {
    const course = await Course.findById(courseId).lean();
    if (!course) return;

    const receivers = new Set();

    // 1. Add course mentor (instructor)
    if (course.instructorId) {
      receivers.add(course.instructorId.toString());
    }

    // 2. Add all admins
    const adminRole = await Role.findOne({ roleName: { $regex: /^admin$/i } }).lean();
    if (adminRole) {
      const userRoles = await UserRole.find({ roleId: adminRole._id }).lean();
      for (const ur of userRoles) {
        receivers.add(ur.userId.toString());
      }
    }

    // 3. Create notifications
    const notificationsToCreate = Array.from(receivers).map(userId => ({
      userId,
      type,
      title,
      message,
      link,
      metadata: {
        ...metadata,
        courseId,
        studentId
      }
    }));

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }
  } catch (error) {
    console.error('Error in notifyAdminsAndMentor:', error);
  }
}

module.exports = { createNotification, notifyAdminsAndMentor };
