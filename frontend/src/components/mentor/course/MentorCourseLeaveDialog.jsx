import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  alpha,
} from '@mui/material';
import AppButton from '../../common/AppButton';

export default function MentorCourseLeaveDialog({
  open,
  onStay,
  onDiscard,
  onSaveDraft,
  saving = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={onStay}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: alpha('#0F172A', 0.35),
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Rời khỏi trang?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Thay đổi của bạn chưa được lưu. Bạn có thể hủy bỏ hoặc lưu bản nháp trước khi rời đi.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <AppButton variant="outlined" onClick={onDiscard} disabled={saving}>
          Hủy
        </AppButton>
        <AppButton
          loading={saving}
          onClick={onSaveDraft}
          sx={{
            bgcolor: '#0891B2',
            '&:hover': { bgcolor: '#0E7490' },
          }}
        >
          Lưu nháp
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}
