import { useEffect, useMemo, useState } from 'react';
import { Box, Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useNavigate } from 'react-router-dom';
import AppButton from '../../components/common/AppButton';
import { toast } from '../../components/common/Toast';
import MentorCourseCreateForm from '../../components/mentor/course/MentorCourseCreateForm';
import MentorCourseCreateStepIndicator from '../../components/mentor/course/MentorCourseCreateStepIndicator';
import MentorCourseLeaveDialog from '../../components/mentor/course/MentorCourseLeaveDialog';
import { useMentorCourseLeaveGuard } from '../../hooks/useMentorCourseLeaveGuard';
// import {
//   //fetchCourseCategories,
//   //fetchCourseLevels,
//   saveCreateCourseStep1,
// } from '../../services/mentorCourseService';
import { getUser } from '../../utils/authUtils';
import {
  formFromStep1Payload,
  loadCreateCourseStep1FromStorage,
} from '../../utils/mentorCourseCreateStorage';
import {
  MENTOR_COURSE_FORM_INITIAL,
  isMentorCourseFormDirty,
  validateMentorCourseForm,
} from '../../utils/mentorCourseFormUtils';

function LeaveAwareBreadcrumbLink({ to, children, onNavigate, sx }) {
  return (
    <MuiLink
      component="button"
      type="button"
      underline="hover"
      onClick={() => onNavigate(to)}
      sx={{
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        font: 'inherit',
        p: 0,
        ...sx,
      }}
    >
      {children}
    </MuiLink>
  );
}

export default function MentorCreateCoursePage() {
  const navigate = useNavigate();
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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === 'IsPublished' ? Boolean(value) : value,
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
    const validationErrors = validateMentorCourseForm(form);
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
      const result = await saveCreateCourseStep1(form, instructorId);
      if (!result.ok) return;

      navigate('/mentor/courses/create/content');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleNext();
  };

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
      <AppButton
        variant="outlined"
        onClick={() => requestLeave('/mentor/courses')}
        disabled={submitting || saving}
        sx={{ minWidth: 100, height: 44, borderRadius: '999px', fontWeight: 700 }}
      >
        Hủy
      </AppButton>
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
    <Box sx={{ width: '100%', maxWidth: 1080, mx: 'auto' }}>
      <Breadcrumbs
        separator="/"
        sx={{ mb: 2, '& .MuiBreadcrumbs-separator': { color: '#64748B', mx: 0.5 } }}
      >
        <LeaveAwareBreadcrumbLink
          to="/home"
          onNavigate={requestLeave}
          sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}
        >
          Trang chủ
        </LeaveAwareBreadcrumbLink>
        <LeaveAwareBreadcrumbLink
          to="/mentor/courses"
          onNavigate={requestLeave}
          sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}
        >
          Khóa học của tôi
        </LeaveAwareBreadcrumbLink>
        <Typography sx={{ fontSize: 13, color: '#0F172A', fontWeight: 600 }}>
          Tạo khóa học
        </Typography>
      </Breadcrumbs>

      <Typography
        component="h1"
        sx={{
          fontSize: { xs: 24, sm: 28 },
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '-0.02em',
          mb: 2,
          maxWidth: 720,
        }}
      >
        Bước 1: Thiết lập thông tin cơ bản cho khóa học.
      </Typography>

      <MentorCourseCreateStepIndicator currentStep={1} />

      <MentorCourseCreateForm
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

      <MentorCourseLeaveDialog
        open={dialogOpen}
        onStay={handleStay}
        onDiscard={handleDiscard}
        onSaveDraft={handleSaveDraft}
        saving={saving}
      />
    </Box>
  );
}
