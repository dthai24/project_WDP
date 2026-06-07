import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/shared/ui/Toast';
import MentorCourseReviewHeader from '@/features/mentor/components/course/MentorCourseReviewHeader';
import MentorCourseInfoReview from '@/features/mentor/components/course/MentorCourseInfoReview';
import MentorCourseContentReview from '@/features/mentor/components/course/MentorCourseContentReview';
import MentorCourseReviewActions from '@/features/mentor/components/course/MentorCourseReviewActions';
import MentorCourseReviewStatusPanel from '@/features/mentor/components/course/MentorCourseReviewStatusPanel';
import {
  createCourseWithContent,
  fetchCourseCategories,
  fetchCourseLevels,
} from '@/features/mentor/services/mentorCourseService';
import {
  clearCreateCourseDraft,
  loadCreateCourseDraft,
  saveCreateCourseDraft,
} from '@/features/mentor/utils/mentorCourseCreateStorage';
import {
  buildCreateCoursePayload,
  buildReviewChecklist,
  getReviewOverviewStats,
  validateCourseDraft,
} from '@/features/mentor/utils/mentorCourseReviewUtils';

export default function MentorCreateCourseReviewPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [ready, setReady] = useState(false);
  const [categoryLabel, setCategoryLabel] = useState('');
  const [levelLabel, setLevelLabel] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const saved = loadCreateCourseDraft();
    if (!saved?.course) {
      toast.error('Vui lòng hoàn thành thông tin cơ bản trước.');
      navigate('/mentor/courses/create', { replace: true });
      return;
    }

    setDraft(saved);
    setReady(true);
  }, [navigate]);

  useEffect(() => {
    if (!draft?.course) return undefined;

    let cancelled = false;

    (async () => {
      const [categoryResult, levelResult] = await Promise.all([
        fetchCourseCategories(),
        fetchCourseLevels(),
      ]);

      if (cancelled) return;

      const category = (categoryResult.categories ?? []).find(
        (item) => String(item.value) === String(draft.course.CategoryId),
      );
      const level = (levelResult.levels ?? []).find(
        (item) => String(item.value) === String(draft.course.LevelId),
      );

      setCategoryLabel(category?.label ?? '');
      setLevelLabel(level?.label ?? '');
    })();

    return () => {
      cancelled = true;
    };
  }, [draft]);

  const validation = useMemo(
    () => (draft ? validateCourseDraft(draft) : { isValid: false, errors: [], warnings: [] }),
    [draft],
  );

  const checklist = useMemo(
    () => (draft ? buildReviewChecklist(draft, validation) : []),
    [draft, validation],
  );

  const overview = useMemo(
    () => getReviewOverviewStats(draft?.paths ?? []),
    [draft],
  );

  const persistDraft = async (isPublished) => {
    const payload = buildCreateCoursePayload(draft, isPublished);
    const nextDraft = {
      ...draft,
      course: payload.course,
    };

    saveCreateCourseDraft(nextDraft);

    // TODO: replace with API call
    // await createCourseWithContent(payload)
    const result = await createCourseWithContent(payload.course, draft.paths ?? []);

    if (!result.success) {
      throw new Error('Không thể lưu khóa học.');

    }
    clearCreateCourseDraft();
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      await persistDraft(false);
      toast.success('Đã lưu bản nháp khóa học.');
      navigate('/mentor/courses');
    } catch {
      toast.error('Không thể lưu bản nháp. Vui lòng thử lại.');
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    const latestValidation = validateCourseDraft(draft);
    if (!latestValidation.isValid) {
      toast.error('Vui lòng hoàn thiện các mục còn thiếu trước khi xuất bản.');
      return;
    }

    setPublishing(true);
    try {
      // Đoạn này thì đừng có await persisDraft
      // lý do: tại persisDraft có call Api và xử lý một chuỗi insert vào database nên rất lâu
      // nếu await => phải chờ lâu => crash frontend
      persistDraft(true);
      toast.success('Đã xuất bản khóa học.');
      navigate('/mentor/courses');
    } catch {
      toast.error('Không thể xuất bản khóa học. Vui lòng thử lại.');
    } finally {
      setPublishing(false);
    }
  };

  if (!ready || !draft) return null;

  return (
    <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto' }}>
      <MentorCourseReviewHeader />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 7fr) minmax(280px, 3fr)' },
          gap: { xs: 2, lg: 2.5 },
          alignItems: 'start',
          mt: 0.5,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <MentorCourseInfoReview
            course={draft.course}
            categoryLabel={categoryLabel}
            levelLabel={levelLabel}
          />
          <MentorCourseContentReview paths={draft.paths ?? []} />
        </Box>

        <MentorCourseReviewStatusPanel
          checklist={checklist}
          validation={validation}
          overview={overview}
          onBack={() => navigate('/mentor/courses/create/content')}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          savingDraft={savingDraft}
          publishing={publishing}
        />
      </Box>

      <Box sx={{ display: { xs: 'block', lg: 'none' }, mt: 2.5 }}>
        <MentorCourseReviewActions
          onBack={() => navigate('/mentor/courses/create/content')}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          savingDraft={savingDraft}
          publishing={publishing}
          canPublish={validation.isValid}
        />
      </Box>
    </Box>
  );
}
