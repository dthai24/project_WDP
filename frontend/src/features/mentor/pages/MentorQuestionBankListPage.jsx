/**
 * Ngân hàng câu hỏi — danh sách (UI shell).
 */
import { Box, Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import { Link } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import EmptyState from '@/shared/ui/EmptyState';
import MentorQuestionBankToolbar from '@/features/mentor/components/questionBank/MentorQuestionBankToolbar';

export default function MentorQuestionBankListPage() {
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
        <Breadcrumbs separator="/" sx={{ '& .MuiBreadcrumbs-separator': { color: '#64748B', mx: 0.5 } }}>
          <MuiLink component={Link} to="/home" underline="hover" sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
            Trang chủ
          </MuiLink>
          <Typography sx={{ fontSize: 13, color: '#0F172A', fontWeight: 600 }}>Ngân hàng câu hỏi</Typography>
        </Breadcrumbs>

        <AppButton
          startIcon={<AddRoundedIcon />}
          sx={{
            height: 44,
            px: 2.5,
            fontSize: 14,
            fontWeight: 700,
            borderRadius: '999px',
            bgcolor: '#0891B2',
            color: '#fff',
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' },
            boxShadow: 'none',
            '&:hover': { bgcolor: '#0E7490', boxShadow: 'none' },
          }}
        >
          Tạo bộ câu hỏi
        </AppButton>
      </Box>

      <MentorQuestionBankToolbar />

      <Box sx={{ borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid rgba(15,23,42,0.08)' }}>
        <EmptyState
          embedded
          icon={QuizOutlinedIcon}
          title="Chưa có khóa học nào trong ngân hàng câu hỏi"
          description="Tạo khóa học trước, sau đó quay lại để quản lý câu hỏi."
        />
      </Box>
    </Box>
  );
}
