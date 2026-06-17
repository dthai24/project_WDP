const express = require('express');
const router = express.Router();

const {
    getStudentsInCourse,
    setPublishCourse,
    setDraftCourse
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
router.get('/courses/:courseId/setPublic', setPublishCourse);
router.get('/courses/:courseId/setDraft', setDraftCourse);
module.exports = router;