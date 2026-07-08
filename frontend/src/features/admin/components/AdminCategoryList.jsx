import { useState } from 'react';
import { Box, Typography, Chip, Menu, MenuItem, IconButton, alpha, Tooltip } from '@mui/material';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EmptyState from '@/shared/ui/EmptyState';
import Loading from '@/shared/ui/Loading';
import AdminCategoryRow from './AdminCategoryRow';
import AdminCatalogEditButton from '@/features/admin/components/AdminCatalogEditButton';
import { CategoryNameChip } from '@/shared/catalog/CatalogNameChip';
import {
  ADMIN_CATALOG_STATUS_CHIP_SX,
  ADMIN_CATALOG_STATUS_LABELS,
} from '@/features/admin/data/adminCatalogConstants';
import { formatCategoryDate } from '@/features/admin/utils/adminCategoryUtils';
import { PRIMARY, TEXT, MUTED } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import {
  ADMIN_CATEGORY_TABLE_GRID_COLUMNS,
} from '@/features/admin/utils/adminCategoryUtils';

const TABLE_ROW_SX = {
  display: { xs: 'none', md: 'grid' },
  gridTemplateColumns: ADMIN_CATEGORY_TABLE_GRID_COLUMNS,
  gap: 2,
  px: 2.25,
  alignItems: 'center',
};

const PILL_CHIP_SX = {
  borderRadius: '999px',
  height: 24,
  fontSize: 12,
  fontWeight: 700,
  '& .MuiChip-label': { px: 1.2, fontWeight: 700 },
};

function ListHeader({ sortBy = 'newest', statusFilter = 'all', onSortChange, onStatusChange }) {
  const [statusAnchor, setStatusAnchor] = useState(null);

  const handleNameClick = () => {
    if (sortBy === 'name_asc') {
      onSortChange?.('name_desc');
    } else if (sortBy === 'name_desc') {
      onSortChange?.('newest');
    } else {
      onSortChange?.('name_asc');
    }
  };

  const handleDateClick = () => {
    if (sortBy === 'newest') {
      onSortChange?.('oldest');
    } else if (sortBy === 'oldest') {
      onSortChange?.('newest');
    } else {
      onSortChange?.('newest');
    }
  };

  return (
    <Box
      sx={{
        ...TABLE_ROW_SX,
        py: 1.25,
        bgcolor: 'rgba(15,23,42,0.02)',
        borderBottom: '1px solid rgba(15,23,42,0.06)',
      }}
    >
      {/* Name Column */}
      <Box
        onClick={handleNameClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': { color: '#0891B2' }
        }}
      >
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: sortBy.startsWith('name_') ? '#0891B2' : MUTED }}>
          Tên hiển thị
        </Typography>
        {sortBy === 'name_asc' && <ArrowUpwardIcon sx={{ fontSize: 12, color: '#0891B2' }} />}
        {sortBy === 'name_desc' && <ArrowDownwardIcon sx={{ fontSize: 12, color: '#0891B2' }} />}
        {!sortBy.startsWith('name_') && <ArrowUpwardIcon sx={{ fontSize: 12, color: 'rgba(15,23,42,0.15)' }} />}
      </Box>

      {/* Status Column */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          userSelect: 'none',
        }}
      >
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: statusFilter !== 'all' ? '#0891B2' : MUTED }}>
          Trạng thái
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => setStatusAnchor(e.currentTarget)}
          sx={{
            p: 0.25,
            color: statusFilter !== 'all' ? '#0891B2' : 'rgba(15,23,42,0.4)',
            '&:hover': { color: '#0891B2', bgcolor: 'rgba(15,23,42,0.04)' }
          }}
        >
          <FilterAltOutlinedIcon sx={{ fontSize: 12 }} />
        </IconButton>

        <Menu
          anchorEl={statusAnchor}
          open={Boolean(statusAnchor)}
          onClose={() => setStatusAnchor(null)}
          slotProps={{
            paper: { sx: { mt: 0.5, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } }
          }}
        >
          <MenuItem
            selected={statusFilter === 'all'}
            onClick={() => { onStatusChange?.('all'); setStatusAnchor(null); }}
            sx={{ fontSize: 12 }}
          >
            Tất cả
          </MenuItem>
          <MenuItem
            selected={statusFilter === 'active'}
            onClick={() => { onStatusChange?.('active'); setStatusAnchor(null); }}
            sx={{ fontSize: 12 }}
          >
            Đang hoạt động
          </MenuItem>
          <MenuItem
            selected={statusFilter === 'inactive'}
            onClick={() => { onStatusChange?.('inactive'); setStatusAnchor(null); }}
            sx={{ fontSize: 12 }}
          >
            Đã khóa
          </MenuItem>
        </Menu>
      </Box>

      {/* Date Column */}
      <Box
        onClick={handleDateClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': { color: '#0891B2' }
        }}
      >
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: (sortBy === 'newest' || sortBy === 'oldest') ? '#0891B2' : MUTED }}>
          Ngày tạo
        </Typography>
        {sortBy === 'newest' && <ArrowDownwardIcon sx={{ fontSize: 12, color: '#0891B2' }} />}
        {sortBy === 'oldest' && <ArrowUpwardIcon sx={{ fontSize: 12, color: '#0891B2' }} />}
        {sortBy !== 'newest' && sortBy !== 'oldest' && <ArrowDownwardIcon sx={{ fontSize: 12, color: 'rgba(15,23,42,0.15)' }} />}
      </Box>

      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          color: MUTED,
          textAlign: 'right',
        }}
      >
        Hành động
      </Typography>
    </Box>
  );
}

