/**
 * LoginPage  ─  Trang đăng nhập
 *
 * Props: không có (page component, mounted bởi React Router)
 *
 * State nội bộ:
 *   form        { email, password }
 *   errors      { email?, password?, general? }
 *   isSubmitting boolean
 *   remember    boolean  — lưu email vào localStorage
 *
 * ── Fetch / Side-effects ──────────────────────────────────────────────────
 *   useEffect: đọc localStorage[REMEMBER_KEY] khi mount để pre-fill email
 *
 * ── API call ─────────────────────────────────────────────────────────────
 *   POST /api/auth/login  (qua loginApi)
 *
 *   Request JSON:
 *   { email: string, password: string }
 *
 *   Response JSON (success):
 *   {
 *     success:  true,
 *     user: { userId, fullName, email, role, isFirstLogin }
 *   }
 *
 *   Response JSON (fail):
 *   { success: false, message: string }
 *
 *   Sau đăng nhập thành công:
 *   - Lưu user vào localStorage['star_user']
 *   - isFirstLogin === true  → navigate('/survey')
 *   - Admin                  → navigate('/admin/accounts')
 *   - Mentor                 → navigate('/mentor/courses')
 *   - otherwise              → navigate('/home')
 */
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import { loginApi } from '@/features/auth/services/authService';
import { getPostLoginPath, isAuthenticatedUser } from '@/features/auth/utils/authUtils';
import Logo from '@/shared/ui/Logo';
import AuthPasswordField from '@/shared/ui/AuthPasswordField';
import { toast } from '@/shared/ui/Toast';
import '@/shared/styles/auth.css';
import { useAuth } from '@/context/AuthContext';

const REMEMBER_KEY = 'star_remember_email';

const validateEmail = (email) => {
  if (!email || email.includes(' ')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remember, setRemember] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setForm((prev) => ({ ...prev, email: saved }));
      setRemember(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticatedUser()) {
      navigate(getPostLoginPath(), { replace: true });
    }
  }, [navigate]);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email không được để trống.';
    else if (!validateEmail(form.email)) errs.email = 'Email không hợp lệ (phải có @, dấu chấm, tên miền, không khoảng trắng).';
    if (!form.password) errs.password = 'Mật khẩu không được để trống.';
    return errs;
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Chặn đồng bộ ngay — trước khi React kịp re-render
    if (submittingRef.current) return;

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const { ok, data } = await loginApi(form.email.trim(), form.password);
      if (ok) {
        if (remember) {
          localStorage.setItem(REMEMBER_KEY, form.email.trim());

        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
        login(data);
        toast.success('Đăng nhập thành công!');
        navigate(getPostLoginPath(data, { isFirstLogin: data.isFirstLogin }));
      } else {
        toast.error(data?.message);
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    } catch {
      toast.error('Không thể kết nối server. Vui lòng kiểm tra backend.');
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Logo height={56} link={false} className="brand-logo" />
          <h1>S.T.A.R Learning Path</h1>
          <p>Đăng nhập để tiếp tục hành trình học tập</p>
        </div>

        <hr className="auth-divider" />

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <EmailOutlinedIcon />
              </span>
              <input
                id="login-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="example@gmail.com"
                value={form.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <AuthPasswordField
            id="login-password"
            name="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isSubmitting}
            autoComplete="current-password"
          />

          <div className="auth-form-options">
            <label className="auth-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={isSubmitting}
              />
              Ghi nhớ đăng nhập
            </label>
            <div className="forgot-link">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>
          </div>

          <button
            id="btn-login"
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <><CircularProgress size={16} thickness={5} sx={{ color: 'inherit', mr: 1 }} />Đang đăng nhập...</>
              : 'Đăng nhập'}
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
