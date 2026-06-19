import { roadmaps } from '../../data/mockData';
import shared from '../shared.module.css';
import styles from './Roadmap.module.css';

const statusMap = {
  completed: { label: 'Hoàn thành', icon: '✅', class: styles.completed, statusClass: styles.statusCompleted },
  'in-progress': { label: 'Đang học', icon: '📖', class: styles.inProgress, statusClass: styles.statusProgress },
  locked: { label: 'Chưa mở', icon: '🔒', class: styles.locked, statusClass: styles.statusLocked },
};

export default function Roadmap() {
  return (
    <div>
      <h1 className={shared.pageTitle}>Lộ trình học tập</h1>
      <p className={shared.pageDesc}>Lộ trình rõ ràng cho TOEIC, IELTS và học theo level từ cơ bản đến nâng cao.</p>

      <div className={styles.roadmapList}>
        {roadmaps.map((roadmap) => (
          <div key={roadmap.id} className={styles.roadmapItem}>
            <div className={styles.roadmapHeader}>
              <div>
                <div className={styles.roadmapTitle} style={{ color: roadmap.color }}>{roadmap.title}</div>
                <div className={styles.roadmapSubtitle}>{roadmap.subtitle}</div>
              </div>
              <div className={styles.roadmapProgress}>
                <div className={styles.progressPercent} style={{ color: roadmap.color }}>{roadmap.progress}%</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  {roadmap.completedDecks}/{roadmap.totalDecks} bộ từ
                </div>
              </div>
            </div>

            <div className={shared.progressBar} style={{ marginBottom: 20 }}>
              <div className={shared.progressFill} style={{ width: `${roadmap.progress}%`, background: roadmap.color }} />
            </div>

            <div className={styles.stages}>
              {roadmap.stages.map((stage) => {
                const s = statusMap[stage.status];
                return (
                  <div key={stage.name} className={styles.stage}>
                    <div className={`${styles.stageIcon} ${s.class}`}>{s.icon}</div>
                    <div className={styles.stageInfo}>
                      <div className={styles.stageName}>{stage.name}</div>
                      <div className={styles.stageWords}>{stage.words} từ vựng</div>
                    </div>
                    <span className={`${styles.stageStatus} ${s.statusClass}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
