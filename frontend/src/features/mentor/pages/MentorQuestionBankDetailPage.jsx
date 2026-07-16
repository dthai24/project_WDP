/**
 * Ngân hàng câu hỏi theo khóa học — UI shell.
 */
import { Box, Typography, alpha } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import { Link } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import EmptyState from '@/shared/ui/EmptyState';
import { PRIMARY, MUTED, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';

export default function MentorQuestionBankDetailPage() {
  return (
    <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto', py: 2 }}>
      <Box sx={{ mb: 2 }}>
        <AppButton
          component={Link}
          to="/mentor/question-banks"
          variant="text"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{
            height: 36,
            px: 0.5,
            color: MUTED,
            fontWeight: 600,
            fontSize: 13,
            '&:hover': { bgcolor: 'transparent', color: PRIMARY },
          }}
        >
          Quay lại danh sách
        </AppButton>
      </Box>

      <Box
        sx={{
          mb: 2.5,
          p: { xs: 2, sm: 2.5 },
          borderRadius: '22px',
          background: `linear-gradient(135deg, ${alpha(PRIMARY, 0.09)} 0%, #fff 70%)`,
          border: `1px solid ${alpha(PRIMARY, 0.14)}`,
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY, mb: 0.75 }}>
          NGÂN HÀNG CÂU HỎI
        </Typography>
        <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 800, color: TEXT, mb: 0.5 }}>
          Tên khóa học
        </Typography>
        <Typography sx={{ fontSize: 13, color: MUTED, mt: 1 }}>
          Chọn chương để quản lý câu hỏi
        </Typography>
      </Box>

      <EmptyState
        icon={MenuBookOutlinedIcon}
        title="Chưa có chương nào trong ngân hàng"
        description="Tạo ngân hàng câu hỏi cho một chương để bắt đầu."
      />
    </Box>
  );
}
