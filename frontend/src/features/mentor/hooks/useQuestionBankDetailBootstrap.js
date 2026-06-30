/**
 * Bootstrap trang Question Bank:
 * - Không có chapterId → danh sách Questions_Path
 * - Có chapterId → editor câu hỏi 1 chương
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  TEST_SKILL_LISTENING,
  buildQuestionSnapshotMap,
  collectPersistedQuestionIds,
  buildQuestionBaselineMap,
  ensureQuestionBankSkillSections,
  getSectionsBySkill,
} from '@/features/mentor/utils/mentorTestContentUtils';
import {
  fetchBankPathList,
  fetchCourseContentOutlineForQB,
  fetchCourseForQB,
  fetchQuestionBankById,
  findQuestionBankByChapter,
} from '@/features/mentor/services/questionBankService';
import {
  formatChapterDisplayLabel,
  getChapterOrder,
} from '@/features/mentor/utils/mentorCourseUtils';
import { buildQuestionBankChapterPath } from '@/features/mentor/utils/mentorQuestionBankListParams';

function getFirstListeningSectionId(sections) {
  return (
    getSectionsBySkill(sections, TEST_SKILL_LISTENING)[0]?.tempId ??
    sections[0]?.tempId ??
    ''
  );
}

export default function useQuestionBankDetailBootstrap() {
  const navigate = useNavigate();
  const { questionBankId } = useParams();
  const [searchParams] = useSearchParams();
  const chapterIdFromUrl = searchParams.get('chapterId') ?? '';
  const isPathListMode = !chapterIdFromUrl;
  const requestIdRef = useRef(0);
  const questionSnapshotRef = useRef(new Map());
  const [questionBaselineMap, setQuestionBaselineMap] = useState(() => new Map());

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [bank, setBank] = useState(null);
  const [bankPaths, setBankPaths] = useState([]);
  const [course, setCourse] = useState(null);
  const [courseChapters, setCourseChapters] = useState([]);
  const [pathsLoading, setPathsLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [sectionErrors, setSectionErrors] = useState({});
  const [activeSkill, setActiveSkill] = useState(TEST_SKILL_LISTENING);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [persistedQuestionIds, setPersistedQuestionIds] = useState(() => new Set());

  const loadData = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setNotFound(false);
    setBank(null);
    setBankPaths([]);
    setSections([]);
    setCourse(null);
    setCourseChapters([]);

    try {
      if (isPathListMode) {
        const res = await fetchBankPathList(questionBankId);
        if (requestIdRef.current !== requestId) return;
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const [courseRes, outlineRes] = await Promise.all([
          fetchCourseForQB(res.bank.courseId),
          fetchCourseContentOutlineForQB(res.bank.courseId),
        ]);
        if (requestIdRef.current !== requestId) return;

        const chapters = outlineRes.ok ? outlineRes.chapters ?? [] : [];
        const enrichedPaths = res.paths.map((path) => {
          const order = getChapterOrder(chapters, path.PathId);
          return {
            ...path,
            chapterOrder: order,
            displayLabel: formatChapterDisplayLabel({
              order,
              title: path.PathName,
              pathId: path.PathId,
            }),
          };
        });

        if (courseRes.ok) setCourse(courseRes.course);
        if (outlineRes.ok) setCourseChapters(chapters);
        setBank(res.bank);
        setBankPaths(enrichedPaths);

        if (enrichedPaths.length === 1) {
          navigate(
            buildQuestionBankChapterPath(questionBankId, {
              courseId: res.bank.courseId,
              chapterId: enrichedPaths[0].PathId,
            }),
            { replace: true },
          );
        }
        return;
      }

      const res = await fetchQuestionBankById(questionBankId, {
        chapterId: chapterIdFromUrl,
      });
      if (requestIdRef.current !== requestId) return;
      if (!res.ok || !res.bank) {
        setNotFound(true);
        return;
      }

      const loadedBank = res.bank;
      const loadedSections = ensureQuestionBankSkillSections(loadedBank.sections ?? []);

      setSections(loadedSections);
      setSectionErrors({});
      setActiveSkill(TEST_SKILL_LISTENING);
      setActiveSectionId(getFirstListeningSectionId(loadedSections));
      setPersistedQuestionIds(collectPersistedQuestionIds(loadedSections));
      const baselineMap = buildQuestionBaselineMap(loadedSections);
      questionSnapshotRef.current = buildQuestionSnapshotMap(loadedSections);
      setQuestionBaselineMap(baselineMap);

      setPathsLoading(true);
      const [courseRes, outlineRes] = await Promise.all([
        fetchCourseForQB(loadedBank.courseId),
        fetchCourseContentOutlineForQB(loadedBank.courseId),
      ]);
      if (requestIdRef.current !== requestId) return;

      const chapters = outlineRes.ok ? outlineRes.chapters ?? [] : [];
      if (courseRes.ok) setCourse(courseRes.course);
      if (outlineRes.ok) setCourseChapters(chapters);

      const matchedChapter = chapters.find(
        (ch) => String(ch.chapterId ?? ch.PathId) === String(loadedBank.chapterId),
      );
      const rawChapterTitle =
        String(loadedBank.chapterTitle ?? loadedBank.title ?? '').trim() ||
        matchedChapter?.chapterTitle ||
        matchedChapter?.PathName ||
        '';
      loadedBank.chapterTitle = rawChapterTitle;
      loadedBank.chapterDisplayLabel = formatChapterDisplayLabel({
        order: getChapterOrder(chapters, loadedBank.chapterId),
        title: rawChapterTitle,
        pathId: loadedBank.chapterId,
      });
      setBank(loadedBank);
    } catch {
      if (requestIdRef.current === requestId) setNotFound(true);
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
        setPathsLoading(false);
      }
    }
  }, [chapterIdFromUrl, isPathListMode, navigate, questionBankId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openPath = useCallback(
    (path) => {
      navigate(
        buildQuestionBankChapterPath(questionBankId, {
          courseId: bank?.courseId,
          chapterId: path.PathId,
        }),
      );
    },
    [bank?.courseId, navigate, questionBankId],
  );

  const backToPathList = useCallback(() => {
    navigate(`/mentor/question-banks/${questionBankId}?courseId=${bank?.courseId ?? ''}`);
  }, [bank?.courseId, navigate, questionBankId]);

  const selectChapter = useCallback(
    async (nextChapterId) => {
      if (!bank?.courseId || String(nextChapterId) === String(bank.chapterId)) return;

      const bankRes = await findQuestionBankByChapter(bank.courseId, nextChapterId);
      if (bankRes.ok) {
        navigate(
          buildQuestionBankChapterPath(bankRes.bank.BankId ?? bankRes.bank.id, {
            courseId: bank.courseId,
            chapterId: nextChapterId,
          }),
        );
        return;
      }

      navigate(
        `/mentor/question-banks/create?courseId=${bank.courseId}&chapterId=${nextChapterId}`,
      );
    },
    [bank, navigate],
  );

  return {
    questionBankId,
    isPathListMode,
    loading,
    notFound,
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
    workspaceKey: `${questionBankId}-${chapterIdFromUrl || 'paths'}`,
    reloadBank: loadData,
    openPath,
    backToPathList,
    selectChapter,
  };
}
