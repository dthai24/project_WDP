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
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import HeadphonesRoundedIcon from '@mui/icons-material/HeadphonesRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { Link } from 'react-router-dom';
import { MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import { formatMentorCourseDate } from '@/features/mentor/utils/mentorCourseUtils';
import {
  TEST_SKILL_LABELS,
  TEST_SKILL_LISTENING,
  TEST_SKILL_READING,
  TEST_SKILL_WRITING,
} from '@/features/mentor/utils/mentorTestContentUtils';

const PILL_CHIP_SX = {
  borderRadius: '999px',
  height: 24,
  fontSize: 12,
  fontWeight: 700,
};

function StatInline({ icon: Icon, label, value, iconColor }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Icon sx={{ fontSize: 16, color: iconColor, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 13, color: MUTED, lineHeight: 1.4 }}>
        {label}:{' '}
        <Box component="span" sx={{ color: TEXT, fontWeight: 700 }}>
          {value}
        </Box>
      </Typography>
    </Box>
  );
}

export default function MentorQuestionBankDetailHeader({
  bankTitle = '',
  courseName = '',
  courseCategory = '',
  chapterTitle = '',
  coursePublished = false,
  totalQuestionCount = 0,
  activeQuestionCount = 0,
  questionCountBySkill = {},
  createdAt = null,
  updatedAt = null,
  actions = null,
  isCreateMode = false,
}) {
  const theme = useTheme();

  const displayTitle =
    bankTitle ||
    (isCreateMode ? 'Chọn chương để tạo ngân hàng câu hỏi' : 'Ngân hàng câu hỏi');

  const breadcrumbLabel = isCreateMode && !bankTitle ? 'Tạo mới' : displayTitle;

  const showDates = Boolean(createdAt || updatedAt);

  const statItems = [
    {
      icon: QuizOutlinedIcon,
      label: 'Tổng câu hỏi',
      value: totalQuestionCount,
      iconColor: PRIMARY,
    },
    ...(coursePublished
      ? [
          {
            icon: CheckCircleOutlineRoundedIcon,
            label: 'Dùng cho quiz',
            value: activeQuestionCount,
            iconColor: '#047857',
          },
        ]
      : []),
    {
      icon: HeadphonesRoundedIcon,
      label: TEST_SKILL_LABELS[TEST_SKILL_LISTENING],
      value: questionCountBySkill[TEST_SKILL_LISTENING] ?? 0,
      iconColor: '#7C3AED',
    },
    {
      icon: MenuBookRoundedIcon,
      label: TEST_SKILL_LABELS[TEST_SKILL_READING],
      value: questionCountBySkill[TEST_SKILL_READING] ?? 0,
      iconColor: '#0891B2',
    },
    {
      icon: EditNoteRoundedIcon,
      label: TEST_SKILL_LABELS[TEST_SKILL_WRITING],
      value: questionCountBySkill[TEST_SKILL_WRITING] ?? 0,
      iconColor: '#EA580C',
    },
  ];

  return (
    <Box sx={{ mb: 2.5 }}>
      <Breadcrumbs
        separator="/"
        sx={{ mb: 1.25, '& .MuiBreadcrumbs-separator': { color: MUTED, mx: 0.5 } }}
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
          to="/mentor/question-banks"
          underline="hover"
          sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}
        >
          Ngân hàng câu hỏi
        </MuiLink>
        <Typography sx={{ fontSize: 13, color: TEXT, fontWeight: 600 }} noWrap>
          {breadcrumbLabel}
        </Typography>
      </Breadcrumbs>

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
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 1,
                mb: 0.75,
              }}
            >
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 20, sm: 22 },
                  fontWeight: 800,
                  color: TEXT,
                  lineHeight: 1.35,
                  letterSpacing: '-0.02em',
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

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 1.25 }}>
              <MenuBookRoundedIcon sx={{ fontSize: 17, color: PRIMARY, mt: 0.15, flexShrink: 0 }} />
              <Typography sx={{ fontSize: 14, color: MUTED, lineHeight: 1.55 }}>
                Khóa học:{' '}
                <Box component="span" sx={{ fontWeight: 700, color: TEXT }}>
                  {courseName || '—'}
                </Box>
                {courseCategory ? (
                  <>
                    {' · '}
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      {courseCategory}
                    </Box>
                  </>
                ) : null}
                {' · Chương: '}
                <Box component="span" sx={{ fontWeight: 700, color: TEXT }}>
                  {chapterTitle || '—'}
                </Box>
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: { xs: 1, sm: 1.5, md: 2 },
                mb: 1.25,
              }}
            >
              {statItems.map(({ icon, label, value, iconColor }) => (
                <StatInline
                  key={label}
                  icon={icon}
                  label={label}
                  value={value}
                  iconColor={iconColor}
                />
              ))}
            </Box>

            {showDates ? (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: { xs: 0.5, sm: 1.5 },
                  alignItems: 'center',
                }}
              >
                {createdAt ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: MUTED }} />
                    <Typography sx={{ fontSize: 12, color: MUTED }}>
                      Tạo:{' '}
                      <Box component="span" sx={{ fontWeight: 600, color: TEXT }}>
                        {formatMentorCourseDate(createdAt)}
                      </Box>
                    </Typography>
                  </Box>
                ) : null}
                {updatedAt ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: MUTED }} />
                    <Typography sx={{ fontSize: 12, color: MUTED }}>
                      Cập nhật:{' '}
                      <Box component="span" sx={{ fontWeight: 600, color: TEXT }}>
                        {formatMentorCourseDate(updatedAt)}
                      </Box>
                    </Typography>
                  </Box>
                ) : null}
              </Box>
            ) : null}
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
