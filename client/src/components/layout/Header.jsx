import { useNavigate } from 'react-router-dom';
import { HiMenu, HiMoon, HiSun } from 'react-icons/hi';
import { useApp } from '../../context/AppContext';
import styles from './Header.module.css';

export default function Header() {
  const navigate = useNavigate();
  const { user, darkMode, setDarkMode, setSidebarOpen } = useApp();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={() => setSidebarOpen(true)}
          aria-label="Mở menu"
        >
          <HiMenu size={22} />
        </button>
        <button
          type="button"
          className={styles.brand}
          onClick={() => navigate('/home')}
        >
          <img src="/logo.svg" alt="Luyện Từ" className={styles.logo} />
          <span className={styles.brandText}>Luyện Từ</span>
        </button>
      </div>

      <div className={styles.right}>
        <button type="button" className={styles.coins} onClick={() => navigate('/store')}>
          <span className={styles.coinIcon}>🪙</span>
          <span className={styles.coinText}>{user.coins.toLocaleString()}</span>
        </button>

        {!user.isPro && (
          <button type="button" className={styles.upgradePro} onClick={() => navigate('/pricing')}>
            <span>⭐</span>
            <span className={styles.proText}>Nâng cấp Pro</span>
          </button>
        )}

        <button
          type="button"
          className={styles.themeToggle}
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Đổi giao diện"
        >
          {darkMode ? <HiSun /> : <HiMoon />}
        </button>
      </div>
    </header>
  );
}
