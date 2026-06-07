import { Box, Chip, IconButton, InputBase, Switch, Tooltip, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import MentorQuestionTypeFields from './MentorQuestionTypeFields';
import {
  canShuffleTestQuestionOptions,
  isQuestionActive,
  normalizeTestQuestion,
  shuffleTestQuestionOptions,
} from '@/features/mentor/utils/mentorTestContentUtils';

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
  contentLocked = false,
  showActiveToggle = false,
  showScoreField = true,
  onChange,
  onDelete,
}) {
  const normalizedQuestion = normalizeTestQuestion(question);
  const allowMultiple = Boolean(normalizedQuestion.AllowMultipleAnswers);
  const canShuffleOptions = canShuffleTestQuestionOptions(normalizedQuestion);
  const isActive = isQuestionActive(normalizedQuestion);
  const fieldsDisabled = disabled || contentLocked;

  const handleChange = (nextQuestion) => onChange(normalizeTestQuestion(nextQuestion));

  const handleActiveToggle = (event) => {
    handleChange({ ...normalizedQuestion, isActive: event.target.checked });
  };

  const handleShuffleOptions = () => {
    handleChange(shuffleTestQuestionOptions(normalizedQuestion));
  };

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
      id={normalizedQuestion.tempId ? `qb-question-${normalizedQuestion.tempId}` : undefined}
      sx={{
        borderRadius: '10px',
        border: '1px solid rgba(15,23,42,0.08)',
        bgcolor: '#fff',
        overflow: 'hidden',
        opacity: showActiveToggle && !isActive ? 0.72 : 1,
        scrollMarginTop: 24,
      }}
    >
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

        {contentLocked ? (
          <Chip
            size="small"
            label="Câu hỏi đã lưu"
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 600,
              bgcolor: 'rgba(100,116,139,0.08)',
              color: MUTED,
            }}
          />
        ) : null}

        {showActiveToggle && !isActive ? (
          <Chip
            size="small"
            icon={<VisibilityOffOutlinedIcon sx={{ fontSize: '14px !important' }} />}
            label="Ẩn khỏi quiz mới"
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 600,
              bgcolor: 'rgba(234,88,12,0.08)',
              color: '#C2410C',
            }}
          />
        ) : null}

        <Box sx={{ flex: 1 }} />

        {showActiveToggle ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: MUTED, userSelect: 'none' }}>
              Dùng cho quiz
            </Typography>
            <Switch
              size="small"
              checked={isActive}
              onChange={handleActiveToggle}
              disabled={disabled}
              inputProps={{ 'aria-label': 'Bật câu hỏi cho quiz mới' }}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  bgcolor: accentColor,
                  opacity: 0.5,
                },
              }}
            />
          </Box>
        ) : null}

        {!contentLocked ? (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                opacity: fieldsDisabled ? 0.5 : 1,
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: MUTED, userSelect: 'none' }}>
                Nhiều đáp án
              </Typography>
              <Switch
                size="small"
                checked={allowMultiple}
                onChange={(e) => handleAnswerModeChange(e.target.checked)}
                disabled={fieldsDisabled}
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

            <Tooltip title="Xáo trộn đáp án" arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={handleShuffleOptions}
                  disabled={fieldsDisabled || !canShuffleOptions}
                  aria-label="Xáo trộn đáp án"
                  sx={{
                    p: 0.4,
                    color: 'rgba(15,23,42,0.22)',
                    '&:hover': { color: TEXT, bgcolor: 'rgba(15,23,42,0.06)' },
                  }}
                >
                  <ShuffleRoundedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </span>
            </Tooltip>

            <IconButton
              size="small"
              onClick={onDelete}
              disabled={fieldsDisabled}
              aria-label="Xóa câu hỏi"
              sx={{
                p: 0.4,
                color: 'rgba(15,23,42,0.22)',
                '&:hover': { color: '#DC2626', bgcolor: 'rgba(220,38,38,0.06)' },
              }}
            >
              <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </>
        ) : null}
      </Box>

      <Box sx={{ px: { xs: 1.25, sm: 1.35 }, pt: 1.15, pb: 1.35 }}>
        {showScoreField && !contentLocked ? (
          <Box sx={{ maxWidth: 88, mb: 1.25 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: MUTED, mb: 0.4 }}>
              Điểm
            </Typography>
            <InputBase
              value={normalizedQuestion.Score ?? ''}
              onChange={handleScoreChange}
              disabled={fieldsDisabled}
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
          disabled={fieldsDisabled}
          onChange={handleChange}
        />
      </Box>
    </Box>
  );
}
