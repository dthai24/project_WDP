import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordApi } from '../services/authService';
import '../styles/auth.css';

const COOLDOWN_KEY = 'otpCooldownEnd'; // localStorage key
const COOLDOWN_MS  = 300_000;          // 5 minutes in ms

const validateEmail = (email) => {
  if (!email || email.includes(' ')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
};

const formatTime = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

/** Reads localStorage and returns remaining cooldown seconds (0 if expired/absent). */
const getRemainingCooldown = () => {
  const end = parseInt(localStorage.getItem(COOLDOWN_KEY) || '0', 10);
  if (!end) return 0;
  const remaining = Math.ceil((end - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email,     setEmail]     = useState('');
  const [error,     setError]     = useState('');
  const [alert,     setAlert]     = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [cooldown,  setCooldown]  = useState(0); // seconds remaining
  const timerRef = useRef(null);

  // ── On mount: resume cooldown from localStorage if still active ──
  useEffect(() => {
    const remaining = getRemainingCooldown();
    if (remaining > 0) startCountdown(remaining);

    // Clear timer on unmount
    return () => clearInterval(timerRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Starts the visual countdown from `seconds`. Clears localStorage when done. */
  const startCountdown = (seconds) => {
    setCooldown(seconds);
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          localStorage.removeItem(COOLDOWN_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Form submit ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault(); // always prevent default first

    // Guard: still in cooldown
    if (cooldown > 0) return;

    const trimmed = email.trim();
    if (!trimmed)                { setError('Email không được để trống.'); return; }
    if (!validateEmail(trimmed)) { setError('Email không hợp lệ.'); return; }

    setLoading(true);
    setError('');
    setAlert(null);

    try {
      // Only send { email } — no role info at all
      const { ok, data } = await forgotPasswordApi(trimmed.toLowerCase());

      if (ok && data.success) {
        // ① Persist cooldown end timestamp to localStorage
        localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS));

        // ② Start 5-minute visual countdown
        startCountdown(COOLDOWN_MS / 1000);

        // ③ Save email for ResetPasswordPage
        sessionStorage.setItem('resetEmail', trimmed.toLowerCase());

        setAlert({ type: 'success', message: data.message });
        setTimeout(() => navigate('/reset-password'), 1500);
      } else {
        setAlert({ type: 'error', message: data.message || 'Không thể gửi OTP. Vui lòng thử lại.' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Không thể kết nối server. Vui lòng kiểm tra backend.' });
    } finally {
      setLoading(false);
    }
  };

  const isBlocked = cooldown > 0 || loading;

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <span className="brand-icon">🔑</span>
          <h1>S.T.A.R Learning Path</h1>
          <p>Khôi phục mật khẩu của bạn</p>
        </div>

        <hr className="auth-divider" />

        {/* Alert banner */}
        {alert && (
          <div className={`form-alert ${alert.type}`} style={{ marginBottom: '16px' }}>
            {alert.message}
          </div>
        )}

        <p style={{
          color: 'var(--clr-text-dim)',
          fontSize: '13.5px',
          textAlign: 'center',
          marginBottom: '20px',
          lineHeight: '1.6',
        }}>
          Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi mã OTP 6 chữ số để đặt lại mật khẩu.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="forgot-email">Email đã đăng ký</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="forgot-email"
                type="email"
                placeholder="example@gmail.com"
                autoComplete="email"
                autoFocus
                value={email}
                disabled={isBlocked}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                  setAlert(null);
                }}
              />
            </div>
            {error && <p className="field-error">{error}</p>}
          </div>

          {/* Cooldown hint — shown while timer is active */}
          {cooldown > 0 && (
            <div className="otp-timer" style={{ marginTop: '4px' }}>
              <span className="time-display">{formatTime(cooldown)}</span>
              <span>Gửi lại OTP sau {formatTime(cooldown)}</span>
            </div>
          )}

          <button
            id="btn-send-otp"
            type="submit"
            className="btn-primary"
            disabled={isBlocked}
            style={{ marginTop: '8px' }}
          >
            {loading && <span className="btn-spinner" />}
            {loading
              ? 'Đang gửi OTP...'
              : cooldown > 0
              ? `⏳ Gửi lại sau ${formatTime(cooldown)}`
              : '📨 Gửi mã OTP'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">← Quay lại Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
