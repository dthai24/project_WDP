const express = require('express');
const router = express.Router();
const {
  submitPlacementTest,
  submitEssay,
  getEssayHistory,
  getPlacementTestRecommendations
} = require('../controllers/studentController');

// POST /api/student/placement-test/submit
router.post('/placement-test/submit', submitPlacementTest);

// GET /api/student/placement-test/recommendations
router.get('/placement-test/recommendations', getPlacementTestRecommendations);

// POST /api/student/essay/submit
router.post('/essay/submit', submitEssay);

// GET /api/student/essay/history
router.get('/essay/history', getEssayHistory);

module.exports = router;
