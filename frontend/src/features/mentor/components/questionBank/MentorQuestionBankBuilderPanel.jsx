/**
 * Editor câu hỏi — UI shell.
 */
import { Box, InputBase, Typography, alpha } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AppButton from '@/shared/ui/AppButton';
import { BUILDER_PANEL_SX } from '@/features/mentor/components/course/mentorCourseContentStyles';
import { CREATE_CARD_SX, MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';

export default function MentorQuestionBankBuilderPanel() {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ ...BUILDER_PANEL_SX, p: { xs: 1.5, sm: 2 }, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Nghe</Typography>
          <AppButton
            startIcon={<SaveOutlinedIcon />}
            sx={{ height: 36, borderRadius: '999px', bgcolor: PRIMARY, color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: '#0E7490' } }}
          >
            Cập nhật section
          </AppButton>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.25,
              py: 0.55,
              borderRadius: '999px',
              border: `1px solid ${alpha(PRIMARY, 0.4)}`,
              bgcolor: alpha(PRIMARY, 0.1),
              color: PRIMARY,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 15 }} />
            Bài số 1
          </Box>
          <AppButton
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            sx={{ height: 32, borderRadius: '999px', fontSize: 12, fontWeight: 600 }}
          >
            Thêm bài
          </AppButton>
        </Box>

        <Box sx={{ ...CREATE_CARD_SX, p: 2 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: MUTED, mb: 0.75, textTransform: 'uppercase' }}>
            Section name
          </Typography>
          <InputBase
            placeholder="Bài số 1"
            fullWidth
            sx={{
              mb: 2,
              px: 1.25,
              py: 0.85,
              borderRadius: '10px',
              border: '1px solid rgba(15,23,42,0.1)',
              fontSize: 14,
            }}
          />

          <Typography sx={{ fontSize: 12, fontWeight: 700, color: MUTED, mb: 0.75, textTransform: 'uppercase' }}>
            Nguồn audio
          </Typography>
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: '12px',
              border: '1px dashed rgba(15,23,42,0.15)',
              bgcolor: 'rgba(15,23,42,0.02)',
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: 13, color: MUTED }}>Kéo thả file audio hoặc dán link</Typography>
          </Box>

          <Typography sx={{ fontSize: 12, fontWeight: 700, color: MUTED, mb: 0.75, textTransform: 'uppercase' }}>
            Câu hỏi
          </Typography>
          <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid rgba(15,23,42,0.08)', bgcolor: '#fff' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT, mb: 1 }}>Câu 1</Typography>
            <InputBase
              placeholder="Nhập nội dung câu hỏi"
              fullWidth
              multiline
              minRows={2}
              sx={{
                mb: 1.5,
                px: 1.25,
                py: 0.85,
                borderRadius: '10px',
                border: '1px solid rgba(15,23,42,0.1)',
                fontSize: 14,
                alignItems: 'flex-start',
              }}
            />
            {['A', 'B', 'C', 'D'].map((opt) => (
              <Box key={opt} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    bgcolor: opt === 'A' ? alpha(PRIMARY, 0.12) : 'rgba(15,23,42,0.04)',
                    color: opt === 'A' ? PRIMARY : MUTED,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {opt}
                </Box>
                <InputBase
                  placeholder={`Đáp án ${opt}`}
                  fullWidth
                  sx={{
                    px: 1.25,
                    py: 0.65,
                    borderRadius: '10px',
                    border: '1px solid rgba(15,23,42,0.08)',
                    fontSize: 13,
                  }}
                />
              </Box>
            ))}
          </Box>

          <AppButton
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            sx={{ mt: 1.5, height: 36, borderRadius: '999px', fontSize: 13, fontWeight: 600 }}
          >
            Thêm câu hỏi
          </AppButton>
        </Box>
      </Box>
    </Box>
  );
}
