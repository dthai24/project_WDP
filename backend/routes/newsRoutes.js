const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', newsController.getNewsList);
router.get('/:id', newsController.getNewsById);

// Protected routes (cần đăng nhập)
router.post('/', protect, newsController.createNews);
router.put('/:id', protect, newsController.updateNews);
router.delete('/:id', protect, newsController.deleteNews);

module.exports = router;
