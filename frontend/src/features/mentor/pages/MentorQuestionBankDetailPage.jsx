/**
 * MentorQuestionBankDetailPage
 * Route: /mentor/question-banks/:questionBankId
 *
 * Xem và chỉnh sửa ngân hàng câu hỏi đã tạo.
 */
import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import { toast } from '@/shared/ui/Toast';
import Loading from '@/shared/ui/Loading';
import ScrollToTopButton from '@/shared/ui/ScrollToTopButton';
import EmptyState from '@/shared/ui/EmptyState';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import MentorQuestionBankSkillNav from '@/features/mentor/components/questionBank/MentorQuestionBankSkillNav';
import MentorQuestionBankBuilderPanel from '@/features/mentor/components/questionBank/MentorQuestionBankBuilderPanel';
import MentorQuestionBankDetailHeader from '@/features/mentor/components/questionBank/MentorQuestionBankDetailHeader';
import MentorQuestionBankRightRail from '@/features/mentor/components/questionBank/MentorQuestionBankRightRail';
import MentorQuestionBankPathsView from '@/features/mentor/components/questionBank/MentorQuestionBankPathsView';
import MentorChapterQuizSetupDialog from '@/features/mentor/components/course/MentorChapterQuizSetupDialog';
import {
  QUIZ_SETUP_SCOPE_CHAPTER,
  QUIZ_SETUP_SCOPE_COURSE,
} from '@/features/mentor/utils/mentorChapterQuizConfigUtils';
import useQuestionBankDetailBootstrap from '@/features/mentor/hooks/useQuestionBankDetailBootstrap';
import { PRIMARY } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import { HEADER_HEIGHT } from '@/shared/layout/MainLayout';
import {
  SCORING_MODE_AUTO,
  buildQuestionBaselineMap,
  buildQuestionSnapshotMap,
  collectPersistedQuestionIds,
  collectQuestionChangeSet,
  countActiveQuestionsBySkill,
  createQuestionBankSection,
  ensureQuestionBankSkillSections,
  getActiveQuestionCount,
  getFilledQuestionCount,
  getNonEmptyQuestionBankSections,
  getQuestionBankSectionNameFallback,
  normalizeQuestionBankSectionForSave,
  getSectionBaiNumber,
  getSectionsBySkill,
  consolidateWritingSections,
  scrollToQuestionBankItem,
  supportsQuestionBankMultiSection,
  validatePublishedQuestionBankIntegrity,
  validateTestMaterial,
} from '@/features/mentor/utils/mentorTestContentUtils';
import { updatePathQuestions } from '@/features/mentor/services/questionBankService';

const PUBLISHED_COURSE_QB_HINT =
  'Khóa học đã xuất bản: chỉ thêm câu hỏi mới, không sửa/xóa câu hỏi cũ. Có thể tắt "Dùng cho quiz" để ẩn câu cũ khỏi quiz/test mới — lịch sử học viên không bị ảnh hưởng.';

function mapSectionsForSave(sourceSections) {
  return sourceSections.map((section) =>
    normalizeQuestionBankSectionForSave({
      ...section,
      DisplayName:
        String(section.DisplayName ?? '').trim() ||
        getQuestionBankSectionNameFallback(section, sourceSections),
    }),
  );
}

