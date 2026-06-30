/**
 * MentorQuestionBankDetailPage — UI shell (paths list + editor), không fetch API.
 */
import { useMemo } from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import EmptyState from '@/shared/ui/EmptyState';
import { toast } from '@/shared/ui/Toast';
import ScrollToTopButton from '@/shared/ui/ScrollToTopButton';
import MentorQuestionBankBuilderPanel from '@/features/mentor/components/questionBank/MentorQuestionBankBuilderPanel';
import MentorQuestionBankDetailHeader from '@/features/mentor/components/questionBank/MentorQuestionBankDetailHeader';
import useQuestionBankEditorUi from '@/features/mentor/hooks/useQuestionBankEditorUi';
import { PRIMARY, MUTED, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import {
  countActiveQuestionsBySkill,
  getFilledQuestionCount,
} from '@/features/mentor/utils/mentorTestContentUtils';
import { formatMentorCourseDate } from '@/features/mentor/utils/mentorCourseUtils';
import {
  getMockChaptersForCourse,
  getMockCourseFromQuestionBank,
} from '@/features/mentor/data/mentorQuestionBankMock';

function PathChapterCard({ path, index, onOpen }) {
  const theme = useTheme();
  const label = path.displayLabel || path.PathName || `Chương #${path.PathId}`;
  const chapterNumber = path.chapterOrder ?? index + 1;
  const questionCount = Number(path.QuestionCount) || 0;

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onOpen(path)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        width: '100%',
        textAlign: 'left',
        p: 2,
        borderRadius: '20px',
        bgcolor: '#FFFFFF',
        border: `1px solid ${alpha('#0F172A', 0.08)}`,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
        boxShadow: theme.ios18?.shadow?.sm ?? 'none',
        '&:hover': {
          borderColor: alpha(PRIMARY, 0.28),
          boxShadow: theme.ios18?.shadow?.md ?? `0 8px 24px ${alpha('#0F172A', 0.08)}`,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '14px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(PRIMARY, 0.1),
          color: PRIMARY,
          fontSize: 18,
          fontWeight: 800,
        }}
      >
        {chapterNumber}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 700,
            color: TEXT,
            mb: 0.35,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <QuizOutlinedIcon sx={{ fontSize: 15, color: MUTED }} />
          <Typography sx={{ fontSize: 13, color: MUTED }}>{questionCount} câu hỏi</Typography>
        </Box>
      </Box>
      <ChevronRightRoundedIcon sx={{ fontSize: 22, color: MUTED, flexShrink: 0 }} />
    </Box>
  );
}

