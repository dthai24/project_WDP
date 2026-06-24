/**
 * Header trang Question Bank (Create & Detail).
 */
import {
  Box,
  Breadcrumbs,
  Chip,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Link, useNavigate } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import MentorChapterCardMenu from '@/features/mentor/components/course/MentorChapterCardMenu';
import {
  BREADCRUMB_LINK_SX,
  CREATE_CARD_SX,
  MUTED,
  QUESTION_BANK_TITLE_SX,
  TEXT,
} from '@/features/mentor/components/course/mentorCourseCreateStyles';
import { formatMentorCourseDate } from '@/features/mentor/utils/mentorCourseUtils';

const STATUS_CHIP_SX = {
  borderRadius: '999px',
  height: 22,
  fontSize: 11,
  fontWeight: 600,
  '& .MuiChip-label': { px: 1, lineHeight: 1.2 },
};

const METRIC_CHIP_SX = {
  borderRadius: '999px',
  height: 26,
  fontSize: 12,
  fontWeight: 600,
  bgcolor: 'rgba(15,23,42,0.04)',
  color: TEXT,
  border: '1px solid rgba(15,23,42,0.06)',
  '& .MuiChip-label': { px: 1.1 },
};

function MetaLine({ parts = [] }) {
  const visible = parts.filter(Boolean);
  if (!visible.length) return null;

  return (
    <Typography
      sx={{
        fontSize: 12,
        color: MUTED,
        lineHeight: 1.5,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
      title={visible.join(' · ')}
    >
      {visible.map((part, index) => (
        <Box component="span" key={part}>
          {index > 0 ? ' · ' : null}
          {part}
        </Box>
      ))}
    </Typography>
  );
}

export default function MentorQuestionBankDetailHeader({
  bankTitle = '',
  courseName = '',
  courseId = null,
  courseCategory = '',
  chapterTitle = '',
  coursePublished = false,
  totalQuestionCount = 0,
  activeQuestionCount = 0,
  questionCountBySkill: _questionCountBySkill = {},
  createdAt = null,
  updatedAt = null,
  actions = null,
  isCreateMode = false,
  onBack,
  onQuizSetup,
}) {
  const navigate = useNavigate();

  const backPath = courseId
    ? `/mentor/courses/${courseId}/questions`
    : '/mentor/question-banks';
  const backLabel = courseId ? 'Quay lại khóa học' : 'Quay lại danh sách';

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

  const breadcrumbCourseLabel = courseName || (courseId ? `Khóa học #${courseId}` : '');

  const breadcrumbItems = [
    { key: 'home', label: 'Trang chủ', to: '/home' },
    ...(courseId
      ? [
          { key: 'courses', label: 'Khóa học của tôi', to: '/mentor/courses' },
          { key: 'course', label: breadcrumbCourseLabel, to: `/mentor/courses/${courseId}` },
          { key: 'questions', label: 'Ngân hàng câu hỏi', to: backPath },
        ]
      : [{ key: 'question-banks', label: 'Ngân hàng câu hỏi', to: '/mentor/question-banks' }]),
  ];

  const metaParts = [
    courseName || null,
    courseCategory || null,
    updatedAt ? `Cập nhật ${formatMentorCourseDate(updatedAt)}` : null,
    !updatedAt && createdAt ? `Tạo ${formatMentorCourseDate(createdAt)}` : null,
  ];

  const showChapterHint =
    chapterTitle &&
    chapterTitle.trim() !== displayTitle.trim() &&
    !displayTitle.includes(chapterTitle.trim());

  const metricChips = [
    { key: 'total', label: `${totalQuestionCount} câu hỏi` },
    ...(coursePublished
      ? [{ key: 'active', label: `${activeQuestionCount} dùng quiz` }]
      : []),
  ];

  return (
    <Box sx={{ mb: 2 }}>
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
          {breadcrumbItems.map(({ key, label, to }) => (
            <MuiLink
              key={key}
              component={Link}
              to={to}
              underline="hover"
              title={label}
              sx={BREADCRUMB_LINK_SX}
            >
              {label}
            </MuiLink>
          ))}
          <Typography
            sx={{
              fontSize: 13,
              color: TEXT,
              fontWeight: 600,
              maxWidth: { xs: 220, sm: 320 },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={breadcrumbLabel}
          >
            {breadcrumbLabel}
          </Typography>
        </Breadcrumbs>

        <AppButton
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />}
          onClick={handleBack}
          sx={{
            height: 36,
            px: 1.75,
            fontSize: 12,
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

      <Box sx={{ ...CREATE_CARD_SX, p: { xs: 1.75, sm: 2 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1.25,
            mb: metaParts.some(Boolean) || showChapterHint || (!isCreateMode && metricChips.length) ? 0.75 : 0,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              <Typography component="h1" sx={QUESTION_BANK_TITLE_SX}>
                {displayTitle}
              </Typography>
              {!isCreateMode || bankTitle ? (
                <Chip
                  size="small"
                  label={coursePublished ? 'Đã xuất bản' : 'Bản nháp'}
                  sx={{
                    ...STATUS_CHIP_SX,
                    bgcolor: coursePublished ? 'rgba(4,120,87,0.1)' : 'rgba(100,116,139,0.08)',
                    color: coursePublished ? '#047857' : MUTED,
                    border: coursePublished
                      ? '1px solid rgba(4,120,87,0.2)'
                      : '1px solid rgba(100,116,139,0.14)',
                  }}
                />
              ) : null}
            </Box>

            {showChapterHint ? (
              <Typography
                sx={{
                  fontSize: 12,
                  color: MUTED,
                  lineHeight: 1.45,
                  mb: 0.35,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={chapterTitle}
              >
                Chương: {chapterTitle}
              </Typography>
            ) : null}

            <MetaLine parts={metaParts} />
          </Box>

          {actions || (!isCreateMode && onQuizSetup) ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
                gap: 0.75,
                flexShrink: 0,
              }}
            >
              {actions}
              {!isCreateMode && onQuizSetup ? (
                <MentorChapterCardMenu onQuizSetup={onQuizSetup} />
              ) : null}
            </Box>
          ) : null}
        </Box>

        {!isCreateMode && metricChips.length ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {metricChips.map(({ key, label }) => (
              <Chip key={key} size="small" label={label} sx={METRIC_CHIP_SX} />
            ))}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
