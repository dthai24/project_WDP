/**
 * MentorCourseQuestionsPage — Placeholder
 * Route: /mentor/courses/:courseId/questions
 */
import { Box, Breadcrumbs, Link as MuiLink, Typography, alpha } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import { mentorQuestionBankMock } from '@/features/mentor/data/mentorQuestionBankMock';

export default function MentorCourseQuestionsPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const course = mentorQuestionBankMock.find((c) => String(c.courseId) === String(courseId));
  const courseName = course?.courseName ?? `Khóa học #${courseId}`;

  return (
    <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 2 },
          mb: 2.5,
        }}
      >
        <Breadcrumbs
          separator="/"
          sx={{ '& .MuiBreadcrumbs-separator': { color: '#64748B', mx: 0.5 } }}
        >
          <MuiLink
            component={Link}
            to="/home"
            underline="hover"
            sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}
          >
            Trang chủ
          </MuiLink>
          <MuiLink
            component={Link}
            to="/mentor/question-banks"
            underline="hover"
            sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}
          >
            Ngân hàng câu hỏi
          </MuiLink>
          <Typography sx={{ fontSize: 13, color: '#0F172A', fontWeight: 600 }}>
            {courseName}
          </Typography>
        </Breadcrumbs>

        <AppButton
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate('/mentor/question-banks')}
          sx={{
            height: 40,
            px: 2,
            fontSize: 13,
            fontWeight: 600,
            borderRadius: '999px',
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          Quay lại
        </AppButton>
      </Box>

      <Box
        sx={{
          py: 5,
          px: 3,
          textAlign: 'center',
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${alpha('#0F172A', 0.08)}`,
        }}
      >
        <QuizOutlinedIcon sx={{ fontSize: 48, color: '#0891B2', opacity: 0.35, mb: 1.5 }} />
        <Typography sx={{ fontSize: { xs: 18, sm: 20 }, fontWeight: 700, color: '#0F172A', mb: 1 }}>
          Ngân hàng câu hỏi — {courseName}
        </Typography>
        <Typography sx={{ fontSize: 15, color: '#64748B' }}>
          Màn quản lý câu hỏi theo chương sẽ được phát triển sau.
        </Typography>
      </Box>
    </Box>
  );
}
