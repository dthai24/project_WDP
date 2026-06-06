import { Box, IconButton, InputBase, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { ContentFieldLabel } from './MentorContentSectionHeading';
import { MUTED } from './mentorCourseCreateStyles';
import MentorQuestionTypeFields from './MentorQuestionTypeFields';
import { normalizeTestQuestion } from '@/features/mentor/utils/mentorTestContentUtils';

const fieldLabelSx = { mb: 0.5, fontSize: 12, fontWeight: 700, color: '#64748B' };

function fieldInputSx(hasError, accentColor) {
  return {
    fontSize: 13,
    color: '#0F172A',
    px: 1,
    py: 0.65,
    borderRadius: '10px',
    border: `1px solid ${hasError ? '#DC2626' : 'rgba(15,23,42,0.12)'}`,
    bgcolor: '#fff',
    width: '100%',
    '&:focus-within': { borderColor: hasError ? '#DC2626' : accentColor },
  };
}

export default function MentorTestQuestionCard({
  question,
  index,
  errors = {},
  accentColor,
  disabled = false,
  showScoreField = true,
  onChange,
  onDelete,
}) {
  const normalizedQuestion = normalizeTestQuestion(question);

  const handleScoreChange = (event) => {
    onChange({ ...normalizedQuestion, Score: event.target.value });
  };

  const handleQuestionChange = (nextQuestion) => {
    onChange(normalizeTestQuestion(nextQuestion));
  };

  return (
    <Box
      sx={{
        p: { xs: 1.15, sm: 1.35 },
        borderRadius: '12px',
        border: '1px solid rgba(15,23,42,0.08)',
        bgcolor: '#fff',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1.25,
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: accentColor,
            px: 0.85,
            py: 0.3,
            borderRadius: '999px',
            bgcolor: `${accentColor}14`,
          }}
        >
          Câu {index + 1}
        </Typography>
        <IconButton
          size="small"
          onClick={onDelete}
          disabled={disabled}
          aria-label="Xóa câu hỏi"
          sx={{ color: MUTED, '&:hover': { color: '#DC2626', bgcolor: 'rgba(220,38,38,0.06)' } }}
        >
          <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {showScoreField ? (
        <Box sx={{ maxWidth: 120, mb: 1.25 }}>
          <ContentFieldLabel sx={fieldLabelSx}>Điểm</ContentFieldLabel>
          <InputBase
            value={normalizedQuestion.Score ?? ''}
            onChange={handleScoreChange}
            disabled={disabled}
            placeholder="1"
            fullWidth
            sx={fieldInputSx(Boolean(errors.Score), accentColor)}
          />
          {errors.Score && (
            <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.25 }}>{errors.Score}</Typography>
          )}
        </Box>
      ) : null}

      <MentorQuestionTypeFields
        question={normalizedQuestion}
        errors={errors}
        accentColor={accentColor}
        disabled={disabled}
        onChange={handleQuestionChange}
      />
    </Box>
  );
}
