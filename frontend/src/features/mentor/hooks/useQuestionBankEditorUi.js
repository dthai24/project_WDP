/**
 * Local UI state cho editor question bank — không fetch, không draft, không save API.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  TEST_SKILL_LISTENING,
  createQuestionBankSection,
  createQuestionBankSkillSections,
  getSectionBaiNumber,
  getSectionsBySkill,
  scrollToQuestionBankItem,
} from '@/features/mentor/utils/mentorTestContentUtils';

export default function useQuestionBankEditorUi({ resetKey } = {}) {
  const [sections, setSections] = useState(() => createQuestionBankSkillSections());
  const [sectionErrors, setSectionErrors] = useState({});
  const [activeSkill, setActiveSkill] = useState(TEST_SKILL_LISTENING);
  const [activeSectionId, setActiveSectionId] = useState('');

  const persistOldSection = (sections, chapterId) => {
    if (!chapterId) return;

    sessionStorage.setItem(
      `section_${chapterId}`,
      JSON.stringify(sections)
    );
  };
  //________useEffect run when resetKey (ChapterId) change__________________
  useEffect(() => {
    if (resetKey == null || resetKey === '') return;

    const getOldSection = sessionStorage.getItem("resetKeyChapterId")
    // console.log(getOldSection)
    persistOldSection(sections, getOldSection)
    const a = sessionStorage.getItem(`section_${getOldSection}`)
    console.table(a)
    // const oldSection = sessionStorage.getItem(`section_${resetKeyChapterId}`)
    const nextSections = createQuestionBankSkillSections();
    setSections(nextSections);
    setSectionErrors({});
    setActiveSkill(TEST_SKILL_LISTENING);
    setActiveSectionId(
      getSectionsBySkill(nextSections, TEST_SKILL_LISTENING)[0]?.tempId ?? '',
    );
  }, [resetKey]);

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

  const canDeleteActiveSection = skillSections.length > 1;

  useEffect(() => {
    if (!activeSection && skillSections[0]) {
      setActiveSectionId(skillSections[0].tempId);
    }
  }, [activeSection, skillSections]);

  const handleSectionChange = (tempId, nextSection) => {
    setSections((prev) => prev.map((s) => (s.tempId === tempId ? nextSection : s)));
    if (sectionErrors[tempId]) {
      setSectionErrors((prev) => ({ ...prev, [tempId]: {} }));
    }
  };

  const handleDeleteSection = (tempId) => {
    const section = sections.find((item) => item.tempId === tempId);
    if (!section) return;

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

  return {
    sections,
    setSections,
    sectionErrors,
    setSectionErrors,
    activeSkill,
    setActiveSkill,
    activeSectionId,
    setActiveSectionId,
    skillSections,
    activeSection,
    activeSectionIndex,
    canDeleteActiveSection,
    handleSectionChange,
    handleDeleteSection,
    handleSkillSelect,
    handleSectionSelect,
    handleAddBai,
    handleOutlineNavigate,
  };
}
