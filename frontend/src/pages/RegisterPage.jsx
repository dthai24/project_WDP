import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import { registerApi } from '../services/authService';
import Logo from '../components/common/Logo';
import AuthPasswordField from '../components/common/AuthPasswordField';
import '../styles/auth.css';

const validateEmail = (email) => {
  if (!email || email.includes(' ')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
};

const validatePhone = (phone) => /^[0-9]{9,11}$/.test(phone.replace(/\s/g, ''));

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm]       = useState({ fullName: '', dateOfBirth: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors]   = useState({});
  const [alert, setAlert]     = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim())        errs.fullName       = 'Họ và tên không được để trống.';
    if (!form.dateOfBirth)            errs.dateOfBirth    = 'Ngày sinh không được để trống.';
    if (!form.phone.trim())           errs.phone          = 'Số điện thoại không được để trống.';
    else if (!validatePhone(form.phone)) errs.phone       = 'Số điện thoại không hợp lệ (9-11 chữ số).';
    if (!form.email.trim())           errs.email          = 'Email không được để trống.';
    else if (!validateEmail(form.email)) errs.email       = 'Email không hợp lệ.';
    if (!form.password)               errs.password       = 'Mật khẩu không được để trống.';
    else if (form.password.length < 6) errs.password      = 'Mật khẩu phải có ít nhất 6 ký tự.';
    if (!form.confirmPassword)        errs.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu xác nhận không khớp.';
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
      const { ok, data } = await registerApi({
        fullName:    form.fullName.trim(),
        dateOfBirth: form.dateOfBirth,
        phone:       form.phone.trim(),
        email:       form.email.trim(),
        password:    form.password,
      });
      if (ok && data.success) {
        sessionStorage.setItem('pendingEmail', form.email.trim().toLowerCase());
        setAlert({ type: 'success', message: data.message });
        setTimeout(() => navigate('/verify-otp'), 1500);
      } else {
        setAlert({ type: 'error', message: data.message || 'Đăng ký thất bại.' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Không thể kết nối server. Vui lòng kiểm tra backend.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-brand">
          <Logo height={56} link={false} className="brand-logo" />
          <h1>S.T.A.R Learning Path</h1>
          <p>Tạo tài khoản mới - Bắt đầu hành trình</p>
        </div>

        <hr className="auth-divider" />

        {alert && (
          <div className={`form-alert ${alert.type}`} style={{ marginBottom: '16px' }}>
            {alert.message}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="reg-fullName">Họ và tên</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <PersonOutlineOutlinedIcon />
              </span>
              <input id="reg-fullName" type="text" name="fullName"
                placeholder="Nguyễn Văn A" value={form.fullName} onChange={handleChange} />
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
                value={form.dateOfBirth} onChange={handleChange} />
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
                placeholder="0901234567" value={form.phone} onChange={handleChange} />
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
                placeholder="example@gmail.com" value={form.email} onChange={handleChange} />
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
            autoComplete="new-password"
            Icon={VpnKeyOutlinedIcon}
          />

          <button id="btn-register" type="submit" className="btn-primary" disabled={loading}>
            {loading && <span className="btn-spinner" />}
            {loading ? 'Đang gửi OTP...' : 'Đăng ký & Nhận OTP'}
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
