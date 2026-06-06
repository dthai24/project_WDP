import { Box, Checkbox, IconButton, InputBase, Radio, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AppButton from '@/shared/ui/AppButton';
import { ContentFieldLabel } from './MentorContentSectionHeading';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import { createTestTempId } from '@/features/mentor/utils/mentorTestContentUtils';

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

function multilineInputSx(hasError, accentColor) {
  return {
    ...fieldInputSx(hasError, accentColor),
    alignItems: 'flex-start',
    py: 0.75,
  };
}

function normalizeSingleCorrectOption(options) {
  const firstCorrectIndex = options.findIndex((option) => option.IsCorrect);
  const keepIndex = firstCorrectIndex >= 0 ? firstCorrectIndex : 0;
  return options.map((option, index) => ({
    ...option,
    IsCorrect: index === keepIndex,
  }));
}

function AnswerModeButton({ label, selected, disabled, accentColor, onSelect }) {
  return (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      onClick={onSelect}
      sx={{
        flex: 1,
        minHeight: 36,
        border: 'none',
        borderRadius: '10px',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 12,
        fontWeight: selected ? 700 : 600,
        fontFamily: 'inherit',
        color: selected ? accentColor : MUTED,
        bgcolor: selected ? `${accentColor}18` : 'transparent',
        transition: 'background-color 0.15s, color 0.15s',
        opacity: disabled ? 0.6 : 1,
        '&:hover': disabled
          ? {}
          : {
              bgcolor: selected ? `${accentColor}22` : 'rgba(15,23,42,0.04)',
              color: selected ? accentColor : TEXT,
            },
      }}
    >
      {label}
    </Box>
  );
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
    updateOptions(
      options.map((option) => ({
        ...option,
        IsCorrect: option.tempId === optionTempId,
      })),
    );
  };

  const handleMultipleCorrectToggle = (optionTempId) => {
    updateOptions(
      options.map((option) =>
        option.tempId === optionTempId
          ? { ...option, IsCorrect: !option.IsCorrect }
          : option,
      ),
    );
  };

  const handleAnswerModeChange = (nextAllowMultiple) => {
    if (nextAllowMultiple === allowMultiple) return;

    if (nextAllowMultiple) {
      handleFieldChange({ AllowMultipleAnswers: true });
      return;
    }

    handleFieldChange({
      AllowMultipleAnswers: false,
      Options: normalizeSingleCorrectOption(options),
    });
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Box>
        <ContentFieldLabel sx={fieldLabelSx}>Câu hỏi</ContentFieldLabel>
        <InputBase
          value={question.QuestionText ?? ''}
          onChange={(event) => handleFieldChange({ QuestionText: event.target.value })}
          disabled={disabled}
          placeholder="Nhập nội dung câu hỏi trắc nghiệm"
          fullWidth
          multiline
          minRows={2}
          sx={multilineInputSx(Boolean(errors.QuestionText), accentColor)}
        />
        {errors.QuestionText && (
          <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.25 }}>{errors.QuestionText}</Typography>
        )}
      </Box>

      <Box>
        <ContentFieldLabel sx={fieldLabelSx}>Kiểu chọn đáp án</ContentFieldLabel>
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            p: 0.5,
            mb: 1,
            borderRadius: '12px',
            bgcolor: '#F8FAFC',
            border: '1px solid rgba(15,23,42,0.08)',
          }}
        >
          <AnswerModeButton
            label="Một đáp án"
            selected={!allowMultiple}
            disabled={disabled}
            accentColor={accentColor}
            onSelect={() => handleAnswerModeChange(false)}
          />
          <AnswerModeButton
            label="Nhiều đáp án"
            selected={allowMultiple}
            disabled={disabled}
            accentColor={accentColor}
            onSelect={() => handleAnswerModeChange(true)}
          />
        </Box>

        <ContentFieldLabel sx={fieldLabelSx}>Đáp án</ContentFieldLabel>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {options.map((option, index) => {
            const optionErrors = errors.Options?.[option.tempId] ?? {};
            const CorrectControl = allowMultiple ? Checkbox : Radio;

            return (
              <Box
                key={option.tempId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: MUTED, minWidth: 18 }}>
                  {String.fromCharCode(65 + index)}
                </Typography>
                <CorrectControl
                  checked={Boolean(option.IsCorrect)}
                  onChange={() =>
                    allowMultiple
                      ? handleMultipleCorrectToggle(option.tempId)
                      : handleSingleCorrectChange(option.tempId)
                  }
                  disabled={disabled}
                  size="small"
                  sx={{
                    p: 0.25,
                    color: 'rgba(15,23,42,0.25)',
                    '&.Mui-checked': { color: accentColor },
                  }}
                  inputProps={{
                    'aria-label': allowMultiple
                      ? `Đáp án đúng ${String.fromCharCode(65 + index)}`
                      : `Chọn đáp án ${String.fromCharCode(65 + index)}`,
                  }}
                />
                <InputBase
                  value={option.OptionText ?? ''}
                  onChange={(event) => handleOptionTextChange(option.tempId, event.target.value)}
                  disabled={disabled}
                  placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                  fullWidth
                  sx={fieldInputSx(Boolean(optionErrors.OptionText), accentColor)}
                />
                {options.length > 2 ? (
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveOption(option.tempId)}
                    disabled={disabled}
                    aria-label="Xóa đáp án"
                    sx={{
                      color: MUTED,
                      flexShrink: 0,
                      '&:hover': { color: '#DC2626', bgcolor: 'rgba(220,38,38,0.06)' },
                    }}
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                ) : (
                  <Box sx={{ width: 28, flexShrink: 0 }} />
                )}
              </Box>
            );
          })}
        </Box>
        {errors._options && (
          <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.25 }}>{errors._options}</Typography>
        )}
        {errors._correctOption && (
          <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.25 }}>{errors._correctOption}</Typography>
        )}
        <AppButton
          variant="text"
          size="small"
          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={handleAddOption}
          disabled={disabled}
          sx={{
            mt: 0.75,
            px: 0.75,
            minHeight: 32,
            fontSize: 12,
            fontWeight: 600,
            color: accentColor,
            '&:hover': { bgcolor: `${accentColor}14` },
          }}
        >
          Thêm đáp án
        </AppButton>
      </Box>
    </Box>
  );
}