export default function MentorQuestionBankDetailPage() {
  const navigate = useNavigate();
  const { questionBankId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const courseId = searchParams.get('courseId') ?? '3';
  const chapterId = searchParams.get('chapterId') ?? '';
  const isEditorMode = searchParams.get('mode') === 'editor';
  const isPathListMode = !chapterId;

  const course = getMockCourseFromQuestionBank(courseId);
  const courseChapters = getMockChaptersForCourse(courseId);
  const selectedChapter = courseChapters.find(
    (item) => String(item.chapterId) === String(chapterId),
  );

  const bank = useMemo(
    () => ({
      id: questionBankId,
      courseId: Number(courseId) || courseId,
      courseTitle: course?.courseName ?? `Khóa học #${courseId}`,
      chapterId: chapterId ? Number(chapterId) : null,
      chapterTitle: selectedChapter?.chapterTitle ?? '',
      title: selectedChapter?.chapterTitle ?? 'Ngân hàng câu hỏi',
      updatedAt: course?.questionBankUpdatedAt,
    }),
    [questionBankId, courseId, course, chapterId, selectedChapter],
  );

  const bankPaths = useMemo(
    () =>
      courseChapters.map((chapter, index) => ({
        PathId: chapter.chapterId,
        PathName: chapter.chapterTitle,
        chapterOrder: index + 1,
        displayLabel: `Chương ${index + 1}: ${chapter.chapterTitle}`,
        QuestionCount: 0,
      })),
    [courseChapters],
  );

  const workspaceKey = `${courseId}-${chapterId || 'none'}`;

  const {
    sections,
    sectionErrors,
    activeSkill,
    activeSection,
    activeSectionIndex,
    skillSections,
    activeSectionId,
    canDeleteActiveSection,
    handleSectionChange,
    handleDeleteSection,
    handleSkillSelect,
    handleSectionSelect,
    handleAddBai,
    handleOutlineNavigate,
  } = useQuestionBankEditorUi({ resetKey: chapterId || null });

  const questionCount = useMemo(() => getFilledQuestionCount(sections), [sections]);
  const questionCountBySkill = useMemo(
    () => countActiveQuestionsBySkill(sections),
    [sections],
  );

  const courseCategory = useMemo(
    () => [course?.categoryName, course?.levelName].filter(Boolean).join(' · '),
    [course],
  );

  const openPath = (path) => {
    navigate(
      `/mentor/question-banks/${questionBankId}?courseId=${courseId}&chapterId=${path.PathId}&mode=editor`,
    );
  };

  const selectChapter = (nextChapterId) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('courseId', courseId);
        next.set('chapterId', String(nextChapterId));
        next.set('mode', 'editor');
        return next;
      },
      { replace: true },
    );
  };

  const handleSubmit = () => {
    toast.info('Logic lưu question bank sẽ được implement lại.');
  };

  const footerActions = (
    <AppButton
      startIcon={<SaveOutlinedIcon />}
      onClick={handleSubmit}
      fullWidth
      sx={{
        height: 44,
        fontSize: 14,
        fontWeight: 700,
        borderRadius: '999px',
        bgcolor: PRIMARY,
        color: '#fff',
        boxShadow: 'none',
        '&:hover': { bgcolor: '#0E7490', boxShadow: 'none' },
      }}
    >
      Lưu ngân hàng
    </AppButton>
  );

  if (isPathListMode) {
    const title = course?.courseName ?? bank.courseTitle;
    const totalQuestions = bankPaths.reduce((sum, path) => sum + (Number(path.QuestionCount) || 0), 0);

    return (
      <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto', py: 2 }}>
        <Box sx={{ mb: 2 }}>
          <AppButton
            variant="text"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/mentor/question-banks')}
            sx={{
              height: 36,
              px: 0.5,
              color: MUTED,
              fontWeight: 600,
              fontSize: 13,
              '&:hover': { bgcolor: 'transparent', color: PRIMARY },
            }}
          >
            Quay lại danh sách
          </AppButton>
        </Box>

        <Box
          sx={{
            mb: 2.5,
            p: { xs: 2, sm: 2.5 },
            borderRadius: '22px',
            background: `linear-gradient(135deg, ${alpha(PRIMARY, 0.09)} 0%, #fff 70%)`,
            border: `1px solid ${alpha(PRIMARY, 0.14)}`,
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY, mb: 0.75 }}>
            NGÂN HÀNG CÂU HỎI
          </Typography>
          <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 800, color: TEXT, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 14, color: MUTED }}>
            {courseCategory ? `${courseCategory} · ` : ''}
            {bankPaths.length} chương · {totalQuestions} câu hỏi
            {bank.updatedAt ? ` · Cập nhật ${formatMentorCourseDate(bank.updatedAt)}` : ''}
          </Typography>
          <Typography sx={{ fontSize: 13, color: MUTED, mt: 1 }}>Chọn chương để quản lý câu hỏi</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <AppButton
            onClick={() => navigate(`/mentor/question-banks/manage?courseId=${courseId}`)}
            sx={{ height: 40, borderRadius: '999px', bgcolor: PRIMARY, boxShadow: 'none' }}
          >
            Thêm chương
          </AppButton>
        </Box>

        {bankPaths.length === 0 ? (
          <EmptyState
            icon={MenuBookOutlinedIcon}
            title="Chưa có chương nào trong ngân hàng"
            description="Tạo ngân hàng câu hỏi cho một chương để bắt đầu."
            actionLabel="Thêm chương"
            onAction={() => navigate(`/mentor/question-banks/manage?courseId=${courseId}`)}
          />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 1.5,
            }}
          >
            {bankPaths.map((path, index) => (
              <PathChapterCard key={path.PathId} path={path} index={index} onOpen={openPath} />
            ))}
          </Box>
        )}
      </Box>
    );
  }

  if (!isEditorMode && chapterId) {
    return (
      <Navigate
        to={`/mentor/question-banks/${questionBankId}?courseId=${courseId}&chapterId=${chapterId}&mode=editor`}
        replace
      />
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: { xs: '100%', lg: 1520 }, mx: 'auto' }}>
      <MentorQuestionBankDetailHeader
        bankTitle={bank.title}
        courseId={bank.courseId}
        courseName={bank.courseTitle}
        coursePublished={course?.status === 'published'}
        totalQuestionCount={questionCount}
        questionCountBySkill={questionCountBySkill}
        updatedAt={bank.updatedAt}
        actions={footerActions}
        onBack={() => navigate(`/mentor/courses/${courseId}/questions`)}
      />

      <Box key={workspaceKey}>
        <MentorQuestionBankBuilderPanel
          sections={sections}
          activeSkill={activeSkill}
          activeSection={activeSection}
          activeSectionIndex={activeSectionIndex}
          activeSectionId={activeSectionId}
          skillSections={skillSections}
          sectionErrors={sectionErrors}
          questionCount={questionCount}
          canDeleteActiveSection={canDeleteActiveSection}
          onSectionSelect={handleSectionSelect}
          onAddBai={handleAddBai}
          onSectionChange={handleSectionChange}
          onDeleteSection={handleDeleteSection}
          onSkillChange={handleSkillSelect}
          onNavigateToItem={handleOutlineNavigate}
          courseName={bank.courseTitle}
          courseCategory={courseCategory}
          chapterTitle={bank.chapterTitle}
          courseChapters={courseChapters}
          selectedChapterId={chapterId}
          courseId={courseId}
          courseOutlineHint="Chọn chương khác để mở ngân hàng câu hỏi tương ứng."
          onChapterSelect={selectChapter}
        />
      </Box>

      <ScrollToTopButton avoidSelectors={['#app-site-footer']} />
    </Box>
  );
}
