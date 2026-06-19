import { useState } from 'react';
import { leaderboard } from '../../data/mockData';
import shared from '../shared.module.css';
import styles from './Leaderboard.module.css';

export default function LeaderboardPage() {
  const [tab, setTab] = useState('streak');
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div>
      <h1 className={shared.pageTitle}>Bảng xếp hạng</h1>
      <p className={shared.pageDesc}>Xem thành tích và so sánh với cộng đồng người học.</p>

      <div className={styles.tabs}>
        <button type="button" className={`${styles.tab} ${tab === 'streak' ? styles.tabActive : ''}`} onClick={() => setTab('streak')}>
          🔥 Streak
        </button>
        <button type="button" className={`${styles.tab} ${tab === 'words' ? styles.tabActive : ''}`} onClick={() => setTab('words')}>
          📚 Từ vựng
        </button>
        <button type="button" className={`${styles.tab} ${tab === 'coins' ? styles.tabActive : ''}`} onClick={() => setTab('coins')}>
          🪙 Coin
        </button>
      </div>

      <div className={styles.podium}>
        <div className={`${styles.podiumItem} ${styles.podiumSecond}`}>
          <div className={styles.podiumRank}>🥈</div>
          <img src={top3[1].avatar} alt={top3[1].name} className={styles.podiumAvatar} />
          <div className={styles.podiumName}>{top3[1].name}</div>
          <div className={styles.podiumStats}>🔥 {top3[1].streak} ngày</div>
          <div className={styles.podiumBar} />
        </div>
        <div className={`${styles.podiumItem} ${styles.podiumFirst}`}>
          <div className={styles.podiumRank}>🥇</div>
          <img src={top3[0].avatar} alt={top3[0].name} className={styles.podiumAvatar} />
          <div className={styles.podiumName}>{top3[0].name}</div>
          <div className={styles.podiumStats}>🔥 {top3[0].streak} ngày</div>
          <div className={styles.podiumBar} />
        </div>
        <div className={`${styles.podiumItem} ${styles.podiumThird}`}>
          <div className={styles.podiumRank}>🥉</div>
          <img src={top3[2].avatar} alt={top3[2].name} className={styles.podiumAvatar} />
          <div className={styles.podiumName}>{top3[2].name}</div>
          <div className={styles.podiumStats}>🔥 {top3[2].streak} ngày</div>
          <div className={styles.podiumBar} />
        </div>
      </div>

      <div className={styles.list}>
        {rest.map((user) => (
          <div key={user.rank} className={`${styles.listItem} ${user.isCurrentUser ? styles.currentUser : ''}`}>
            <span className={styles.rank}>{user.rank}</span>
            <img src={user.avatar} alt={user.name} className={styles.avatar} />
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.name} {user.isCurrentUser && '(Bạn)'}</div>
              <div className={styles.userStreak}>🔥 {user.streak} ngày streak</div>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statValue}>{user.words.toLocaleString()}</div>
                <div className={styles.statLabel}>Từ</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>{user.coins.toLocaleString()}</div>
                <div className={styles.statLabel}>Coin</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
