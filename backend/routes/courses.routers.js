const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getAllCourses, getMyCourses } = require('../controllers/courses.controller');

// Some endpoints might not strictly require auth, but we use protect or a soft-auth middleware to extract userId
// I will use a custom middleware inline for optional auth, or just use protect if it's required.
// For now, I will use a soft middleware to allow both logged-in and guests.
const optionalAuth = require('../middlewares/authMiddleware').optionalAuth || ((req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (userId) {
    req.user = { userId };
  }
  next();
});

router.get('/', optionalAuth, getAllCourses);

router.post('/my-courses', optionalAuth, getMyCourses)

module.exports = router;
