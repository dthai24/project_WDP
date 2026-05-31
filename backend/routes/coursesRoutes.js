const express = require('express');
const router = express.Router();

const {
    getMyCourses
} = require('../controllers/coursesController');

const optionalAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'] || req.query.userId;

    if (userId) {
        req.user = {
            userId: Number(userId),
        };
    }

    next();
};

// GET /api/courses
// Lấy tất cả khóa học
// Nếu có userId thì lấy kèm progress của user đó


// POST /api/courses/my-courses
// Lấy khóa học theo role student / mentor
router.post('/my-courses', getMyCourses);

module.exports = router;