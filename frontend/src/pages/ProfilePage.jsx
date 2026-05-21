import PageTitle from '../components/common/PageTitle';
import EmptyState from '../components/common/EmptyState';

export default function ProfilePage() {
  return (
    <>
      <PageTitle
        title="Hồ sơ cá nhân"
        subtitle="Quản lý thông tin tài khoản của bạn."
      />
      <EmptyState
        title="Đang phát triển"
        description="Trang hồ sơ sẽ được cập nhật trong phiên bản tiếp theo."
      />
    </>
  );
}
