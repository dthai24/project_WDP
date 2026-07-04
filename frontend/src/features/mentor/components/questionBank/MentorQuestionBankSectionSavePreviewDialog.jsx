import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import AppButton from '@/shared/ui/AppButton';
import { MUTED } from '@/features/mentor/components/course/mentorCourseCreateStyles';

function SummaryChip({ label, count, color = 'default' }) {
  if (!count) return null;
  return (
    <Chip
      size="small"
      label={`${label}: ${count}`}
      color={color}
      variant="outlined"
      sx={{ fontWeight: 600, fontSize: 11 }}
    />
  );
}

export default function MentorQuestionBankSectionSavePreviewDialog({
  open,
  payload,
  loading = false,
  onClose,
  onConfirm,
}) {
  const theme = useTheme();
  const jsonText = JSON.stringify(payload ?? {}, null, 2);
  const summary = payload?.summary ?? {};

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Payload lưu section (API / DB)</DialogTitle>
      <DialogContent sx={{ pt: 0.5 }}>
        <Typography sx={{ fontSize: 13, color: MUTED, mb: 1, lineHeight: 1.5 }}>
          Mỗi block map trực tiếp 1 thao tác SQL đơn giản. Backend xử lý theo thứ tự:
          {' '}
          <strong>
            sectionsDelete → questionsDelete → sectionSourceUpdate → sectionUpdate → questionsUpdate → sectionInsert / questionsInsert
          </strong>
          . URL đề bài lưu qua <strong>sectionSourceUpdate.sourceUrl</strong> → cột <strong>SourceUrl</strong>.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
          <SummaryChip label="DELETE sections" count={summary.sectionsDelete} color="error" />
          <SummaryChip label="UPDATE source URL" count={summary.sectionSourceUpdate} color="info" />
          <SummaryChip label="INSERT section" count={summary.sectionInsert} color="success" />
          <SummaryChip label="UPDATE section" count={summary.sectionUpdate} color="info" />
          <SummaryChip label="INSERT questions" count={summary.questionsInsert} color="success" />
          <SummaryChip label="UPDATE questions" count={summary.questionsUpdate} color="warning" />
          <SummaryChip label="DELETE questions" count={summary.questionsDelete} color="error" />
          {summary.choicesReplace > 0 ? (
            <SummaryChip label="REPLACE choices" count={summary.choicesReplace} color="warning" />
          ) : null}
        </Box>
        <Typography
          component="pre"
          sx={{
            m: 0,
            p: 1.5,
            borderRadius: '12px',
            bgcolor: 'rgba(15,23,42,0.04)',
            border: '1px solid rgba(15,23,42,0.08)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: 12,
            lineHeight: 1.55,
            color: '#0F172A',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: 'min(60vh, 520px)',
            overflow: 'auto',
          }}
        >
          {jsonText}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <AppButton variant="text" onClick={onClose} disabled={loading}>
          Hủy
        </AppButton>
        <AppButton
          loading={loading}
          onClick={onConfirm}
          sx={{
            background: theme.palette.primary.main,
            '&:hover': { background: theme.palette.primary.dark },
          }}
        >
          Xác nhận lưu
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}
