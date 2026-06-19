import { classes } from '../../data/mockData';
import shared from '../shared.module.css';

export default function Classes() {
  return (
    <div>
      <h1 className={shared.pageTitle}>Lớp học</h1>
      <p className={shared.pageDesc}>Tham gia lớp học, học chung bộ từ vựng với giáo viên và bạn bè.</p>

      <div className={shared.toolbar}>
        <input type="text" className={shared.searchInput} placeholder="Nhập mã lớp để tham gia..." />
        <button type="button" className={`${shared.btn} ${shared.btnPrimary}`}>Tham gia lớp</button>
        <button type="button" className={shared.btn} style={{ background: 'var(--surface)', border: '2px solid var(--sidebar-border)' }}>
          + Tạo lớp mới
        </button>
      </div>

      <div className={shared.grid}>
        {classes.map((cls) => (
          <div key={cls.id} className={shared.card}>
            <div className={shared.cardIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>🏫</div>
            <h3 className={shared.cardTitle}>{cls.name}</h3>
            <p className={shared.cardDesc}>Giáo viên: {cls.teacher}</p>
            <div className={shared.tags}>
              <span className={shared.tag}>Mã: {cls.code}</span>
              <span className={shared.tag}>{cls.students} học sinh</span>
              <span className={shared.tag}>{cls.decks} bộ từ</span>
            </div>
            <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}>
              Vào lớp
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
