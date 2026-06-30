const express = require('express');
const router = express.Router();
const {
  getTestMeta,
  startTestAttempt,
  submitTestAttempt
} = require('../controllers/testsController');

// Optional auth helper to set user object if x-user-id header is provided
const optionalAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.query.userId || req.body.userId;
  if (userId) {
    req.user = { userId: String(userId) };
  }
  next();
};

// GET /api/courses/:courseId/tests/:scope/meta
router.get('/:courseId/tests/:scope/meta', optionalAuth, getTestMeta);

// POST /api/courses/:courseId/tests/:scope/start
router.post('/:courseId/tests/:scope/start', optionalAuth, startTestAttempt);

// POST /api/courses/:courseId/tests/attempts/:attemptId/submit
router.post('/:courseId/tests/attempts/:attemptId/submit', optionalAuth, submitTestAttempt);

module.exports = router;
