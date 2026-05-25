// courseRoutes.js
const express = require('express');
const router = express.Router();
const { getCourses, getTopCourses, getMyCourses, enrollCourse } = require('../controllers/courseController');

router.post('/enroll', enrollCourse); // POST /api/courses/enroll

router.get('/', getCourses);        // GET /api/courses
router.get('/top', getTopCourses);  // GET /api/courses/top?limit=4
router.get('/my', getMyCourses);

module.exports = router;