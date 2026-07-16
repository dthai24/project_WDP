/**
 * Ngân hàng câu hỏi theo chương — UI shell.
 */
import { Box, Breadcrumbs, Link as MuiLink, Typography, alpha } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import { Link } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import EmptyState from '@/shared/ui/EmptyState';

const TEXT = '#0F172A';
const MUTED = '#64748B';
const PRIMARY = '#0891B2';

export default function MentorCourseQuestionsPage() {
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
        <Breadcrumbs separator="/" sx={{ '& .MuiBreadcrumbs-separator': { color: MUTED, mx: 0.5 } }}>
          <MuiLink component={Link} to="/mentor/courses" underline="hover" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
            Khóa học
          </MuiLink>
          <MuiLink component={Link} to="/mentor/courses/1" underline="hover" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
            Tên khóa học
          </MuiLink>
          <Typography sx={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>Ngân hàng câu hỏi</Typography>
        </Breadcrumbs>

        <AppButton
          component={Link}
          to="/mentor/courses/1"
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ height: 40, borderRadius: '999px', width: { xs: '100%', sm: 'auto' } }}
        >
          Quay lại khóa học
        </AppButton>
      </Box>

      <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 800, color: TEXT, mb: 0.75 }}>
        Ngân hàng câu hỏi theo chương
      </Typography>
      <Typography sx={{ fontSize: 14, color: MUTED, mb: 2.5 }}>
        Khóa học: <Box component="span" sx={{ fontWeight: 700, color: TEXT }}>Tên khóa học</Box>
      </Typography>

      <Box sx={{ borderRadius: '20px', bgcolor: '#FFFFFF', border: `1px solid ${alpha('#0F172A', 0.08)}` }}>
        <EmptyState
          embedded
          icon={QuizOutlinedIcon}
          title="Chưa có ngân hàng câu hỏi"
          description="Tạo bộ câu hỏi cho từng chương để bắt đầu quản lý."
        />
      </Box>
    </Box>
  );
}
