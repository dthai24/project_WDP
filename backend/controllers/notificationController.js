const Notification = require('../Models/MongoDB/Notification');

// GET /api/notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    const { limit = 20, skip = 0 } = req.query;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ success: false, message: 'Error updating notification', error: error.message });
  }
};

// PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.json({ success: true });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ success: false, message: 'Error updating notifications', error: error.message });
  }
};

const User = require('../Models/MongoDB/User');
const UserCourse = require('../Models/MongoDB/UserCourse');
const Role = require('../Models/MongoDB/Role');
const UserRole = require('../Models/MongoDB/UserRole');

// POST /api/notifications/broadcast
exports.broadcastNotification = async (req, res) => {
  try {
    const { type = 'system', title, message, link, courseId } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Missing title or message' });
    }

    let targetUserIds = [];

    if (courseId) {
      // 1. Course-related announcement: Notify all students enrolled in this course
      const enrollments = await UserCourse.find({ courseId }).lean();
      targetUserIds = enrollments.map(e => e.userId.toString());
    } else {
      // 2. Promotion/General announcement: Notify all students
      const studentRole = await Role.findOne({ roleName: { $regex: /^student$/i } }).lean();
      if (studentRole) {
        const studentUserRoles = await UserRole.find({ roleId: studentRole._id }).lean();
        targetUserIds = studentUserRoles.map(ur => ur.userId.toString());
      }
    }

    // De-duplicate user IDs
    targetUserIds = [...new Set(targetUserIds)];

    // Create notifications in batch
    const notificationsToCreate = targetUserIds.map(userId => ({
      userId,
      type,
      title,
      message,
      link,
      metadata: { courseId }
    }));

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }

    res.json({ success: true, message: `Successfully broadcasted to ${targetUserIds.length} students` });
  } catch (error) {
    console.error('Error in broadcastNotification:', error);
    res.status(500).json({ success: false, message: 'Error broadcasting notification', error: error.message });
  }
};
