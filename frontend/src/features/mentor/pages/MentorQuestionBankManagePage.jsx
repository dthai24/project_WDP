/**
 * Workspace question bank — axios tại trang.
 * Route: /mentor/question-banks/:courseId/:pathId
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '@/shared/ui/Loading';
import { toast } from '@/shared/ui/Toast';
import ScrollToTopButton from '@/shared/ui/ScrollToTopButton';
import MentorQuestionBankBuilderPanel from '@/features/mentor/components/questionBank/MentorQuestionBankBuilderPanel';
import MentorQuestionBankDetailHeader from '@/features/mentor/components/questionBank/MentorQuestionBankDetailHeader';
import MentorQuestionBankOutlinePanel from '@/features/mentor/components/questionBank/MentorQuestionBankOutlinePanel';
import MentorQuestionBankSkillNav from '@/features/mentor/components/questionBank/MentorQuestionBankSkillNav';
import {
  TEST_SKILL_LISTENING,
  countActiveQuestionsBySkill,
  createQuestionBankSection,
  createQuestionBankSkillSections,
  getFilledQuestionCount,
  getSectionBaiNumber,
  getSectionsBySkill,
  normalizeQuestionBankSectionForSave,
  scrollToQuestionBankItem,
  validateQuestionBankSection,
} from '@/features/mentor/utils/mentorTestContentUtils';
import {
  buildSectionBaselinesMap,
  buildSectionEditorSnapshot,
  isSectionEditorDirty,
  mapApiSectionToEditorSection,
  mergeQuestionsIntoSection,
} from '@/features/mentor/utils/questionBankApiMappers';
import useQuestionBankSectionCommit from '@/features/mentor/hooks/useQuestionBankSectionCommit';
import { saveQuestionBankSection } from '@/features/mentor/services/questionBankService';

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

        let mappedSections = (sectionPayload?.data?.sections ?? []).map(mapApiSectionToEditorSection);
        if (mappedSections.length === 0) {
          mappedSections = createQuestionBankSkillSections();
        }

        const sectionsWithQuestions = await Promise.all(
          mappedSections.map(async (section) => {
            if (!section.SectionId) return section;
            const { data } = await axios.get(
              `${API_BASE}/api/question-bank/sections/${section.SectionId}/questions`,
              { params: { courseId, pathId } },
            );
            if (data?.success === false) return section;
            return mergeQuestionsIntoSection(section, data?.data?.questions ?? []);
          }),
        );

        if (cancelled) return;

        setQuestionPathId(sectionPayload?.data?.questionPathId ?? null);
        setSections(sectionsWithQuestions);
        sectionsRef.current = sectionsWithQuestions;
        setSectionBaselines(buildSectionBaselinesMap(sectionsWithQuestions));
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
    () => getSectionsBySkill(sections, activeSkill),
    [sections, activeSkill],
  );

  const activeSection = useMemo(() => {
    const picked = sections.find((s) => s.tempId === activeSectionId);
    if (picked?.SkillType === activeSkill) return picked;
    return skillSections[0] ?? null;
  }, [sections, activeSkill, activeSectionId, skillSections]);

  const activeSectionIndex = activeSection
    ? getSectionBaiNumber(activeSection, sections) - 1
    : 0;

  const selectedPath = coursePaths.find((item) => String(item.PathId) === String(pathId));
  const bankTitle = selectedPath?.PathName?.trim() ?? `Path #${pathId}`;
  const courseCategory = [course?.CategoryDisplayName, course?.LevelDisplayName].filter(Boolean).join(' · ');
  const questionCount = getFilledQuestionCount(sections);
  const questionCountBySkill = countActiveQuestionsBySkill(sections);
  const activeSectionDirty = activeSection
    ? isSectionEditorDirty(activeSection, sectionBaselines)
    : false;

  const handleSectionChange = (tempId, nextSection) => {
    const next = sectionsRef.current.map((s) => (s.tempId === tempId ? nextSection : s));
    sectionsRef.current = next;
    setSections(next);
    if (sectionErrors[tempId]) {
      setSectionErrors((prev) => ({ ...prev, [tempId]: undefined }));
    }
  };

  const appendSectionBaselines = (nextSections) => {
    setSectionBaselines((prev) => ({
      ...prev,
      ...buildSectionBaselinesMap(nextSections.filter((s) => prev[s.tempId] == null)),
    }));
  };

  const withSavedSection = (navigateFn) => {
    const section = sectionsRef.current.find((s) => s.tempId === activeSectionId) ?? activeSection;
    const isDirty = section ? isSectionEditorDirty(section, sectionBaselines) : false;
    if (!prepareSectionNavigation(section, isDirty)) return;
    navigateFn();
  };

  const handleUpdateSection = async () => {
    if (!activeSection) return;

    flushActiveSection();

    const section = sectionsRef.current.find((s) => s.tempId === activeSection.tempId) ?? activeSection;
    if (isActiveSectionBusy(section)) {
      toast.warning('Đang tải file lên, vui lòng đợi hoàn tất.');
      return;
    }

    const normalized = normalizeQuestionBankSectionForSave(section);
    const errors = validateQuestionBankSection(normalized);
    if (Object.keys(errors).length > 0) {
      setSectionErrors((prev) => ({ ...prev, [section.tempId]: errors }));
      toast.error('Vui lòng kiểm tra lại thông tin section.');
      return;
    }

    setUpdatingSectionId(section.tempId);
    try {
      const sectionOrder = getSectionBaiNumber(section, sectionsRef.current);
      const result = await saveQuestionBankSection({
        courseId,
        pathId,
        questionPathId,
        section: normalized,
        sectionOrder,
      });

      if (!result.ok) {
        toast.error(result.message ?? 'Không thể cập nhật section.');
        return;
      }

      if (result.sectionId && !section.SectionId) {
        const next = sectionsRef.current.map((s) =>
          s.tempId === section.tempId ? { ...s, SectionId: result.sectionId } : s,
        );
        sectionsRef.current = next;
        setSections(next);
      }

      setSectionBaselines((prev) => ({
        ...prev,
        [section.tempId]: buildSectionEditorSnapshot(normalized),
      }));
      setSectionErrors((prev) => ({ ...prev, [section.tempId]: undefined }));
      toast.success(result.message ?? 'Đã cập nhật section.');
    } finally {
      setUpdatingSectionId('');
    }
  };

  const handleDeleteSection = (tempId) => {
    const section = sectionsRef.current.find((item) => item.tempId === tempId);
    if (tempId === activeSectionId) {
      const isDirty = section ? isSectionEditorDirty(section, sectionBaselines) : false;
      if (!prepareSectionNavigation(section, isDirty)) return;
    }

    if (!section || getSectionsBySkill(sectionsRef.current, section.SkillType).length <= 1) return;

    const nextSections = sectionsRef.current.filter((item) => item.tempId !== tempId);
    sectionsRef.current = nextSections;
    setSections(nextSections);
    setSectionBaselines((prev) => {
      const next = { ...prev };
      delete next[tempId];
      return next;
    });
    setSectionErrors((prev) => {
      const next = { ...prev };
      delete next[tempId];
      return next;
    });

    if (activeSectionId === tempId) {
      setActiveSectionId(getSectionsBySkill(nextSections, section.SkillType)[0]?.tempId ?? '');
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
      const newSection = createQuestionBankSection(skill);
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
      const newSection = createQuestionBankSection(activeSkill);
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
          const newSection = createQuestionBankSection(target.skill);
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
          sections={sections}
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
            activeSectionDirty={activeSectionDirty}
            updatingSection={updatingSectionId === activeSectionId}
            questionCount={questionCount}
            canDeleteActiveSection={skillSections.length > 1}
            coursePublished={Boolean(course?.IsPublished)}
            onSectionSelect={handleSectionSelect}
            onAddBai={handleAddBai}
            onSectionChange={handleSectionChange}
            onDeleteSection={handleDeleteSection}
            onUpdateSection={handleUpdateSection}
            onRegisterSectionControls={bindSectionControls}
          />

          <MentorQuestionBankOutlinePanel
            sections={sections}
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
    </Box>
  );
}
