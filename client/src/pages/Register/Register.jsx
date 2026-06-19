import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from '../Auth/Auth.module.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    register(name, email);
    navigate('/home');
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.logo}>
          <img src="/logo.svg" alt="Luyện Từ" />
          <span className={styles.logoText}>Luyện Từ</span>
        </div>
        <h1 className={styles.title}>Đăng ký miễn phí</h1>
        <p className={styles.subtitle}>Bắt đầu học từ vựng ngay hôm nay — hoàn toàn miễn phí.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name">Họ và tên</label>
            <input id="name" type="text" placeholder="Nguyễn Văn A" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Mật khẩu</label>
            <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className={styles.submitBtn}>Tạo tài khoản</button>
        </form>

        <div className={styles.footer}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
        <Link to="/" className={styles.backLink}>← Về trang chủ</Link>
      </div>
    </div>
  );
}
