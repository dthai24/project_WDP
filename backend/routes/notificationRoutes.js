const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect: authMiddleware } = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, notificationController.getUserNotifications);
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead);
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

module.exports = router;
