const express = require('express');
const courseRoutes = express.Router();

const {
    getAllCourses,
    getMyCourses,
} = require('../controllers/course.controller');

// POST /api/courses
courseRoutes.post('/', getAllCourses);

// POST /api/courses/my-courses
courseRoutes.post('/my-courses', getMyCourses);

module.exports = courseRoutes;