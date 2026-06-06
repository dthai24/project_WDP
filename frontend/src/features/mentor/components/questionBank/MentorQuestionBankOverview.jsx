/**
 * MentorQuestionBankOverview — panel tóm tắt bên phải (giống MentorContentOverview).
 */
import { Box, Typography, alpha } from '@mui/material';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PlayLessonRoundedIcon from '@mui/icons-material/PlayLessonRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { Link } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import Loading from '@/shared/ui/Loading';
import { MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import {
  BUILDER_PANEL_SX,
  CHAPTER_THEME,
  LESSON_THEME,
} from '@/features/mentor/components/course/mentorCourseContentStyles';

function OutlineNavItem({
  label,
  meta,
  icon: Icon,
  iconColor,
  indent = 0,
  onClick,
  disabled = false,
  selected = false,
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0.65,
        width: '100%',
        textAlign: 'left',
        border: selected ? `1px solid ${alpha(PRIMARY, 0.35)}` : '1px solid transparent',
        background: 'none',
        cursor: onClick && !disabled ? 'pointer' : 'default',
        font: 'inherit',
        pl: indent * 1.5 + 0.5,
        pr: 0.5,
        py: 0.55,
        borderRadius: '10px',
        bgcolor: selected ? alpha(PRIMARY, 0.08) : 'transparent',
        transition: 'background-color 0.15s, border-color 0.15s',
        '&:hover':
          onClick && !disabled && !selected
            ? { bgcolor: 'rgba(8,145,178,0.06)' }
            : onClick && !disabled && selected
              ? { bgcolor: alpha(PRIMARY, 0.12) }
              : undefined,
        '&:disabled': { opacity: 0.55, cursor: 'default' },
      }}
    >
      {Icon ? (
        <Icon sx={{ fontSize: 15, color: selected ? PRIMARY : iconColor, mt: 0.15, flexShrink: 0 }} />
      ) : (
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '999px',
            bgcolor: iconColor,
            mt: 0.55,
            flexShrink: 0,
            ml: 0.45,
          }}
        />
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontSize: indent >= 1 ? 12 : 13,
            fontWeight: indent === 0 ? 700 : 600,
            color: selected ? PRIMARY : TEXT,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {label}
        </Typography>
        {meta && (
          <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.15, lineHeight: 1.35 }}>
            {meta}
          </Typography>
        )}
      </Box>
      {selected && (
        <CheckCircleRoundedIcon sx={{ fontSize: 16, color: PRIMARY, mt: 0.1, flexShrink: 0 }} />
      )}
    </Box>
  );
}

function CourseOutlineSection({
  courseChapters = [],
  chaptersLoading = false,
  selectedChapterId = '',
  chapterError = '',
  courseId = '',
  onChapterSelect,
}) {
  if (chaptersLoading) {
    return (
      <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
        <Loading size={24} />
      </Box>
    );
  }

  if (courseChapters.length === 0) {
    return (
      <Box
        sx={{
          p: 1.5,
          borderRadius: '12px',
          bgcolor: 'rgba(15,23,42,0.03)',
          border: '1px dashed rgba(15,23,42,0.12)',
        }}
      >
        <Typography sx={{ fontSize: 13, color: MUTED, lineHeight: 1.55, mb: 1.25 }}>
          Khóa học này chưa có chương. Tạo chương trước khi tạo ngân hàng câu hỏi theo chương.
        </Typography>
        {courseId && (
          <AppButton
            component={Link}
            to={`/mentor/courses/${courseId}/content/edit`}
            variant="outlined"
            size="small"
            endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ height: 34, fontSize: 12, fontWeight: 600, borderRadius: '999px' }}
          >
            Tạo chương cho khóa học
          </AppButton>
        )}
      </Box>
    );
  }

  return (
    <>
      <Typography sx={{ fontSize: 12, color: MUTED, mb: 1, lineHeight: 1.45 }}>
        Chọn chương để tạo bộ câu hỏi. Danh sách bài học chỉ để tham khảo nội dung.
      </Typography>

      {chapterError && (
        <Typography sx={{ fontSize: 12, color: '#DC2626', mb: 1, lineHeight: 1.45 }}>
          {chapterError}
        </Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
          maxHeight: { lg: 280 },
          overflowY: 'auto',
          pr: 0.25,
          mr: -0.25,
        }}
      >
        {courseChapters.map((chapter, chapterIndex) => {
          const lessons = chapter.lessons ?? [];
          const isSelected = String(chapter.chapterId) === String(selectedChapterId);

          return (
            <Box key={chapter.chapterId} sx={{ mb: 0.35 }}>
              <OutlineNavItem
                label={`Chương ${chapterIndex + 1}: ${chapter.chapterTitle}`}
                meta={
                  lessons.length > 0 ? `${lessons.length} bài học` : 'Chưa có bài học'
                }
                icon={MenuBookRoundedIcon}
                iconColor={CHAPTER_THEME.color}
                selected={isSelected}
                onClick={() => onChapterSelect?.(String(chapter.chapterId))}
              />

              {lessons.map((lesson, lessonIndex) => (
                <OutlineNavItem
                  key={lesson.lessonId}
                  label={`Bài ${lessonIndex + 1}: ${lesson.lessonTitle}`}
                  icon={PlayLessonRoundedIcon}
                  iconColor={LESSON_THEME.color}
                  indent={1}
                  disabled
                />
              ))}
            </Box>
          );
        })}
      </Box>
    </>
  );
}

export default function MentorQuestionBankOverview({
  courseName = '',
  courseCategory = '',
  chapterTitle = '',
  selectedChapterId = '',
  courseChapters = [],
  chaptersLoading = false,
  chapterError = '',
  courseId = '',
  footer = null,
  onChapterSelect,
}) {
  return (
    <Box
      sx={{
        position: { lg: 'sticky' },
        top: { lg: 24 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ ...BUILDER_PANEL_SX, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, mb: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              bgcolor: 'rgba(8,145,178,0.08)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <InsightsRoundedIcon sx={{ fontSize: 18, color: PRIMARY }} />
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: TEXT }}>
            Mục lục khóa học
          </Typography>
        </Box>

        <Box
          sx={{
            p: 1.25,
            mb: 1.5,
            borderRadius: '12px',
            bgcolor: 'rgba(8,145,178,0.05)',
            border: '1px solid rgba(8,145,178,0.12)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <MenuBookRoundedIcon sx={{ fontSize: 18, color: PRIMARY, mt: 0.15, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: MUTED, mb: 0.25 }}>
                Khóa học · Chương
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.4 }}>
                {courseName || '—'}
              </Typography>
              {chapterTitle ? (
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT, mt: 0.35 }}>
                  {chapterTitle}
                </Typography>
              ) : null}
              {courseCategory ? (
                <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.35 }}>
                  {courseCategory}
                </Typography>
              ) : null}
            </Box>
          </Box>
        </Box>

        <CourseOutlineSection
          courseChapters={courseChapters}
          chaptersLoading={chaptersLoading}
          selectedChapterId={selectedChapterId}
          chapterError={chapterError}
          courseId={courseId}
          onChapterSelect={onChapterSelect}
        />
      </Box>

      {footer && (
        <Box sx={{ display: { xs: 'none', lg: 'block' }, width: '100%' }}>{footer}</Box>
      )}
    </Box>
  );
}
