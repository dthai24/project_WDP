const express = require('express');
const router = express.Router();
const { getCourses, getTopCourses, getMyCourses, enrollCourse } = require('../controllers/courseController');

const optionalAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (userId) {
        req.user = { userId: parseInt(userId, 10) };
    }
    next();
};

router.get('/', optionalAuth, getCourses);
router.get('/top', getTopCourses);
router.get('/my', getMyCourses);
router.post('/enroll', enrollCourse);

module.exports = router;
