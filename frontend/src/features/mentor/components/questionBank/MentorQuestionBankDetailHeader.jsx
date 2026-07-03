/**
 * Header trang Question Bank (Create & Detail).
 */
import {
  Box,
  Breadcrumbs,
  Chip,
  Link as MuiLink,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Link, useNavigate } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import MentorChapterCardMenu from '@/features/mentor/components/course/MentorChapterCardMenu';
import { MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import { formatMentorCourseDate } from '@/features/mentor/utils/mentorCourseUtils';
const PILL_CHIP_SX = {
  borderRadius: '999px',
  height: 24,
  fontSize: 12,
  fontWeight: 700,
};
function MetaLine({ icon: Icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
      {Icon ? <Icon sx={{ fontSize: 14, color: MUTED, flexShrink: 0 }} /> : null}
      <Typography sx={{ fontSize: 12.5, color: MUTED, lineHeight: 1.45 }}>
        {label}:{' '}
        <Box component="span" sx={{ color: TEXT, fontWeight: 600 }}>
          {value}
        </Box>
      </Typography>
    </Box>
  );
}
export default function MentorQuestionBankDetailHeader({
  bankTitle = '',
  courseName = '',
  courseId = null,
  coursePublished = false,
  totalQuestionCount = 0,
  createdAt = null,
  updatedAt = null,
  actions = null,
  isCreateMode = false,
  showBreadcrumbs = true,
  breadcrumbMode = 'default',
  onBack,
  onQuizSetup,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const backPath = courseId
    ? `/mentor/courses/${courseId}/questions`
    : '/mentor/question-banks';
  const backLabel = courseId
    ? (isCreateMode ? 'Quay lại' : 'Quay lại khóa học')
    : 'Quay lại danh sách';
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(backPath);
  };
  const displayTitle =
    bankTitle ||
    (isCreateMode ? 'Chọn chương để tạo ngân hàng câu hỏi' : 'Ngân hàng câu hỏi');
  const breadcrumbLabel = isCreateMode && !bankTitle ? 'Tạo mới' : displayTitle;
  return (
    <Box sx={{ mb: 2.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 2 },
          mb: 1.25,
        }}
      >
        {showBreadcrumbs ? (
          <Breadcrumbs
            separator="/"
            sx={{
              flex: 1,
              minWidth: 0,
              flexWrap: 'wrap',
              rowGap: 0.5,
              '& .MuiBreadcrumbs-separator': { color: MUTED, mx: 0.5 },
              '& .MuiBreadcrumbs-li': { maxWidth: '100%' },
            }}
          >
            <MuiLink
              component={Link}
              to="/home"
              underline="hover"
              sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}
            >
              Trang chủ
            </MuiLink>
            {courseId ? (
              <MuiLink
                component={Link}
                to="/mentor/courses"
                underline="hover"
                sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}
              >
                Khóa học của tôi
              </MuiLink>
            ) : (
              <MuiLink
                component={Link}
                to="/mentor/question-banks"
                underline="hover"
                sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}
              >
                Ngân hàng câu hỏi
              </MuiLink>
            )}
            {courseId ? (
              <MuiLink
                component={Link}
                to={`/mentor/courses/${courseId}`}
                underline="hover"
                sx={{ fontSize: 13, color: MUTED, fontWeight: 500, maxWidth: 220 }}
                noWrap
              >
                {courseName || `Khóa học #${courseId}`}
              </MuiLink>
            ) : null}
            {courseId && breadcrumbMode === 'default' ? (
              <MuiLink
                component={Link}
                to={backPath}
                underline="hover"
                sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}
              >
                Ngân hàng câu hỏi
              </MuiLink>
            ) : null}
            <Typography
              sx={{ fontSize: 13, color: TEXT, fontWeight: 600, maxWidth: 280 }}
              noWrap
            >
              {breadcrumbLabel}
            </Typography>
          </Breadcrumbs>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}
        <AppButton
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />}
          onClick={handleBack}
          sx={{
            height: 40,
            px: 2,
            fontSize: 13,
            fontWeight: 600,
            borderRadius: '999px',
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' },
            color: TEXT,
            borderColor: 'rgba(15,23,42,0.12)',
          }}
        >
          {backLabel}
        </AppButton>
      </Box>
      <Box
        sx={{
          p: { xs: 2, sm: 2.25 },
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid rgba(15,23,42,0.08)',
          boxShadow: theme.ios18?.shadow?.sm ?? '0 1px 2px rgba(8,145,178,0.04)',
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
          <Box
            sx={{
              width: { xs: '100%', md: 52 },
              height: { xs: 8, md: 52 },
              borderRadius: { xs: '999px', md: '14px' },
              flexShrink: 0,
              bgcolor: alpha(PRIMARY, 0.12),
              display: { xs: 'block', md: 'grid' },
              placeItems: 'center',
            }}
          >
            <QuizOutlinedIcon
              sx={{ fontSize: 24, color: PRIMARY, display: { xs: 'none', md: 'block' } }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.75,
                width: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 1,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: 17, sm: 18 },
                    fontWeight: 600,
                    color: TEXT,
                    lineHeight: 1.4,
                    letterSpacing: '0.01em',
                  }}
                >
                  {displayTitle}
                </Typography>
                {!isCreateMode || bankTitle ? (
                  <Chip
                    size="small"
                    label={coursePublished ? 'Khóa học đã xuất bản' : 'Khóa học chưa xuất bản'}
                    sx={{
                      ...PILL_CHIP_SX,
                      bgcolor: coursePublished ? 'rgba(4,120,87,0.12)' : 'rgba(100,116,139,0.10)',
                      color: coursePublished ? '#047857' : MUTED,
                      border: coursePublished
                        ? '1px solid rgba(4,120,87,0.24)'
                        : '1px solid rgba(100,116,139,0.18)',
                    }}
                  />
                ) : null}
              </Box>
              {!isCreateMode && onQuizSetup ? (
                <MentorChapterCardMenu onQuizSetup={onQuizSetup} />
              ) : null}
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <MetaLine
                icon={QuizOutlinedIcon}
                label="Tổng câu hỏi"
                value={totalQuestionCount}
              />
              {createdAt ? (
                <MetaLine
                  icon={CalendarTodayOutlinedIcon}
                  label="Tạo"
                  value={formatMentorCourseDate(createdAt)}
                />
              ) : null}
              {updatedAt ? (
                <MetaLine
                  icon={CalendarTodayOutlinedIcon}
                  label="Cập nhật"
                  value={formatMentorCourseDate(updatedAt)}
                />
              ) : null}
            </Box>
          </Box>
          {actions ? (
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                gap: 1,
                flexShrink: 0,
                minWidth: 168,
              }}
            >
              {actions}
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
