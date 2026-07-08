import { Box, Typography, Skeleton } from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import EmptyState from '@/shared/ui/EmptyState';
import AdminAccountRow from './AdminAccountRow';
import { MUTED } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import {
  ADMIN_ACCOUNT_TABLE_HEADERS,
  ADMIN_ACCOUNT_TABLE_LAYOUT_SX,
  getAdminAccountHeaderCellSx,
} from '@/features/admin/utils/adminAccountUtils';

function ListHeader() {
  return (
    <Box
      className="bg-slate-50/50"
      sx={{
        display: { xs: 'none', md: 'grid' },
        ...ADMIN_ACCOUNT_TABLE_LAYOUT_SX,
        py: 1.5,
        borderBottom: '1px solid rgba(15,23,42,0.06)',
      }}
    >
      {ADMIN_ACCOUNT_TABLE_HEADERS.map((label, index) => (
        <Typography
          key={label}
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: MUTED,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            ...getAdminAccountHeaderCellSx(index),
          }}
        >
          {label}
        </Typography>
      ))}
    </Box>
  );
}

export default function AdminAccountList({
  accounts,
  loading,
  error,
  hasAnyAccounts,
  isFiltered,
  onEdit,
  onView,
  onToggleStatus,
  onClearFilters,
}) {
  if (loading) {
    return (
      <Box
        className="rounded-xl shadow-sm border border-slate-100"
        sx={{
          overflow: 'hidden',
          bgcolor: '#fff',
        }}
      >
        <ListHeader />
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              ...ADMIN_ACCOUNT_TABLE_LAYOUT_SX,
              py: 2,
              borderBottom: '1px solid rgba(15,23,42,0.06)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" width={110} />
            </Box>
            <Skeleton variant="text" width={160} />
            <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={70} height={20} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width={90} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Skeleton variant="circular" width={28} height={28} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <EmptyState
        embedded
        title="Không thể tải danh sách tài khoản."
        description="Vui lòng kiểm tra lại kết nối hệ thống."
      />
    );
  }

  if (!hasAnyAccounts) {
    return (
      <EmptyState
        embedded
        icon={PeopleAltOutlinedIcon}
        title="Không có tài khoản nào."
        description="Chưa có tài khoản nào được đăng ký trong hệ thống."
      />
    );
  }

  if (accounts.length === 0 && isFiltered) {
    return (
      <EmptyState
        embedded
        icon={SearchOffOutlinedIcon}
        title="Không tìm thấy tài khoản nào."
        description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
        actionLabel="Xóa bộ lọc"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <Box
      className="rounded-xl shadow-sm border border-slate-100"
      sx={{
        overflow: 'hidden',
        bgcolor: '#fff',
      }}
    >
      <ListHeader />
      {accounts.map((account) => (
        <AdminAccountRow
          key={account.id}
          account={account}
          onEdit={onEdit}
          onView={onView}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </Box>
  );
}
