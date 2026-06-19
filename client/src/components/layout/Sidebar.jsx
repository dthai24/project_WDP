import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiHome,
  HiFolder,
  HiBookOpen,
  HiLightningBolt,
  HiPlay,
  HiMap,
  HiTrendingUp,
  HiShoppingBag,
  HiChevronLeft,
  HiChevronRight,
  HiMoon,
  HiSun,
} from 'react-icons/hi';
import { FaCrown } from 'react-icons/fa';
import { useApp } from '../../context/AppContext';
import { navItems } from '../../data/mockData';
import styles from './Sidebar.module.css';

const iconMap = {
  home: HiHome,
  folder: HiFolder,
  book: HiBookOpen,
  flashcard: HiLightningBolt,
  game: HiPlay,
  roadmap: HiMap,
  trophy: HiTrendingUp,
  store: HiShoppingBag,
  vip: FaCrown,
};

export default function Sidebar() {
  const navigate = useNavigate();
  const {
    user,
    darkMode,
    setDarkMode,
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarOpen,
    setSidebarOpen,
  } = useApp();

  const handleNavClick = () => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      <aside
        className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''} ${sidebarOpen ? styles.open : ''}`}
      >
        <nav>
          <ul className={styles.navList}>
            {navItems.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `${styles.navItem} ${isActive ? styles.active : ''} ${item.isVip ? styles.vipItem : ''}`
                    }
                    onClick={handleNavClick}
                    style={{ '--item-color': item.color }}
                  >
                    <div className={styles.navItemInner}>
                      <div
                        className={styles.navIcon}
                        style={{ background: `${item.color}20`, color: item.color }}
                      >
                        <Icon />
                      </div>
                      <span className={styles.navLabel} style={{ color: undefined }}>
                        {item.label}
                      </span>
                      {item.isVip && <span className={styles.vipBadge}>VIP</span>}
                    </div>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          className={styles.collapseBtn}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {sidebarCollapsed ? <HiChevronRight size={18} /> : <HiChevronLeft size={18} />}
        </button>

        <div className={styles.userSection}>
          <div className={styles.userCard} onClick={() => navigate('/home')} role="presentation">
            <img src={user.avatar} alt={user.name} className={styles.avatar} />
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userHint}>Xem hồ sơ</div>
            </div>
          </div>
        </div>

        <div className={styles.bottomActions}>
          <button type="button" className={styles.coinsBtn} onClick={() => navigate('/store')}>
            <span>🪙</span>
            <span className={styles.coinsText}>{user.coins.toLocaleString()}</span>
          </button>
          <button type="button" className={styles.themeBtn} onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <HiSun size={18} /> : <HiMoon size={18} />}
            <span className={styles.themeLabel}>{darkMode ? 'Sáng' : 'Tối'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
