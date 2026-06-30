/**
 * Workspace UI question bank — chỉ layout + local state, không API.
 * Route: /mentor/question-banks/manage?courseId=1[&chapterId=2]
 */
import { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import { toast } from '@/shared/ui/Toast';
import ScrollToTopButton from '@/shared/ui/ScrollToTopButton';
import MentorQuestionBankBuilderPanel from '@/features/mentor/components/questionBank/MentorQuestionBankBuilderPanel';
import MentorQuestionBankDetailHeader from '@/features/mentor/components/questionBank/MentorQuestionBankDetailHeader';
import useQuestionBankEditorUi from '@/features/mentor/hooks/useQuestionBankEditorUi';
import {
  countActiveQuestionsBySkill,
  getFilledQuestionCount,
} from '@/features/mentor/utils/mentorTestContentUtils';
import { PRIMARY } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import {
  getMockChaptersForCourse,
  getMockCourseFromQuestionBank,
} from '@/features/mentor/data/mentorQuestionBankMock';

export default function MentorQuestionBankManagePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [errors, setErrors] = useState({});

  const courseId = searchParams.get('courseId') ?? '';
  const chapterId = searchParams.get('chapterId') ?? '';

  const course = getMockCourseFromQuestionBank(courseId);
  const courseChapters = getMockChaptersForCourse(courseId);
  const selectedChapter = courseChapters.find(
    (item) => String(item.chapterId) === String(chapterId),
  );
  const hasChapters = courseChapters.length > 0;
  const canUseGenerator = Boolean(chapterId) && hasChapters;
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

  const bankTitle = selectedChapter?.chapterTitle?.trim() ?? '';
  const courseCategory = useMemo(
    () => [course?.categoryName, course?.levelName].filter(Boolean).join(' · '),
    [course],
  );
  const questionCount = useMemo(() => getFilledQuestionCount(sections), [sections]);
  const questionCountBySkill = useMemo(
    () => countActiveQuestionsBySkill(sections),
    [sections],
  );

  const handleChapterSelect = (nextChapterId) => {
    if (!courseId) return;
    if (errors.chapterId) setErrors((prev) => ({ ...prev, chapterId: undefined }));
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('courseId', courseId);
        next.set('chapterId', String(nextChapterId));
        return next;
      },
      { replace: true },
    );
  };

  const handleSubmit = () => {
    if (!chapterId) {
      setErrors({ chapterId: 'Vui lòng chọn chương từ mục lục bên phải' });
      toast.error('Vui lòng chọn chương trước khi lưu.');
      return;
    }
    toast.info('Logic lưu question bank sẽ được implement lại.');
  };

  const handleBack = () => {
    if (courseId) {
      navigate(`/mentor/courses/${courseId}/questions`);
      return;
    }
    navigate('/mentor/question-banks');
  };

  const footerActions = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, width: '100%' }}>
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
    </Box>
  );

  if (!courseId) {
    return (
      <Box sx={{ py: 8, textAlign: 'center', color: '#64748B' }}>
        Thiếu courseId trong URL. Ví dụ: /mentor/question-banks/manage?courseId=3
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: { xs: '100%', lg: 1520 }, mx: 'auto' }}>
      <MentorQuestionBankDetailHeader
        isCreateMode
        bankTitle={bankTitle}
        courseId={courseId}
        courseName={course?.courseName}
        coursePublished={course?.status === 'published'}
        totalQuestionCount={questionCount}
        questionCountBySkill={questionCountBySkill}
        actions={footerActions}
        onBack={handleBack}
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
          disabled={!canUseGenerator}
          emptyHint={
            !canUseGenerator
              ? hasChapters
                ? 'Chọn chương từ mục lục khóa học ở cột bên phải để bắt đầu tạo bộ câu hỏi.'
                : 'Khóa học chưa có chương để tạo bộ câu hỏi.'
              : null
          }
          canDeleteActiveSection={canDeleteActiveSection}
          onSectionSelect={handleSectionSelect}
          onAddBai={handleAddBai}
          onSectionChange={handleSectionChange}
          onDeleteSection={handleDeleteSection}
          onSkillChange={handleSkillSelect}
          onNavigateToItem={handleOutlineNavigate}
          courseName={course?.courseName}
          courseCategory={courseCategory}
          chapterTitle={selectedChapter?.chapterTitle}
          courseChapters={courseChapters}
          chaptersLoading={false}
          selectedChapterId={chapterId}
          chapterError={errors.chapterId}
          courseId={courseId}
          courseOutlineHint="Chọn chương để tạo hoặc mở ngân hàng câu hỏi tương ứng."
          onChapterSelect={handleChapterSelect}
        />
      </Box>

      <Box id="qb-mobile-footer-actions" sx={{ display: { xs: 'flex', lg: 'none' }, mt: 2.5, pb: 4 }}>
        {footerActions}
      </Box>

      <ScrollToTopButton avoidSelectors={['#app-site-footer', '#qb-mobile-footer-actions']} />
    </Box>
  );
}
