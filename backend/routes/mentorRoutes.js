const express = require('express');
const router = express.Router();

const {
    getStudentsInCourse
} = require('../controllers/mentorController');


const optionalAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'] || req.query.userId;

    if (userId) {
        req.user = {
            userId: Number(userId),
        };
    }

    next();
};
router.get('/courses/:courseId/students', getStudentsInCourse);
module.exports = router;