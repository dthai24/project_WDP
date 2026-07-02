const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect: authMiddleware } = require('../middlewares/authMiddleware');

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * GET /api/payment/pricing/:courseId
 * Lấy thông tin giá khóa học
 */
router.get('/pricing/:courseId', paymentController.getCoursePricingInfo);

/**
 * GET /api/payment/callback
 * Callback từ VNPay (IPN)
 */
router.get('/callback', paymentController.paymentCallback);

// ==========================================
// PROTECTED ROUTES (Cần auth)
// ==========================================

/**
 * POST /api/payment/create
 * Tạo đơn thanh toán
 */
router.post('/create', authMiddleware, paymentController.createPayment);

/**
 * GET /api/payment/status/:paymentId
 * Lấy trạng thái thanh toán
 */
router.get(
  '/status/:paymentId',
  authMiddleware,
  paymentController.getPaymentStatus
);

/**
 * GET /api/payment/user-payments
 * Lấy danh sách thanh toán của user
 */
router.get(
  '/user-payments',
  authMiddleware,
  paymentController.getUserPayments
);

/**
 * GET /api/payment/check-access/:courseId
 * Kiểm tra user có quyền truy cập khóa học không
 */
router.get(
  '/check-access/:courseId',
  authMiddleware,
  paymentController.checkCourseAccess
);

/**
 * POST /api/payment/refund/:paymentId
 * Hoàn tiền
 */
router.post('/refund/:paymentId', authMiddleware, paymentController.refundPayment);

module.exports = router;
