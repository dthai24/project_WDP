import { Box, IconButton, InputBase, MenuItem, Select, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { ContentFieldLabel } from './MentorContentSectionHeading';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import MentorQuestionTypeFields from './MentorQuestionTypeFields';
import {
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
  rebuildQuestionForType,
} from '../../../utils/mentorTestContentUtils';

const fieldLabelSx = { mb: 0.5, fontSize: 12, fontWeight: 700, color: '#64748B' };

function fieldInputSx(hasError, accentColor) {
  return {
    fontSize: 13,
    color: TEXT,
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
  const handleTypeChange = (event) => {
    const nextType = event.target.value;
    if (nextType === question.QuestionType) return;
    onChange(rebuildQuestionForType(question, nextType));
  };

  const handleScoreChange = (event) => {
    onChange({ ...question, Score: event.target.value });
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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: showScoreField
            ? { xs: '1fr', sm: '1fr 120px' }
            : '1fr',
          gap: 1.25,
          mb: 1.25,
        }}
      >
        <Box>
          <ContentFieldLabel sx={fieldLabelSx}>Kiểu câu hỏi</ContentFieldLabel>
          <Select
            value={question.QuestionType ?? ''}
            onChange={handleTypeChange}
            disabled={disabled}
            displayEmpty
            fullWidth
            size="small"
            sx={{
              fontSize: 13,
              borderRadius: '10px',
              bgcolor: '#fff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: errors.QuestionType ? '#DC2626' : 'rgba(15,23,42,0.12)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: errors.QuestionType ? '#DC2626' : accentColor,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: errors.QuestionType ? '#DC2626' : accentColor,
              },
            }}
          >
            {QUESTION_TYPES.map((type) => (
              <MenuItem key={type} value={type} sx={{ fontSize: 13 }}>
                {QUESTION_TYPE_LABELS[type]}
              </MenuItem>
            ))}
          </Select>
          {errors.QuestionType && (
            <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.25 }}>{errors.QuestionType}</Typography>
          )}
        </Box>

        {showScoreField ? (
          <Box>
            <ContentFieldLabel sx={fieldLabelSx}>Điểm</ContentFieldLabel>
            <InputBase
              value={question.Score ?? ''}
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
      </Box>

      <MentorQuestionTypeFields
        question={question}
        errors={errors}
        accentColor={accentColor}
        disabled={disabled}
        onChange={onChange}
      />
    </Box>
  );
}
