<<<<<<< HEAD
// courseRoutes.js
const express = require('express');
const router = express.Router();
const { getCourses, getTopCourses, getMyCourses, enrollCourse } = require('../controllers/courseController');

router.post('/enroll', enrollCourse); // POST /api/courses/enroll

router.get('/', getCourses);        // GET /api/courses
router.get('/top', getTopCourses);  // GET /api/courses/top?limit=4
router.get('/my', getMyCourses);

module.exports = router;
=======
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getCourses } = require('../controllers/courseController');

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

router.get('/', optionalAuth, getCourses);

module.exports = router;
>>>>>>> origin/Nguyen_Tan_Dung_HE194923
