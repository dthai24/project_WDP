import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import paymentApi from '../../services/paymentApi';
import './PaymentPage.css';

const PaymentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseInfo, setCourseInfo] = useState(null);
  const [paymentType, setPaymentType] = useState('one-time');
  const [subscriptionMonths, setSubscriptionMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy thông tin khóa học
  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        setCourseLoading(true);
        const data = await paymentApi.getCoursePricing(courseId);
        setCourseInfo(data.data || data);
      } catch (err) {
        setError(err.message || 'Failed to load course information');
        toast.error(err.message || 'Failed to load course information');
      } finally {
        setCourseLoading(false);
      }
    };

    if (courseId) {
      fetchCourseInfo();
    }
  }, [courseId]);

  const handlePayment = async (bankCode) => {
    try {
      setLoading(true);
      const response = await paymentApi.createPayment(
        courseId,
        paymentType,
        paymentType === 'subscription' ? subscriptionMonths : 1,
        bankCode
      );

      if (response.paymentUrl) {
        // Redirect to VNPay payment
        window.location.href = response.paymentUrl;
      } else {
        toast.error('Failed to create payment URL');
      }
    } catch (err) {
      setError(err.message || 'Failed to create payment');
      toast.error(err.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  if (courseLoading) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="loading">
            <p>Loading course information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !courseInfo) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="error-box">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/courses')} className="btn btn-primary">
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!courseInfo || !courseInfo.isPaid) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="error-box">
            <h2>Free Course</h2>
            <p>This course is free. You can access it directly.</p>
            <button onClick={() => navigate(`/courses/${courseId}`)} className="btn btn-primary">
              Go to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  const originalPrice = courseInfo.price || 0;
  const discountAmount = courseInfo.discountAmount || 0;
  const finalPrice = courseInfo.finalPrice || originalPrice;

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-container">
          {/* Course Summary */}
          <div className="course-summary">
            <div className="summary-card">
              <h2>{courseInfo.courseName}</h2>

              <div className="pricing-info">
                {courseInfo.discountPercentage > 0 && (
                  <div className="discount-badge">
                    -{courseInfo.discountPercentage}%
                  </div>
                )}

                <div className="price-row">
                  {discountAmount > 0 && (
                    <p className="original-price">
                      {originalPrice.toLocaleString('vi-VN')} ₫
                    </p>
                  )}
                  <p className="final-price">
                    {finalPrice.toLocaleString('vi-VN')} ₫
                  </p>
                </div>

                {discountAmount > 0 && (
                  <p className="save-amount">
                    You save {discountAmount.toLocaleString('vi-VN')} ₫
                  </p>
                )}
              </div>

              {/* Payment Type Selection */}
              <div className="payment-type-selector">
                <label>
                  <input
                    type="radio"
                    name="paymentType"
                    value="one-time"
                    checked={paymentType === 'one-time'}
                    onChange={(e) => setPaymentType(e.target.value)}
                  />
                  <span>One-time Payment</span>
                </label>

                <label>
                  <input
                    type="radio"
                    name="paymentType"
                    value="subscription"
                    checked={paymentType === 'subscription'}
                    onChange={(e) => setPaymentType(e.target.value)}
                  />
                  <span>Subscription</span>
                </label>
              </div>

              {/* Subscription Duration */}
              {paymentType === 'subscription' && (
                <div className="subscription-options">
                  <label htmlFor="subscriptionMonths">Subscription Duration:</label>
                  <select
                    id="subscriptionMonths"
                    value={subscriptionMonths}
                    onChange={(e) => setSubscriptionMonths(parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 6, 12].map((month) => (
                      <option key={month} value={month}>
                        {month} Month{month > 1 ? 's' : ''} ({(finalPrice * month).toLocaleString('vi-VN')} ₫)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Payment Method Info */}
              <div className="payment-method-info">
                <h4>Payment Method</h4>
                <div className="vnpay-info">
                  <img src="https://vnpay.vn/images/logo-vnpay.svg" alt="VNPay" className="vnpay-logo" />
                  <p>You will be redirected to VNPay to complete your payment securely.</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="order-summary">
                <h4>Order Summary</h4>
                <div className="summary-item">
                  <span>Course Price:</span>
                  <span>{originalPrice.toLocaleString('vi-VN')} ₫</span>
                </div>
                {discountAmount > 0 && (
                  <div className="summary-item discount">
                    <span>Discount ({courseInfo.discountPercentage}%):</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                {paymentType === 'subscription' && (
                  <div className="summary-item">
                    <span>Duration:</span>
                    <span>{subscriptionMonths} month{subscriptionMonths > 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="summary-item total">
                  <span>Total:</span>
                  <span className="total-amount">
                    {(finalPrice * (paymentType === 'subscription' ? subscriptionMonths : 1)).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  className="btn btn-primary btn-pay"
                  onClick={() => handlePayment()}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => navigate(`/courses/${courseId}`)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>

              {/* Security Notice */}
              <div className="security-notice">
                <p>
                  🔒 Your payment information is secure and encrypted. We use VNPay
                  for safe transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
