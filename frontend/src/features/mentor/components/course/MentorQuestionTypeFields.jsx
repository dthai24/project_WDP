import { Box, Checkbox, IconButton, InputBase, Radio, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import { createTestTempId } from '@/features/mentor/utils/mentorTestContentUtils';

function normalizeSingleCorrectOption(options) {
  const firstCorrectIndex = options.findIndex((option) => option.IsCorrect);
  const keepIndex = firstCorrectIndex >= 0 ? firstCorrectIndex : 0;
  return options.map((option, index) => ({ ...option, IsCorrect: index === keepIndex }));
}

export default function MentorQuestionTypeFields({
  question,
  errors = {},
  accentColor,
  disabled = false,
  onChange,
}) {
  const handleFieldChange = (patch) => onChange({ ...question, ...patch });

  const options = question.Options ?? [];
  const allowMultiple = Boolean(question.AllowMultipleAnswers);

  const updateOptions = (nextOptions) => handleFieldChange({ Options: nextOptions });

  const handleOptionTextChange = (optionTempId, value) => {
    updateOptions(
      options.map((option) =>
        option.tempId === optionTempId ? { ...option, OptionText: value } : option,
      ),
    );
  };

  const handleSingleCorrectChange = (optionTempId) => {
    updateOptions(options.map((option) => ({ ...option, IsCorrect: option.tempId === optionTempId })));
  };

  const handleMultipleCorrectToggle = (optionTempId) => {
    updateOptions(
      options.map((option) =>
        option.tempId === optionTempId ? { ...option, IsCorrect: !option.IsCorrect } : option,
      ),
    );
  };

  const handleAddOption = () => {
    updateOptions([
      ...options,
      { tempId: createTestTempId('option'), OptionText: '', IsCorrect: false },
    ]);
  };

  const handleRemoveOption = (optionTempId) => {
    if (options.length <= 2) return;
    const next = options.filter((option) => option.tempId !== optionTempId);
    updateOptions(allowMultiple ? next : normalizeSingleCorrectOption(next));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.35 }}>
      {/* Question text */}
      <Box>
        <InputBase
          value={question.QuestionText ?? ''}
          onChange={(event) => handleFieldChange({ QuestionText: event.target.value })}
          disabled={disabled}
          placeholder="Nhập nội dung câu hỏi..."
          fullWidth
          multiline
          minRows={2}
          sx={{
            fontSize: 13.5,
            color: TEXT,
            lineHeight: 1.6,
            alignItems: 'flex-start',
            px: 0.25,
            py: 0.25,
            width: '100%',
            borderBottom: `1.5px solid ${errors.QuestionText ? '#DC2626' : 'rgba(15,23,42,0.1)'}`,
            borderRadius: 0,
            '&:focus-within': {
              borderBottomColor: errors.QuestionText ? '#DC2626' : accentColor,
            },
          }}
        />
        {errors.QuestionText ? (
          <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.3 }}>
            {errors.QuestionText}
          </Typography>
        ) : null}
      </Box>

      {/* Answer options */}
      <Box>
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 700,
            color: MUTED,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mb: 0.65,
          }}
        >
          Đáp án
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.15 }}>
          {options.map((option, index) => {
            const optionErrors = errors.Options?.[option.tempId] ?? {};
            const isCorrect = Boolean(option.IsCorrect);
            const CorrectControl = allowMultiple ? Checkbox : Radio;
            const letter = String.fromCharCode(65 + index);

            return (
              <Box
                key={option.tempId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.4,
                  px: 0.35,
                  py: 0.15,
                  borderRadius: '8px',
                  bgcolor: isCorrect ? 'rgba(22,163,74,0.05)' : 'transparent',
                  transition: 'background-color 0.12s',
                }}
              >
                <CorrectControl
                  checked={isCorrect}
                  onChange={() =>
                    allowMultiple
                      ? handleMultipleCorrectToggle(option.tempId)
                      : handleSingleCorrectChange(option.tempId)
                  }
                  disabled={disabled}
                  size="small"
                  sx={{
                    p: 0.35,
                    flexShrink: 0,
                    color: 'rgba(15,23,42,0.2)',
                    '&.Mui-checked': { color: accentColor },
                  }}
                  inputProps={{ 'aria-label': `Đáp án ${letter}` }}
                />
                <InputBase
                  value={option.OptionText ?? ''}
                  onChange={(event) => handleOptionTextChange(option.tempId, event.target.value)}
                  disabled={disabled}
                  placeholder={`Đáp án ${letter}`}
                  fullWidth
                  sx={{
                    fontSize: 13,
                    color: TEXT,
                    flex: 1,
                    px: 0.25,
                    py: 0.3,
                    borderBottom: `1px solid ${
                      optionErrors.OptionText
                        ? '#DC2626'
                        : isCorrect
                          ? 'rgba(22,163,74,0.35)'
                          : 'rgba(15,23,42,0.08)'
                    }`,
                    borderRadius: 0,
                    '&:focus-within': {
                      borderBottomColor: optionErrors.OptionText ? '#DC2626' : accentColor,
                    },
                  }}
                />
                {options.length > 2 ? (
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveOption(option.tempId)}
                    disabled={disabled}
                    aria-label="Xóa đáp án"
                    sx={{
                      p: 0.3,
                      flexShrink: 0,
                      color: 'rgba(15,23,42,0.2)',
                      '&:hover': { color: '#DC2626', bgcolor: 'rgba(220,38,38,0.06)' },
                    }}
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                ) : (
                  <Box sx={{ width: 24, flexShrink: 0 }} />
                )}
              </Box>
            );
          })}
        </Box>

        {errors._options ? (
          <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.4 }}>{errors._options}</Typography>
        ) : null}
        {errors._correctOption ? (
          <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.4 }}>
            {errors._correctOption}
          </Typography>
        ) : null}

        <Box
          component="button"
          type="button"
          onClick={handleAddOption}
          disabled={disabled}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.35,
            mt: 0.85,
            px: 0.65,
            py: 0.4,
            border: 'none',
            background: 'none',
            borderRadius: '8px',
            cursor: disabled ? 'default' : 'pointer',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'inherit',
            color: '#64748B',
            opacity: disabled ? 0.5 : 1,
            '&:hover': disabled ? undefined : { bgcolor: 'rgba(15,23,42,0.06)' },
          }}
        >
          <AddRoundedIcon sx={{ fontSize: 14 }} />
          Thêm đáp án
        </Box>
      </Box>
    </Box>
  );
}
