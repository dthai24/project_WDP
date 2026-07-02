import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import paymentApi from '../../services/paymentApi';
import './ShoppingCart.css';

const ShoppingCart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error parsing cart:', err);
      }
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (updatedCart) => {
    localStorage.setItem('shoppingCart', JSON.stringify(updatedCart));
    setCart(updatedCart);
  };

  const addToCart = (course) => {
    if (!course.isPaid) {
      toast.info('This course is free');
      return;
    }

    const existingItem = cart.find((item) => item._id === course._id);
    if (existingItem) {
      toast.warning('This course is already in your cart');
      return;
    }

    const newCart = [...cart, course];
    saveCart(newCart);
    toast.success('Course added to cart');
  };

  const removeFromCart = (courseId) => {
    const newCart = cart.filter((item) => item._id !== courseId);
    saveCart(newCart);
    toast.info('Course removed from cart');
  };

  const calculateTotal = () => {
    return cart.reduce((total, course) => {
      const discount = (course.price * (course.discountPercentage || 0)) / 100;
      return total + (course.price - discount);
    }, 0);
  };

  const handleCheckout = async (courseId) => {
    try {
      setLoading(true);
      navigate(`/payment/${courseId}`);
    } catch (err) {
      toast.error(err.message || 'Error proceeding to payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutAll = async () => {
    if (cart.length === 0) {
      toast.warning('Cart is empty');
      return;
    }

    // For simplicity, checkout first course
    // In a real scenario, you might want to support bulk purchase
    handleCheckout(cart[0]._id);
  };

  if (cart.length === 0) {
    return (
      <div className="shopping-cart">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Start adding courses to your cart to purchase them</p>
            <button
              onClick={() => navigate('/courses')}
              className="btn btn-primary"
            >
              Browse Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shopping-cart">
      <div className="container">
        <div className="cart-wrapper">
          {/* Cart Items */}
          <div className="cart-items">
            <h1>Shopping Cart ({cart.length})</h1>

            <div className="items-list">
              {cart.map((course) => {
                const discount = (course.price * (course.discountPercentage || 0)) / 100;
                const finalPrice = course.price - discount;

                return (
                  <div key={course._id} className="cart-item">
                    <div className="item-thumbnail">
                      <img src={course.thumbnail} alt={course.courseName} />
                      {course.discountPercentage > 0 && (
                        <div className="discount-badge">
                          -{course.discountPercentage}%
                        </div>
                      )}
                    </div>

                    <div className="item-details">
                      <h3>{course.courseName}</h3>
                      {course.description && (
                        <p className="description">{course.description.substring(0, 100)}...</p>
                      )}

                      <div className="item-price">
                        {discount > 0 && (
                          <span className="original-price">
                            {course.price.toLocaleString('vi-VN')} ₫
                          </span>
                        )}
                        <span className="final-price">
                          {finalPrice.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    </div>

                    <div className="item-actions">
                      <button
                        onClick={() => handleCheckout(course._id)}
                        className="btn btn-buy"
                        disabled={loading}
                      >
                        Buy Now
                      </button>
                      <button
                        onClick={() => removeFromCart(course._id)}
                        className="btn btn-remove"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>

              <div className="summary-items">
                {cart.map((course) => {
                  const discount = (course.price * (course.discountPercentage || 0)) / 100;
                  const finalPrice = course.price - discount;

                  return (
                    <div key={course._id} className="summary-item">
                      <span>{course.courseName}</span>
                      <span className="price">
                        {finalPrice.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>{calculateTotal().toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="total-row taxes">
                  <span>Tax (10%):</span>
                  <span>{(calculateTotal() * 0.1).toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="total-row final">
                  <span>Total:</span>
                  <span className="amount">
                    {(calculateTotal() * 1.1).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckoutAll}
                className="btn btn-checkout"
                disabled={loading || cart.length === 0}
              >
                {loading ? 'Processing...' : `Checkout (${cart.length})`}
              </button>

              <button
                onClick={() => navigate('/courses')}
                className="btn btn-continue-shopping"
              >
                Continue Shopping
              </button>

              <div className="security-badge">
                <p>🔒 Secure payment with VNPay</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
