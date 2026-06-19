import { storeItems } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import shared from '../shared.module.css';

const typeLabels = {
  avatar: 'Avatar',
  background: 'Hình nền',
  effect: 'Hiệu ứng',
  sound: 'Âm thanh',
  frame: 'Khung',
  sticker: 'Sticker',
};

export default function Store() {
  const { user } = useApp();

  return (
    <div>
      <h1 className={shared.pageTitle}>Cửa hàng</h1>
      <p className={shared.pageDesc}>
        Dùng coin kiếm được từ luyện tập để mở khóa avatar, hình nền và vật phẩm.
        Bạn có <strong style={{ color: '#1cb0f6' }}>{user.coins.toLocaleString()} 🪙</strong> coin.
      </p>

      <div className={shared.grid}>
        {storeItems.map((item) => (
          <div key={item.id} className={shared.card}>
            <div
              className={shared.cardIcon}
              style={{
                background: item.type === 'background' ? item.image : `${item.type === 'avatar' ? '#e0f2fe' : '#fef9c3'}`,
                width: '100%',
                height: 120,
                borderRadius: 12,
                marginBottom: 12,
                overflow: 'hidden',
              }}
            >
              {item.type === 'avatar' ? (
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : item.type === 'background' ? (
                <div style={{ width: '100%', height: '100%', background: item.image }} />
              ) : (
                <span style={{ fontSize: '3rem' }}>{item.image}</span>
              )}
            </div>
            <span className={shared.tag}>{typeLabels[item.type]}</span>
            <h3 className={shared.cardTitle}>{item.name}</h3>
            <div className={shared.meta}>
              {item.owned ? (
                <span style={{ color: '#23ac38', fontWeight: 700 }}>✅ Đã sở hữu</span>
              ) : (
                <>
                  <span>🪙 {item.price}</span>
                  <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} style={{ padding: '8px 16px' }}>
                    Mua
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
