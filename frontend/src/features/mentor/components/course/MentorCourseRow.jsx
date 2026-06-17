/**
 * MentorCourseRow  ─  Dòng hiển thị một khóa học trong danh sách Mentor
 *
 * Props:
 *   course : {
 *     courseId:      number,
 *     courseName:    string,
 *     description:   string,
 *     category:      string,
 *     level:         string,
 *     thumbnail:     string,
 *     isPublished:   boolean,
 *     createdAt:     string,
 *     updatedAt:     string,
 *     chapterCount:  number,
 *     lessonCount:   number,
 *     materialCount: number,
 *     studentCount:  number,
 *     rating:        number
 *   }
 *   onClick : (courseId: number) => void  — navigate đến /mentor/courses/:courseId
 */
import {
  Box,
  Chip,
  Link as MuiLink,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { Link } from 'react-router-dom';
import {
  formatMentorCourseDate,
  truncateText,
} from '@/features/mentor/utils/mentorCourseUtils';

const TEXT = '#0F172A';
const MUTED = '#64748B';
const PRIMARY = '#0891B2';

const METRIC_COLORS = {
  students: '#2563EB',
  rating: '#D97706',
  chapters: '#7C3AED',
  lessons: '#0891B2',
  materials: '#475569',
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

function getStatusChip(IsPublished) {
  if (IsPublished === true) {
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

function getLevelChipStyle(levelId) {
  // beginner
  if (levelId === 1) {
    return {
      bgcolor: 'rgba(56,189,248,0.12)',
      color: '#0284C7',
      border: '1px solid rgba(56,189,248,0.22)',
    };
  }
  //elementary
  if (levelId === 2) {
    return {
      bgcolor: 'rgba(56,189,248,0.12)',
      color: '#0284C7',
      border: '1px solid rgba(56,189,248,0.22)',
    };
  }
  //intermediate
  if (levelId === 3) {
    return {
      bgcolor: 'rgba(245,158,11,0.12)',
      color: '#D97706',
      border: '1px solid rgba(245,158,11,0.22)',
    };
  }
  //advanced
  if (levelId === 4) {
    return {
      bgcolor: 'rgba(234,88,12,0.12)',
      color: '#EA580C',
      border: '1px solid rgba(234,88,12,0.22)',
    };
  }
  //if not receive value of levelId 
  return { bgcolor: '#F1F5F9', color: '#64748B' };
}

function getCategoryChipStyle(categoryId) {

  switch (Number(categoryId)) {
    case 1: return { bgcolor: 'rgba(37,99,235,0.10)', color: '#2563EB' };
    case 2: return { bgcolor: 'rgba(124,58,237,0.10)', color: '#7C3AED' };
    case 3: return { bgcolor: 'rgba(14,116,144,0.10)', color: '#0E7490' };
    case 4: return { bgcolor: 'rgba(15,23,42,0.08)', color: '#334155' };
    case 5: return { bgcolor: 'rgba(236,72,153,0.10)', color: '#DB2777' };
  }
  return { bgcolor: '#F1F5F9', color: '#64748B' };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getImageUrl(thumbnail) {
  if (!thumbnail) return '';

  const value = String(thumbnail).trim();

  // Trường hợp ảnh đã là URL đầy đủ hoặc base64/blob
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:image') ||
    value.startsWith('blob:')
  ) {
    return value;
  }

  // Trường hợp DB lưu: /assets/avatars/courses/course_avt_76.jpg
  return `${API_URL}${value}`;
}

function CourseThumbnail({ thumbnail, courseName }) {
  const imageUrl = getImageUrl(thumbnail);

  return (
    <Box
      sx={{
        width: { xs: '100%', sm: 112 },
        height: { xs: 140, sm: 72 },
        borderRadius: '14px',
        flexShrink: 0,
        overflow: 'hidden',
        bgcolor: alpha(PRIMARY, 0.1),
        backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {!imageUrl && (
        <MenuBookOutlinedIcon sx={{ fontSize: 28, color: PRIMARY }} />
      )}

      {!imageUrl && courseName && (
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
  const statusChip = getStatusChip(course.IsPublished);
  const detailPath = `/mentor/courses/${course.CourseId}?tab=course`;
  const totalChapters = course.Paths.length;
  const totalLessons = 0;
  const totalMaterials = course.totalMaterials ?? 0;
  console.log(totalLessons)
  return (
    <Box
      sx={{
        position: 'relative',
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
      <CourseThumbnail thumbnail={course.Thumbnail} courseName={course.CourseName} />

      <Box sx={{ flex: 1, minWidth: 0, pr: { xs: 10, md: 0 } }}>
        <MuiLink
          component={Link}
          to={detailPath}
          underline="hover"
          sx={{
            display: 'block',
            fontSize: { xs: 16, sm: 17 },
            fontWeight: 700,
            color: TEXT,
            lineHeight: 1.35,
            mb: 0.75,
            '&:hover': { color: PRIMARY },
          }}
        >
          {course.CourseName}
        </MuiLink>

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
          {truncateText(course.Description, 140)}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
          {course.CategoryId && (
            <Chip
              size="small"
              label={course.CategoryDisplayName}
              sx={{ ...PILL_CHIP_SX, ...getCategoryChipStyle(course.CategoryId) }}
            />
          )}
          {course.LevelDisplayName && (
            <Chip
              size="small"
              label={course.LevelDisplayName}
              sx={{ ...PILL_CHIP_SX, ...getLevelChipStyle(course.LevelId) }}
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
            icon={RouteOutlinedIcon}
            label="Chương"
            value={totalChapters}
            iconColor={METRIC_COLORS.chapters}
          />
          <MetricItem
            icon={MenuBookRoundedIcon}
            label="Bài"
            value={totalLessons.length}
            iconColor={METRIC_COLORS.lessons}
          />
          <MetricItem
            icon={ArticleOutlinedIcon}
            label="Học liệu"
            value={totalMaterials}
            iconColor={METRIC_COLORS.materials}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            <CalendarTodayOutlinedIcon
              sx={{ fontSize: 15, color: METRIC_COLORS.updated, flexShrink: 0 }}
            />
            <Typography sx={{ fontSize: 12, color: MUTED }}>
              Cập nhật:{' '}
              <Box component="span" sx={{ color: TEXT, fontWeight: 600 }}>
                {formatMentorCourseDate(course.UpdatedAt)}
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          position: { xs: 'absolute', md: 'static' },
          top: { xs: 16, md: 'auto' },
          right: { xs: 16, md: 'auto' },
          flexShrink: 0,
          alignSelf: { md: 'flex-start' },
        }}
      >
        <Chip
          size="small"
          label={statusChip.label}
          sx={{ ...PILL_CHIP_SX, ...statusChip.sx }}
        />
      </Box>
    </Box>
  );
}
