/**
 * Cấu hình bài kiểm tra cuối khóa — UI shell.
 */
import { Box, InputBase, Typography, alpha } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';

const inputSx = {
  fontSize: 13,
  color: TEXT,
  px: 1,
  py: 0.65,
  borderRadius: '10px',
  border: '1px solid rgba(15,23,42,0.12)',
  bgcolor: '#fff',
  width: '100%',
  maxWidth: 88,
};

export default function MentorFinalTestConfigEditor() {
  return (
    <Box sx={{ p: 1.5, borderRadius: '14px', border: `1px solid ${alpha(PRIMARY, 0.15)}`, bgcolor: alpha(PRIMARY, 0.04) }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
        <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: PRIMARY }} />
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Cấu hình random toàn khóa</Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.25 }}>
        {['Nghe', 'Đọc', 'Từ vựng'].map((label) => (
          <Box key={label}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: MUTED, mb: 0.5 }}>{label}</Typography>
            <InputBase defaultValue={0} type="number" sx={inputSx} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
