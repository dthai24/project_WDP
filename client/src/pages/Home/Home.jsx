import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { weekDays, roadmaps } from '../../data/mockData';
import styles from './Home.module.css';

const quickActions = [
  { label: 'Thêm từ', description: 'Tạo từ vựng cá nhân', to: '/words', icon: '➕', bg: '#e0f2fe', color: '#0284c7' },
  { label: 'Luyện tập', description: 'Flashcard & Games', to: '/practice', icon: '⚡', bg: '#f3e8ff', color: '#9333ea' },
  { label: 'Xếp hạng', description: 'Xem thành tích', to: '/leaderboard', icon: '🏆', bg: '#ffedd5', color: '#ea580c' },
  { label: 'Cộng đồng', description: 'Facebook & Zalo', to: '#', icon: '👥', bg: '#dcfce7', color: '#1f8f31' },
];

export default function Home() {
  const { user } = useApp();
  const navigate = useNavigate();
  const progress = user.totalWords > 0 ? Math.round((user.learnedWords / user.totalWords) * 100) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <div className={styles.avatarBlock} onClick={() => navigate('/store')} role="presentation">
          <img src={user.avatar} alt={user.name} />
        </div>

        <div className={styles.statsBlock}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{user.totalWords}</div>
              <div className={styles.statLabel}>Tổng từ</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{user.learnedWords}</div>
              <div className={styles.statLabel}>Đã thuộc</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{progress}%</div>
              <div className={styles.statLabel}>Tiến độ</div>
            </div>
            <div
              className={`${styles.statItem} ${user.dueWords > 0 ? styles.statItemDue : ''}`}
              onClick={() => user.dueWords > 0 && navigate('/practice')}
              role="presentation"
            >
              <div className={styles.statValue}>{user.dueWords > 0 ? user.dueWords : user.learnedWords}</div>
              <div className={styles.statLabel}>{user.dueWords > 0 ? 'Từ đến hạn' : 'Đã thuộc'}</div>
            </div>
          </div>
        </div>

        <div className={styles.streakBlock}>
          <div className={styles.streakHeader}>
            <span className={styles.fireIcon}>🔥</span>
            <span className={styles.streakTitle}>CHUỖI NGÀY HỌC</span>
          </div>
          <div className={styles.streakCount}>
            {user.currentStreak}
            <span className={styles.streakUnit}>ngày</span>
          </div>
          <div className={styles.weekDays}>
            {weekDays.map((day) => (
              <div
                key={day.label}
                className={`${styles.dayDot} ${day.isActive ? styles.active : ''} ${day.isToday ? styles.today : ''}`}
              >
                <div className={styles.dot}>{day.isActive && '🔥'}</div>
                <span className={styles.dayLabel}>{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Truy cập nhanh</h2>
      <div className={styles.quickActions}>
        {quickActions.map((action) => (
          <Link key={action.label} to={action.to} className={styles.actionCard}>
            <div className={styles.actionIcon} style={{ background: action.bg, color: action.color }}>
              {action.icon}
            </div>
            <div className={styles.actionInfo}>
              <h3>{action.label}</h3>
              <p>{action.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.roadmapSection}>
        <h2 className={styles.sectionTitle}>Lộ trình học tập</h2>
        <div className={styles.roadmapPreview}>
          <div className={styles.roadmapCards}>
            {roadmaps.map((roadmap) => (
              <Link key={roadmap.id} to="/roadmap" className={styles.roadmapCard}>
                <h4 style={{ color: roadmap.color }}>{roadmap.title}</h4>
                <p>{roadmap.subtitle}</p>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${roadmap.progress}%`, background: roadmap.color }}
                  />
                </div>
                <div className={styles.progressText}>
                  {roadmap.completedDecks}/{roadmap.totalDecks} bộ từ · {roadmap.progress}%
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
