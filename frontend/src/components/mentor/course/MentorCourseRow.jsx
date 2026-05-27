import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppButton from '../../common/AppButton';
import {
  formatMentorCourseDate,
  truncateText,
} from '../../../utils/mentorCourseUtils';

const TEXT = '#0F172A';
const MUTED = '#64748B';
const PRIMARY = '#0891B2';

function getStatusChip(status) {
  if (status === 'published') {
    return {
      label: 'Đã xuất bản',
      sx: {
        bgcolor: 'rgba(4,120,87,0.10)',
        color: '#047857',
        border: '1px solid rgba(4,120,87,0.22)',
      },
    };
  }
  return {
    label: 'Bản nháp',
    sx: {
      bgcolor: 'rgba(100,116,139,0.10)',
      color: MUTED,
      border: '1px solid rgba(100,116,139,0.18)',
    },
  };
}

function CourseThumbnail({ thumbnail, courseName }) {
  return (
    <Box
      sx={{
        width: { xs: '100%', sm: 112 },
        height: { xs: 140, sm: 72 },
        borderRadius: '14px',
        flexShrink: 0,
        overflow: 'hidden',
        bgcolor: alpha(PRIMARY, 0.06),
        backgroundImage: thumbnail ? `url(${thumbnail})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {!thumbnail && (
        <MenuBookOutlinedIcon sx={{ fontSize: 28, color: alpha(PRIMARY, 0.35) }} />
      )}
      {!thumbnail && courseName && (
        <Typography sx={{ display: 'none' }}>{courseName}</Typography>
      )}
    </Box>
  );
}

function MetricItem({ icon: Icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
      <Icon sx={{ fontSize: 15, color: MUTED, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 12, color: MUTED, whiteSpace: 'nowrap' }}>
        {label}: <Box component="span" sx={{ color: TEXT, fontWeight: 600 }}>{value}</Box>
      </Typography>
    </Box>
  );
}

export default function MentorCourseRow({ course }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [menuAnchor, setMenuAnchor] = useState(null);

  const statusChip = getStatusChip(course.status);
  const basePath = `/mentor/courses/${course.courseId}`;

  const handleView = () => navigate(basePath);
  const handleEdit = () => navigate(`${basePath}/edit`);
  const handleContent = () => navigate(`${basePath}/content`);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.25 },
        borderRadius: '20px',
        bgcolor: '#FFFFFF',
        border: `1px solid ${alpha('#0F172A', 0.08)}`,
        boxShadow: theme.ios18?.shadow?.sm,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        gap: { xs: 1.75, md: 2.5 },
      }}
    >
      <CourseThumbnail thumbnail={course.thumbnail} courseName={course.courseName} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.75 }}>
          <Typography
            sx={{
              fontSize: { xs: 16, sm: 17 },
              fontWeight: 700,
              color: TEXT,
              lineHeight: 1.35,
            }}
          >
            {course.courseName}
          </Typography>
          <Chip
            size="small"
            label={statusChip.label}
            sx={{ height: 24, fontSize: 11, fontWeight: 600, ...statusChip.sx }}
          />
        </Box>

        <Typography
          sx={{
            fontSize: 13,
            color: MUTED,
            lineHeight: 1.55,
            mb: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {truncateText(course.description, 140)}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
          {course.categoryName && (
            <Chip
              size="small"
              label={course.categoryName}
              sx={{
                height: 24,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: alpha(PRIMARY, 0.08),
                color: PRIMARY,
              }}
            />
          )}
          {course.levelName && (
            <Chip
              size="small"
              label={course.levelName}
              variant="outlined"
              sx={{
                height: 24,
                fontSize: 11,
                fontWeight: 600,
                borderColor: alpha('#0F172A', 0.12),
                color: TEXT,
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          <MetricItem
            icon={PeopleOutlineRoundedIcon}
            label="Học viên"
            value={course.studentCount ?? 0}
          />
          <MetricItem
            icon={StarRoundedIcon}
            label="Đánh giá"
            value={course.rating != null ? course.rating.toFixed(1) : '—'}
          />
          <MetricItem
            icon={MenuBookRoundedIcon}
            label="Bài học"
            value={course.totalLessons ?? 0}
          />
          <Typography sx={{ fontSize: 12, color: MUTED }}>
            Cập nhật:{' '}
            <Box component="span" sx={{ color: TEXT, fontWeight: 600 }}>
              {formatMentorCourseDate(course.updatedAt)}
            </Box>
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          alignItems: { xs: 'center', md: 'flex-end' },
          justifyContent: { xs: 'flex-start', md: 'center' },
          gap: 1,
          flexShrink: 0,
        }}
      >
        {!isMobile ? (
          <>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={handleView}
              sx={{ px: 1.75, py: 0.75, fontSize: 13, minWidth: 120 }}
            >
              Xem
            </AppButton>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={handleEdit}
              sx={{ px: 1.75, py: 0.75, fontSize: 13, minWidth: 120 }}
            >
              Chỉnh sửa
            </AppButton>
            <AppButton
              variant="contained"
              size="small"
              startIcon={<FolderOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={handleContent}
              sx={{ px: 1.75, py: 0.75, fontSize: 13, minWidth: 120 }}
            >
              Nội dung
            </AppButton>
          </>
        ) : (
          <>
            <AppButton variant="contained" size="small" onClick={handleContent} sx={{ fontSize: 13 }}>
              Nội dung
            </AppButton>
            <Tooltip title="Thêm thao tác">
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{
                  border: `1px solid ${alpha('#0F172A', 0.08)}`,
                  borderRadius: '12px',
                }}
              >
                <MoreHorizRoundedIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: '12px',
                    minWidth: 180,
                    border: `1px solid ${alpha(PRIMARY, 0.1)}`,
                  },
                },
              }}
            >
              <MenuItem onClick={() => { setMenuAnchor(null); handleView(); }}>Xem</MenuItem>
              <MenuItem onClick={() => { setMenuAnchor(null); handleEdit(); }}>Chỉnh sửa</MenuItem>
              <MenuItem onClick={() => { setMenuAnchor(null); handleContent(); }}>Quản lý nội dung</MenuItem>
            </Menu>
          </>
        )}
      </Box>
    </Box>
  );
}
