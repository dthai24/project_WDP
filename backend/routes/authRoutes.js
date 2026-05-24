const express = require('express');
const router  = express.Router();
const {
  login,
  register,
  verifyOtp,
  getTags,
  savePreferences,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

// POST /api/auth/login — tất cả roles (Admin, Mentor, Student)
router.post('/login', login);

// POST /api/auth/register — chỉ dành cho Student (tự đăng ký)
router.post('/register', register);

// POST /api/auth/verify-otp — xác thực OTP đăng ký
router.post('/verify-otp', verifyOtp);

// GET /api/auth/tags — lấy danh sách 12 chủ đề khảo sát
router.get('/tags', getTags);

// POST /api/auth/save-preferences — lưu sở thích người dùng
router.post('/save-preferences', savePreferences);

// POST /api/auth/forgot-password — gửi OTP đặt lại mật khẩu (tất cả roles)
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password — xác nhận OTP và cập nhật mật khẩu (tất cả roles)
router.post('/reset-password', resetPassword);

module.exports = router;
