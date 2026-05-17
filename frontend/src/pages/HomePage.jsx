import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

export default function HomePage() {
  const navigate  = useNavigate();
  const userRaw   = sessionStorage.getItem('user');
  const user      = userRaw ? JSON.parse(userRaw) : {};

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0918',
      fontFamily: "'Inter', sans-serif",
      color: '#e2e0f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{
        position: 'fixed', borderRadius: '50%', filter: 'blur(80px)',
        opacity: 0.3, pointerEvents: 'none',
        width: 500, height: 500,
        background: 'radial-gradient(circle, #6c63ff, #a78bfa)',
        top: -150, left: -150, zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', borderRadius: '50%', filter: 'blur(80px)',
        opacity: 0.2, pointerEvents: 'none',
        width: 400, height: 400,
        background: 'radial-gradient(circle, #a78bfa, #6c63ff)',
        bottom: -130, right: -100, zIndex: 0,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '48px 40px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        textAlign: 'center',
        animation: 'cardIn 0.5s cubic-bezier(0.34,1.3,0.64,1) both',
      }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🌟</div>

        <h1 style={{
          fontSize: '28px', fontWeight: 900, margin: '0 0 8px',
          background: 'linear-gradient(135deg, #fff 30%, #a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Chào mừng trở lại!
        </h1>
        <p style={{ color: '#a78bfa', fontSize: 18, fontWeight: 600, margin: '0 0 4px' }}>
          {user.fullName || 'Học viên'}
        </p>
        <p style={{ color: '#8885a0', fontSize: 13, margin: '0 0 32px' }}>
          {user.email}
        </p>

        <div style={{
          background: 'rgba(108,99,255,0.1)',
          border: '1px solid rgba(108,99,255,0.2)',
          borderRadius: 14,
          padding: '20px 24px',
          marginBottom: 32,
          textAlign: 'left',
        }}>
          <p style={{ color: '#8885a0', fontSize: 13, margin: '0 0 6px' }}>📬 Newsfeed</p>
          <p style={{ color: '#e2e0f0', fontSize: 15 }}>
            Trang chủ S.T.A.R Learning Path đang được xây dựng. 
            Hãy chờ đợi những tính năng thú vị sắp tới! 🚀
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: '12px 32px',
            background: 'rgba(255,107,107,0.15)',
            border: '1px solid rgba(255,107,107,0.35)',
            borderRadius: 12,
            color: '#ff6b6b',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(255,107,107,0.25)'}
          onMouseLeave={e => e.target.style.background = 'rgba(255,107,107,0.15)'}
        >
          🚪 Đăng xuất
        </button>
      </div>
    </div>
  );
}
