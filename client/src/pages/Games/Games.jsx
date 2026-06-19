import { games } from '../../data/mockData';
import shared from '../shared.module.css';

export default function Games() {
  return (
    <div>
      <h1 className={shared.pageTitle}>Game luyện tập</h1>
      <p className={shared.pageDesc}>6 chế độ game tương tác giúp bạn học từ vựng vui và hiệu quả hơn.</p>

      <div className={shared.grid}>
        {games.map((game) => (
          <div key={game.id} className={shared.card}>
            <div className={shared.cardIcon} style={{ background: `${game.color}20`, fontSize: '2rem' }}>
              {game.icon}
            </div>
            <h3 className={shared.cardTitle}>{game.name}</h3>
            <p className={shared.cardDesc}>{game.description}</p>
            <div className={shared.meta}>
              <span>👥 {game.players.toLocaleString()} lượt chơi</span>
              <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} style={{ padding: '8px 16px' }}>
                Chơi ngay
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
