/**
 * Bootstrap trang Create Question Bank — URL-driven, an toàn khi F5 / đổi chương.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@/shared/ui/Toast';
import {
  TEST_SKILL_LISTENING,
  createQuestionBankSkillSections,
  getSectionsBySkill,
} from '@/features/mentor/utils/mentorTestContentUtils';
import {
  fetchCourseContentOutlineForQB,
  fetchCourseForQB,
  findQuestionBankByChapter,
} from '@/features/mentor/services/questionBankService';
import { buildQuestionBankChapterPath } from '@/features/mentor/utils/mentorQuestionBankListParams';

const DRAFT_KEY_PREFIX = 'mentor_qb_create_draft';

function getDraftStorageKey(courseId, chapterId) {
  if (!courseId || !chapterId) return '';
  return `${DRAFT_KEY_PREFIX}_${courseId}_${chapterId}`;
}

function readDraftSections(courseId, chapterId) {
  const key = getDraftStorageKey(courseId, chapterId);
  if (!key) return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeQuestionBankCreateDraft(courseId, chapterId, sections) {
  const key = getDraftStorageKey(courseId, chapterId);
  if (!key) return;
  try {
    sessionStorage.setItem(key, JSON.stringify(sections));
  } catch {
    // quota exceeded — ignore
  }
}

export function clearQuestionBankCreateDraft(courseId, chapterId) {
  const key = getDraftStorageKey(courseId, chapterId);
  if (!key) return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function buildInitialSections(courseId, chapterId) {
  const draft = readDraftSections(courseId, chapterId);
  if (draft?.length) return draft;
  return createQuestionBankSkillSections();
}

function getFirstListeningSectionId(sections) {
  return (
    getSectionsBySkill(sections, TEST_SKILL_LISTENING)[0]?.tempId ??
    sections[0]?.tempId ??
    ''
  );
}

function getChapterKey(courseId, chapterId) {
  if (!courseId || !chapterId) return '';
  return `${courseId}-${chapterId}`;
}

export default function useQuestionBankCreateBootstrap() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const courseId = searchParams.get('courseId') ?? '';
  const chapterId = searchParams.get('chapterId') ?? '';

  const resolvedChapterKeyRef = useRef('');
  const sectionsRef = useRef(createQuestionBankSkillSections());
  const prevCourseIdRef = useRef('');

  const [course, setCourse] = useState(null);
  const [courseChapters, setCourseChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState(() => createQuestionBankSkillSections());
  const [activeSkill, setActiveSkill] = useState(TEST_SKILL_LISTENING);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [sectionErrors, setSectionErrors] = useState({});

  sectionsRef.current = sections;

  const applyChapterState = useCallback((targetCourseId, targetChapterId) => {
    const nextSections = buildInitialSections(targetCourseId, targetChapterId);
    setSections(nextSections);
    setSectionErrors({});
    setActiveSkill(TEST_SKILL_LISTENING);
    setActiveSectionId(getFirstListeningSectionId(nextSections));
    resolvedChapterKeyRef.current = getChapterKey(targetCourseId, targetChapterId);
    sectionsRef.current = nextSections;
  }, []);

  const resetEmptyEditor = useCallback(() => {
    const emptySections = createQuestionBankSkillSections();
    setSections(emptySections);
    setSectionErrors({});
    setActiveSkill(TEST_SKILL_LISTENING);
    setActiveSectionId(getFirstListeningSectionId(emptySections));
    resolvedChapterKeyRef.current = '';
    sectionsRef.current = emptySections;
  }, []);

  const resolveChapter = useCallback(
    (targetChapterId, { redirectIfExists = true } = {}) => {
      if (!courseId || !targetChapterId || courseChapters.length === 0) {
        return false;
      }

      const bankRes = findQuestionBankByChapter(courseId, targetChapterId);
      if (bankRes.ok && redirectIfExists) {
        navigate(
          buildQuestionBankChapterPath(bankRes.bank.id, {
            courseId,
            chapterId: targetChapterId,
          }),
          { replace: true },
        );
        return true;
      }

      const chapter = courseChapters.find(
        (item) => String(item.chapterId) === String(targetChapterId),
      );
      if (!chapter) return false;

      applyChapterState(courseId, targetChapterId);
      return true;
    },
    [applyChapterState, courseChapters, courseId, navigate],
  );

  useEffect(() => {
    if (!courseId) {
      navigate('/mentor/question-banks', { replace: true });
      return;
    }

    let mounted = true;
    setLoading(true);

    Promise.all([fetchCourseForQB(courseId), fetchCourseContentOutlineForQB(courseId)])
      .then(([courseRes, outlineRes]) => {
        if (!mounted) return;

        if (!courseRes.ok) {
          toast.error('Không tìm thấy khóa học.');
          navigate('/mentor/question-banks', { replace: true });
          return;
        }

        setCourse(courseRes.course);
        setCourseChapters(outlineRes.ok ? outlineRes.chapters ?? [] : []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [courseId, navigate]);

  useEffect(() => {
    if (prevCourseIdRef.current && prevCourseIdRef.current !== courseId) {
      resetEmptyEditor();
    }
    prevCourseIdRef.current = courseId;
    resolvedChapterKeyRef.current = '';
  }, [courseId, resetEmptyEditor]);

  useEffect(() => {
    if (loading || !courseId || courseChapters.length === 0) return;

    if (!chapterId) {
      resolvedChapterKeyRef.current = '';
      resetEmptyEditor();
      return;
    }

    const chapterKey = getChapterKey(courseId, chapterId);
    if (resolvedChapterKeyRef.current === chapterKey) return;

    resolveChapter(chapterId);
  }, [loading, courseId, chapterId, courseChapters, resolveChapter, resetEmptyEditor]);

  useEffect(() => {
    if (!courseId || !chapterId) return;

    const chapterKey = getChapterKey(courseId, chapterId);
    if (resolvedChapterKeyRef.current !== chapterKey) return;

    writeQuestionBankCreateDraft(courseId, chapterId, sections);
  }, [courseId, chapterId, sections]);

  const selectChapter = useCallback(
    (nextChapterId) => {
      if (String(nextChapterId) === String(chapterId)) return;

      if (courseId && chapterId) {
        writeQuestionBankCreateDraft(courseId, chapterId, sectionsRef.current);
      }

      const bankRes = findQuestionBankByChapter(courseId, nextChapterId);
      if (bankRes.ok) {
        navigate(
          buildQuestionBankChapterPath(bankRes.bank.id, {
            courseId,
            chapterId: nextChapterId,
          }),
        );
        return;
      }

      if (courseChapters.length > 0) {
        resolveChapter(nextChapterId, { redirectIfExists: false });
      }

      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('courseId', courseId);
          next.set('chapterId', String(nextChapterId));
          return next;
        },
        { replace: true },
      );
    },
    [chapterId, courseChapters, courseId, navigate, resolveChapter, setSearchParams],
  );

  const selectedChapter = courseChapters.find(
    (item) => String(item.chapterId) === String(chapterId),
  );

  const workspaceKey = getChapterKey(courseId, chapterId) || `course-${courseId}-none`;

  return {
    courseId,
    chapterId,
    course,
    courseChapters,
    loading,
    workspaceKey,
    sections,
    setSections,
    sectionErrors,
    setSectionErrors,
    activeSkill,
    setActiveSkill,
    activeSectionId,
    setActiveSectionId,
    selectedChapter,
    hasChapters: courseChapters.length > 0,
    canUseGenerator: Boolean(chapterId) && courseChapters.length > 0 && !loading,
    selectChapter,
  };
}
