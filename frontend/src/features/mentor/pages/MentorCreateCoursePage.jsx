/**
 * MentorCreateCoursePage  ─  Bước 1: Tạo thông tin cơ bản khóa học
 *
 * Props: không có (page component, route: /mentor/courses/create)
 *
 * State nội bộ:
 *   form  { courseName, description, categoryId, levelId, thumbnail, isFree }
 *
 * ── Fetch data ───────────────────────────────────────────────────────────
 *   useEffect: gọi fetchCourseCategories() + fetchCourseLevels() khi mount
 *
 *   GET /api/categories
 *   Response: { success: true, categories: [{ categoryId, displayName }] }
 *
 *   GET /api/levels
 *   Response: { success: true, levels: [{ levelId, displayName }] }
 *
 * ── API call (lưu bản nháp) ──────────────────────────────────────────────
 *   saveCreateCourseStep1(form, user.userId)
 *
 *   TODO: POST /api/mentor/courses/draft
 *   Request JSON:
 *   {
 *     courseName:  string,
 *     description: string,
 *     categoryId:  number,
 *     levelId:     number,
 *     thumbnail:   string | null,
 *     isFree:      boolean
 *   }
 *   Response JSON: { success: true, courseId: number }
 *
 *   Sau khi lưu → navigate('/mentor/courses/create/content')
 */
import { useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useNavigate } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import { toast } from '@/shared/ui/Toast';
import MentorCourseCreateForm from '@/features/mentor/components/course/MentorCourseCreateForm';
import MentorCourseCreateStepIndicator from '@/features/mentor/components/course/MentorCourseCreateStepIndicator';
import MentorCourseLeaveDialog from '@/features/mentor/components/course/MentorCourseLeaveDialog';
import { useMentorCourseLeaveGuard } from '@/features/mentor/hooks/useMentorCourseLeaveGuard';
import {
  fetchCourseCategories,
  fetchCourseLevels,
  saveCreateCourseStep1,
} from '@/features/mentor/services/mentorCourseService';
import { getUser } from '@/features/auth/utils/authUtils';
import {
  formFromStep1Payload,
  loadCreateCourseStep1FromStorage,
} from '@/features/mentor/utils/mentorCourseCreateStorage';
import {
  MENTOR_COURSE_FORM_INITIAL,
  isMentorCourseFormDirty,
  validateMentorCourseForm,
} from '@/features/mentor/utils/mentorCourseFormUtils';

export default function MentorCreateCoursePage() {
  const navigate = useNavigate();
  //   export const MENTOR_COURSE_FORM_INITIAL = {
  //   CourseName: '',
  //   Description: '',
  //   CategoryId: '',
  //   LevelId: '',
  //   Thumbnail: '',
  //   IsPublished: false,
  // };
  const [form, setForm] = useState(MENTOR_COURSE_FORM_INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const instructorId = getUser()?.userId ?? null;
  const isDirty = useMemo(() => isMentorCourseFormDirty(form), [form]);

  const {
    dialogOpen,
    saving,
    requestLeave,
    handleStay,
    handleDiscard,
    handleSaveDraft,
  } = useMentorCourseLeaveGuard({ isDirty, form, instructorId });

  useEffect(() => {
    const saved = loadCreateCourseStep1FromStorage();
    const restored = formFromStep1Payload(saved);
    if (restored) setForm(restored);
  }, []);
  //fetch Category & Level
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setOptionsLoading(true);
      const [categoryResult, levelResult] = await Promise.all([
        fetchCourseCategories(),
        fetchCourseLevels(),
      ]);

      if (cancelled) return;

      if (categoryResult.ok) {
        setCategoryOptions(categoryResult.categories);
      } else {
        toast.error(categoryResult.message || 'Không thể tải danh mục khóa học.');
      }

      if (levelResult.ok) {
        setLevelOptions(levelResult.levels);
      } else {
        toast.error(levelResult.message || 'Không thể tải trình độ khóa học.');
      }

      setOptionsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  //console.log(levelOptions);
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    let nextValue = value;

    if (type === 'checkbox') {
      nextValue = checked;
    } else if (name === 'IsPublished' || name === 'IsPaid') {
      nextValue = Boolean(checked ?? value);
    }

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
      ...(name === 'IsPaid' && !nextValue ? { Price: '', DiscountPercentage: 0 } : {}),
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleNext = async () => {
    // console.log(form);
    const validationErrors = validateMentorCourseForm(form);
    // console.log("cccc" + Object.keys(validationErrors).length)
    // console.table(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!instructorId) {
      toast.error('Không xác định được mentor. Vui lòng đăng nhập lại.');
      return;
    }

    setSubmitting(true);
    try {
      //* TO DO Fetch Api to save draft
      // Hiện tại đang lưu step 1 vào session 
      // (thực tế là lưu all bước vào session, tới lúc tạo và public thì mới xóa sesion và lưu vào database)
      const result = await saveCreateCourseStep1(form, instructorId);
      if (!result.ok) {
        return
      };
      // console.log(result);
      navigate('/mentor/courses/create/content');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleNext();
  };

  // Button (Hủy, Tiếp theo)
  const formFooter = (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        gap: 1.25,
        pt: 0.5,
      }}
    >
      {/* Button Hủy */}
      <AppButton
        variant="outlined"
        onClick={() => requestLeave('/mentor/courses')}
        disabled={submitting || saving}
        sx={{ minWidth: 100, height: 44, borderRadius: '999px', fontWeight: 700 }}
      >
        Hủy
      </AppButton>
      {/* Button Tiếp theo */}
      <AppButton
        type="submit"
        loading={submitting}
        endIcon={!submitting ? <ArrowForwardRoundedIcon /> : undefined}
        sx={{
          minWidth: 128,
          height: 44,
          borderRadius: '999px',
          fontWeight: 700,
          bgcolor: '#0891B2',
          '&:hover': { bgcolor: '#0E7490' },
        }}
      >
        Tiếp theo
      </AppButton>
    </Box>
  );

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-4">
        <h1 className="text-[22px] sm:text-[24px] font-bold leading-[1.3]" style={{ color: '#0F172A' }}>
          Tạo khóa học
        </h1>
        <p className="text-[14px] mt-1 leading-[1.55] max-w-[560px]" style={{ color: '#64748B' }}>
          Nhập thông tin cơ bản để bắt đầu tạo khóa học mới.
        </p>
      </div>

      <MentorCourseCreateStepIndicator currentStep={1} />

      <MentorCourseCreateForm
        //   STATE form = MENTOR_COURSE_FORM_INITIAL = {
        //   CourseName: '',
        //   Description: '',
        //   CategoryId: '',
        //   LevelId: '',
        //   Thumbnail: '',
        //   IsPublished: false,
        // };
        form={form}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        disabled={submitting}
        categoryOptions={categoryOptions}
        levelOptions={levelOptions}
        optionsLoading={optionsLoading}
        footer={formFooter}
      />
      {/* Modal appear when click Cancel (Create Course Process) */}
      <MentorCourseLeaveDialog
        open={dialogOpen}
        onStay={handleStay}
        onDiscard={handleDiscard}
        onSaveDraft={handleSaveDraft}
        saving={saving}
      />
    </div>
  );
}
