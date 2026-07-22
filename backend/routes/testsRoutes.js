const express = require('express');
const router = express.Router();
const {
  getTestMeta,
  startTestAttempt,
  submitTestAttempt,
  listTestQuestions,
  createTestQuestion,
  updateTestQuestion,
  deleteTestQuestion
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

// Mentor CRUD — quản lý câu hỏi bài kiểm tra cuối khóa
router.get('/:courseId/tests/final/questions', optionalAuth, listTestQuestions);
router.post('/:courseId/tests/final/questions', optionalAuth, createTestQuestion);
router.put('/:courseId/tests/final/questions/:questionId', optionalAuth, updateTestQuestion);
router.delete('/:courseId/tests/final/questions/:questionId', optionalAuth, deleteTestQuestion);

module.exports = router;
