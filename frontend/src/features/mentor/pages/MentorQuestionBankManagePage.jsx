/**
 * Workspace UI question bank.
 * Route: /mentor/question-banks/manage?courseId=1[&chapterId=2]
 */
import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import { toast } from '@/shared/ui/Toast';
import ScrollToTopButton from '@/shared/ui/ScrollToTopButton';
import Loading from '@/shared/ui/Loading';
import MentorQuestionBankBuilderPanel from '@/features/mentor/components/questionBank/MentorQuestionBankBuilderPanel';
import MentorQuestionBankDetailHeader from '@/features/mentor/components/questionBank/MentorQuestionBankDetailHeader';
import MentorQuestionBankOutlinePanel from '@/features/mentor/components/questionBank/MentorQuestionBankOutlinePanel';
import MentorQuestionBankSkillNav from '@/features/mentor/components/questionBank/MentorQuestionBankSkillNav';
import useQuestionBankEditorUi from '@/features/mentor/hooks/useQuestionBankEditorUi';
import useQuestionBankChapterData from '@/features/mentor/hooks/useQuestionBankChapterData';
import {
  countQuestionsBySkillFromSections,
  getSectionDisplayQuestionCount,
} from '@/features/mentor/utils/questionBankApiMappers';
import { PRIMARY } from '@/features/mentor/components/course/mentorCourseCreateStyles';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api';

export default function MentorQuestionBankManagePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [errors, setErrors] = useState({});
  const [course, setCourse] = useState({});
  const [courseChapters, setCourseChapters] = useState([]);
  const [courseLoading, setCourseLoading] = useState(true);

  const courseId = searchParams.get('courseId') ?? '';
  const chapterId = searchParams.get('chapterId') ?? '';

  useEffect(() => {
    if (!courseId) {
      setCourseLoading(false);
      return undefined;
    }

    let cancelled = false;

    const fetchData = async () => {
      setCourseLoading(true);
      try {
        const [resChapters, resCourse] = await Promise.all([
          fetch(`${API_BASE}/courses/my-courses/${courseId}/chapters`),
          fetch(`${API_BASE}/courses/my-courses/${courseId}?tab=course`),
        ]);

        const chaptersPayload = await resChapters.json();
        const coursePayload = await resCourse.json();

        if (cancelled) return;

        setCourseChapters(chaptersPayload?.data?.Paths ?? []);
        setCourse(coursePayload?.data?.[0] ?? {});
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          toast.error('Không tải được thông tin khóa học.');
        }
      } finally {
        if (!cancelled) setCourseLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const selectedChapter = courseChapters.find(
    (item) => String(item.PathId) === String(chapterId),
  );
  const hasChapters = courseChapters.length > 0;
  const canUseGenerator = Boolean(chapterId) && hasChapters;
  const workspaceKey = `${courseId}-${chapterId || 'none'}`;

  const {
    sections,
    setSections,
    sectionErrors,
    activeSkill,
    setActiveSkill,
    activeSection,
    activeSectionIndex,
    skillSections,
    activeSectionId,
    setActiveSectionId,
    canDeleteActiveSection,
    handleSectionChange,
    handleDeleteSection,
    handleSkillSelect,
    handleSectionSelect,
    handleAddBai,
    handleOutlineNavigate,
  } = useQuestionBankEditorUi({ resetKey: chapterId || null });

  const { sectionsLoading, questionsLoading, loadSectionQuestions } = useQuestionBankChapterData({
    courseId,
    chapterId,
    setSections,
    setActiveSkill,
    setActiveSectionId,
  });

  useEffect(() => {
    if (!activeSectionId || sectionsLoading) return;
    const section = sections.find((item) => item.tempId === activeSectionId);
    if (!section?.SectionId || section.questionsLoaded || section.questionsLoading) return;
    loadSectionQuestions(activeSectionId, sections);
  }, [activeSectionId, sections, sectionsLoading, loadSectionQuestions]);

  const bankTitle = selectedChapter?.PathName?.trim() ?? '';

  const courseCategory = useMemo(
    () => [course?.categoryName, course?.levelName].filter(Boolean).join(' · '),
    [course],
  );

  const questionCount = useMemo(
    () => sections.reduce((sum, section) => sum + getSectionDisplayQuestionCount(section), 0),
    [sections],
  );

  const questionCountBySkill = useMemo(
    () => countQuestionsBySkillFromSections(sections),
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
        courseName={course.CourseName}
        coursePublished={course.IsPublished}
        totalQuestionCount={questionCount}
        questionCountBySkill={questionCountBySkill}
        actions={footerActions}
        onBack={handleBack}
      />

      <Box
        key={workspaceKey}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 2, lg: 2.5 },
          alignItems: 'start',
        }}
      >
        <MentorQuestionBankSkillNav
          sections={sections}
          activeSkill={activeSkill}
          disabled={!canUseGenerator || sectionsLoading}
          sectionErrors={sectionErrors}
          onSkillChange={handleSkillSelect}
        />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 7fr) minmax(280px, 3fr)' },
            gap: { xs: 2, lg: 2.5 },
            alignItems: 'start',
          }}
        >
          <Box sx={{ position: 'relative', minWidth: 0 }}>
            {(sectionsLoading || (questionsLoading && activeSection?.questionsLoading)) && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 3,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'rgba(255,255,255,0.72)',
                  borderRadius: '20px',
                }}
              >
                <Loading message={sectionsLoading ? 'Đang tải section...' : 'Đang tải câu hỏi...'} />
              </Box>
            )}

            <MentorQuestionBankBuilderPanel
              sections={sections}
              activeSkill={activeSkill}
              activeSection={activeSection}
              activeSectionIndex={activeSectionIndex}
              activeSectionId={activeSectionId}
              skillSections={skillSections}
              sectionErrors={sectionErrors}
              questionCount={questionCount}
              disabled={!canUseGenerator || sectionsLoading}
              emptyHint={
                !canUseGenerator
                  ? hasChapters
                    ? 'Chọn chương từ mục lục khóa học ở cột bên phải để bắt đầu tạo bộ câu hỏi.'
                    : 'Khóa học chưa có chương để tạo bộ câu hỏi.'
                  : sectionsLoading
                    ? 'Đang tải section của chương...'
                    : null
              }
              canDeleteActiveSection={canDeleteActiveSection}
              onSectionSelect={handleSectionSelect}
              onAddBai={handleAddBai}
              onSectionChange={handleSectionChange}
              onDeleteSection={handleDeleteSection}
            />
          </Box>

          <MentorQuestionBankOutlinePanel
            sections={sections}
            activeSkill={activeSkill}
            activeSectionId={activeSectionId}
            onNavigateToItem={handleOutlineNavigate}
            courseName={course.CourseName}
            courseCategory={courseCategory}
            chapterTitle={selectedChapter?.PathName}
            courseChapters={courseChapters}
            chaptersLoading={courseLoading}
            selectedChapterId={chapterId}
            chapterError={errors.chapterId}
            courseId={courseId}
            courseOutlineHint="Chọn chương để tạo hoặc mở ngân hàng câu hỏi tương ứng."
            onChapterSelect={handleChapterSelect}
          />
        </Box>
      </Box>

      <Box id="qb-mobile-footer-actions" sx={{ display: { xs: 'flex', lg: 'none' }, mt: 2.5, pb: 4 }}>
        {footerActions}
      </Box>

      <ScrollToTopButton avoidSelectors={['#app-site-footer', '#qb-mobile-footer-actions']} />
    </Box>
  );
}
