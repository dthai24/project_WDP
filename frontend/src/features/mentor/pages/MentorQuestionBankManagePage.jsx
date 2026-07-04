/**
 * Workspace question bank — axios tại trang.
 * Route: /mentor/question-banks/:courseId/:pathId
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '@/shared/ui/Loading';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { toast } from '@/shared/ui/Toast';
import ScrollToTopButton from '@/shared/ui/ScrollToTopButton';
import MentorQuestionBankBuilderPanel from '@/features/mentor/components/questionBank/MentorQuestionBankBuilderPanel';
import MentorQuestionBankSectionSavePreviewDialog from '@/features/mentor/components/questionBank/MentorQuestionBankSectionSavePreviewDialog';
import MentorQuestionBankDetailHeader from '@/features/mentor/components/questionBank/MentorQuestionBankDetailHeader';
import MentorQuestionBankOutlinePanel from '@/features/mentor/components/questionBank/MentorQuestionBankOutlinePanel';
import MentorQuestionBankSkillNav from '@/features/mentor/components/questionBank/MentorQuestionBankSkillNav';
import {
  TEST_SKILL_LISTENING,
  TEST_SKILL_READING,
  countActiveQuestionsBySkill,
  createQuestionBankSection,
  createQuestionBankSkillSections,
  getFilledQuestionCount,
  getSectionBaiNumber,
  getSectionsBySkill,
  getVisibleSectionsBySkill,
  attachInitialQuestionsToSection,
  finalizeSectionAfterFullQuestionRestore,
  normalizeQuestionBankSectionForSave,
  scrollToQuestionBankItem,
  validateQuestionBankSection,
  isQuestionBankSectionValid,
  findQuestionBankSectionSaveIssue,
  buildQuestionBankSectionSaveErrors,
  hasPendingPersistedQuestionDeletes,
} from '@/features/mentor/utils/mentorTestContentUtils';
import {
  buildSectionBaselinesMap,
  buildSectionEditorSnapshot,
  buildSectionSourceBaselinesMap,
  buildSectionSourceSnapshot,
  buildQuestionBankWorkspaceSavePayload,
  hasQuestionBankWorkspaceChanges,
  hasSectionUnsavedChanges,
  isQuestionBankDeleteOnlyPayload,
  applyInitialQuestionsBaseline,
  revertSectionToSavedBaseline,
  mapApiSectionToEditorSection,
  mergeQuestionsIntoSection,
} from '@/features/mentor/utils/questionBankApiMappers';
import useQuestionBankSectionCommit from '@/features/mentor/hooks/useQuestionBankSectionCommit';
import { saveQuestionBankSection, deleteQuestionBankSection } from '@/features/mentor/services/questionBankService';
import { useNavigationGuard } from '@/context/NavigationGuardContext';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export default function MentorQuestionBankManagePage() {
  const navigate = useNavigate();
  const { courseId, pathId } = useParams();

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [course, setCourse] = useState(null);
  const [coursePaths, setCoursePaths] = useState([]);
  const [sections, setSections] = useState(() => createQuestionBankSkillSections());
  const sectionsRef = useRef(sections);
  const [sectionBaselines, setSectionBaselines] = useState({});
  const sectionBaselinesRef = useRef(sectionBaselines);
  const [initialSectionBaselines, setInitialSectionBaselines] = useState({});
  const initialSectionBaselinesRef = useRef(initialSectionBaselines);
  const [sectionSourceBaselines, setSectionSourceBaselines] = useState({});
  const sectionSourceBaselinesRef = useRef(sectionSourceBaselines);
  const [unsavedNavDialogOpen, setUnsavedNavDialogOpen] = useState(false);
  const [savePreviewOpen, setSavePreviewOpen] = useState(false);
  const [savePreviewPayload, setSavePreviewPayload] = useState(null);
  const savePayloadRef = useRef(null);
  const pendingNavigationRef = useRef(null);
  const requestNavigationRef = useRef(null);
  const { registerNavigationGuard } = useNavigationGuard() ?? {};
  const [questionPathId, setQuestionPathId] = useState(null);
  const [sectionErrors, setSectionErrors] = useState({});
  const [updatingSectionId, setUpdatingSectionId] = useState('');
  const [activeSkill, setActiveSkill] = useState(TEST_SKILL_LISTENING);
  const [activeSectionId, setActiveSectionId] = useState('');
  const {
    bindSectionControls,
    flushActiveSection,
    isActiveSectionBusy,
    prepareSectionNavigation,
  } = useQuestionBankSectionCommit();

  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  useEffect(() => {
    sectionBaselinesRef.current = sectionBaselines;
  }, [sectionBaselines]);

  useEffect(() => {
    initialSectionBaselinesRef.current = initialSectionBaselines;
  }, [initialSectionBaselines]);

  useEffect(() => {
    sectionSourceBaselinesRef.current = sectionSourceBaselines;
  }, [sectionSourceBaselines]);

  useEffect(() => {
    if (!courseId || !pathId) return undefined;

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [resCourse, resPaths, resSections] = await Promise.all([
          axios.get(`${API_BASE}/api/courses/my-courses/${courseId}`, { params: { tab: 'course' } }),
          axios.get(`${API_BASE}/api/courses/my-courses/${courseId}/chapters`),
          axios.get(`${API_BASE}/api/question-bank/courses/${courseId}/paths/${pathId}/sections`),
        ]);

        if (cancelled) return;

        setCourse(resCourse.data?.data?.[0] ?? null);
        setCoursePaths(resPaths.data?.data?.Paths ?? []);

        const sectionPayload = resSections.data;
        if (sectionPayload?.success === false) {
          toast.error(sectionPayload.message ?? 'Không tải được danh sách section.');
          setSections(createQuestionBankSkillSections());
          return;
        }

        let mappedSections = (sectionPayload?.data?.sections ?? [])
          .slice()
          .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
          .map(mapApiSectionToEditorSection);
        if (mappedSections.length === 0) {
          mappedSections = createQuestionBankSkillSections();
        }

        const sectionsWithQuestions = (
          await Promise.all(
            mappedSections.map(async (section) => {
              if (!section.SectionId) return section;
              const { data } = await axios.get(
                `${API_BASE}/api/question-bank/sections/${section.SectionId}/questions`,
                { params: { courseId, pathId } },
              );
              if (data?.success === false) return section;
              return mergeQuestionsIntoSection(section, data?.data?.questions ?? []);
            }),
          )
        ).map(attachInitialQuestionsToSection);

        if (cancelled) return;

        setQuestionPathId(sectionPayload?.data?.questionPathId ?? null);
        const baselines = buildSectionBaselinesMap(sectionsWithQuestions);
        setSections(sectionsWithQuestions);
        sectionsRef.current = sectionsWithQuestions;
        setSectionBaselines(baselines);
        setInitialSectionBaselines(baselines);
        setSectionSourceBaselines(buildSectionSourceBaselinesMap(sectionsWithQuestions));
        setSectionErrors({});

        const firstSection =
          getSectionsBySkill(sectionsWithQuestions, TEST_SKILL_LISTENING)[0]
          ?? sectionsWithQuestions[0];

        if (firstSection) {
          setActiveSkill(firstSection.SkillType);
          setActiveSectionId(firstSection.tempId);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          toast.error(error.response?.data?.message ?? 'Không tải được dữ liệu ngân hàng câu hỏi.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseId, pathId]);

  const skillSections = useMemo(
    () => getVisibleSectionsBySkill(sections, activeSkill),
    [sections, activeSkill],
  );

  const visibleSections = useMemo(
    () => sections.filter((section) => !section.pendingDelete),
    [sections],
  );

  const hasPendingSectionDeletes = sections.some((section) => section.pendingDelete);

  const activeSection = useMemo(() => {
    const picked = sections.find((s) => s.tempId === activeSectionId && !s.pendingDelete);
    if (picked?.SkillType === activeSkill) return picked;
    return skillSections[0] ?? null;
  }, [sections, activeSkill, activeSectionId, skillSections]);

  const activeSectionIndex = activeSection
    ? getSectionBaiNumber(activeSection, visibleSections) - 1
    : 0;

  const selectedPath = coursePaths.find((item) => String(item.PathId) === String(pathId));
  const bankTitle = selectedPath?.PathName?.trim() ?? `Path #${pathId}`;
  const courseCategory = [course?.CategoryDisplayName, course?.LevelDisplayName].filter(Boolean).join(' · ');
  const questionCount = getFilledQuestionCount(visibleSections);
  const questionCountBySkill = countActiveQuestionsBySkill(visibleSections);
  const activeSectionUnsaved = activeSection
    ? hasSectionUnsavedChanges(activeSection, sectionBaselines, sectionSourceBaselines)
    : false;
  const hasPendingQuestionDeletes = activeSection
    ? hasPendingPersistedQuestionDeletes(activeSection)
    : false;
  const canSaveSection = hasPendingSectionDeletes
    || hasPendingQuestionDeletes
    || (activeSectionUnsaved && Boolean(activeSection) && isQuestionBankSectionValid(activeSection));
  const activeSectionDirty = canSaveSection;

  const handleSectionChange = (tempId, nextSection) => {
    const next = sectionsRef.current.map((s) => (s.tempId === tempId ? nextSection : s));
    sectionsRef.current = next;
    setSections(next);
    if (sectionErrors[tempId]) {
      setSectionErrors((prev) => ({ ...prev, [tempId]: undefined }));
    }
  };

  const handleQuestionsFullyRestored = (tempId, nextSection) => {
    const finalized = finalizeSectionAfterFullQuestionRestore(nextSection);
    handleSectionChange(tempId, finalized);
    setSectionBaselines((prev) =>
      applyInitialQuestionsBaseline(finalized, prev, initialSectionBaselinesRef.current),
    );
  };

  const appendSectionBaselines = (nextSections) => {
    const missing = nextSections.filter((s) => s?.tempId);
    setSectionBaselines((prev) => {
      const additions = buildSectionBaselinesMap(missing.filter((s) => prev[s.tempId] == null));
      if (Object.keys(additions).length > 0) {
        setInitialSectionBaselines((initialPrev) => ({ ...initialPrev, ...additions }));
      }
      return { ...prev, ...additions };
    });
    setSectionSourceBaselines((prev) => ({
      ...prev,
      ...buildSectionSourceBaselinesMap(missing.filter((s) => prev[s.tempId] == null)),
    }));
  };

  const clearPendingSectionDeletes = () => {
    const next = sectionsRef.current.map((section) =>
      section.pendingDelete ? { ...section, pendingDelete: false } : section,
    );
    sectionsRef.current = next;
    setSections(next);
  };

  const removePendingDeletedSections = () => {
    const removedTempIds = sectionsRef.current
      .filter((section) => section.pendingDelete)
      .map((section) => section.tempId);

    const next = sectionsRef.current.filter((section) => !section.pendingDelete);
    sectionsRef.current = next;
    setSections(next);

    setSectionBaselines((prev) => {
      const nextBaselines = { ...prev };
      removedTempIds.forEach((tempId) => {
        delete nextBaselines[tempId];
      });
      return nextBaselines;
    });
    setInitialSectionBaselines((prev) => {
      const nextBaselines = { ...prev };
      removedTempIds.forEach((tempId) => {
        delete nextBaselines[tempId];
      });
      return nextBaselines;
    });
    setSectionSourceBaselines((prev) => {
      const nextBaselines = { ...prev };
      removedTempIds.forEach((tempId) => {
        delete nextBaselines[tempId];
      });
      return nextBaselines;
    });
    setSectionErrors((prev) => {
      const nextErrors = { ...prev };
      removedTempIds.forEach((tempId) => {
        delete nextErrors[tempId];
      });
      return nextErrors;
    });

    if (removedTempIds.includes(activeSectionId)) {
      const fallback = getVisibleSectionsBySkill(next, activeSkill)[0] ?? next.find((item) => !item.pendingDelete);
      setActiveSectionId(fallback?.tempId ?? '');
      if (fallback?.SkillType) setActiveSkill(fallback.SkillType);
    }
  };

  const revertActiveSectionChanges = () => {
    const section = sectionsRef.current.find((s) => s.tempId === activeSectionId);
    if (!section) return;

    const reverted = revertSectionToSavedBaseline(
      section,
      sectionBaselinesRef.current,
      sectionSourceBaselinesRef.current,
    );
    const next = sectionsRef.current.map((s) => (s.tempId === section.tempId ? reverted : s));
    sectionsRef.current = next;
    setSections(next);
    setSectionErrors((prev) => ({ ...prev, [section.tempId]: undefined }));
    clearPendingSectionDeletes();
  };

  const requestNavigation = (navigateFn) => {
    const section = sectionsRef.current.find((s) => s.tempId === activeSectionId) ?? activeSection;
    if (!prepareSectionNavigation(section)) return;

    const isDirty = hasQuestionBankWorkspaceChanges(
      sectionsRef.current,
      section,
      sectionBaselinesRef.current,
      sectionSourceBaselinesRef.current,
    );

    if (isDirty) {
      pendingNavigationRef.current = navigateFn;
      setUnsavedNavDialogOpen(true);
      return;
    }

    navigateFn();
  };

  const handleUnsavedNavCancel = () => {
    pendingNavigationRef.current = null;
    setUnsavedNavDialogOpen(false);
  };

  const handleUnsavedNavContinue = () => {
    const navigateFn = pendingNavigationRef.current;
    pendingNavigationRef.current = null;
    setUnsavedNavDialogOpen(false);
    revertActiveSectionChanges();
    navigateFn?.();
  };

  const withSavedSection = (navigateFn) => {
    requestNavigation(navigateFn);
  };

  requestNavigationRef.current = requestNavigation;

  useEffect(() => {
    if (!registerNavigationGuard) return undefined;
    return registerNavigationGuard((navigateFn) => {
      requestNavigationRef.current?.(navigateFn);
    });
  }, [registerNavigationGuard]);

  const handleUpdateSection = async () => {
    if (!activeSection) return;

    flushActiveSection();

    const section = sectionsRef.current.find((s) => s.tempId === activeSection.tempId) ?? activeSection;
    if (isActiveSectionBusy(section)) {
      toast.warning('Đang tải file lên, vui lòng đợi hoàn tất.');
      return;
    }

    const normalized = normalizeQuestionBankSectionForSave(section);
    const hasActiveChanges = hasSectionUnsavedChanges(
      section,
      sectionBaselinesRef.current,
      sectionSourceBaselinesRef.current,
    );
    const pendingDeletes = sectionsRef.current.filter((item) => item.pendingDelete);

    if (!hasActiveChanges && pendingDeletes.length === 0) {
      toast.info('Không có thay đổi để lưu.');
      return;
    }

    const sectionOrder = getSectionBaiNumber(section, visibleSections);
    const previewPayload = buildQuestionBankWorkspaceSavePayload(
      section,
      {
        courseId,
        pathId,
        questionPathId,
        sectionOrder,
      },
      sectionBaselinesRef.current,
      sectionSourceBaselinesRef.current,
      sectionsRef.current,
    );
    const deleteQuestionsOnly = isQuestionBankDeleteOnlyPayload(previewPayload);

    if (hasActiveChanges && !deleteQuestionsOnly) {
      const saveIssue = findQuestionBankSectionSaveIssue(section);
      if (saveIssue) {
        setSectionErrors((prev) => ({
          ...prev,
          [section.tempId]: buildQuestionBankSectionSaveErrors(section, saveIssue),
        }));
        toast.warning(saveIssue.message);
        return;
      }

      const errors = validateQuestionBankSection(normalized);
      if (Object.keys(errors).length > 0) {
        setSectionErrors((prev) => ({ ...prev, [section.tempId]: errors }));
        toast.error('Vui lòng kiểm tra lại thông tin section.');
        return;
      }
    }

    savePayloadRef.current = previewPayload;
    setSavePreviewPayload(previewPayload);
    setSavePreviewOpen(true);
  };

  const handleSavePreviewClose = () => {
    if (updatingSectionId) return;
    setSavePreviewOpen(false);
  };

  const handleConfirmSaveSection = async () => {
    const section = sectionsRef.current.find((s) => s.tempId === activeSectionId) ?? activeSection;
    if (!section) return;

    flushActiveSection();

    const sectionOrder = getSectionBaiNumber(
      section,
      sectionsRef.current.filter((item) => !item.pendingDelete),
    );
    const savePayload = buildQuestionBankWorkspaceSavePayload(
      section,
      {
        courseId,
        pathId,
        questionPathId,
        sectionOrder,
      },
      sectionBaselinesRef.current,
      sectionSourceBaselinesRef.current,
      sectionsRef.current,
    );
    savePayloadRef.current = savePayload;

    const normalized = normalizeQuestionBankSectionForSave(section);
    const sectionsToDelete = savePayload.sectionsDelete ?? [];
    const hasSectionSaveOps =
      savePayload.sectionInsert
      || savePayload.sectionUpdate
      || savePayload.sectionSourceUpdate
      || (savePayload.questionsInsert?.length ?? 0) > 0
      || (savePayload.questionsUpdate?.length ?? 0) > 0
      || (savePayload.questionsDelete?.length ?? 0) > 0;

    setUpdatingSectionId(section.tempId);
    try {
      for (const item of sectionsToDelete) {
        if (!item.sectionId) continue;
        const deleteResult = await deleteQuestionBankSection(item.sectionId, {
          courseId: Number(courseId),
          pathId: Number(pathId),
        });
        if (!deleteResult.ok) {
          toast.error(deleteResult.message ?? 'Không thể xóa section.');
          return;
        }
      }

      let result = {
        ok: true,
        sectionId: section.SectionId ?? null,
        questionIdMap: [],
        message: sectionsToDelete.length > 0 ? 'Đã xóa section.' : 'Đã lưu thay đổi.',
      };

      if (hasSectionSaveOps) {
        result = await saveQuestionBankSection(savePayload);
        if (!result.ok) {
          toast.error(result.message ?? 'Không thể cập nhật section.');
          return;
        }
      }

      if (sectionsToDelete.length > 0) {
        removePendingDeletedSections();
      }

      if (!hasSectionSaveOps) {
        setSavePreviewOpen(false);
        toast.success(result.message ?? 'Đã lưu thay đổi.');
        return;
      }

      if (result.sectionId && !section.SectionId) {
        const next = sectionsRef.current.map((s) =>
          s.tempId === section.tempId ? { ...s, SectionId: result.sectionId } : s,
        );
        sectionsRef.current = next;
        setSections(next);
      }

      const questionIdByRef = Object.fromEntries(
        (result.questionIdMap ?? []).map((item) => [item.clientRef, item.questionId]),
      );
      const questionsWithIds = (normalized.Questions ?? []).map((question) =>
        question.QuestionId
          ? question
          : { ...question, QuestionId: questionIdByRef[question.tempId] ?? null },
      );

      const clearedDeleted = sectionsRef.current.map((s) => {
        if (s.tempId !== section.tempId) return s;
        const withQuestions = attachInitialQuestionsToSection({
          ...s,
          Questions: questionsWithIds,
          DeletedQuestions: [],
        });
        if (result.sourceUrl == null) return withQuestions;
        if (withQuestions.SkillType === TEST_SKILL_LISTENING) {
          return { ...withQuestions, AudioUrl: result.sourceUrl };
        }
        if (withQuestions.SkillType === TEST_SKILL_READING) {
          return { ...withQuestions, MaterialUrl: result.sourceUrl };
        }
        return withQuestions;
      });
      sectionsRef.current = clearedDeleted;
      setSections(clearedDeleted);

      const sectionForBaseline = {
        ...normalized,
        SectionId: result.sectionId ?? normalized.SectionId ?? null,
        Questions: questionsWithIds,
        ...(result.sourceUrl != null && normalized.SkillType === TEST_SKILL_LISTENING
          ? { AudioUrl: result.sourceUrl }
          : {}),
        ...(result.sourceUrl != null && normalized.SkillType === TEST_SKILL_READING
          ? { MaterialUrl: result.sourceUrl }
          : {}),
      };
      const snapshot = buildSectionEditorSnapshot(sectionForBaseline);
      setSectionBaselines((prev) => ({
        ...prev,
        [section.tempId]: snapshot,
      }));
      setInitialSectionBaselines((prev) => ({
        ...prev,
        [section.tempId]: snapshot,
      }));
      const sourceSnapshot = buildSectionSourceSnapshot(sectionForBaseline);
      if (sourceSnapshot != null) {
        setSectionSourceBaselines((prev) => ({
          ...prev,
          [section.tempId]: sourceSnapshot,
        }));
      }
      setSectionErrors((prev) => ({ ...prev, [section.tempId]: undefined }));
      setSavePreviewOpen(false);
      toast.success(result.message ?? 'Đã cập nhật section.');
    } finally {
      setUpdatingSectionId('');
    }
  };

  const handleDeleteSection = (tempId) => {
    const performMarkDelete = () => {
      const section = sectionsRef.current.find((item) => item.tempId === tempId);
      if (!section) return;

      const visibleInSkill = getVisibleSectionsBySkill(sectionsRef.current, section.SkillType);
      if (visibleInSkill.length <= 1) return;

      const nextSections = sectionsRef.current.map((item) =>
        item.tempId === tempId ? { ...item, pendingDelete: true } : item,
      );
      sectionsRef.current = nextSections;
      setSections(nextSections);

      if (activeSectionId === tempId) {
        const nextActive = getVisibleSectionsBySkill(nextSections, section.SkillType)[0];
        setActiveSectionId(nextActive?.tempId ?? '');
      }

      toast.info('Section sẽ được xóa khi bạn lưu thay đổi.');
    };

    if (tempId === activeSectionId) {
      requestNavigation(performMarkDelete);
      return;
    }

    performMarkDelete();
  };

  const handleSkillSelect = (skill) => {
    if (skill === activeSkill) return;
    withSavedSection(() => {
      setActiveSkill(skill);
      const existing = getSectionsBySkill(sectionsRef.current, skill)[0];
      if (existing) {
        setActiveSectionId(existing.tempId);
        return;
      }
      const newSection = attachInitialQuestionsToSection(createQuestionBankSection(skill));
      const nextSections = [...sectionsRef.current, newSection];
      sectionsRef.current = nextSections;
      setSections(nextSections);
      appendSectionBaselines([newSection]);
      setActiveSectionId(newSection.tempId);
    });
  };

  const handleSectionSelect = (tempId) => {
    if (tempId === activeSectionId) return;
    withSavedSection(() => {
      const section = sectionsRef.current.find((item) => item.tempId === tempId);
      if (!section) return;
      setActiveSkill(section.SkillType);
      setActiveSectionId(tempId);
    });
  };

  const handleAddBai = () => {
    withSavedSection(() => {
      const newSection = attachInitialQuestionsToSection(createQuestionBankSection(activeSkill));
      const nextSections = [...sectionsRef.current, newSection];
      sectionsRef.current = nextSections;
      setSections(nextSections);
      appendSectionBaselines([newSection]);
      setActiveSectionId(newSection.tempId);
    });
  };

  const handleOutlineNavigate = (target) => {
    const isSameSection = target.sectionTempId && target.sectionTempId === activeSectionId;
    const isSameSkillOnly = !target.sectionTempId && target.skill === activeSkill;

    const navigate = () => {
      if (target.sectionTempId) {
        const section = sectionsRef.current.find((item) => item.tempId === target.sectionTempId);
        if (section) {
          setActiveSkill(section.SkillType);
          setActiveSectionId(target.sectionTempId);
        }
      } else if (target.skill) {
        setActiveSkill(target.skill);
        const existing = getSectionsBySkill(sectionsRef.current, target.skill)[0];
        if (existing) {
          setActiveSectionId(existing.tempId);
        } else {
          const newSection = attachInitialQuestionsToSection(createQuestionBankSection(target.skill));
          const nextSections = [...sectionsRef.current, newSection];
          sectionsRef.current = nextSections;
          setSections(nextSections);
          appendSectionBaselines([newSection]);
          setActiveSectionId(newSection.tempId);
        }
      }
      scrollToQuestionBankItem(target);
    };

    if (isSameSection || isSameSkillOnly) {
      scrollToQuestionBankItem(target);
      return;
    }

    withSavedSection(navigate);
  };

  const handlePathSelect = (nextPathId) => {
    if (String(nextPathId) === String(pathId)) return;
    withSavedSection(() => {
      setErrors((prev) => ({ ...prev, pathId: undefined }));
      navigate(`/mentor/question-banks/${courseId}/${nextPathId}`, { replace: true });
    });
  };

  const handleBack = () => {
    withSavedSection(() => navigate(`/mentor/question-banks/${courseId}`));
  };

  if (!courseId || !pathId) {
    return (
      <Box sx={{ py: 8, textAlign: 'center', color: '#64748B' }}>
        Thiếu courseId hoặc pathId. Ví dụ: /mentor/question-banks/3/10
      </Box>
    );
  }

  if (loading) return <Loading />;

  return (
    <Box sx={{ width: '100%', maxWidth: { xs: '100%', lg: 1520 }, mx: 'auto' }}>
      <MentorQuestionBankDetailHeader
        isCreateMode
        breadcrumbMode="coursePath"
        bankTitle={bankTitle}
        courseId={courseId}
        courseName={course?.CourseName ?? `Khóa học #${courseId}`}
        coursePublished={Boolean(course?.IsPublished)}
        totalQuestionCount={questionCount}
        questionCountBySkill={questionCountBySkill}
        onBack={handleBack}
        onNavigateRequest={requestNavigation}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 2, lg: 2.5 },
          alignItems: 'start',
        }}
      >
        <MentorQuestionBankSkillNav
          sections={visibleSections}
          activeSkill={activeSkill}
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
          <MentorQuestionBankBuilderPanel
            sections={sections}
            activeSkill={activeSkill}
            activeSection={activeSection}
            activeSectionIndex={activeSectionIndex}
            activeSectionId={activeSectionId}
            skillSections={skillSections}
            sectionErrors={sectionErrors}
            sectionBaselines={sectionBaselines}
            sectionSourceBaselines={sectionSourceBaselines}
            activeSectionDirty={activeSectionDirty}
            hasPendingSectionDeletes={hasPendingSectionDeletes}
            updatingSection={updatingSectionId === activeSectionId}
            questionCount={questionCount}
            canDeleteActiveSection={skillSections.length > 1}
            coursePublished={Boolean(course?.IsPublished)}
            onSectionSelect={handleSectionSelect}
            onAddBai={handleAddBai}
            onSectionChange={handleSectionChange}
            onQuestionsFullyRestored={handleQuestionsFullyRestored}
            onDeleteSection={handleDeleteSection}
            onUpdateSection={handleUpdateSection}
            onRegisterSectionControls={bindSectionControls}
          />

          <MentorQuestionBankOutlinePanel
            sections={visibleSections}
            activeSkill={activeSkill}
            activeSectionId={activeSectionId}
            onNavigateToItem={handleOutlineNavigate}
            courseName={course?.CourseName ?? `Khóa học #${courseId}`}
            courseCategory={courseCategory}
            chapterTitle={selectedPath?.PathName}
            courseChapters={coursePaths}
            selectedChapterId={pathId}
            chapterError={errors.pathId}
            courseId={courseId}
            onChapterSelect={handlePathSelect}
          />
        </Box>
      </Box>

      <ScrollToTopButton avoidSelectors={['#app-site-footer']} />

      <ConfirmDialog
        open={unsavedNavDialogOpen}
        onClose={handleUnsavedNavCancel}
        onConfirm={handleUnsavedNavContinue}
        title="Thay đổi chưa được lưu"
        message="Nếu bạn chuyển sang mục khác, các sự thay đổi sẽ không được lưu. Bạn có muốn tiếp tục?"
        confirmLabel="Tiếp tục"
        cancelLabel="Hủy"
      />

      <MentorQuestionBankSectionSavePreviewDialog
        open={savePreviewOpen}
        payload={savePreviewPayload}
        loading={Boolean(updatingSectionId)}
        onClose={handleSavePreviewClose}
        onConfirm={handleConfirmSaveSection}
      />
    </Box>
  );
}
