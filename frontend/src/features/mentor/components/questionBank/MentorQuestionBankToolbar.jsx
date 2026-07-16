/**
 * Toolbar danh sách ngân hàng câu hỏi — UI shell.
 */
import { Box, Chip, Typography, alpha, useTheme } from '@mui/material';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import SortOutlinedIcon from '@mui/icons-material/SortOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const MUTED = '#64748B';
const ICON = '#94A3B8';

function FilterTrigger({ icon: Icon, label }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        minWidth: 118,
        height: 34,
        px: 1.25,
        pr: 0.75,
        borderRadius: '10px',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        bgcolor: '#fff',
        cursor: 'default',
      }}
    >
      <Icon sx={{ fontSize: 16, color: ICON }} />
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#0F172A', flex: 1, minWidth: 0 }} noWrap>
        {label}
      </Typography>
      <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, color: MUTED }} />
    </Box>
  );
}

export default function MentorQuestionBankToolbar() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: 1.25,
        mb: 2,
        p: 1.25,
        borderRadius: '16px',
        bgcolor: '#FFFFFF',
        border: '1px solid rgba(15,23,42,0.08)',
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        <FilterTrigger icon={FactCheckOutlinedIcon} label="Tất cả" />
        <FilterTrigger icon={QuizOutlinedIcon} label="Tất cả câu hỏi" />
        <FilterTrigger icon={SortOutlinedIcon} label="Mới cập nhật" />
      </Box>

      <Typography sx={{ fontSize: 12.5, color: MUTED, fontWeight: 500, alignSelf: { md: 'center' } }}>
        0 khóa học
      </Typography>
    </Box>
  );
}
