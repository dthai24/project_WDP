const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // User & Course
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },

  // Payment Info
  paymentType: {
    type: String,
    enum: ['one-time', 'subscription'],
    default: 'one-time'
  },
  amount: { 
    type: Number, 
    required: true 
  }, // Số tiền (VNĐ)
  discountAmount: { 
    type: Number, 
    default: 0 
  },
  finalAmount: { 
    type: Number, 
    required: true 
  }, // Số tiền sau giảm

  // VNPay Info
  vnpayOrderId: { 
    type: String, 
    unique: true, 
    sparse: true 
  }, // Mã giao dịch VNPay
  transactionCode: { 
    type: String, 
    unique: true, 
    sparse: true 
  }, // Mã giao dịch VNPay (VNP_TransactionNo)
  bankCode: String, // Ngân hàng thanh toán
  bankTransactionNo: String, // Mã giao dịch ngân hàng

  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: String, // VNPay, Momo, ZaloPay, etc
  paymentDescription: String,

  // Subscription fields (nếu paymentType = 'subscription')
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  subscriptionDurationMonths: {
    type: Number,
    default: 1
  },
  isSubscriptionActive: {
    type: Boolean,
    default: false
  },
  autoRenewal: {
    type: Boolean,
    default: true
  },

  // Error handling
  errorMessage: String,
  errorCode: String,

  // Tracking
  paidAt: Date,
  failedAt: Date,
  cancelledAt: Date,
  refundAmount: { type: Number, default: 0 },
  refundAt: Date,
  refundReason: String,

}, { timestamps: true });

// Index for quick lookups
paymentSchema.index({ userId: 1, courseId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });
// NOTE: vnpayOrderId index is already created via unique: true

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
