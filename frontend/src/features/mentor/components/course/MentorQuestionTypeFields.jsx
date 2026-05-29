import { Box, Checkbox, IconButton, InputBase, Radio, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AppButton from '@/shared/ui/AppButton';
import { ContentFieldLabel } from './MentorContentSectionHeading';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import {
  QUESTION_TYPE_FILL_BLANK,
  QUESTION_TYPE_MATCHING,
  QUESTION_TYPE_MULTIPLE_CHOICE,
  QUESTION_TYPE_TEXT_ANSWER,
  createDefaultMatchingPairs,
  createTestTempId,
} from '@/features/mentor/utils/mentorTestContentUtils';

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

  if (question.QuestionType === QUESTION_TYPE_FILL_BLANK) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Box>
          <ContentFieldLabel sx={fieldLabelSx}>Câu có chỗ trống</ContentFieldLabel>
          <InputBase
            value={question.QuestionText ?? ''}
            onChange={(event) => handleFieldChange({ QuestionText: event.target.value })}
            disabled={disabled}
            placeholder="Ví dụ: I ____ to school every day."
            fullWidth
            multiline
            minRows={2}
            sx={multilineInputSx(Boolean(errors.QuestionText), accentColor)}
          />
          {errors.QuestionText && (
            <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.25 }}>{errors.QuestionText}</Typography>
          )}
          <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.5 }}>
            Dùng ____ để đánh dấu vị trí cần điền.
          </Typography>
        </Box>
        <Box>
          <ContentFieldLabel sx={fieldLabelSx}>Đáp án đúng</ContentFieldLabel>
          <InputBase
            value={question.CorrectAnswer ?? ''}
            onChange={(event) => handleFieldChange({ CorrectAnswer: event.target.value })}
            disabled={disabled}
            placeholder="Ví dụ: go"
            fullWidth
            sx={fieldInputSx(Boolean(errors.CorrectAnswer), accentColor)}
          />
          {errors.CorrectAnswer && (
            <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.25 }}>{errors.CorrectAnswer}</Typography>
          )}
        </Box>
      </Box>
    );
  }

  if (question.QuestionType === QUESTION_TYPE_MULTIPLE_CHOICE) {
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

  if (question.QuestionType === QUESTION_TYPE_TEXT_ANSWER) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Box>
          <ContentFieldLabel sx={fieldLabelSx}>Đề bài</ContentFieldLabel>
          <InputBase
            value={question.QuestionText ?? ''}
            onChange={(event) => handleFieldChange({ QuestionText: event.target.value })}
            disabled={disabled}
            placeholder="Nhập đề bài tự luận"
            fullWidth
            multiline
            minRows={3}
            sx={multilineInputSx(Boolean(errors.QuestionText), accentColor)}
          />
          {errors.QuestionText && (
            <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.25 }}>{errors.QuestionText}</Typography>
          )}
        </Box>
        <Box>
          <ContentFieldLabel sx={fieldLabelSx}>Gợi ý đáp án / tiêu chí chấm</ContentFieldLabel>
          <InputBase
            value={question.ExpectedAnswer ?? ''}
            onChange={(event) => handleFieldChange({ ExpectedAnswer: event.target.value })}
            disabled={disabled}
            placeholder="Tuỳ chọn — gợi ý nội dung hoặc tiêu chí chấm điểm"
            fullWidth
            multiline
            minRows={2}
            sx={multilineInputSx(false, accentColor)}
          />
        </Box>
      </Box>
    );
  }

  if (question.QuestionType === QUESTION_TYPE_MATCHING) {
    const pairs = question.Pairs ?? createDefaultMatchingPairs();

    const updatePairs = (nextPairs) => handleFieldChange({ Pairs: nextPairs });

    const handlePairChange = (pairTempId, field, value) => {
      updatePairs(
        pairs.map((pair) => (pair.tempId === pairTempId ? { ...pair, [field]: value } : pair)),
      );
    };

    const handleAddPair = () => {
      updatePairs([...pairs, { tempId: createTestTempId('pair'), LeftText: '', RightText: '' }]);
    };

    const handleRemovePair = (pairTempId) => {
      if (pairs.length <= 2) return;
      updatePairs(pairs.filter((pair) => pair.tempId !== pairTempId));
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Box>
          <ContentFieldLabel sx={fieldLabelSx}>Nội dung câu hỏi</ContentFieldLabel>
          <InputBase
            value={question.QuestionText ?? ''}
            onChange={(event) => handleFieldChange({ QuestionText: event.target.value })}
            disabled={disabled}
            placeholder="Ví dụ: Ghép từ với nghĩa phù hợp."
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
          <ContentFieldLabel sx={fieldLabelSx}>Cặp ghép</ContentFieldLabel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {pairs.map((pair) => {
              const pairErrors = errors.Pairs?.[pair.tempId] ?? {};
              return (
                <Box
                  key={pair.tempId}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr auto' },
                    gap: 0.75,
                    alignItems: 'center',
                  }}
                >
                  <InputBase
                    value={pair.LeftText ?? ''}
                    onChange={(event) => handlePairChange(pair.tempId, 'LeftText', event.target.value)}
                    disabled={disabled}
                    placeholder="Ví dụ: apple"
                    fullWidth
                    sx={fieldInputSx(Boolean(pairErrors.LeftText), accentColor)}
                  />
                  <InputBase
                    value={pair.RightText ?? ''}
                    onChange={(event) => handlePairChange(pair.tempId, 'RightText', event.target.value)}
                    disabled={disabled}
                    placeholder="Ví dụ: quả táo"
                    fullWidth
                    sx={fieldInputSx(Boolean(pairErrors.RightText), accentColor)}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemovePair(pair.tempId)}
                    disabled={disabled || pairs.length <= 2}
                    aria-label="Xóa cặp ghép"
                    sx={{
                      color: MUTED,
                      justifySelf: { xs: 'flex-end', sm: 'center' },
                      '&:hover': { color: '#DC2626', bgcolor: 'rgba(220,38,38,0.06)' },
                    }}
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
          {errors._pairs && (
            <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.25 }}>{errors._pairs}</Typography>
          )}
          <AppButton
            variant="text"
            size="small"
            startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={handleAddPair}
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
            Thêm cặp ghép
          </AppButton>
        </Box>
      </Box>
    );
  }

  return null;
}
