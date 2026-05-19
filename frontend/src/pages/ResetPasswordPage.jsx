import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPasswordApi, forgotPasswordApi } from '../services/authService';
import '../styles/auth.css';

const OTP_LENGTH  = 6;
const OTP_SECONDS = 300; // 5 phút

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const email    = sessionStorage.getItem('resetEmail') || '';

  const [digits,      setDigits]      = useState(Array(OTP_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [timeLeft,    setTimeLeft]    = useState(OTP_SECONDS);
  const [errors,      setErrors]      = useState({});
  const [alert,       setAlert]       = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [resending,   setResending]   = useState(false);
  const inputRefs = useRef([]);

  // Redirect nếu không có email trong session
  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true });
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── OTP digit handlers ──────────────────────────────────────
  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next  = [...digits];
    next[index] = digit;
    setDigits(next);
    setErrors((p) => ({ ...p, otp: '' }));
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === 'Enter') handleSubmit();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (text.length === OTP_LENGTH) {
      setDigits(text.split(''));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    const otp = digits.join('');
    const errs = {};
    if (otp.length < OTP_LENGTH)         errs.otp         = 'Vui lòng nhập đủ 6 chữ số OTP.';
    if (timeLeft <= 0)                   errs.otp         = 'Mã OTP đã hết hạn. Vui lòng gửi lại.';
    if (!newPassword)                    errs.newPassword  = 'Mật khẩu mới không được để trống.';
    else if (newPassword.length < 6)     errs.newPassword  = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
    if (confirmPass !== newPassword)     errs.confirmPass  = 'Mật khẩu xác nhận không khớp.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setAlert(null);
    try {
      // Chỉ gửi email + otp + newPassword — không có role nào
      const { ok, data } = await resetPasswordApi(email, otp, newPassword);
      if (ok && data.success) {
        setAlert({ type: 'success', message: data.message });
        sessionStorage.removeItem('resetEmail');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setAlert({ type: 'error', message: data.message || 'Đặt lại mật khẩu thất bại.' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Không thể kết nối server.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true);
    setDigits(Array(OTP_LENGTH).fill(''));
    setAlert(null);
    try {
      const { ok, data } = await forgotPasswordApi(email);
      if (ok && data.success) {
        setTimeLeft(OTP_SECONDS);
        setAlert({ type: 'success', message: 'Mã OTP mới đã được gửi. Vui lòng kiểm tra hộp thư.' });
        inputRefs.current[0]?.focus();
      } else {
        setAlert({ type: 'error', message: data.message || 'Không thể gửi lại OTP.' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Không thể kết nối server.' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon">🔒</span>
          <h1>S.T.A.R Learning Path</h1>
          <p>Đặt lại mật khẩu</p>
        </div>

        <hr className="auth-divider" />

        {alert && (
          <div className={`form-alert ${alert.type}`} style={{ marginBottom: '16px' }}>
            {alert.message}
          </div>
        )}

        <p className="otp-email-hint">
          Nhập mã OTP 6 chữ số đã gửi đến <span>{email}</span>
        </p>

        {/* OTP grid */}
        <div className="otp-grid" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              id={`reset-otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className={`otp-input ${d ? 'filled' : ''}`}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading || timeLeft <= 0}
            />
          ))}
        </div>
        {errors.otp && <p className="field-error" style={{ textAlign: 'center', marginTop: '4px' }}>{errors.otp}</p>}

        {/* Timer */}
        <div className="otp-timer">
          <span className={`time-display ${timeLeft === 0 ? 'expired' : ''}`}>
            {timeLeft > 0 ? formatTime(timeLeft) : 'Hết hạn'}
          </span>
          {timeLeft > 0
            ? <span>Mã còn hiệu lực trong {formatTime(timeLeft)}</span>
            : <span style={{ color: '#ff6b6b' }}>Mã đã hết hạn — hãy gửi lại</span>}
        </div>

        {/* New password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
          <div className="form-group">
            <label htmlFor="reset-new-password">Mật khẩu mới</label>
            <div className="input-wrapper">
              <span className="input-icon">🔑</span>
              <input
                id="reset-new-password"
                type={showPass ? 'text' : 'password'}
                placeholder="Ít nhất 6 ký tự"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: '', confirmPass: '' })); }}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-dim)', fontSize: '16px', padding: 0, lineHeight: 1 }}
              >{showPass ? '🙈' : '👁️'}</button>
            </div>
            {errors.newPassword && <p className="field-error">{errors.newPassword}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="reset-confirm-password">Xác nhận mật khẩu mới</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="reset-confirm-password"
                type={showPass ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu"
                value={confirmPass}
                onChange={(e) => { setConfirmPass(e.target.value); setErrors((p) => ({ ...p, confirmPass: '' })); }}
              />
            </div>
            {errors.confirmPass && <p className="field-error">{errors.confirmPass}</p>}
          </div>

          <button
            id="btn-reset-password"
            type="button"
            className="btn-primary"
            disabled={loading || timeLeft <= 0 || digits.join('').length < OTP_LENGTH}
            onClick={handleSubmit}
          >
            {loading && <span className="btn-spinner" />}
            {loading ? 'Đang xử lý...' : '✅ Đặt lại mật khẩu'}
          </button>

          <button
            type="button"
            className="btn-secondary"
            disabled={resending || timeLeft > 0}
            onClick={handleResend}
          >
            {resending ? 'Đang gửi...' : '🔄 Gửi lại mã OTP'}
          </button>
        </div>

        <div className="auth-footer" style={{ marginTop: '16px' }}>
          <Link to="/forgot-password">← Nhập email lại</Link>
          {' · '}
          <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
