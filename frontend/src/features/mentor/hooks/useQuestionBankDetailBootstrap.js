/**
 * Bootstrap trang Detail Question Bank — reload an toàn khi F5 / đổi chương.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TEST_SKILL_LISTENING,
  buildQuestionSnapshotMap,
  collectPersistedQuestionIds,
  ensureQuestionBankSkillSections,
  getSectionsBySkill,
} from '@/features/mentor/utils/mentorTestContentUtils';
import {
  fetchCourseContentOutlineForQB,
  fetchCourseForQB,
  findQuestionBankByChapter,
  getQuestionBankById,
} from '@/features/mentor/services/questionBankService';

function getFirstListeningSectionId(sections) {
  return (
    getSectionsBySkill(sections, TEST_SKILL_LISTENING)[0]?.tempId ??
    sections[0]?.tempId ??
    ''
  );
}

function createEmptyEditorState() {
  return {
    bank: null,
    course: null,
    coursePaths: [],
    sections: [],
    sectionErrors: {},
    activeSkill: TEST_SKILL_LISTENING,
    activeSectionId: '',
    persistedQuestionIds: new Set(),
  };
}

export default function useQuestionBankDetailBootstrap() {
  const navigate = useNavigate();
  const { questionBankId } = useParams();
  const requestIdRef = useRef(0);
  const questionSnapshotRef = useRef(new Map());

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadedBankId, setLoadedBankId] = useState('');
  const [bank, setBank] = useState(null);
  const [course, setCourse] = useState(null);
  const [coursePaths, setCoursePaths] = useState([]);
  const [pathsLoading, setPathsLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [sectionErrors, setSectionErrors] = useState({});
  const [activeSkill, setActiveSkill] = useState(TEST_SKILL_LISTENING);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [persistedQuestionIds, setPersistedQuestionIds] = useState(() => new Set());

  const resetEditorState = useCallback(() => {
    const empty = createEmptyEditorState();
    setBank(empty.bank);
    setCourse(empty.course);
    setCoursePaths(empty.coursePaths);
    setSections(empty.sections);
    setSectionErrors(empty.sectionErrors);
    setActiveSkill(empty.activeSkill);
    setActiveSectionId(empty.activeSectionId);
    setPersistedQuestionIds(empty.persistedQuestionIds);
    questionSnapshotRef.current = new Map();
    setLoadedBankId('');
    setNotFound(false);
  }, []);

  useEffect(() => {
    requestIdRef.current += 1;
    setLoading(true);
    resetEditorState();
  }, [questionBankId, resetEditorState]);

  const loadBank = useCallback(async () => {
    const requestId = requestIdRef.current;

    setLoading(true);
    setNotFound(false);

    try {
      const res = await getQuestionBankById(questionBankId);
      if (requestIdRef.current !== requestId) return;

      if (!res.ok || !res.bank) {
        setNotFound(true);
        setBank(null);
        setLoadedBankId('');
        return;
      }

      const loadedBank = res.bank;
      const loadedSections = ensureQuestionBankSkillSections(
        loadedBank.sections?.length > 0 ? loadedBank.sections : [],
      );

      setBank(loadedBank);
      setLoadedBankId(String(loadedBank.id));
      setSections(loadedSections);
      setSectionErrors({});
      setActiveSkill(TEST_SKILL_LISTENING);
      setActiveSectionId(getFirstListeningSectionId(loadedSections));
      setPersistedQuestionIds(collectPersistedQuestionIds(loadedSections));
      questionSnapshotRef.current = buildQuestionSnapshotMap(loadedSections);

      setPathsLoading(true);
      try {
        const [courseRes, outlineRes] = await Promise.all([
          fetchCourseForQB(loadedBank.courseId),
          fetchCourseContentOutlineForQB(loadedBank.courseId),
        ]);
        if (requestIdRef.current !== requestId) return;

        if (courseRes.ok) setCourse(courseRes.course);
        if (outlineRes.ok) setCoursePaths(outlineRes.chapters ?? []);
      } finally {
        if (requestIdRef.current === requestId) {
          setPathsLoading(false);
        }
      }
    } catch {
      if (requestIdRef.current === requestId) {
        setNotFound(true);
        setLoadedBankId('');
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [questionBankId]);

  useEffect(() => {
    loadBank();
  }, [loadBank]);

  const selectChapter = useCallback(
    (nextChapterId) => {
      if (!bank?.courseId || String(nextChapterId) === String(bank.chapterId)) return;

      const bankRes = findQuestionBankByChapter(bank.courseId, nextChapterId);
      if (bankRes.ok) {
        navigate(`/mentor/question-banks/${bankRes.bank.id}`);
        return;
      }

      navigate(
        `/mentor/question-banks/create?courseId=${bank.courseId}&chapterId=${nextChapterId}`,
      );
    },
    [bank, navigate],
  );

  const isReady = !loading && loadedBankId === String(questionBankId) && Boolean(bank);

  return {
    questionBankId,
    loading: !isReady && !notFound,
    notFound,
    bank,
    setBank,
    course,
    coursePaths,
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
    workspaceKey: questionBankId ?? '',
    reloadBank: loadBank,
    selectChapter,
  };
}