export default function AdminCategoryList({
  categories,
  loading,
  error,
  hasAnyCategories,
  isFiltered,
  onEdit,
  onDelete,
  onClearFilters,
  viewMode = 'list',
  sortBy = 'newest',
  statusFilter = 'all',
  onSortChange,
  onStatusChange,
}) {
  if (loading) {
    return <Loading message="Đang tải danh sách danh mục..." />;
  }

  if (error) {
    return (
      <EmptyState
        embedded
        title="Không thể tải danh sách danh mục."
        description="Vui lòng thử lại."
      />
    );
  }

  if (!hasAnyCategories) {
    return (
      <EmptyState
        embedded
        icon={CategoryOutlinedIcon}
        title="Chưa có danh mục nào."
        description="Danh sách danh mục sẽ hiển thị tại đây khi có dữ liệu."
      />
    );
  }

  if (categories.length === 0 && isFiltered) {
    return (
      <EmptyState
        embedded
        icon={SearchOffOutlinedIcon}
        title="Không tìm thấy danh mục nào."
        description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
        actionLabel="Xóa bộ lọc"
        onAction={onClearFilters}
      />
    );
  }

  if (viewMode === 'grid') {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
        {categories.map((category) => {
          const statusSx =
            ADMIN_CATALOG_STATUS_CHIP_SX[category.status] ?? ADMIN_CATALOG_STATUS_CHIP_SX.ACTIVE;
          return (
            <Box
              key={category.id}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid rgba(15,23,42,0.08)',
                bgcolor: '#fff',
                position: 'relative',
                boxShadow: '0 1px 3px rgba(15,23,42,0.02)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 150,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 15px -3px rgba(15,23,42,0.06)',
                  borderColor: 'rgba(8,145,178,0.25)'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
                <CategoryNameChip
                  label={category.displayName}
                  id={category.id}
                  colorCode={category.colorCode}
                  sx={{ fontSize: 13, py: 0.5 }}
                />
                <Chip
                  size="small"
                  label={ADMIN_CATALOG_STATUS_LABELS[category.status] ?? category.status}
                  sx={{ ...PILL_CHIP_SX, ...statusSx, flexShrink: 0 }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1.5, borderTop: '1px solid rgba(15,23,42,0.04)' }}>
                <Typography sx={{ fontSize: 12, color: MUTED }}>
                  Ngày tạo: {formatCategoryDate(category.createdAt)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <AdminCatalogEditButton
                    ariaLabel="Chỉnh sửa danh mục"
                    title="Chỉnh sửa"
                    onClick={() => onEdit?.(category)}
                  />
                  <Tooltip title="Xóa danh mục">
                    <IconButton
                      size="small"
                      aria-label="Xóa danh mục"
                      onClick={() => onDelete?.(category)}
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: '10px',
                        border: '1px solid rgba(220,38,38,0.08)',
                        color: '#DC2626',
                        '&:hover': {
                          color: '#B91C1C',
                          bgcolor: 'rgba(220,38,38,0.06)',
                          borderColor: 'rgba(220,38,38,0.2)',
                        },
                      }}
                    >
                      <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: '16px',
        border: '1px solid rgba(15,23,42,0.08)',
        overflow: 'hidden',
        bgcolor: '#fff',
      }}
    >
      <ListHeader
        sortBy={sortBy}
        statusFilter={statusFilter}
        onSortChange={onSortChange}
        onStatusChange={onStatusChange}
      />
      {categories.map((category) => (
        <AdminCategoryRow key={category.id} category={category} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </Box>
  );
}
