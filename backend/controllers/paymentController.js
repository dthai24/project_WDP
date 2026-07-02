const Payment = require('../models/MongoDB/Payment');
const Course = require('../models/MongoDB/Course');
const User = require('../models/MongoDB/User');
const UserCourse = require('../models/MongoDB/UserCourse');
const vnpayService = require('../services/vnpayService');

// ==========================================
// 1. CREATE PAYMENT - TẠO ĐƠN HÀNG
// ==========================================
exports.createPayment = async (req, res) => {
  try {
    const { courseId, paymentType = 'one-time', subscriptionDurationMonths = 1 } = req.body;
    const userId = req.user?.userId || req.user?._id || req.user?.id;

    // Simple validation
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Lấy thông tin khóa học
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.isPaid || course.price === 0) {
      return res.status(400).json({ message: 'This course is free' });
    }

    // Check xem user đã mua khóa học này chưa
    const existingPayment = await Payment.findOne({
      userId,
      courseId,
      status: 'success'
    });

    if (existingPayment && paymentType === 'one-time') {
      return res.status(400).json({ message: 'You have already purchased this course' });
    }

    // Tính toán số tiền
    const discountPercentage = course.discountPercentage || 0;
    const amount = course.price;
    const discountAmount = Math.floor((amount * discountPercentage) / 100);
    const finalAmount = amount - discountAmount;

    if (!vnpayService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'VNPay chưa được cấu hình. Thêm VNP_TMN_CODE và VNP_HASH_SECRET vào file backend/.env rồi restart server.',
        code: 'VNPAY_NOT_CONFIGURED',
      });
    }

    // Tạo Payment record
    const orderId = vnpayService.generateOrderId(userId, courseId);
    
    const payment = new Payment({
      userId,
      courseId,
      paymentType,
      amount,
      discountAmount,
      finalAmount,
      vnpayOrderId: orderId,
      status: 'pending',
      paymentMethod: 'VNPay',
      paymentDescription: `Thanh toan khoa hoc ${course.courseName}`,
      subscriptionDurationMonths: paymentType === 'subscription' ? subscriptionDurationMonths : 1
    });

    await payment.save();

    // Tạo VNPay payment URL
    const paymentUrl = vnpayService.createPaymentUrl({
      orderId,
      amount: finalAmount,
      description: payment.paymentDescription,
      userId,
      courseId,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(201).json({
      success: true,
      paymentId: payment._id,
      orderId,
      paymentUrl,
      amount: finalAmount,
      currency: 'VND'
    });

  } catch (error) {
    console.error('Error in createPayment:', error);
    res.status(500).json({ 
      message: 'Error creating payment', 
      error: error.message 
    });
  }
};

// ==========================================
// 2. PAYMENT CALLBACK - NHẬN PHẢN HỒI TỪ VNPAY
// ==========================================
exports.paymentCallback = async (req, res) => {
  try {
    // Verify VNPay response
    const verificationResult = vnpayService.verifyPaymentResponse(req.query);

    if (!verificationResult.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid signature' 
      });
    }

    const { orderId, responseCode, transactionStatus } = verificationResult;
    const isSuccessful = responseCode === '00' && transactionStatus === '00';

    // Tìm Payment record
    const payment = await Payment.findOne({ vnpayOrderId: orderId });
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    // Update payment status
    if (isSuccessful) {
      payment.status = 'success';
      payment.paidAt = new Date();
      payment.transactionCode = verificationResult.transactionNo;
      payment.bankCode = verificationResult.bankCode;
      payment.bankTransactionNo = verificationResult.bankTranNo;

      await payment.save();

      // Add course to user (enroll user)
      await enrollUserInCourse(payment.userId, payment.courseId, payment);

      // Calculate subscription dates
      if (payment.paymentType === 'subscription') {
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + payment.subscriptionDurationMonths * 30 * 24 * 60 * 60 * 1000);
        
        payment.subscriptionStartDate = startDate;
        payment.subscriptionEndDate = endDate;
        payment.isSubscriptionActive = true;
        await payment.save();
      }

      // Redirect to success page
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?orderId=${orderId}&paymentId=${payment._id}`);
    } else {
      payment.status = 'failed';
      payment.failedAt = new Date();
      payment.errorMessage = verificationResult.data?.vnp_Message || 'Payment failed';
      payment.errorCode = responseCode;
      await payment.save();

      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?orderId=${orderId}&paymentId=${payment._id}`);
    }

  } catch (error) {
    console.error('Error in paymentCallback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing payment callback', 
      error: error.message 
    });
  }
};

