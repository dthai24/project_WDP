const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getDashboard,
  getUsers,
  createUser,
  getUserDetail,
  updateUser,
  toggleUserStatus,
  deleteUser,
  updateUserRoles,
  getRoles,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getLevels,
  createLevel,
  updateLevel,
  deleteLevel,
  getCourses,
  updateCourse,
  deleteCourse,
  getApplications,
  getApplicationDetail,
  approveApplication,
  rejectApplication,
  approveCourse,
  rejectCourse,
  approveCourseUpdates,
  rejectCourseUpdates,
  getAuditLogs,
} = require('../controllers/adminController');


const UserRole = require('../models/MongoDB/UserRole');
const Role = require('../models/MongoDB/Role');

// Middleware kiểm tra quyền Admin
const adminOnly = async (req, res, next) => {
  try {
    // Lấy userId từ protect middleware
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }
    // Kiểm tra role Admin từ header hoặc có thể query DB
    // Đơn giản: dùng header x-role-name hoặc query DB
    const roleName = req.headers['x-role-name'];
    if (roleName && roleName.toLowerCase() === 'admin') {
      return next();
    }
    // Fallback: kiểm tra từ MongoDB
    const adminRole = await Role.findOne({ roleName: { $regex: /^admin$/i } });
    if (!adminRole) {
      return res.status(500).json({ success: false, message: 'Lỗi cấu hình hệ thống' });
    }
    const userRole = await UserRole.findOne({ userId, roleId: adminRole._id });
    if (userRole) {
      return next();
    } else {
      return res.status(403).json({ success: false, message: 'Không có quyền Admin' });
    }
  } catch (err) {
    console.error('[AdminOnly Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ========== DASHBOARD ==========
router.get('/dashboard', protect, adminOnly, getDashboard);

// ========== USERS ==========
router.get('/users', protect, adminOnly, getUsers);
router.post('/users', protect, adminOnly, createUser);
router.get('/users/:userId', protect, adminOnly, getUserDetail);
router.put('/users/:userId', protect, adminOnly, updateUser);
router.patch('/users/:userId/status', protect, adminOnly, toggleUserStatus);
router.delete('/users/:userId', protect, adminOnly, deleteUser);
router.put('/users/:userId/roles', protect, adminOnly, updateUserRoles);


// ========== ROLES ==========
router.get('/roles', protect, adminOnly, getRoles);

// ========== CATEGORIES ==========
router.get('/categories', protect, adminOnly, getCategories);
router.post('/categories', protect, adminOnly, createCategory);
router.put('/categories/:categoryId', protect, adminOnly, updateCategory);
router.delete('/categories/:categoryId', protect, adminOnly, deleteCategory);

// ========== LEVELS ==========
router.get('/levels', protect, adminOnly, getLevels);
router.post('/levels', protect, adminOnly, createLevel);
router.put('/levels/:levelId', protect, adminOnly, updateLevel);
router.delete('/levels/:levelId', protect, adminOnly, deleteLevel);

// ========== COURSES ==========
router.get('/courses', protect, adminOnly, getCourses);
router.put('/courses/:courseId', protect, adminOnly, updateCourse);
router.delete('/courses/:courseId', protect, adminOnly, deleteCourse);
router.post('/courses/:courseId/approve', protect, adminOnly, approveCourse);
router.post('/courses/:courseId/reject', protect, adminOnly, rejectCourse);
router.post('/courses/:courseId/approve-updates', protect, adminOnly, approveCourseUpdates);
router.post('/courses/:courseId/reject-updates', protect, adminOnly, rejectCourseUpdates);

// ========== MENTOR APPLICATIONS ==========
router.get('/applications', protect, adminOnly, getApplications);
router.get('/applications/:applicationId', protect, adminOnly, getApplicationDetail);
router.post('/applications/:applicationId/approve', protect, adminOnly, approveApplication);
router.post('/applications/:applicationId/reject', protect, adminOnly, rejectApplication);

// ========== EDIT HISTORY ==========
router.get('/history', protect, adminOnly, getAuditLogs);

module.exports = router;
