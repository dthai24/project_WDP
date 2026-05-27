import { useEffect, useState } from 'react';
import { Box, Breadcrumbs, Link as MuiLink, Typography, alpha } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate } from 'react-router-dom';
import AppButton from '../../components/common/AppButton';
import { toast } from '../../components/common/Toast';
import MentorCourseCreateStepIndicator from '../../components/mentor/course/MentorCourseCreateStepIndicator';
import MentorContentPreview from '../../components/mentor/course/MentorContentPreview';
import { loadCreateCourseDraft } from '../../utils/mentorCourseCreateStorage';

function BreadcrumbLink({ to, children, navigate, sx }) {
  return (
    <MuiLink
      component="button"
      type="button"
      underline="hover"
      onClick={() => navigate(to)}
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

export default function MentorCreateCourseReviewPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadCreateCourseDraft();
    if (!saved?.course) {
      toast.error('Vui lòng hoàn thành thông tin cơ bản trước.');
      navigate('/mentor/courses/create', { replace: true });
      return;
    }

    if (!(saved.paths ?? []).length) {
      toast.error('Vui lòng xây dựng nội dung khóa học trước.');
      navigate('/mentor/courses/create/content', { replace: true });
      return;
    }

    setDraft(saved);
    setReady(true);
  }, [navigate]);

  if (!ready || !draft) return null;

  return (
    <Box sx={{ width: '100%', maxWidth: 1080, mx: 'auto' }}>
      <Breadcrumbs
        separator="/"
        sx={{ mb: 2, '& .MuiBreadcrumbs-separator': { color: '#64748B', mx: 0.5 } }}
      >
        <BreadcrumbLink to="/home" navigate={navigate} sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
          Trang chủ
        </BreadcrumbLink>
        <BreadcrumbLink
          to="/mentor/courses"
          navigate={navigate}
          sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}
        >
          Khóa học của tôi
        </BreadcrumbLink>
        <Typography sx={{ fontSize: 13, color: '#0F172A', fontWeight: 600 }}>
          Xem lại & xuất bản
        </Typography>
      </Breadcrumbs>

      <Typography
        component="h1"
        sx={{
          fontSize: { xs: 24, sm: 28 },
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '-0.02em',
          mb: 0.75,
        }}
      >
        Xem lại & xuất bản
      </Typography>
      <Typography sx={{ fontSize: 15, color: '#64748B', mb: 2, maxWidth: 640 }}>
        Bước 3: Kiểm tra lại thông tin trước khi xuất bản khóa học.
      </Typography>

      <MentorCourseCreateStepIndicator currentStep={3} />

      <Box
        sx={{
          py: 3,
          px: 3,
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${alpha('#0F172A', 0.08)}`,
          boxShadow: '0 1px 2px rgba(8,145,178,0.04)',
          mb: 2.5,
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0F172A', mb: 1 }}>
          {draft.course.CourseName || 'Khóa học chưa đặt tên'}
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, mb: 2 }}>
          {/* TODO: Step 3 — review course info and publish */}
          Trang xem lại và xuất bản sẽ được triển khai ở bước tiếp theo.
        </Typography>

        <Box sx={{ maxWidth: 360 }}>
          <MentorContentPreview paths={draft.paths ?? []} courseName={draft.course.CourseName ?? ''} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
        <AppButton
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate('/mentor/courses/create/content')}
          sx={{ minWidth: 110, height: 44, borderRadius: '999px', fontWeight: 700 }}
        >
          Quay lại
        </AppButton>
      </Box>
    </Box>
  );
}
