/**
 * Workspace question bank — UI-only (không API / validate / mock data).
 * Route: /mentor/question-banks/:courseId/:pathId
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '@/shared/ui/Toast';
import ScrollToTopButton from '@/shared/ui/ScrollToTopButton';
import MentorQuestionBankBuilderPanel from '@/features/mentor/components/questionBank/MentorQuestionBankBuilderPanel';
import MentorQuestionBankDetailHeader from '@/features/mentor/components/questionBank/MentorQuestionBankDetailHeader';
import MentorQuestionBankOutlinePanel from '@/features/mentor/components/questionBank/MentorQuestionBankOutlinePanel';
import MentorQuestionBankSkillNav from '@/features/mentor/components/questionBank/MentorQuestionBankSkillNav';
import {
  TEST_SKILL_LISTENING,
  attachInitialQuestionsToSection,
  countActiveQuestionsBySkill,
  countSectionsByUseForTest,
  createQuestionBankSection,
  createQuestionBankSkillSections,
  filterSectionsByUseForTest,
  finalizeSectionAfterFullQuestionRestore,
  getFilledQuestionCount,
  getSectionBaiNumber,
  getSectionsBySkill,
  getVisibleSectionsBySkill,
  scrollToQuestionBankItem,
  SECTION_USE_FOR_TEST_FILTER,
} from '@/features/mentor/utils/mentorTestContentUtils';
import { getDefaultChapterQuizConfig } from '@/features/mentor/utils/mentorChapterQuizConfigUtils';

export default function MentorQuestionBankManagePage() {
  const navigate = useNavigate();
  const { courseId, pathId } = useParams();

  const [course, setCourse] = useState(null);
  const [coursePaths, setCoursePaths] = useState([]);
  const [sections, setSections] = useState(() => createQuestionBankSkillSections());
  const sectionsRef = useRef(sections);
  const [activeSkill, setActiveSkill] = useState(TEST_SKILL_LISTENING);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [sectionUseForTestFilter, setSectionUseForTestFilter] = useState(SECTION_USE_FOR_TEST_FILTER.ALL);
  const [chapterQuizConfig, setChapterQuizConfig] = useState(null);

  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  useEffect(() => {
    if (!courseId || !pathId) return;

    setCourse({
      CourseId: Number(courseId),
      CourseName: `Khóa học #${courseId}`,
      IsPublished: false,
    });
    setCoursePaths([{
      PathId: Number(pathId),
      PathName: `Chương #${pathId}`,
      Order: 1,
      Nodes: [],
    }]);
    setChapterQuizConfig(getDefaultChapterQuizConfig({
      courseId,
      chapterId: pathId,
      chapterTitle: `Chương #${pathId}`,
      chapterIndex: 0,
    }));

    const nextSections = createQuestionBankSkillSections();
    sectionsRef.current = nextSections;
    setSections(nextSections);
    setActiveSkill(TEST_SKILL_LISTENING);
    setActiveSectionId(nextSections.find((item) => item.SkillType === TEST_SKILL_LISTENING)?.tempId ?? '');
  }, [courseId, pathId]);

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

  const createSectionWithNextOrder = (skill, currentSections = []) => {
    const newSection = attachInitialQuestionsToSection(createQuestionBankSection(skill));
    const maxOrder = currentSections
      .filter((section) => section.SkillType === skill)
      .reduce((max, section) => Math.max(max, Number(section.sectionOrder) || 0), 0);
    return { ...newSection, sectionOrder: maxOrder + 1 };
  };

  const handleSectionChange = (tempId, nextSection) => {
    const next = sectionsRef.current.map((s) => (s.tempId === tempId ? nextSection : s));
    sectionsRef.current = next;
    setSections(next);
  };

  const handleQuestionsFullyRestored = (tempId, nextSection) => {
    handleSectionChange(tempId, finalizeSectionAfterFullQuestionRestore(nextSection));
  };

  const handleUpdateSection = () => {
    toast.info('UI-only: logic lưu section chưa được implement.');
  };

  const handleSkillSelect = (skill) => {
    if (skill === activeSkill) return;
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
    setActiveSectionId(newSection.tempId);
  };

  const handleSectionSelect = (tempId) => {
    if (tempId === activeSectionId) return;
    const section = sectionsRef.current.find((item) => item.tempId === tempId);
    if (!section) return;
    setActiveSkill(section.SkillType);
    setActiveSectionId(tempId);
  };

  const handleAddBai = () => {
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
    setActiveSectionId(newSection.tempId);
  };

  const handleOutlineNavigate = (target) => {
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
        setActiveSectionId(newSection.tempId);
      }
    }
    scrollToQuestionBankItem(target);
  };

  const handlePathSelect = (nextPathId) => {
    if (String(nextPathId) === String(pathId)) return;
    navigate(`/mentor/question-banks/${courseId}/${nextPathId}`, { replace: true });
  };

  const handleBack = () => {
    navigate(`/mentor/question-banks/${courseId}`);
  };

  if (!courseId || !pathId) {
    return (
      <Box sx={{ py: 8, textAlign: 'center', color: '#64748B' }}>
        Thiếu courseId hoặc pathId. Ví dụ: /mentor/question-banks/3/1
      </Box>
    );
  }

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
          sections={visibleSections}
          activeSkill={activeSkill}
          sectionErrors={{}}
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
            sectionErrors={{}}
            sectionBaselines={{}}
            sectionSourceBaselines={{}}
            activeSectionDirty={false}
            updatingSection={false}
            questionCount={questionCount}
            coursePublished={Boolean(course?.IsPublished)}
            chapterQuizConfig={chapterQuizConfig}
            onSectionSelect={handleSectionSelect}
            onAddBai={handleAddBai}
            onSectionChange={handleSectionChange}
            onQuestionsFullyRestored={handleQuestionsFullyRestored}
            onUpdateSection={handleUpdateSection}
            onRegisterSectionControls={() => {}}
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
            chapterError={null}
            courseId={courseId}
            chapterQuizConfig={chapterQuizConfig}
            onChapterSelect={handlePathSelect}
          />
        </Box>
      </Box>

      <ScrollToTopButton avoidSelectors={['#app-site-footer']} />
    </Box>
  );
}
