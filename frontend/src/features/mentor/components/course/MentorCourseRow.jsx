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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Link, useNavigate } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import {
  countCourseLessons,
  countCourseMaterials,
  countCourseStudents,
  formatMentorCourseDate,
  truncateText,
} from '@/features/mentor/utils/mentorCourseUtils';

const TEXT = '#0F172A';
const MUTED = '#64748B';
const PRIMARY = '#059669';

const METRIC_COLORS = {
  students: '#0284c7',
  rating: '#D97706',
  chapters: '#7C3AED',
  lessons: '#059669',
  materials: '#475569',
  updated: '#0284c7',
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

function getStatusChip(status, IsPublished) {
  if (status === 'pending') {
    return {
      label: 'Chờ duyệt',
      sx: {
        bgcolor: 'rgba(217,119,6,0.12)',
        color: '#D97706',
        border: '1px solid rgba(217,119,6,0.24)',
      },
    };
  }
  if (status === 'active' || IsPublished === true) {
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

import { resolveCategoryChipSx, resolveLevelChipSx } from '@/shared/catalog/catalogRegistry';
import ThumbnailImage from '@/shared/ui/ThumbnailImage';

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

export default function MentorCourseRow({ course, onDelete }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const statusChip = getStatusChip(course.status, course.IsPublished);
  const detailPath = `/mentor/courses/${course.CourseId}?tab=course`;
  const totalChapters = (course.Paths ?? course.paths ?? []).length;
  const totalLessons = countCourseLessons(course);
  const totalMaterials = countCourseMaterials(course);
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
      <ThumbnailImage
        src={course.Thumbnail}
        label={course.CourseName}
        alt={course.CourseName}
        iconSize={28}
        sx={{
          width: { xs: '100%', sm: 112 },
          height: { xs: 140, sm: 72 },
          borderRadius: '14px',
          flexShrink: 0,
        }}
      />

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
              sx={{ ...PILL_CHIP_SX, ...resolveCategoryChipSx({ id: course.CategoryId, displayName: course.CategoryName }) }}
            />
          )}
          {course.LevelDisplayName && (
            <Chip
              size="small"
              label={course.LevelDisplayName}
              sx={{ ...PILL_CHIP_SX, ...resolveLevelChipSx({ id: course.LevelId, displayName: course.LevelName }) }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          <MetricItem
            icon={PeopleOutlineRoundedIcon}
            label="Học viên"
            value={countCourseStudents(course)}
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
            value={totalLessons}
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
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          alignItems: { xs: 'center', md: 'flex-end' },
          gap: 1.5,
          flexShrink: 0,
          position: { xs: 'absolute', md: 'static' },
          top: { xs: 16, md: 'auto' },
          right: { xs: 16, md: 'auto' },
          alignSelf: { md: 'center' },
        }}
      >
        <Chip
          size="small"
          label={statusChip.label}
          sx={{ ...PILL_CHIP_SX, ...statusChip.sx, order: { xs: 2, md: 1 } }}
        />

        <Box sx={{ display: 'flex', gap: 0.75, order: { xs: 1, md: 2 } }}>
          <AppButton
            variant="outlined"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/mentor/courses/${course.CourseId}/edit`);
            }}
            sx={{
              minWidth: 0,
              width: 32,
              height: 32,
              borderRadius: '8px',
              p: 0,
              color: PRIMARY,
              borderColor: 'rgba(5,150,105,0.2)',
              '&:hover': {
                borderColor: PRIMARY,
                bgcolor: 'rgba(5,150,105,0.04)',
              },
            }}
            title="Chỉnh sửa thông tin"
          >
            <EditOutlinedIcon sx={{ fontSize: 16 }} />
          </AppButton>

          <AppButton
            variant="outlined"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/mentor/courses/${course.CourseId}/content/edit`);
            }}
            sx={{
              minWidth: 0,
              width: 32,
              height: 32,
              borderRadius: '8px',
              p: 0,
              color: '#0ea5e9',
              borderColor: 'rgba(14,165,233,0.2)',
              '&:hover': {
                borderColor: '#0ea5e9',
                bgcolor: 'rgba(14,165,233,0.04)',
              },
            }}
            title="Sửa nội dung học liệu"
          >
            <MenuBookRoundedIcon sx={{ fontSize: 16 }} />
          </AppButton>

          <AppButton
            variant="outlined"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete?.(course.CourseId);
            }}
            sx={{
              minWidth: 0,
              width: 32,
              height: 32,
              borderRadius: '8px',
              p: 0,
              color: '#DC2626',
              borderColor: 'rgba(220,38,38,0.2)',
              '&:hover': {
                borderColor: '#DC2626',
                bgcolor: 'rgba(220,38,38,0.04)',
              },
            }}
            title="Xóa khóa học"
          >
            <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
          </AppButton>
        </Box>
      </Box>
    </Box>
  );
}
