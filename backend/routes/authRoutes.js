const express = require('express');
const router  = express.Router();
const { login, register, verifyOtp, getTags, savePreferences } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/verify-otp
router.post('/verify-otp', verifyOtp);

// GET /api/auth/tags — lấy danh sách 12 chủ đề khảo sát
router.get('/tags', getTags);

// POST /api/auth/save-preferences — lưu sở thích người dùng
router.post('/save-preferences', savePreferences);

module.exports = router;
