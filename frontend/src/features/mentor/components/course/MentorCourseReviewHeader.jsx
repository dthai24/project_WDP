import { Box, Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MentorCourseCreateStepIndicator from './MentorCourseCreateStepIndicator';
import { MUTED, TEXT } from './mentorCourseCreateStyles';

function BreadcrumbLink({ to, children, sx }) {
  const navigate = useNavigate();

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

export default function MentorCourseReviewHeader() {
  return (
    <>
      <Breadcrumbs
        separator="/"
        sx={{ mb: 2, '& .MuiBreadcrumbs-separator': { color: MUTED, mx: 0.5 } }}
      >
        <BreadcrumbLink to="/home" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
          Trang chủ
        </BreadcrumbLink>
        <BreadcrumbLink to="/mentor/courses" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
          Khóa học của tôi
        </BreadcrumbLink>
        <BreadcrumbLink
          to="/mentor/courses/create"
          sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}
        >
          Tạo khóa học
        </BreadcrumbLink>
        <Typography sx={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>
          Xem lại & tạo
        </Typography>
      </Breadcrumbs>

      <Typography
        component="h1"
        sx={{
          fontSize: { xs: 24, sm: 28 },
          fontWeight: 800,
          color: TEXT,
          letterSpacing: '-0.02em',
          mb: 0.75,
        }}
      >
        Xem lại & tạo khóa học
      </Typography>
      <Typography sx={{ fontSize: 15, color: MUTED, mb: 1.75, maxWidth: 720, lineHeight: 1.55 }}>
        Bước 3: Kiểm tra thông tin khóa học trước khi tạo (lưu dưới dạng bản nháp).
      </Typography>

      <MentorCourseCreateStepIndicator currentStep={3} />
    </>
  );
}
