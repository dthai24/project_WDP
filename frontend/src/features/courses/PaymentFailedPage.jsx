import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import paymentApi from '../../services/paymentApi';
import './PaymentStatus.css';

const PaymentFailedPage = () => {
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
        console.error('Error:', err);
        // Continue even if we can't fetch details
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId]);

  const handleRetry = () => {
    if (payment?.courseId?._id) {
      navigate(`/payment/${payment.courseId._id}`);
    }
  };

  if (loading) {
    return (
      <div className="payment-status-page failed">
        <div className="container">
          <div className="status-card loading">
            <div className="spinner"></div>
            <p>Loading payment details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-status-page failed">
      <div className="container">
        <div className="status-card failed-card">
          <div className="failed-icon">✕</div>
          <h1>Payment Failed</h1>

          <div className="failed-message">
            <p>
              {payment?.errorMessage ||
                error ||
                'Your payment could not be processed. Please try again.'}
            </p>
          </div>

          {payment && (
            <div className="payment-details">
              <div className="detail-row">
                <span className="label">Order ID:</span>
                <span className="value">{payment.vnpayOrderId || orderId}</span>
              </div>

              <div className="detail-row">
                <span className="label">Course:</span>
                <span className="value">{payment.courseId?.courseName}</span>
              </div>

              <div className="detail-row">
                <span className="label">Amount:</span>
                <span className="value">
                  {payment.finalAmount?.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              <div className="detail-row">
                <span className="label">Status:</span>
                <span className="value status-failed">{payment.status}</span>
              </div>

              {payment.errorCode && (
                <div className="detail-row">
                  <span className="label">Error Code:</span>
                  <span className="value">{payment.errorCode}</span>
                </div>
              )}

              <div className="detail-row">
                <span className="label">Date & Time:</span>
                <span className="value">
                  {new Date(payment.failedAt || payment.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
          )}

          <div className="failure-reasons">
            <h3>Possible Reasons:</h3>
            <ul>
              <li>Insufficient balance in your bank account</li>
              <li>Card/account was declined by the bank</li>
              <li>Incorrect card information</li>
              <li>Connection timeout during transaction</li>
              <li>Transaction was cancelled</li>
            </ul>
          </div>

          <div className="action-buttons">
            <button onClick={handleRetry} className="btn btn-primary">
              Try Again
            </button>
            <button onClick={() => navigate('/courses')} className="btn btn-outline">
              Browse Courses
            </button>
          </div>

          <div className="support-section">
            <p>
              💬 If you need help, please contact our support team at{' '}
              <strong>support@wdp.edu.vn</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
