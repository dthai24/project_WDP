import { Box, IconButton, InputBase, Switch, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import MentorQuestionTypeFields from './MentorQuestionTypeFields';
import { normalizeTestQuestion } from '@/features/mentor/utils/mentorTestContentUtils';

function normalizeSingleCorrect(options) {
  const keep = Math.max(0, options.findIndex((o) => o.IsCorrect));
  return options.map((o, i) => ({ ...o, IsCorrect: i === keep }));
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
  const allowMultiple = Boolean(normalizedQuestion.AllowMultipleAnswers);

  const handleChange = (nextQuestion) => onChange(normalizeTestQuestion(nextQuestion));

  const handleScoreChange = (event) =>
    handleChange({ ...normalizedQuestion, Score: event.target.value });

  const handleAnswerModeChange = (nextMultiple) => {
    if (nextMultiple === allowMultiple) return;
    if (nextMultiple) {
      handleChange({ ...normalizedQuestion, AllowMultipleAnswers: true });
      return;
    }
    handleChange({
      ...normalizedQuestion,
      AllowMultipleAnswers: false,
      Options: normalizeSingleCorrect(normalizedQuestion.Options ?? []),
    });
  };

  return (
    <Box
      sx={{
        borderRadius: '10px',
        border: '1px solid rgba(15,23,42,0.08)',
        bgcolor: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: { xs: 1.25, sm: 1.35 },
          py: 0.65,
          borderBottom: '1px solid rgba(15,23,42,0.06)',
        }}
      >
        <Typography
          component="span"
          sx={{ fontSize: 12, fontWeight: 700, color: TEXT, flexShrink: 0, lineHeight: 1.5 }}
        >
          Câu {index + 1}
        </Typography>

        <Box sx={{ flex: 1 }} />

        {/* Multiple answers toggle */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: MUTED, userSelect: 'none' }}>
            Nhiều đáp án
          </Typography>
          <Switch
            size="small"
            checked={allowMultiple}
            onChange={(e) => handleAnswerModeChange(e.target.checked)}
            disabled={disabled}
            inputProps={{ 'aria-label': 'Cho phép nhiều đáp án đúng' }}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                bgcolor: accentColor,
                opacity: 0.5,
              },
            }}
          />
        </Box>

        {/* Delete */}
        <IconButton
          size="small"
          onClick={onDelete}
          disabled={disabled}
          aria-label="Xóa câu hỏi"
          sx={{
            p: 0.4,
            color: 'rgba(15,23,42,0.22)',
            '&:hover': { color: '#DC2626', bgcolor: 'rgba(220,38,38,0.06)' },
          }}
        >
          <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ px: { xs: 1.25, sm: 1.35 }, pt: 1.15, pb: 1.35 }}>
        {showScoreField ? (
          <Box sx={{ maxWidth: 88, mb: 1.25 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: MUTED, mb: 0.4 }}>
              Điểm
            </Typography>
            <InputBase
              value={normalizedQuestion.Score ?? ''}
              onChange={handleScoreChange}
              disabled={disabled}
              placeholder="1"
              fullWidth
              sx={{
                fontSize: 13,
                color: TEXT,
                px: 0.85,
                py: 0.45,
                borderRadius: '8px',
                border: `1px solid ${errors.Score ? '#DC2626' : 'rgba(15,23,42,0.1)'}`,
                '&:focus-within': { borderColor: errors.Score ? '#DC2626' : accentColor },
              }}
            />
            {errors.Score ? (
              <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.25 }}>
                {errors.Score}
              </Typography>
            ) : null}
          </Box>
        ) : null}

        <MentorQuestionTypeFields
          question={normalizedQuestion}
          errors={errors}
          accentColor={accentColor}
          disabled={disabled}
          onChange={handleChange}
        />
      </Box>
    </Box>
  );
}
