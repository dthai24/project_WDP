/**
 * RegisterPage  ─  Trang đăng ký tài khoản
 *
 * Props: không có (page component)
 *
 * State nội bộ:
 *   form     { fullName, email, phone, password, confirmPassword, dateOfBirth }
 *   errors   { fullName?, email?, phone?, password?, confirmPassword?, dateOfBirth?, general? }
 *   step     number  (1 = nhập thông tin, 2 = chờ OTP)
 *
 * ── API call ─────────────────────────────────────────────────────────────
 *   POST /api/auth/register  (qua registerApi)
 *
 *   Request JSON:
 *   {
 *     fullName:    string,
 *     email:       string,
 *     phone:       string,
 *     password:    string,
 *     dateOfBirth: string   // "YYYY-MM-DD"
 *   }
 *
 *   Response JSON (success):
 *   { success: true, message: "Mã OTP đã gửi đến email." }
 *
 *   Response JSON (fail):
 *   { success: false, message: "Email đã tồn tại." }
 *
 *   Sau khi gửi thành công → navigate('/verify-otp', { state: { email } })
 */
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import { registerApi } from '@/features/auth/services/authService';
import Logo from '@/shared/ui/Logo';
import AuthPasswordField from '@/shared/ui/AuthPasswordField';
import { toast } from '@/shared/ui/Toast';
import '@/shared/styles/auth.css';

const validateEmail = (email) => {
  if (!email || email.includes(' ')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
};

const validatePhone = (phone) => /^[0-9]{9,11}$/.test(phone.replace(/\s/g, ''));

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm]                 = useState({ fullName: '', dateOfBirth: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors]             = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef                   = useRef(false);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim())           errs.fullName        = 'Họ và tên không được để trống.';
    if (!form.dateOfBirth)               errs.dateOfBirth     = 'Ngày sinh không được để trống.';
    else if (form.dateOfBirth > todayStr()) errs.dateOfBirth   = 'Ngày sinh không được ở tương lai.';
    if (!form.phone.trim())              errs.phone           = 'Số điện thoại không được để trống.';
    else if (!validatePhone(form.phone)) errs.phone           = 'Số điện thoại không hợp lệ (9-11 chữ số).';
    if (!form.email.trim())              errs.email           = 'Email không được để trống.';
    else if (!validateEmail(form.email)) errs.email           = 'Email không hợp lệ.';
    if (!form.password)                  errs.password        = 'Mật khẩu không được để trống.';
    else if (form.password.length < 6)   errs.password        = 'Mật khẩu phải có ít nhất 6 ký tự.';
    if (!form.confirmPassword)           errs.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    return errs;
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const { ok, data } = await registerApi({
        fullName:    form.fullName.trim(),
        dateOfBirth: form.dateOfBirth,
        phone:       form.phone.trim(),
        email:       form.email.trim(),
        password:    form.password,
      });
      if (ok && data.success) {
        sessionStorage.setItem('pendingEmail', form.email.trim().toLowerCase());
        toast.success(data.message);
        navigate('/verify-otp');
      } else {
        toast.error(data.message || 'Đăng ký thất bại.');
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
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-brand">
          <Logo height={56} link={false} className="brand-logo" />
          <h1>English Master</h1>
          <p>Tạo tài khoản mới - Bắt đầu hành trình</p>
        </div>

        <hr className="auth-divider" />

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="reg-fullName">Họ và tên</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <PersonOutlineOutlinedIcon />
              </span>
              <input id="reg-fullName" type="text" name="fullName"
                placeholder="Nguyễn Văn A" value={form.fullName} onChange={handleChange}
                disabled={isSubmitting} />
            </div>
            {errors.fullName && <p className="field-error">{errors.fullName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-dob">Ngày sinh</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <CakeOutlinedIcon />
              </span>
              <input id="reg-dob" type="date" name="dateOfBirth"
                value={form.dateOfBirth} onChange={handleChange}
                max={todayStr()}
                disabled={isSubmitting} />
            </div>
            {errors.dateOfBirth && <p className="field-error">{errors.dateOfBirth}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-phone">Số điện thoại</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <PhoneOutlinedIcon />
              </span>
              <input id="reg-phone" type="tel" name="phone"
                placeholder="0901234567" value={form.phone} onChange={handleChange}
                disabled={isSubmitting} />
            </div>
            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <EmailOutlinedIcon />
              </span>
              <input id="reg-email" type="email" name="email" autoComplete="email"
                placeholder="example@gmail.com" value={form.email} onChange={handleChange}
                disabled={isSubmitting} />
            </div>
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <AuthPasswordField
            id="reg-password"
            name="password"
            label="Mật khẩu"
            placeholder="Tối thiểu 6 ký tự"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isSubmitting}
            autoComplete="new-password"
          />

          <AuthPasswordField
            id="reg-confirm"
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            disabled={isSubmitting}
            autoComplete="new-password"
            Icon={VpnKeyOutlinedIcon}
          />

          <button id="btn-register" type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting
              ? <><CircularProgress size={16} thickness={5} sx={{ color: 'inherit', mr: 1 }} />Đang gửi OTP...</>
              : 'Đăng ký & Nhận OTP'}
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản?{' '}
          <Link to="/login">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
}
