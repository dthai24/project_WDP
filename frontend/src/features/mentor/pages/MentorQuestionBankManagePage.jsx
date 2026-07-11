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
  TEST_SKILL_VOCABULARY,
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
  getQuestionBankSectionValidationToast,
  hasPendingPersistedQuestionDeletes,
  SECTION_USE_FOR_TEST_FILTER,
  countSectionsByUseForTest,
  filterSectionsByUseForTest,
  validateSectionUseForTestRule,
  SECTION_USE_FOR_TEST_REQUIRES_QUESTION_MESSAGE,
} from '@/features/mentor/utils/mentorTestContentUtils';
import {
  buildSectionBaselinesMap,
  buildSectionEditorSnapshot,
  buildSectionSourceBaselinesMap,
  buildSectionSourceSnapshot,
  buildQuestionBankSectionSavePayload,
  hasQuestionBankWorkspaceChanges,
  hasSectionUnsavedChanges,
  isQuestionBankDeleteOnlyPayload,
  shouldUploadReadingComposeText,
  applyInitialQuestionsBaseline,
  revertSectionToSavedBaseline,
  mapApiSectionToEditorSection,
  mergeQuestionsIntoSection,
  hydrateReadingSectionFromSourceUrl,
} from '@/features/mentor/utils/questionBankApiMappers';
import useQuestionBankSectionCommit from '@/features/mentor/hooks/useQuestionBankSectionCommit';
import { saveQuestionBankSection } from '@/features/mentor/services/questionBankService';
import { uploadTextMaterial } from '@/features/mentor/services/materialUploadService';
import { isHtmlContentEmpty } from '@/features/mentor/utils/mentorCourseContentUtils';
import { getChapterQuizConfig } from '@/features/mentor/services/chapterQuizConfigService';
import { validateListeningReadingPublishedSectionQuota, validateVocabularySectionQuestionQuota, isSkillSectionRandomPick } from '@/features/mentor/utils/mentorChapterQuizConfigUtils';
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
  const [savePreviewReadingText, setSavePreviewReadingText] = useState(null);
  const savePayloadRef = useRef(null);
  const savePreviewReadingTextRef = useRef(null);
  const confirmSaveInFlightRef = useRef(false);
  const pendingNavigationRef = useRef(null);
  const requestNavigationRef = useRef(null);
  const { registerNavigationGuard } = useNavigationGuard() ?? {};
  const [questionPathId, setQuestionPathId] = useState(null);
  const [sectionErrors, setSectionErrors] = useState({});
  const [updatingSectionId, setUpdatingSectionId] = useState('');
  const [activeSkill, setActiveSkill] = useState(TEST_SKILL_LISTENING);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [sectionUseForTestFilter, setSectionUseForTestFilter] = useState(
    SECTION_USE_FOR_TEST_FILTER.ALL,
  );
  const [chapterQuizConfig, setChapterQuizConfig] = useState(null);
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
        const [resCourse, resPaths, resSections, resQuizConfig] = await Promise.all([
          axios.get(`${API_BASE}/api/courses/my-courses/${courseId}`, { params: { tab: 'course' } }),
          axios.get(`${API_BASE}/api/courses/my-courses/${courseId}/chapters`),
          axios.get(`${API_BASE}/api/question-bank/courses/${courseId}/paths/${pathId}/sections`),
          getChapterQuizConfig(courseId, pathId),
        ]);

        if (cancelled) return;

        setCourse(resCourse.data?.data?.[0] ?? null);
        setCoursePaths(resPaths.data?.data?.Paths ?? []);
        setChapterQuizConfig(resQuizConfig?.ok ? resQuizConfig.config ?? null : null);

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

        const hydratedSections = await Promise.all(
          sectionsWithQuestions.map((section) => hydrateReadingSectionFromSourceUrl(section)),
        );

        if (cancelled) return;

        setQuestionPathId(sectionPayload?.data?.questionPathId ?? null);
        const baselines = buildSectionBaselinesMap(hydratedSections);
        setSections(hydratedSections);
        sectionsRef.current = hydratedSections;
        setSectionBaselines(baselines);
        setInitialSectionBaselines(baselines);
        setSectionSourceBaselines(buildSectionSourceBaselinesMap(hydratedSections));
        setSectionErrors({});

        const firstSection =
          getSectionsBySkill(hydratedSections, TEST_SKILL_LISTENING)[0]
          ?? hydratedSections[0];

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

  useEffect(() => {
    if (activeSkill !== TEST_SKILL_READING) return undefined;

    let cancelled = false;

    (async () => {
      const readingSections = getSectionsBySkill(sectionsRef.current, TEST_SKILL_READING);
      const pending = readingSections.filter(
        (section) =>
          String(section.MaterialUrl ?? '').trim() && isHtmlContentEmpty(section.Description),
      );
      if (pending.length === 0) return;

      const hydrated = await Promise.all(
        pending.map((section) => hydrateReadingSectionFromSourceUrl(section)),
      );
      if (cancelled) return;

      const hydratedByTempId = Object.fromEntries(
        pending.map((section, index) => [section.tempId, hydrated[index]]),
      );
      const changed = pending.some((section, index) => hydrated[index] !== section);
      if (!changed) return;

      const nextSections = sectionsRef.current.map(
        (section) => hydratedByTempId[section.tempId] ?? section,
      );
      sectionsRef.current = nextSections;
      setSections(nextSections);

      setSectionBaselines((prev) => {
        const nextBaselines = { ...prev };
        pending.forEach((section, index) => {
          const updated = hydrated[index];
          if (updated !== section) {
            nextBaselines[section.tempId] = buildSectionEditorSnapshot(updated);
          }
        });
        return nextBaselines;
      });
      setInitialSectionBaselines((prev) => {
        const nextBaselines = { ...prev };
        pending.forEach((section, index) => {
          const updated = hydrated[index];
          if (updated !== section) {
            nextBaselines[section.tempId] = buildSectionEditorSnapshot(updated);
          }
        });
        return nextBaselines;
      });
      setSectionSourceBaselines((prev) => {
        const nextBaselines = { ...prev };
        pending.forEach((section, index) => {
          const updated = hydrated[index];
          if (updated !== section) {
            const snapshot = buildSectionSourceSnapshot(updated);
            if (snapshot != null) {
              nextBaselines[section.tempId] = snapshot;
            }
          }
        });
        return nextBaselines;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [activeSkill]);

  const skillSectionsAll = useMemo(
    () => getVisibleSectionsBySkill(sections, activeSkill),
    [sections, activeSkill],
  );

  const skillSections = useMemo(
    () => filterSectionsByUseForTest(skillSectionsAll, sectionUseForTestFilter),
    [skillSectionsAll, sectionUseForTestFilter],
  );

  const sectionUseForTestCounts = useMemo(
    () => countSectionsByUseForTest(skillSectionsAll),
    [skillSectionsAll],
  );

  useEffect(() => {
    if (skillSections.length === 0) return;
    if (!skillSections.some((section) => section.tempId === activeSectionId)) {
      setActiveSectionId(skillSections[0].tempId);
    }
  }, [skillSections, activeSectionId]);

  const visibleSections = sections;

  const activeSection = useMemo(() => {
    const picked = sections.find((s) => s.tempId === activeSectionId);
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
  const canSaveSection = hasPendingQuestionDeletes
    || (activeSectionUnsaved && Boolean(activeSection));
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

  const createSectionWithNextOrder = (skill, currentSections = []) => {
    const newSection = attachInitialQuestionsToSection(createQuestionBankSection(skill));
    const maxOrder = currentSections
      .filter((section) => section.SkillType === skill)
      .reduce((max, section) => Math.max(max, Number(section.sectionOrder) || 0), 0);
    return {
      ...newSection,
      sectionOrder: maxOrder + 1,
    };
  };

  useEffect(() => {
    if (!registerNavigationGuard) return undefined;
    return registerNavigationGuard((navigateFn) => {
      requestNavigationRef.current?.(navigateFn);
    });
  }, [registerNavigationGuard]);

  const handleUpdateSection = () => {
    if (!activeSection) return;

    flushActiveSection();

    const section = sectionsRef.current.find((s) => s.tempId === activeSection.tempId) ?? activeSection;
    if (isActiveSectionBusy(section)) {
      toast.warning('Đang tải file lên, vui lòng đợi hoàn tất.');
      return;
    }

    const hasActiveChanges = hasSectionUnsavedChanges(
      section,
      sectionBaselinesRef.current,
      sectionSourceBaselinesRef.current,
    );
    if (!hasActiveChanges) {
      toast.info('Không có thay đổi để lưu.');
      return;
    }

    const sectionOrder = getSectionBaiNumber(section, visibleSections);
    const previewPayload = buildQuestionBankSectionSavePayload(
      section,
      {
        courseId,
        pathId,
        questionPathId,
        sectionOrder,
      },
      sectionBaselinesRef.current,
      sectionSourceBaselinesRef.current,
    );

    savePayloadRef.current = previewPayload;
    const readingHtml = section.SkillType === TEST_SKILL_READING
      ? String(section.Description ?? '')
      : null;
    savePreviewReadingTextRef.current = readingHtml;
    setSavePreviewReadingText(readingHtml);
    setSavePreviewPayload(previewPayload);
    setSavePreviewOpen(true);
  };

  const handleSavePreviewClose = () => {
    if (updatingSectionId) return;
    setSavePreviewOpen(false);
    setSavePreviewReadingText(null);
    savePreviewReadingTextRef.current = null;
    savePayloadRef.current = null;
  };

  const handleConfirmSaveSection = async () => {
    if (confirmSaveInFlightRef.current) return;

    flushActiveSection();

    const section = sectionsRef.current.find((s) => s.tempId === activeSectionId) ?? activeSection;
    if (!section) return;

    const useForTestError = validateSectionUseForTestRule(section);
    if (useForTestError.isUseForTest) {
      setSectionErrors((prev) => ({
        ...prev,
        [section.tempId]: {
          ...(prev[section.tempId] ?? {}),
          isUseForTest: useForTestError.isUseForTest,
        },
      }));
      toast.error(SECTION_USE_FOR_TEST_REQUIRES_QUESTION_MESSAGE);
      return;
    }

    if (isSkillSectionRandomPick(section.SkillType)) {
      const quotaError = validateListeningReadingPublishedSectionQuota(
        sectionsRef.current,
        section.SkillType,
        chapterQuizConfig,
      );
      if (quotaError.isUseForTest) {
        setSectionErrors((prev) => ({
          ...prev,
          [section.tempId]: {
            ...(prev[section.tempId] ?? {}),
            isUseForTest: quotaError.isUseForTest,
          },
        }));
        toast.error(quotaError.isUseForTest);
        setSavePreviewOpen(false);
        savePreviewReadingTextRef.current = null;
        savePayloadRef.current = null;
        return;
      }
    }

    if (section.SkillType === TEST_SKILL_VOCABULARY) {
      const vocabQuotaError = validateVocabularySectionQuestionQuota(section, chapterQuizConfig);
      if (vocabQuotaError.isUseForTest || vocabQuotaError._questions) {
        setSectionErrors((prev) => ({
          ...prev,
          [section.tempId]: {
            ...(prev[section.tempId] ?? {}),
            ...vocabQuotaError,
          },
        }));
        toast.error(vocabQuotaError.isUseForTest ?? vocabQuotaError._questions);
        setSavePreviewOpen(false);
        savePreviewReadingTextRef.current = null;
        savePayloadRef.current = null;
        return;
      }
    }

    const normalized = normalizeQuestionBankSectionForSave(section);
    const previewPayload = savePayloadRef.current ?? buildQuestionBankSectionSavePayload(
      section,
      {
        courseId,
        pathId,
        questionPathId,
        sectionOrder: getSectionBaiNumber(section, visibleSections),
      },
      sectionBaselinesRef.current,
      sectionSourceBaselinesRef.current,
    );
    const deleteQuestionsOnly = isQuestionBankDeleteOnlyPayload(previewPayload);

    if (!deleteQuestionsOnly) {
      const errors = validateQuestionBankSection(normalized, {
        forSave: true,
        allSections: sectionsRef.current,
      });
      if (Object.keys(errors).length > 0) {
        setSectionErrors((prev) => ({ ...prev, [section.tempId]: errors }));
        const validationToast = getQuestionBankSectionValidationToast(errors, section);
        if (validationToast) toast.error(validationToast);
        setSavePreviewOpen(false);
        savePreviewReadingTextRef.current = null;
        savePayloadRef.current = null;
        return;
      }
    }

    confirmSaveInFlightRef.current = true;
    setUpdatingSectionId(section.tempId);

    try {
      const sectionOrder = getSectionBaiNumber(section, visibleSections);
      let uploadedReadingSourceUrl = null;

      if (shouldUploadReadingComposeText(section, sectionSourceBaselinesRef.current)) {
        const html = String(
          section.Description ?? savePreviewReadingTextRef.current ?? '',
        );
        try {
          const uploaded = await uploadTextMaterial({
            html,
            title: String(section.SectionTitle ?? section.DisplayName ?? 'question-bank-reading').trim()
              || 'question-bank-reading',
          });
          uploadedReadingSourceUrl = String(uploaded.url ?? '').trim() || null;
          if (!uploadedReadingSourceUrl) {
            toast.error('Không thể tải nội dung văn bản lên Cloudinary.');
            return;
          }
        } catch (error) {
          console.error(error);
          toast.error(error.message ?? 'Không thể tải nội dung văn bản lên Cloudinary.');
          return;
        }
      }

      const savePayload = buildQuestionBankSectionSavePayload(
        section,
        {
          courseId,
          pathId,
          questionPathId,
          sectionOrder,
        },
        sectionBaselinesRef.current,
        sectionSourceBaselinesRef.current,
        { uploadedReadingSourceUrl },
      );
      savePayloadRef.current = savePayload;

      const normalized = normalizeQuestionBankSectionForSave(section);
      const hasSectionSaveOps =
        savePayload.sectionInsert
        || savePayload.sectionUpdate
        || savePayload.sectionSourceUpdate
        || (savePayload.questionsInsert?.length ?? 0) > 0
        || (savePayload.questionsUpdate?.length ?? 0) > 0
        || (savePayload.questionsDelete?.length ?? 0) > 0;

      let result = {
        ok: true,
        sectionId: section.SectionId ?? null,
        questionIdMap: [],
        message: 'Đã lưu thay đổi.',
      };

      if (hasSectionSaveOps) {
        result = await saveQuestionBankSection(savePayload);
        if (!result.ok) {
          toast.error(result.message ?? 'Không thể cập nhật section.');
          return;
        }
      }

      if (!hasSectionSaveOps) {
        setSavePreviewOpen(false);
        setSavePreviewReadingText(null);
        savePreviewReadingTextRef.current = null;
        savePayloadRef.current = null;
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

      if (result.questionPathId) {
        setQuestionPathId(result.questionPathId);
      }

      const questionIdByRef = Object.fromEntries(
        (result.questionIdMap ?? []).map((item) => [item.clientRef, item.questionId]),
      );
      const choiceIdByRef = Object.fromEntries(
        (result.choiceIdMap ?? [])
          .filter((item) => item?.clientRef && item?.choiceId)
          .map((item) => [item.clientRef, item.choiceId]),
      );
      const questionsWithIds = (normalized.Questions ?? []).map((question) => {
        const nextQuestion = question.QuestionId
          ? question
          : { ...question, QuestionId: questionIdByRef[question.tempId] ?? null };
        return {
          ...nextQuestion,
          Options: (nextQuestion.Options ?? []).map((option) =>
            option.ChoiceId
              ? option
              : { ...option, ChoiceId: choiceIdByRef[option.tempId] ?? option.ChoiceId ?? null },
          ),
        };
      });

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
      setSavePreviewReadingText(null);
      savePreviewReadingTextRef.current = null;
      savePayloadRef.current = null;
      toast.success(result.message ?? 'Đã cập nhật section.');
    } finally {
      confirmSaveInFlightRef.current = false;
      setUpdatingSectionId('');
    }
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
      const newSection = createSectionWithNextOrder(skill, sectionsRef.current);
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
      const newSection = createSectionWithNextOrder(activeSkill, sectionsRef.current);
      const skillIndexes = sectionsRef.current
        .map((section, index) => ({ section, index }))
        .filter(({ section }) => section.SkillType === activeSkill)
        .map(({ index }) => index);
      const nextSections = [...sectionsRef.current];
      if (skillIndexes.length > 0) {
        const lastSkillIndex = skillIndexes[skillIndexes.length - 1];
        nextSections.splice(lastSkillIndex + 1, 0, newSection);
      } else {
        nextSections.push(newSection);
      }
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
          const newSection = createSectionWithNextOrder(target.skill, sectionsRef.current);
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
          chapterQuizConfig={chapterQuizConfig}
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
            skillSectionsAllCount={skillSectionsAll.length}
            sectionUseForTestFilter={sectionUseForTestFilter}
            sectionUseForTestCounts={sectionUseForTestCounts}
            onSectionUseForTestFilterChange={setSectionUseForTestFilter}
            sectionErrors={sectionErrors}
            sectionBaselines={sectionBaselines}
            sectionSourceBaselines={sectionSourceBaselines}
            activeSectionDirty={activeSectionDirty}
            updatingSection={updatingSectionId === activeSectionId}
            questionCount={questionCount}
            coursePublished={Boolean(course?.IsPublished)}
            chapterQuizConfig={chapterQuizConfig}
            onSectionSelect={handleSectionSelect}
            onAddBai={handleAddBai}
            onSectionChange={handleSectionChange}
            onQuestionsFullyRestored={handleQuestionsFullyRestored}
            onUpdateSection={handleUpdateSection}
            onRegisterSectionControls={bindSectionControls}
          />

          <MentorQuestionBankOutlinePanel
            sections={visibleSections}
            activeSkill={activeSkill}
            activeSectionId={activeSectionId}
            sectionUseForTestFilter={sectionUseForTestFilter}
            onNavigateToItem={handleOutlineNavigate}
            courseName={course?.CourseName ?? `Khóa học #${courseId}`}
            courseCategory={courseCategory}
            chapterTitle={selectedPath?.PathName}
            courseChapters={coursePaths}
            selectedChapterId={pathId}
            chapterError={errors.pathId}
            courseId={courseId}
            chapterQuizConfig={chapterQuizConfig}
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
        readingTextHtml={savePreviewReadingText}
        loading={Boolean(updatingSectionId)}
        onClose={handleSavePreviewClose}
        onConfirm={handleConfirmSaveSection}
      />
    </Box>
  );
}
