import { Box } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AppButton from '../../common/AppButton';
import { MUTED, PRIMARY } from './mentorCourseCreateStyles';

export default function MentorCourseReviewActions({
  onBack,
  onSaveDraft,
  onPublish,
  savingDraft = false,
  publishing = false,
  canPublish = false,
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <AppButton
        onClick={onPublish}
        loading={publishing}
        disabled={!canPublish || savingDraft}
        sx={{
          height: 44,
          borderRadius: '999px',
          fontWeight: 700,
          bgcolor: PRIMARY,
          '&:hover': { bgcolor: '#0E7490' },
        }}
      >
        Xuất bản khóa học
      </AppButton>
      <AppButton
        variant="outlined"
        onClick={onSaveDraft}
        loading={savingDraft}
        disabled={publishing}
        sx={{ height: 44, borderRadius: '999px', fontWeight: 700 }}
      >
        Lưu bản nháp
      </AppButton>
      <AppButton
        variant="text"
        startIcon={<ArrowBackRoundedIcon />}
        onClick={onBack}
        disabled={savingDraft || publishing}
        sx={{ height: 40, borderRadius: '999px', fontWeight: 700, color: MUTED }}
      >
        Quay lại
      </AppButton>
    </Box>
  );
}
