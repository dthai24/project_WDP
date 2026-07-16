/**
 * Chọn bank chương cho Quiz — UI shell.
 */
import { Box, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import AppButton from '@/shared/ui/AppButton';
import { MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';

export default function MentorTestQuestionBankSelector() {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: '14px',
        border: '1px dashed rgba(15,23,42,0.12)',
        bgcolor: '#fff',
        textAlign: 'center',
      }}
    >
      <QuizOutlinedIcon sx={{ fontSize: 36, color: '#CBD5E1', mb: 1 }} />
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: TEXT, mb: 0.5 }}>
        Chương chưa có ngân hàng câu hỏi
      </Typography>
      <Typography sx={{ fontSize: 13, color: MUTED, mb: 2, lineHeight: 1.5 }}>
        Mỗi chương có một bank riêng. Tạo bank cho chương này trước khi thêm quiz.
      </Typography>
      <AppButton
        startIcon={<AddRoundedIcon />}
        sx={{
          height: 36,
          px: 2,
          fontSize: 13,
          fontWeight: 600,
          borderRadius: '999px',
          bgcolor: PRIMARY,
          color: '#fff',
          boxShadow: 'none',
          '&:hover': { bgcolor: '#0E7490', boxShadow: 'none' },
        }}
      >
        Tạo bank cho chương
      </AppButton>
    </Box>
  );
}
