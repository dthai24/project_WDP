import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginApi } from '../services/authService';
import '../styles/auth.css';

const validateEmail = (email) => {
  if (!email || email.includes(' ')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
};

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [alert, setAlert]     = useState(null); // { type: 'error'|'success', message }
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.trim())           errs.email    = 'Email không được để trống.';
    else if (!validateEmail(form.email)) errs.email = 'Email không hợp lệ (phải có @, dấu chấm, tên miền, không khoảng trắng).';
    if (!form.password)               errs.password = 'Mật khẩu không được để trống.';
    return errs;
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setAlert(null);
    try {
      const { ok, data } = await loginApi(form.email.trim(), form.password);
      if (ok && data.success) {
        setAlert({ type: 'success', message: data.message });
        sessionStorage.setItem('user', JSON.stringify(data.user));

        // Routing theo isFirstLogin
        setTimeout(() => {
          if (data.user.isFirstLogin) {
            navigate('/survey'); // Lần đầu → Khảo sát sở thích
          } else {
            navigate('/');       // Đã làm rồi → Thẳng Newsfeed
          }
        }, 800);
      } else {
        setAlert({ type: 'error', message: data.message || 'Đăng nhập thất bại.' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Không thể kết nối server. Vui lòng kiểm tra backend.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon">⭐</span>
          <h1>S.T.A.R Learning Path</h1>
          <p>Đăng nhập để tiếp tục hành trình học tập</p>
        </div>

        <hr className="auth-divider" />

        {alert && (
          <div className={`form-alert ${alert.type}`} style={{ marginBottom: '16px' }}>
            {alert.message}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="login-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="example@gmail.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Mật khẩu</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="login-password"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div className="forgot-link">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <button id="btn-login" type="submit" className="btn-primary" disabled={loading}>
            {loading && <span className="btn-spinner" />}
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-footer">
          Chưa có tài khoản?{' '}
          <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