// ==========================================
// 3. GET PAYMENT STATUS
// ==========================================
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.userId || req.user?._id || req.user?.id;

    const payment = await Payment.findById(paymentId)
      .populate('courseId', 'courseName')
      .populate('userId', 'fullName email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check authorization
    if (payment.userId._id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(payment);

  } catch (error) {
    console.error('Error in getPaymentStatus:', error);
    res.status(500).json({ 
      message: 'Error fetching payment status', 
      error: error.message 
    });
  }
};

// ==========================================
// 4. GET USER PAYMENTS
// ==========================================
exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    const { status, limit = 10, skip = 0 } = req.query;

    let query = { userId };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('courseId', 'courseName thumbnail price')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

  } catch (error) {
    console.error('Error in getUserPayments:', error);
    res.status(500).json({ 
      message: 'Error fetching user payments', 
      error: error.message 
    });
  }
};

// ==========================================
// 5. CHECK IF USER OWNS COURSE
// ==========================================
exports.checkCourseAccess = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.userId || req.user?._id || req.user?.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Free course
    if (!course.isPaid) {
      return res.json({ 
        success: true, 
        hasAccess: true, 
        reason: 'Free course',
        course: { _id: course._id, courseName: course.courseName }
      });
    }

    // Paid course - check if user has active payment
    const payment = await Payment.findOne({
      userId,
      courseId,
      status: 'success'
    });

    if (!payment) {
      return res.json({ 
        success: true, 
        hasAccess: false,
        course: { _id: course._id, courseName: course.courseName, price: course.price }
      });
    }

    // Check subscription expiry
    if (payment.paymentType === 'subscription' && payment.subscriptionEndDate) {
      const isExpired = new Date() > payment.subscriptionEndDate;
      
      return res.json({
        success: true,
        hasAccess: !isExpired,
        payment,
        subscriptionExpired: isExpired,
        subscriptionEndDate: payment.subscriptionEndDate
      });
    }

    res.json({ 
      success: true, 
      hasAccess: true,
      payment 
    });

  } catch (error) {
    console.error('Error in checkCourseAccess:', error);
    res.status(500).json({ 
      message: 'Error checking course access', 
      error: error.message 
    });
  }
};

// ==========================================
// HELPER FUNCTION: ENROLL USER IN COURSE
// ==========================================
async function enrollUserInCourse(userId, courseId, payment) {
  try {
    // Check if already enrolled
    let userCourse = await UserCourse.findOne({ userId, courseId });

    if (!userCourse) {
      userCourse = new UserCourse({
        userId,
        courseId,
        enrollmentDate: new Date(),
        progressPercentage: 0,
        paymentId: payment._id,
      });
    } else {
      userCourse.paymentId = payment._id;
    }

    await userCourse.save();
    console.log(`User ${userId} enrolled in course ${courseId}`);
  } catch (error) {
    console.error('Error enrolling user in course:', error);
  }
}

// ==========================================
// 6. REFUND PAYMENT
// ==========================================
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { refundReason } = req.body;
    const userId = req.user?.userId || req.user?._id || req.user?.id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (payment.status !== 'success') {
      return res.status(400).json({ message: 'Cannot refund this payment' });
    }

    // Check refund window (e.g., 7 days)
    const refundWindow = 7 * 24 * 60 * 60 * 1000; // 7 days
    const timeSincePurchase = Date.now() - payment.paidAt.getTime();
    
    if (timeSincePurchase > refundWindow) {
      return res.status(400).json({ message: 'Refund period has expired' });
    }

    payment.status = 'cancelled';
    payment.cancelledAt = new Date();
    payment.refundAmount = payment.finalAmount;
    payment.refundReason = refundReason;
    await payment.save();

    // Remove course access
    await UserCourse.deleteOne({ userId, courseId: payment.courseId });

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      refundAmount: payment.finalAmount
    });

  } catch (error) {
    console.error('Error in refundPayment:', error);
    res.status(500).json({ 
      message: 'Error processing refund', 
      error: error.message 
    });
  }
}

// ==========================================
// 7. GET COURSE PRICING INFO
// ==========================================
exports.getCoursePricingInfo = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      success: true,
      courseId: course._id,
      courseName: course.courseName,
      isPaid: course.isPaid,
      price: course.price,
      discountPercentage: course.discountPercentage,
      discountAmount: Math.floor((course.price * course.discountPercentage) / 100),
      finalPrice: course.price - Math.floor((course.price * course.discountPercentage) / 100),
      currency: 'VND'
    });

  } catch (error) {
    console.error('Error in getCoursePricingInfo:', error);
    res.status(500).json({ 
      message: 'Error fetching pricing info', 
      error: error.message 
    });
  }
};
