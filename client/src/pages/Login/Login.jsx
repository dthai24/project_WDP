import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from '../Auth/Auth.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
    navigate('/home');
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.logo}>
          <img src="/logo.svg" alt="Luyện Từ" />
          <span className={styles.logoText}>Luyện Từ</span>
        </div>
        <h1 className={styles.title}>Đăng nhập</h1>
        <p className={styles.subtitle}>Chào mừng trở lại! Tiếp tục hành trình học từ vựng.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Mật khẩu</label>
            <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className={styles.submitBtn}>Đăng nhập</button>
        </form>

        <div className={styles.footer}>
          Chưa có tài khoản? <Link to="/register">Đăng ký miễn phí</Link>
        </div>
        <Link to="/" className={styles.backLink}>← Về trang chủ</Link>
      </div>
    </div>
  );
}
