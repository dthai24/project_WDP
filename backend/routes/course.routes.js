const express = require('express');;
const courseRoutes = express.Router();

const { getAllCourses, getMyCourses } = require('../controllers/course.controller');
courseRoutes.get('/', getAllCourses);

courseRoutes.get('/my-courses', getMyCourses);

module.exports = courseRoutes;