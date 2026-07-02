import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import paymentApi from '../../services/paymentApi';
import './PaymentStatus.css';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const paymentId = searchParams.get('paymentId');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!paymentId) {
        setError('Invalid payment ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await paymentApi.getPaymentStatus(paymentId);
        setPayment(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch payment details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId]);

  if (loading) {
    return (
      <div className="payment-status-page success">
        <div className="container">
          <div className="status-card loading">
            <div className="spinner"></div>
            <p>Verifying your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-status-page">
        <div className="container">
          <div className="status-card error">
            <div className="error-icon">⚠️</div>
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

  return (
    <div className="payment-status-page success">
      <div className="container">
        <div className="status-card success-card">
          <div className="success-icon">✓</div>
          <h1>Payment Successful!</h1>

          <div className="success-message">
            <p>Thank you for your purchase. Your transaction has been completed successfully.</p>
          </div>

          {payment && (
            <div className="payment-details">
              <div className="detail-row">
                <span className="label">Order ID:</span>
                <span className="value">{payment.vnpayOrderId || orderId}</span>
              </div>

              <div className="detail-row">
                <span className="label">Transaction ID:</span>
                <span className="value">{payment.transactionCode || 'N/A'}</span>
              </div>

              <div className="detail-row">
                <span className="label">Course:</span>
                <span className="value">{payment.courseId?.courseName}</span>
              </div>

              <div className="detail-row">
                <span className="label">Amount Paid:</span>
                <span className="value amount">
                  {payment.finalAmount?.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              <div className="detail-row">
                <span className="label">Payment Method:</span>
                <span className="value">VNPay</span>
              </div>

              {payment.paymentType === 'subscription' && (
                <>
                  <div className="detail-row">
                    <span className="label">Subscription Duration:</span>
                    <span className="value">{payment.subscriptionDurationMonths} month(s)</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Start Date:</span>
                    <span className="value">
                      {new Date(payment.subscriptionStartDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="label">End Date:</span>
                    <span className="value">
                      {new Date(payment.subscriptionEndDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </>
              )}

              <div className="detail-row">
                <span className="label">Date & Time:</span>
                <span className="value">
                  {new Date(payment.paidAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button
              onClick={() => navigate(`/courses/${payment?.courseId?._id}`)}
              className="btn btn-primary"
            >
              Go to Course
            </button>
            <button onClick={() => navigate('/student/my-courses')} className="btn btn-outline">
              My Courses
            </button>
          </div>

          <div className="confirmation-email">
            <p>📧 A confirmation email has been sent to your registered email address.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
