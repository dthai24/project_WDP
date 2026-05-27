import {
  Box,
  Chip,
  Link as MuiLink,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { Link } from 'react-router-dom';
import {
  formatMentorCourseDate,
  truncateText,
} from '../../../utils/mentorCourseUtils';

const TEXT = '#0F172A';
const MUTED = '#64748B';
const PRIMARY = '#0891B2';

const METRIC_COLORS = {
  students: '#2563EB',
  rating: '#D97706',
  lessons: '#0891B2',
  updated: '#7C3AED',
};

const PILL_CHIP_SX = {
  borderRadius: '999px',
  height: 24,
  fontSize: 12,
  fontWeight: 700,
  lineHeight: '24px',
  '& .MuiChip-label': {
    px: 1.2,
    lineHeight: '24px',
    fontWeight: 700,
  },
};

function getStatusChip(status) {
  if (status === 'published') {
    return {
      label: 'Đã xuất bản',
      sx: {
        bgcolor: 'rgba(4,120,87,0.12)',
        color: '#047857',
        border: '1px solid rgba(4,120,87,0.24)',
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

function getLevelChipStyle(level = '') {
  const l = level.toLowerCase();
  if (l.includes('cơ bản') || l.includes('sơ cấp')) {
    return {
      bgcolor: 'rgba(56,189,248,0.12)',
      color: '#0284C7',
      border: '1px solid rgba(56,189,248,0.22)',
    };
  }
  if (l.includes('trung cấp')) {
    return {
      bgcolor: 'rgba(245,158,11,0.12)',
      color: '#D97706',
      border: '1px solid rgba(245,158,11,0.22)',
    };
  }
  if (l.includes('nâng cao')) {
    return {
      bgcolor: 'rgba(234,88,12,0.12)',
      color: '#EA580C',
      border: '1px solid rgba(234,88,12,0.22)',
    };
  }
  return { bgcolor: '#F1F5F9', color: '#64748B' };
}

function getCategoryChipStyle(category = '') {
  const map = {
    'Giao tiếp': { bgcolor: 'rgba(37,99,235,0.10)', color: '#2563EB' },
    IELTS: { bgcolor: 'rgba(124,58,237,0.10)', color: '#7C3AED' },
    TOEIC: { bgcolor: 'rgba(14,116,144,0.10)', color: '#0E7490' },
    'Ngữ pháp': { bgcolor: 'rgba(15,23,42,0.08)', color: '#334155' },
    'Phát âm': { bgcolor: 'rgba(236,72,153,0.10)', color: '#DB2777' },
  };
  return map[category] ?? { bgcolor: '#F1F5F9', color: '#64748B' };
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
        bgcolor: alpha(PRIMARY, 0.1),
        backgroundImage: thumbnail ? `url(${thumbnail})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {!thumbnail && (
        <MenuBookOutlinedIcon sx={{ fontSize: 28, color: PRIMARY }} />
      )}
      {!thumbnail && courseName && (
        <Typography sx={{ display: 'none' }}>{courseName}</Typography>
      )}
    </Box>
  );
}

function MetricItem({ icon: Icon, label, value, iconColor }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
      <Icon sx={{ fontSize: 15, color: iconColor, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 12, color: MUTED, whiteSpace: 'nowrap' }}>
        {label}: <Box component="span" sx={{ color: TEXT, fontWeight: 600 }}>{value}</Box>
      </Typography>
    </Box>
  );
}

export default function MentorCourseRow({ course }) {
  const theme = useTheme();
  const statusChip = getStatusChip(course.status);
  const detailPath = `/mentor/courses/${course.courseId}`;

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
          <MuiLink
            component={Link}
            to={detailPath}
            underline="hover"
            sx={{
              fontSize: { xs: 16, sm: 17 },
              fontWeight: 700,
              color: TEXT,
              lineHeight: 1.35,
              '&:hover': { color: PRIMARY },
            }}
          >
            {course.courseName}
          </MuiLink>
          <Chip
            size="small"
            label={statusChip.label}
            sx={{ ...PILL_CHIP_SX, ...statusChip.sx }}
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
              sx={{ ...PILL_CHIP_SX, ...getCategoryChipStyle(course.categoryName) }}
            />
          )}
          {course.levelName && (
            <Chip
              size="small"
              label={course.levelName}
              sx={{ ...PILL_CHIP_SX, ...getLevelChipStyle(course.levelName) }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          <MetricItem
            icon={PeopleOutlineRoundedIcon}
            label="Học viên"
            value={course.studentCount ?? 0}
            iconColor={METRIC_COLORS.students}
          />
          <MetricItem
            icon={StarRoundedIcon}
            label="Đánh giá"
            value={course.rating != null ? course.rating.toFixed(1) : '—'}
            iconColor={METRIC_COLORS.rating}
          />
          <MetricItem
            icon={MenuBookRoundedIcon}
            label="Bài học"
            value={course.totalLessons ?? 0}
            iconColor={METRIC_COLORS.lessons}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            <CalendarTodayOutlinedIcon
              sx={{ fontSize: 15, color: METRIC_COLORS.updated, flexShrink: 0 }}
            />
            <Typography sx={{ fontSize: 12, color: MUTED }}>
              Cập nhật:{' '}
              <Box component="span" sx={{ color: TEXT, fontWeight: 600 }}>
                {formatMentorCourseDate(course.updatedAt)}
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
