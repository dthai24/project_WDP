import { useState } from 'react';
import { Box, Collapse, IconButton, InputBase, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import HeadphonesRoundedIcon from '@mui/icons-material/HeadphonesRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import { ContentFieldLabel } from './MentorContentSectionHeading';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import { contentAddButtonSx, TEST_ADD_QUESTION_THEME } from './mentorCourseContentStyles';
import MentorTestQuestionCard from './MentorTestQuestionCard';
import MentorTestListeningSourceEditor from './MentorTestListeningSourceEditor';
import {
  TEST_SKILL_CHIP_COLORS,
  TEST_SKILL_LABELS,
  TEST_SKILL_LISTENING,
  TEST_SKILL_READING,
  TEST_SKILL_WRITING,
  createEmptyTestQuestion,
  getListeningSectionFields,
  getSectionDisplayTitle,
  getSectionScoreLabel,
  SCORING_MODE_AUTO,
} from '@/features/mentor/utils/mentorTestContentUtils';

const fieldLabelSx = { mb: 0.5, fontSize: 12, fontWeight: 700, color: '#64748B' };

const SKILL_OPTIONS = [
  { value: TEST_SKILL_LISTENING, label: TEST_SKILL_LABELS.LISTENING, icon: HeadphonesRoundedIcon },
  { value: TEST_SKILL_READING, label: TEST_SKILL_LABELS.READING, icon: MenuBookRoundedIcon },
  { value: TEST_SKILL_WRITING, label: TEST_SKILL_LABELS.WRITING, icon: EditNoteRoundedIcon },
];

function SkillOptionButton({ option, selected, disabled, accentColor, onSelect }) {
  const Icon = option.icon;
  const isSelected = selected === option.value;

  return (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      onClick={() => onSelect(option.value)}
      sx={{
        flex: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        minHeight: 40,
        px: 1.25,
        border: 'none',
        borderRadius: '10px',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 13,
        fontWeight: isSelected ? 700 : 600,
        fontFamily: 'inherit',
        color: isSelected ? accentColor : MUTED,
        bgcolor: isSelected ? `${accentColor}18` : 'transparent',
        transition: 'background-color 0.15s, color 0.15s',
        opacity: disabled ? 0.6 : 1,
        '&:hover': disabled
          ? {}
          : {
              bgcolor: isSelected ? `${accentColor}22` : 'rgba(15,23,42,0.04)',
              color: isSelected ? accentColor : TEXT,
            },
      }}
    >
      <Icon sx={{ fontSize: 18 }} />
      {option.label}
    </Box>
  );
}

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

function SkillChip({ skillType }) {
  const chip = TEST_SKILL_CHIP_COLORS[skillType] ?? TEST_SKILL_CHIP_COLORS[TEST_SKILL_READING];
  const label = TEST_SKILL_LABELS[skillType] ?? '';

  if (!label) return null;

  return (
    <Typography
      component="span"
      sx={{
        fontSize: 11,
        fontWeight: 700,
        color: chip.color,
        px: 0.85,
        py: 0.25,
        borderRadius: '999px',
        bgcolor: chip.bg,
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>
  );
}

export default function MentorTestSectionCard({
  section,
  index,
  errors = {},
  accentColor,
  disabled = false,
  scoringMode = SCORING_MODE_AUTO,
  totalScore = 10,
  questionCountAll = 0,
  showScoreField = false,
  defaultExpanded = true,
  onChange,
  onDelete,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const questions = section.Questions ?? [];
  const sectionScoreLabel = getSectionScoreLabel(section, scoringMode, totalScore, questionCountAll);
  const skillType = section.SkillType ?? TEST_SKILL_READING;
  const skillTheme = TEST_SKILL_CHIP_COLORS[skillType] ?? TEST_SKILL_CHIP_COLORS[TEST_SKILL_READING];
  const skillAccent = skillTheme.color;
  const showListeningSource = skillType === TEST_SKILL_LISTENING;
  const displayTitle = getSectionDisplayTitle(section);

  const updateSection = (patch) => onChange({ ...section, ...patch });

  const updateQuestions = (nextQuestions) => updateSection({ Questions: nextQuestions });

  const handleAddQuestion = () => {
    updateQuestions([...questions, createEmptyTestQuestion()]);
  };

  const handleQuestionChange = (questionTempId, nextQuestion) => {
    updateQuestions(
      questions.map((question) => (question.tempId === questionTempId ? nextQuestion : question)),
    );
  };

  const handleDeleteQuestion = (questionTempId) => {
    updateQuestions(questions.filter((question) => question.tempId !== questionTempId));
  };

  const handleSkillChange = (nextSkill) => {
    if (nextSkill === skillType) return;

    const patch = { SkillType: nextSkill };

    if (nextSkill === TEST_SKILL_LISTENING) {
      Object.assign(patch, getListeningSectionFields());
    } else {
      patch.AudioSourceType = undefined;
      patch.File = null;
      patch.FileName = null;
      patch.FileSize = null;
      patch.AudioUrl = undefined;
    }

    updateSection(patch);
  };

  return (
    <Box
      sx={{
        borderRadius: '14px',
        border: `1px solid ${skillAccent}28`,
        borderLeft: `4px solid ${skillAccent}`,
        bgcolor: '#fff',
        boxShadow: `0 1px 4px ${skillAccent}14`,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: { xs: 1.1, sm: 1.25 },
          py: 1,
          bgcolor: skillTheme.bg,
          borderBottom: expanded ? `1px solid ${skillAccent}20` : 'none',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            <Typography
              component="span"
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: skillAccent,
                px: 0.85,
                py: 0.25,
                borderRadius: '999px',
                bgcolor: `${skillAccent}18`,
              }}
            >
              Phần {index + 1}
            </Typography>
            <SkillChip skillType={skillType} />
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: TEXT,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: { xs: '100%', sm: 280 },
              }}
            >
              {displayTitle}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5 }}>
            <Typography component="span" sx={{ fontSize: 11, fontWeight: 600, color: MUTED }}>
              {sectionScoreLabel}
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="small"
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={expanded ? 'Thu gọn phần kiểm tra' : 'Mở rộng phần kiểm tra'}
          sx={{ color: MUTED, flexShrink: 0 }}
        >
          {expanded ? (
            <ExpandLessRoundedIcon sx={{ fontSize: 20 }} />
          ) : (
            <ExpandMoreRoundedIcon sx={{ fontSize: 20 }} />
          )}
        </IconButton>

        <IconButton
          size="small"
          onClick={onDelete}
          disabled={disabled}
          aria-label="Xóa phần kiểm tra"
          sx={{
            color: MUTED,
            flexShrink: 0,
            '&:hover': { color: '#DC2626', bgcolor: 'rgba(220,38,38,0.06)' },
          }}
        >
          <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: { xs: 1.15, sm: 1.35 }, bgcolor: `${skillAccent}06` }}>
          <Box sx={{ mb: 1.25 }}>
            <ContentFieldLabel sx={fieldLabelSx}>Tên phần</ContentFieldLabel>
            <InputBase
              value={section.SectionTitle ?? ''}
              onChange={(event) => updateSection({ SectionTitle: event.target.value })}
              disabled={disabled}
              placeholder="Ví dụ: Phần nghe đoạn hội thoại ngắn"
              fullWidth
              sx={fieldInputSx(false, skillAccent)}
            />
          </Box>

          <Box sx={{ mb: 1.25 }}>
            <ContentFieldLabel sx={fieldLabelSx}>Kỹ năng</ContentFieldLabel>
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                p: 0.5,
                borderRadius: '12px',
                bgcolor: '#F8FAFC',
                border: `1px solid ${errors.SkillType ? '#DC2626' : 'rgba(15,23,42,0.08)'}`,
              }}
            >
              {SKILL_OPTIONS.map((option) => (
                <SkillOptionButton
                  key={option.value}
                  option={option}
                  selected={skillType}
                  disabled={disabled}
                  accentColor={TEST_SKILL_CHIP_COLORS[option.value]?.color ?? accentColor}
                  onSelect={handleSkillChange}
                />
              ))}
            </Box>
            {errors.SkillType && (
              <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.25 }}>
                {errors.SkillType}
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: showListeningSource ? 1.25 : 1.5 }}>
            <ContentFieldLabel sx={fieldLabelSx}>Mô tả phần</ContentFieldLabel>
            <InputBase
              value={section.Description ?? ''}
              onChange={(event) => updateSection({ Description: event.target.value })}
              disabled={disabled}
              placeholder="Mô tả ngắn cho phần kiểm tra (tuỳ chọn)"
              fullWidth
              multiline
              minRows={2}
              sx={multilineInputSx(false, skillAccent)}
            />
          </Box>

          {showListeningSource ? (
            <MentorTestListeningSourceEditor
              section={section}
              errors={errors}
              accentColor={skillAccent}
              disabled={disabled}
              onChange={(patch) => updateSection(patch)}
            />
          ) : null}

          <Box sx={{ mb: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Câu hỏi</Typography>
          </Box>

          {errors._questions && (
            <Typography sx={{ fontSize: 11, color: '#DC2626', mb: 1 }}>{errors._questions}</Typography>
          )}

          {questions.length === 0 ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                border: '1px dashed rgba(15,23,42,0.12)',
                bgcolor: '#F8FAFC',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: 12, color: MUTED, mb: 1 }}>
                Chưa có câu hỏi trong phần này.
              </Typography>
              <Box
                component="button"
                type="button"
                onClick={handleAddQuestion}
                disabled={disabled}
                sx={{
                  ...contentAddButtonSx(TEST_ADD_QUESTION_THEME),
                  cursor: disabled ? 'default' : 'pointer',
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                <AddRoundedIcon sx={{ fontSize: 16 }} />
                Thêm câu hỏi
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                pl: { xs: 0, sm: 0.75 },
                borderLeft: { xs: 'none', sm: `2px solid ${skillAccent}33` },
              }}
            >
              {questions.map((question, questionIndex) => (
                <MentorTestQuestionCard
                  key={question.tempId}
                  question={question}
                  index={questionIndex}
                  errors={errors.Questions?.[question.tempId] ?? {}}
                  accentColor={skillAccent}
                  disabled={disabled}
                  showScoreField={showScoreField}
                  onChange={(nextQuestion) => handleQuestionChange(question.tempId, nextQuestion)}
                  onDelete={() => handleDeleteQuestion(question.tempId)}
                />
              ))}
              <Box
                component="button"
                type="button"
                onClick={handleAddQuestion}
                disabled={disabled}
                sx={{
                  ...contentAddButtonSx(TEST_ADD_QUESTION_THEME),
                  alignSelf: 'flex-start',
                  cursor: disabled ? 'default' : 'pointer',
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                <AddRoundedIcon sx={{ fontSize: 16 }} />
                Thêm câu hỏi
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
