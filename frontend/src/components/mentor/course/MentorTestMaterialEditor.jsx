import { Box, InputBase, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import { ContentFieldLabel } from './MentorContentSectionHeading';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import { contentAddButtonSx, MATERIAL_TYPE_THEME, TEST_ADD_SECTION_THEME } from './mentorCourseContentStyles';
import MentorTestSectionCard from './MentorTestSectionCard';
import {
  SCORING_MODE_AUTO,
  SCORING_MODE_LABELS,
  SCORING_MODE_MANUAL,
  calculateAutoQuestionScore,
  calculateManualTotalScore,
  computeMaterialTestSummary,
  createEmptyTestSection,
  DEFAULT_TEST_TOTAL_SCORE,
  formatScoreValue,
  getEffectiveScoringMode,
  getQuestionCount,
  scoresMatch,
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

function multilineInputSx(hasError, accentColor) {
  return {
    ...fieldInputSx(hasError, accentColor),
    alignItems: 'flex-start',
    py: 0.75,
  };
}

function ScoringModeButton({ label, selected, disabled, accentColor, onSelect }) {
  return (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      onClick={onSelect}
      sx={{
        flex: 1,
        minHeight: 40,
        border: 'none',
        borderRadius: '10px',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 13,
        fontWeight: selected ? 700 : 600,
        fontFamily: 'inherit',
        color: selected ? accentColor : MUTED,
        bgcolor: selected ? `${accentColor}18` : 'transparent',
        transition: 'background-color 0.15s, color 0.15s',
        opacity: disabled ? 0.6 : 1,
        px: 1,
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

function SummaryPill({ children, color = MUTED, bgcolor = 'rgba(15,23,42,0.05)' }) {
  return (
    <Typography
      component="span"
      sx={{
        fontSize: 11,
        fontWeight: 600,
        color,
        px: 1,
        py: 0.35,
        borderRadius: '999px',
        bgcolor,
      }}
    >
      {children}
    </Typography>
  );
}

export default function MentorTestMaterialEditor({
  material,
  errors = {},
  onChange,
  disabled = false,
}) {
  const theme = MATERIAL_TYPE_THEME.TEST;
  const accentColor = theme.color;
  const sections = material.Sections ?? [];
  const scoringMode = getEffectiveScoringMode(material);
  const isAuto = scoringMode === SCORING_MODE_AUTO;
  const totalScore = DEFAULT_TEST_TOTAL_SCORE;
  const { sectionCount } = computeMaterialTestSummary(sections);
  const questionCount = getQuestionCount(sections);
  const perQuestionScore = calculateAutoQuestionScore(totalScore, questionCount);
  const manualTotal = calculateManualTotalScore(sections);

  const updateSections = (nextSections) => {
    onChange(material.tempId, { Sections: nextSections });
  };

  const handleAddSection = () => {
    updateSections([...sections, createEmptyTestSection()]);
  };

  const handleSectionChange = (sectionTempId, nextSection) => {
    updateSections(
      sections.map((section) => (section.tempId === sectionTempId ? nextSection : section)),
    );
  };

  const handleDeleteSection = (sectionTempId) => {
    updateSections(sections.filter((section) => section.tempId !== sectionTempId));
  };

  const renderScoreSummary = () => {
    if (isAuto) {
      if (questionCount === 0) {
        return (
          <Typography sx={{ fontSize: 12, color: MUTED }}>
            Thêm câu hỏi để hệ thống tự chia điểm.
          </Typography>
        );
      }
      return (
        <SummaryPill>
          Tổng {questionCount} câu · mỗi câu {formatScoreValue(perQuestionScore)} điểm
        </SummaryPill>
      );
    }

    const matched = scoresMatch(totalScore, manualTotal);
    const isOver = manualTotal > totalScore + 0.01;
    const isUnder = manualTotal < totalScore - 0.01;

    let statusColor = '#16A34A';
    let statusBg = 'rgba(22,163,74,0.10)';
    let statusText = 'Tổng điểm đã khớp.';

    if (isUnder) {
      statusColor = '#EA580C';
      statusBg = 'rgba(234,88,12,0.10)';
      statusText = 'Tổng điểm câu hỏi đang thấp hơn tổng điểm bài kiểm tra.';
    } else if (isOver) {
      statusColor = '#DC2626';
      statusBg = 'rgba(220,38,38,0.10)';
      statusText = 'Tổng điểm câu hỏi đang vượt quá tổng điểm bài kiểm tra.';
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <SummaryPill color={matched ? '#16A34A' : isOver ? '#DC2626' : '#EA580C'}>
          Tổng điểm hiện tại: {formatScoreValue(manualTotal)} / {formatScoreValue(totalScore)}
        </SummaryPill>
        {questionCount > 0 && !matched ? (
          <Typography sx={{ fontSize: 12, color: statusColor, bgcolor: statusBg, px: 1, py: 0.5, borderRadius: '8px' }}>
            {statusText}
          </Typography>
        ) : questionCount > 0 && matched ? (
          <Typography sx={{ fontSize: 12, color: statusColor }}>{statusText}</Typography>
        ) : null}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        mt: 1.25,
        ml: { xs: 0, sm: 0.25 },
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: '16px',
        border: '1px solid rgba(15,23,42,0.08)',
        bgcolor: '#F8FAFC',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${accentColor}18`,
            color: accentColor,
            flexShrink: 0,
          }}
        >
          <QuizRoundedIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>
            Tạo bài kiểm tra
          </Typography>
          <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.25 }}>
            Tạo nhiều phần kiểm tra theo kỹ năng nghe, đọc, viết.
          </Typography>
        </Box>
        {sectionCount > 0 ? (
          <SummaryPill>{sectionCount} phần</SummaryPill>
        ) : null}
      </Box>

      <Box sx={{ mb: 1.25 }}>
        <ContentFieldLabel sx={fieldLabelSx}>Cách tính điểm</ContentFieldLabel>
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            p: 0.5,
            borderRadius: '12px',
            bgcolor: '#fff',
            border: '1px solid rgba(15,23,42,0.08)',
          }}
        >
          <ScoringModeButton
            label={SCORING_MODE_LABELS[SCORING_MODE_AUTO]}
            selected={isAuto}
            disabled={disabled}
            accentColor={accentColor}
            onSelect={() => onChange(material.tempId, { ScoringMode: SCORING_MODE_AUTO })}
          />
          <ScoringModeButton
            label={SCORING_MODE_LABELS[SCORING_MODE_MANUAL]}
            selected={!isAuto}
            disabled={disabled}
            accentColor={accentColor}
            onSelect={() => onChange(material.tempId, { ScoringMode: SCORING_MODE_MANUAL })}
          />
        </Box>
      </Box>

      <Box sx={{ mb: 1.5, p: 1, borderRadius: '12px', bgcolor: '#fff', border: '1px solid rgba(15,23,42,0.06)' }}>
        {renderScoreSummary()}
        {errors._scoreMismatch && (
          <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.75 }}>{errors._scoreMismatch}</Typography>
        )}
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <ContentFieldLabel sx={fieldLabelSx}>Mô tả bài kiểm tra</ContentFieldLabel>
        <InputBase
          value={material.Description ?? ''}
          onChange={(event) => onChange(material.tempId, { Description: event.target.value })}
          disabled={disabled}
          placeholder="Mô tả ngắn cho toàn bộ bài kiểm tra (tuỳ chọn)"
          fullWidth
          multiline
          minRows={2}
          sx={multilineInputSx(false, accentColor)}
        />
      </Box>

      <Box sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Phần kiểm tra</Typography>
      </Box>

      {errors._sections && (
        <Typography sx={{ fontSize: 11, color: '#DC2626', mb: 1 }}>{errors._sections}</Typography>
      )}

      {sections.length === 0 ? (
        <Box
          sx={{
            p: 2,
            borderRadius: '14px',
            border: '1px dashed rgba(15,23,42,0.12)',
            bgcolor: '#fff',
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT, mb: 0.5 }}>
            Chưa có phần kiểm tra nào
          </Typography>
          <Typography sx={{ fontSize: 12, color: MUTED, mb: 1.25 }}>
            Thêm phần Nghe, Đọc hoặc Viết để bắt đầu tạo câu hỏi.
          </Typography>
          <Box
            component="button"
            type="button"
            onClick={handleAddSection}
            disabled={disabled}
            sx={{
              ...contentAddButtonSx(TEST_ADD_SECTION_THEME),
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 16 }} />
            Thêm phần
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {sections.map((section, index) => (
            <MentorTestSectionCard
              key={section.tempId}
              section={section}
              index={index}
              errors={errors.Sections?.[section.tempId] ?? {}}
              accentColor={accentColor}
              disabled={disabled}
              scoringMode={scoringMode}
              totalScore={totalScore}
              questionCountAll={questionCount}
              showScoreField={!isAuto}
              defaultExpanded={index === sections.length - 1}
              onChange={(nextSection) => handleSectionChange(section.tempId, nextSection)}
              onDelete={() => handleDeleteSection(section.tempId)}
            />
          ))}
          <Box
            component="button"
            type="button"
            onClick={handleAddSection}
            disabled={disabled}
            sx={{
              ...contentAddButtonSx(TEST_ADD_SECTION_THEME),
              alignSelf: 'flex-start',
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 16 }} />
            Thêm phần
          </Box>
        </Box>
      )}
    </Box>
  );
}
