import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import paymentApi from '../../services/paymentApi';
import './UserPayments.css';

const UserPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentApi.getUserPayments(
        statusFilter === 'all' ? null : statusFilter,
        10,
        page * 10
      );
      setPayments(response.payments || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch payments');
      toast.error(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId) => {
    const reason = prompt('Enter refund reason (optional):');
    if (reason === null) return;

    try {
      await paymentApi.refundPayment(paymentId, reason);
      toast.success('Refund requested successfully');
      fetchPayments();
    } catch (err) {
      toast.error(err.message || 'Failed to request refund');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      success: 'success',
      pending: 'pending',
      processing: 'processing',
      failed: 'failed',
      cancelled: 'cancelled'
    };
    return statusMap[status] || 'pending';
  };

  const getPaymentTypeLabel = (type) => {
    return type === 'one-time' ? 'One-time Purchase' : 'Subscription';
  };

  if (loading) {
    return (
      <div className="user-payments">
        <div className="container">
          <div className="loading">Loading payments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-payments">
      <div className="container">
        <h1>My Payments</h1>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('all');
              setPage(0);
            }}
          >
            All
          </button>
          <button
            className={`tab ${statusFilter === 'success' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('success');
              setPage(0);
            }}
          >
            Completed
          </button>
          <button
            className={`tab ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('pending');
              setPage(0);
            }}
          >
            Pending
          </button>
          <button
            className={`tab ${statusFilter === 'failed' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('failed');
              setPage(0);
            }}
          >
            Failed
          </button>
        </div>

        {/* Payments Table */}
        {payments.length > 0 ? (
          <div className="payments-table-wrapper">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="course-name">
                      <div>
                        {payment.courseId?.courseName || 'Unknown Course'}
                      </div>
                      <small>ID: {payment.vnpayOrderId}</small>
                    </td>
                    <td>{getPaymentTypeLabel(payment.paymentType)}</td>
                    <td className="amount">
                      {payment.finalAmount?.toLocaleString('vi-VN')} ₫
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td>{new Date(payment.paidAt || payment.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="actions">
                      {payment.status === 'success' && (
                        <>
                          <button
                            className="btn-link"
                            onClick={() => handleRefund(payment._id)}
                            title="Request refund"
                          >
                            Refund
                          </button>
                          <button
                            className="btn-link"
                            onClick={() =>
                              window.open(
                                `/courses/${payment.courseId?._id}`,
                                '_blank'
                              )
                            }
                            title="Go to course"
                          >
                            View Course
                          </button>
                        </>
                      )}
                      {payment.status === 'pending' && (
                        <button
                          className="btn-link retry"
                          onClick={() => window.location.href = `/payment/${payment.courseId?._id}`}
                        >
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No payments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPayments;
