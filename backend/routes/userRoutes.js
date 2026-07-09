const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getProfile, updateProfile, changePassword, updateGoals, applyMentor, getMyCoursesList } = require('../controllers/userController');
const { uploadAvatar, avatarUploadMiddleware } = require('../controllers/avatarController');

// All routes require authentication
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// POST /api/users/avatar — upload merged avatar (face + reward frame)
router.post('/avatar', protect, avatarUploadMiddleware, uploadAvatar);

// PUT /api/users/goals 
router.put('/goals', protect, updateGoals);

// POST /api/users/apply-mentor
router.post('/apply-mentor', protect, applyMentor);

// GET /api/users/courses — Danh sách khoá học của học viên (dùng token)
router.get('/courses', protect, getMyCoursesList);

module.exports = router;

