/**
 * Header workspace question bank — UI shell.
 */
import {
  Box,
  Breadcrumbs,
  Chip,
  Link as MuiLink,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Link } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import { MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';

const PILL_CHIP_SX = {
  borderRadius: '999px',
  height: 24,
  fontSize: 12,
  fontWeight: 700,
};

export default function MentorQuestionBankDetailHeader() {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 2 },
          mb: 1.25,
        }}
      >
        <Breadcrumbs
          separator="/"
          sx={{
            flex: 1,
            minWidth: 0,
            flexWrap: 'wrap',
            '& .MuiBreadcrumbs-separator': { color: MUTED, mx: 0.5 },
          }}
        >
          <MuiLink component={Link} to="/home" underline="hover" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
            Trang chủ
          </MuiLink>
          <MuiLink component={Link} to="/mentor/question-banks" underline="hover" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
            Ngân hàng câu hỏi
          </MuiLink>
          <MuiLink component={Link} to="/mentor/question-banks/1" underline="hover" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
            Tên khóa học
          </MuiLink>
          <Typography sx={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>Tên chương</Typography>
        </Breadcrumbs>

        <AppButton
          component={Link}
          to="/mentor/question-banks"
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ height: 40, borderRadius: '999px', fontWeight: 600, flexShrink: 0 }}
        >
          Quay lại
        </AppButton>
      </Box>

      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '22px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${alpha('#0F172A', 0.08)}`,
          boxShadow: theme.ios18?.shadow?.sm,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              bgcolor: alpha(PRIMARY, 0.1),
              color: PRIMARY,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <QuizOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: 20, sm: 24 }, fontWeight: 800, color: TEXT, lineHeight: 1.25, mb: 0.5 }}>
              Tên chương
            </Typography>
            <Typography sx={{ fontSize: 13, color: MUTED }}>Tên khóa học · 0 câu hỏi</Typography>
          </Box>
          <Chip size="small" label="Bản nháp" sx={{ ...PILL_CHIP_SX, bgcolor: 'rgba(100,116,139,0.10)', color: MUTED }} />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography sx={{ fontSize: 12.5, color: MUTED }}>
            Nghe: <Box component="span" sx={{ color: TEXT, fontWeight: 600 }}>0</Box>
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: MUTED }}>
            Đọc: <Box component="span" sx={{ color: TEXT, fontWeight: 600 }}>0</Box>
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: MUTED }}>
            Từ vựng: <Box component="span" sx={{ color: TEXT, fontWeight: 600 }}>0</Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
