import {
  Box,
  Breadcrumbs,
  Chip,
  Link as MuiLink,
  Tab,
  Tabs,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import UnpublishedRoundedIcon from '@mui/icons-material/UnpublishedRounded';
import { Link, useNavigate } from 'react-router-dom';
import AppButton from '../../common/AppButton';
import MentorCourseMetricsInline from './MentorCourseMetricsInline';
import { PRIMARY, TEXT, MUTED } from './mentorCourseCreateStyles';
import { MENTOR_COURSE_DETAIL_TABS } from '../../../utils/mentorCourseDetailUtils';

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
        width: { xs: '100%', sm: 96 },
        height: { xs: 120, sm: 72 },
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
      {!thumbnail && <MenuBookOutlinedIcon sx={{ fontSize: 28, color: PRIMARY }} />}
      {!thumbnail && courseName && (
        <Typography sx={{ display: 'none' }}>{courseName}</Typography>
      )}
    </Box>
  );
}

export default function MentorCourseDetailHeader({
  course,
  activeTab,
  onTabChange,
  onPublishToggle,
  publishing = false,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const statusChip = getStatusChip(course.status);
  const isPublished = course.status === 'published';
  const editPath = `/mentor/courses/${course.courseId}/edit`;

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Breadcrumbs
          separator="/"
          sx={{ '& .MuiBreadcrumbs-separator': { color: MUTED, mx: 0.5 } }}
        >
          <MuiLink
            component={Link}
            to="/home"
            underline="hover"
            sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}
          >
            Trang chủ
          </MuiLink>
          <MuiLink
            component={Link}
            to="/mentor/courses"
            underline="hover"
            sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}
          >
            Khóa học của tôi
          </MuiLink>
          <Typography sx={{ fontSize: 13, color: TEXT, fontWeight: 600, maxWidth: 280 }} noWrap>
            {course.courseName}
          </Typography>
        </Breadcrumbs>

        <AppButton
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />}
          onClick={() => navigate('/mentor/courses')}
          sx={{
            height: 36,
            borderRadius: '999px',
            fontSize: 13,
            fontWeight: 600,
            px: 1.75,
            color: TEXT,
            borderColor: 'rgba(15,23,42,0.12)',
          }}
        >
          Quay lại
        </AppButton>
      </Box>

      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid rgba(15,23,42,0.08)',
          boxShadow: theme.ios18?.shadow?.sm ?? '0 1px 2px rgba(8,145,178,0.04)',
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'flex-start' },
            gap: 2,
          }}
        >
          <CourseThumbnail thumbnail={course.thumbnail} courseName={course.courseName} />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <Typography
                sx={{
                  fontSize: { xs: 20, sm: 22 },
                  fontWeight: 800,
                  color: TEXT,
                  lineHeight: 1.35,
                }}
              >
                {course.courseName}
              </Typography>
              <Chip size="small" label={statusChip.label} sx={{ ...PILL_CHIP_SX, ...statusChip.sx }} />
            </Box>

            {course.description && (
              <Typography
                sx={{
                  fontSize: 14,
                  color: MUTED,
                  lineHeight: 1.6,
                  mb: 1.25,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {course.description}
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 0.5 }}>
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

            <MentorCourseMetricsInline course={course} />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'row', md: 'column' },
              gap: 1,
              flexShrink: 0,
              alignSelf: { xs: 'stretch', md: 'flex-start' },
            }}
          >
            <AppButton
              variant="outlined"
              startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate(editPath)}
              sx={{
                height: 38,
                borderRadius: '999px',
                fontSize: 13,
                fontWeight: 700,
                px: 2,
                flex: { xs: 1, md: 'unset' },
              }}
            >
              Chỉnh sửa
            </AppButton>
            <AppButton
              startIcon={
                isPublished ? (
                  <UnpublishedRoundedIcon sx={{ fontSize: 16 }} />
                ) : (
                  <PublishRoundedIcon sx={{ fontSize: 16 }} />
                )
              }
              onClick={onPublishToggle}
              disabled={publishing}
              sx={{
                height: 38,
                borderRadius: '999px',
                fontSize: 13,
                fontWeight: 700,
                px: 2,
                bgcolor: PRIMARY,
                color: '#fff',
                flex: { xs: 1, md: 'unset' },
                boxShadow: 'none',
                '&:hover': { bgcolor: '#0E7490', boxShadow: 'none' },
              }}
            >
              {isPublished ? 'Hủy xuất bản' : 'Xuất bản'}
            </AppButton>
          </Box>
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, value) => onTabChange(value)}
        sx={{
          minHeight: 42,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '999px',
            bgcolor: PRIMARY,
          },
          '& .MuiTab-root': {
            minHeight: 42,
            textTransform: 'none',
            fontSize: 14,
            fontWeight: 600,
            color: MUTED,
            px: 2,
            '&.Mui-selected': { color: PRIMARY, fontWeight: 700 },
          },
        }}
      >
        <Tab value={MENTOR_COURSE_DETAIL_TABS.COURSE} label="Khóa học" />
        <Tab value={MENTOR_COURSE_DETAIL_TABS.CONTENT} label="Nội dung" />
        <Tab value={MENTOR_COURSE_DETAIL_TABS.STUDENTS} label="Học viên" />
      </Tabs>
    </Box>
  );
}