export default function MentorQuestionBankDetailPage() {
  const navigate = useNavigate();
  const { questionBankId } = useParams();
  const [searchParams] = useSearchParams();
  const isEditorMode = searchParams.get('mode') === 'editor';
  const [submitting, setSubmitting] = useState(false);
  const [quizSetupTarget, setQuizSetupTarget] = useState(null);

  const {
    loading,
    notFound,
    isPathListMode,
    bank,
    bankPaths,
    setBank,
    course,
    courseChapters,
    pathsLoading,
    sections,
    setSections,
    sectionErrors,
    setSectionErrors,
    activeSkill,
    setActiveSkill,
    activeSectionId,
    setActiveSectionId,
    persistedQuestionIds,
    setPersistedQuestionIds,
    questionSnapshotRef,
    questionBaselineMap,
    setQuestionBaselineMap,
    workspaceKey,
    openPath,
    selectChapter,
  } = useQuestionBankDetailBootstrap();

  const coursePublished = course?.IsPublished === true || course?.IsPublished === 1;

  const questionCount = useMemo(() => getFilledQuestionCount(sections), [sections]);
  const activeQuestionCount = useMemo(() => getActiveQuestionCount(sections), [sections]);
  const activeQuestionCountBySkill = useMemo(
    () => countActiveQuestionsBySkill(sections),
    [sections],
  );

  const questionChanges = useMemo(
    () => collectQuestionChangeSet(sections, questionBaselineMap),
    [sections, questionBaselineMap],
  );

  const hasPendingQuestionChanges =
    questionChanges.dirtyTempIds.size > 0 || questionChanges.deletedQuestionIds.length > 0;

  const skillSections = useMemo(
    () => getSectionsBySkill(sections, activeSkill),
    [sections, activeSkill],
  );

  const activeSection = useMemo(() => {
    if (activeSectionId) {
      const found = sections.find((section) => section.tempId === activeSectionId);
      if (found?.SkillType === activeSkill) return found;
    }
    return skillSections[0] ?? null;
  }, [sections, activeSkill, activeSectionId, skillSections]);

  const activeSectionIndex = useMemo(() => {
    if (!activeSection) return 0;
    return getSectionBaiNumber(activeSection, sections) - 1;
  }, [activeSection, sections]);

  const canDeleteActiveSection =
    supportsQuestionBankMultiSection(activeSkill) && skillSections.length > 1;

  useEffect(() => {
    if (loading || isPathListMode || isEditorMode) return;
    const next = new URLSearchParams(searchParams);
    next.set('mode', 'editor');
    navigate({ search: `?${next.toString()}` }, { replace: true });
  }, [loading, isPathListMode, isEditorMode, searchParams, navigate]);

  useEffect(() => {
    if (!activeSection && skillSections[0]) {
      setActiveSectionId(skillSections[0].tempId);
    }
  }, [activeSection, skillSections, setActiveSectionId]);

  useEffect(() => {
    if (loading || isPathListMode) return;
    const questionId = searchParams.get('questionId');
    if (!questionId) return;

    const questionTempId = `question-${questionId}`;
    const section = sections.find((item) =>
      (item.Questions ?? []).some((question) => String(question.tempId) === questionTempId),
    );
    if (!section) return;

    setActiveSkill(section.SkillType);
    setActiveSectionId(section.tempId);
    scrollToQuestionBankItem({ type: 'question', questionTempId });
  }, [loading, isPathListMode, searchParams, sections, setActiveSectionId, setActiveSkill]);

  const handleSectionChange = (tempId, nextSection) => {
    setSections((prev) => prev.map((s) => (s.tempId === tempId ? nextSection : s)));
    if (sectionErrors[tempId]) {
      setSectionErrors((prev) => ({ ...prev, [tempId]: {} }));
    }
  };

  const handleDeleteSection = (tempId) => {
    const section = sections.find((item) => item.tempId === tempId);
    if (!section || !supportsQuestionBankMultiSection(section.SkillType)) return;

    const sameSkillSections = getSectionsBySkill(sections, section.SkillType);
    if (sameSkillSections.length <= 1) return;

    const nextSections = sections.filter((item) => item.tempId !== tempId);
    setSections(nextSections);
    setSectionErrors((prev) => {
      const next = { ...prev };
      delete next[tempId];
      return next;
    });

    if (activeSectionId === tempId) {
      const fallback = getSectionsBySkill(nextSections, section.SkillType)[0];
      setActiveSectionId(fallback?.tempId ?? '');
    }
  };

  const handleSkillSelect = (skill) => {
    setActiveSkill(skill);
    const existing = getSectionsBySkill(sections, skill);
    if (existing[0]) {
      setActiveSectionId(existing[0].tempId);
      return;
    }

    const newSection = createQuestionBankSection(skill);
    setSections((prev) => [...prev, newSection]);
    setActiveSectionId(newSection.tempId);
  };

  const handleSectionSelect = (tempId) => {
    if (!tempId) return;
    const section = sections.find((item) => item.tempId === tempId);
    if (!section) return;
    setActiveSkill(section.SkillType);
    setActiveSectionId(tempId);
  };

  const handleAddBai = () => {
    if (!supportsQuestionBankMultiSection(activeSkill)) return;
    const newSection = createQuestionBankSection(activeSkill);
    setSections((prev) => [...prev, newSection]);
    setActiveSectionId(newSection.tempId);
  };

  const handleOutlineNavigate = (target) => {
    if (target.sectionTempId) {
      const section = sections.find((item) => item.tempId === target.sectionTempId);
      if (section) {
        setActiveSkill(section.SkillType);
        setActiveSectionId(target.sectionTempId);
      }
    } else if (target.skill) {
      handleSkillSelect(target.skill);
    }
    scrollToQuestionBankItem(target);
  };

  const validateSections = () => {
    const bankTitle = bank?.title?.trim() || bank?.chapterTitle?.trim() || '';
    const materialErrors = validateTestMaterial(
      { Title: bankTitle, Sections: sections, ScoringMode: SCORING_MODE_AUTO },
      { inlineSections: true, skipTitle: true },
    );
    if (materialErrors.Sections) {
      return { sections: materialErrors.Sections, _sections: materialErrors._sections };
    }
    if (materialErrors._sections) {
      return { _sections: materialErrors._sections };
    }
    return {};
  };

  const handleSave = async () => {
    if (!bank) return;

    if (!hasPendingQuestionChanges) {
      toast.info('Không có thay đổi để lưu.');
      return;
    }

    if (coursePublished) {
      const integrity = validatePublishedQuestionBankIntegrity(
        sections,
        questionSnapshotRef.current,
      );
      if (!integrity.ok) {
        toast.error(integrity.message);
        return;
      }
    }

    const sectionValidation = validateSections();
    if (sectionValidation._sections) {
      if (sectionValidation.sections) setSectionErrors(sectionValidation.sections);
      toast.error(sectionValidation._sections ?? 'Vui lòng kiểm tra lại câu hỏi.');
      return;
    }

    setSubmitting(true);
    try {
      const bankTitle = bank.title?.trim() || bank.chapterTitle?.trim() || '';
      const sectionsForSave = consolidateWritingSections(sections);

      const res = await updatePathQuestions(bank.courseId, bank.chapterId, {
        sections: sectionsForSave,
        dirtyTempIds: questionChanges.dirtyTempIds,
        deletedQuestionIds: questionChanges.deletedQuestionIds,
        chapterTitle: bank.chapterTitle ?? bankTitle,
      });

      if (!res.ok) {
        toast.error(res.message ?? 'Lưu thay đổi thất bại.');
        return;
      }

      const nextSections = ensureQuestionBankSkillSections(res.bank?.sections ?? sectionsForSave);
      const nextBaseline = buildQuestionBaselineMap(nextSections);
      if (res.bank) {
        setBank(res.bank);
      }
      setSections(nextSections);
      setPersistedQuestionIds(collectPersistedQuestionIds(nextSections));
      questionSnapshotRef.current = buildQuestionSnapshotMap(nextSections);
      setQuestionBaselineMap(nextBaseline);
      toast.success('Đã lưu thay đổi.');
    } catch {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const footerActions = (
    <AppButton
      loading={submitting}
      disabled={!hasPendingQuestionChanges}
      startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
      onClick={handleSave}
      sx={{
        height: 34,
        px: 1.75,
        fontSize: 12,
        fontWeight: 600,
        borderRadius: '999px',
        bgcolor: PRIMARY,
        color: '#fff',
        boxShadow: 'none',
        '&:hover': { bgcolor: '#0E7490', boxShadow: 'none' },
      }}
    >
      Lưu thay đổi
    </AppButton>
  );

  const openQuizSetupForBank = () => {
    if (!bank) return;
    setQuizSetupTarget({
      scope: QUIZ_SETUP_SCOPE_CHAPTER,
      chapterId: bank.chapterId,
      chapterTitle: bank.chapterTitle,
      chapterIndex: Math.max(
        0,
        courseChapters.findIndex(
          (chapter) => String(chapter.chapterId ?? chapter.PathId) === String(bank.chapterId),
        ),
      ),
    });
  };

  const openQuizSetupForChapter = (chapter, chapterIndex) => {
    setQuizSetupTarget({
      scope: QUIZ_SETUP_SCOPE_CHAPTER,
      chapterId: chapter.chapterId ?? chapter.PathId,
      chapterTitle: chapter.chapterTitle ?? chapter.PathName,
      chapterIndex,
    });
  };

  const openCourseQuizSetup = () => {
    setQuizSetupTarget({ scope: QUIZ_SETUP_SCOPE_COURSE });
  };

  const backToCourseQuestions = () => {
    if (bank?.courseId) {
      navigate(`/mentor/courses/${bank.courseId}/questions`);
      return;
    }
    navigate('/mentor/question-banks');
  };

  if (loading) {
    return (
      <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <Loading message={isPathListMode ? 'Đang tải danh sách chương...' : 'Đang tải ngân hàng câu hỏi...'} />
      </Box>
    );
  }

  if (notFound || !bank) {
    return (
      <Box sx={{ width: '100%', maxWidth: 640, mx: 'auto', py: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <AppButton
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/mentor/question-banks')}
            sx={{ height: 40, borderRadius: '999px', fontWeight: 600, fontSize: 13 }}
          >
            Quay lại danh sách
          </AppButton>
        </Box>
        <EmptyState
          icon={QuizOutlinedIcon}
          title="Không tìm thấy ngân hàng câu hỏi"
          description="Ngân hàng câu hỏi có thể đã bị xóa hoặc không tồn tại."
          actionLabel="Quay lại danh sách"
          onAction={() => navigate('/mentor/question-banks')}
        />
      </Box>
    );
  }

  if (isPathListMode) {
    const courseCategory = [course?.CategoryDisplayName, course?.LevelDisplayName]
      .filter(Boolean)
      .join(' · ');

    return (
      <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto', py: 2 }}>
        <MentorQuestionBankPathsView
          bank={bank}
          paths={bankPaths}
          courseName={course?.CourseName ?? bank.courseTitle}
          courseCategory={courseCategory}
          updatedAt={bank.updatedAt}
          onOpenPath={openPath}
          onBack={() => navigate('/mentor/question-banks')}
          onCreatePath={
            bank.courseId
              ? () => navigate(`/mentor/question-banks/create?courseId=${bank.courseId}`)
              : undefined
          }
        />
      </Box>
    );
  }

  if (!isEditorMode) {
    return (
      <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <Loading message="Đang mở trình chỉnh sửa..." />
      </Box>
    );
  }

  const bankTitle =
    bank.chapterDisplayLabel ||
    bank.title?.trim() ||
    bank.chapterTitle?.trim() ||
    'Ngân hàng câu hỏi';
  const courseCategory = [course?.CategoryDisplayName, course?.LevelDisplayName]
    .filter(Boolean)
    .join(' · ');

  return (
    <Box sx={{ width: '100%', maxWidth: { xs: '100%', lg: 1520 }, mx: 'auto' }}>
      <MentorQuestionBankDetailHeader
        bankTitle={bankTitle}
        courseId={bank.courseId}
        courseName={bank.courseTitle || course?.CourseName}
        courseCategory={courseCategory}
        chapterTitle={bank.chapterTitle}
        coursePublished={coursePublished}
        totalQuestionCount={questionCount}
        activeQuestionCount={activeQuestionCount}
        questionCountBySkill={activeQuestionCountBySkill}
        createdAt={bank.createdAt}
        updatedAt={bank.updatedAt ?? bank.questionBankUpdatedAt}
        actions={footerActions}
        onBack={backToCourseQuestions}
        onQuizSetup={openQuizSetupForBank}
      />

      <MentorChapterQuizSetupDialog
        open={Boolean(quizSetupTarget)}
        onClose={() => setQuizSetupTarget(null)}
        scope={quizSetupTarget?.scope ?? QUIZ_SETUP_SCOPE_CHAPTER}
        courseId={bank.courseId}
        courseTitle={bank.courseTitle || course?.CourseName}
        chapterId={quizSetupTarget?.chapterId ?? bank.chapterId}
        chapterTitle={quizSetupTarget?.chapterTitle ?? bank.chapterTitle}
        chapterIndex={
          quizSetupTarget?.chapterIndex ??
          Math.max(
            0,
            courseChapters.findIndex(
              (chapter) => String(chapter.chapterId ?? chapter.PathId) === String(bank.chapterId),
            ),
          )
        }
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
        <Box
          sx={{
            width: { xs: '100%', lg: 200 },
            flexShrink: 0,
            alignSelf: 'flex-start',
            position: { lg: 'sticky' },
            top: { lg: HEADER_HEIGHT + 16 },
            zIndex: 2,
          }}
        >
          <MentorQuestionBankSkillNav
            sections={sections}
            activeSkill={activeSkill}
            sectionErrors={sectionErrors}
            showActiveCounts={coursePublished}
            onSkillChange={handleSkillSelect}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            maxWidth: { lg: 1280 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 7fr) minmax(280px, 3fr)' },
            gap: { xs: 2, lg: 2.5 },
            alignItems: 'start',
          }}
        >
          <MentorQuestionBankBuilderPanel
            sections={sections}
            activeSkill={activeSkill}
            activeSection={activeSection}
            activeSectionIndex={activeSectionIndex}
            skillSections={skillSections}
            sectionErrors={sectionErrors}
            questionCount={questionCount}
            publishedHint={coursePublished ? PUBLISHED_COURSE_QB_HINT : null}
            coursePublished={coursePublished}
            persistedQuestionIds={persistedQuestionIds}
            canDeleteActiveSection={canDeleteActiveSection}
            onSectionSelect={handleSectionSelect}
            onAddBai={handleAddBai}
            onSectionChange={handleSectionChange}
            onDeleteSection={handleDeleteSection}
          />

          <MentorQuestionBankRightRail
            sections={sections}
            activeSkill={activeSkill}
            activeSectionId={activeSectionId}
            onNavigateToItem={handleOutlineNavigate}
            courseName={bank.courseTitle || course?.CourseName}
            courseCategory={courseCategory}
            chapterTitle={bank.chapterTitle}
            courseChapters={courseChapters}
            chaptersLoading={pathsLoading}
            selectedChapterId={bank.chapterId}
            courseId={bank.courseId}
            courseOutlineHint="Chọn chương khác để mở ngân hàng câu hỏi tương ứng."
            onChapterSelect={selectChapter}
            onChapterQuizSetup={openQuizSetupForChapter}
            onCourseQuizSetup={openCourseQuizSetup}
          />
        </Box>
      </Box>

      <ScrollToTopButton avoidSelectors={['#app-site-footer']} />
    </Box>
  );
}
