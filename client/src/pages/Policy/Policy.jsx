import shared from '../shared.module.css';

export default function Policy() {
  return (
    <div style={{ maxWidth: 800 }}>
      <h1 className={shared.pageTitle}>Điều khoản sử dụng</h1>
      <p className={shared.pageDesc}>Cập nhật lần cuối: 01/06/2025</p>

      <div style={{ lineHeight: 1.8, color: 'var(--text)' }}>
        <h2 style={{ fontSize: '1.25rem', margin: '24px 0 12px', color: 'var(--ink)' }}>1. Giới thiệu</h2>
        <p>Chào mừng bạn đến với Luyện Từ. Bằng việc sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản này.</p>

        <h2 style={{ fontSize: '1.25rem', margin: '24px 0 12px', color: 'var(--ink)' }}>2. Dịch vụ</h2>
        <p>Luyện Từ cung cấp nền tảng học từ vựng tiếng Anh miễn phí với flashcard, game luyện tập, lộ trình TOEIC/IELTS và hệ thống Spaced Repetition.</p>

        <h2 style={{ fontSize: '1.25rem', margin: '24px 0 12px', color: 'var(--ink)' }}>3. Tài khoản người dùng</h2>
        <p>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập. Mọi hoạt động trên tài khoản của bạn đều thuộc trách nhiệm của bạn.</p>

        <h2 style={{ fontSize: '1.25rem', margin: '24px 0 12px', color: 'var(--ink)' }}>4. Quyền sở hữu trí tuệ</h2>
        <p>Nội dung trên Luyện Từ thuộc quyền sở hữu của chúng tôi. Bạn không được sao chép, phân phối hoặc sử dụng cho mục đích thương mại mà không có sự cho phép.</p>

        <h2 style={{ fontSize: '1.25rem', margin: '24px 0 12px', color: 'var(--ink)' }}>5. Chính sách bảo mật</h2>
        <p>Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Dữ liệu học tập được lưu trữ an toàn và không chia sẻ với bên thứ ba.</p>
      </div>
    </div>
  );
}
