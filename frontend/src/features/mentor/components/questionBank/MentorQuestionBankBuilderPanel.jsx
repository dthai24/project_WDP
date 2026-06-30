/**
 * Editor câu hỏi — cột giữa workspace question bank.
 */
import { Box, Typography, alpha } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import MentorTestSectionCard from '@/features/mentor/components/course/MentorTestSectionCard';
import { CREATE_CARD_SX, MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import {
  SCORING_MODE_AUTO,
  TEST_SKILL_CHIP_COLORS,
  getFilledTestQuestions,
  getQuestionBankSectionTabLabel,
  isQuestionBankWritingSkill,
} from '@/features/mentor/utils/mentorTestContentUtils';

function BaiTab({ label, selected, disabled, accentColor, hasContent = false, onClick }) {
  const StatusIcon = hasContent ? CheckCircleOutlineRoundedIcon : RadioButtonUncheckedRoundedIcon;
  const statusColor = hasContent ? '#047857' : alpha(MUTED, 0.85);

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={hasContent ? 'Đã có câu hỏi' : 'Chưa có câu hỏi'}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.25,
        py: 0.55,
        borderRadius: '999px',
        border: selected ? `1px solid ${alpha(accentColor, 0.4)}` : '1px solid rgba(15,23,42,0.1)',
        bgcolor: selected ? alpha(accentColor, 0.1) : '#fff',
        color: selected ? accentColor : TEXT,
        fontSize: 12,
        fontWeight: selected ? 700 : 600,
        fontFamily: 'inherit',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        maxWidth: { xs: '100%', sm: 220 },
        overflow: 'hidden',
        transition: 'background-color 0.15s, border-color 0.15s',
        '&:hover': disabled ? undefined : { bgcolor: selected ? alpha(accentColor, 0.14) : 'rgba(15,23,42,0.04)' },
      }}
    >
      <StatusIcon sx={{ fontSize: 15, color: statusColor, flexShrink: 0 }} />
      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
        {label}
      </Box>
    </Box>
  );
}

export default function MentorQuestionBankBuilderPanel({
  sections = [],
  activeSkill,
  activeSection,
  activeSectionIndex = 0,
  activeSectionId = '',
  skillSections = [],
  sectionErrors = {},
  questionCount = 0,
  disabled = false,
  emptyHint = null,
  publishedHint = null,
  coursePublished = false,
  persistedQuestionIds = null,
  canDeleteActiveSection = false,
  onSectionSelect,
  onAddBai,
  onSectionChange,
  onDeleteSection,
}) {
  const accentColor = TEST_SKILL_CHIP_COLORS[activeSkill]?.color ?? PRIMARY;
  const isWritingSkill = isQuestionBankWritingSkill(activeSkill);
  const addLabel = isWritingSkill ? 'Thêm nhóm câu hỏi' : 'Thêm bài';
  const countLabel = isWritingSkill ? 'nhóm' : 'bài';

  return (
    <Box id="question-bank-builder-root" sx={{ minWidth: 0, width: '100%' }}>
      <Box sx={{ ...CREATE_CARD_SX, mb: { xs: 2, lg: 0 } }}>
        {publishedHint ? (
          <Typography
            sx={{
              fontSize: 13,
              color: '#92400E',
              mb: 2,
              p: 1.25,
              borderRadius: '10px',
              bgcolor: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.18)',
              lineHeight: 1.55,
            }}
          >
            {publishedHint}
          </Typography>
        ) : null}

        {emptyHint ? (
          <Typography
            sx={{
              fontSize: 13,
              color: MUTED,
              mb: 2,
              p: 1.25,
              borderRadius: '10px',
              bgcolor: 'rgba(15,23,42,0.04)',
              lineHeight: 1.5,
            }}
          >
            {emptyHint}
          </Typography>
        ) : null}

        <Box id="qb-questions" sx={{ opacity: disabled ? 0.6 : 1, scrollMarginTop: 24 }}>
          <Box sx={{ pointerEvents: disabled ? 'none' : 'auto' }}>
            {activeSection ? (
              <>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, mb: 2 }}>
                  {skillSections.map((section) => (
                    <BaiTab
                      key={section.tempId}
                      label={getQuestionBankSectionTabLabel(section, sections)}
                      hasContent={getFilledTestQuestions(section?.Questions).length > 0}
                      selected={section.tempId === activeSectionId}
                      disabled={disabled}
                      accentColor={accentColor}
                      onClick={() => onSectionSelect?.(section.tempId)}
                    />
                  ))}
                  <Box
                    component="button"
                    type="button"
                    onClick={onAddBai}
                    disabled={disabled}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.35,
                      px: 1,
                      py: 0.55,
                      borderRadius: '999px',
                      border: '1px dashed rgba(15,23,42,0.18)',
                      bgcolor: 'transparent',
                      color: MUTED,
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      cursor: disabled ? 'default' : 'pointer',
                      opacity: disabled ? 0.55 : 1,
                      '&:hover': disabled ? undefined : { bgcolor: 'rgba(15,23,42,0.04)', color: TEXT },
                    }}
                  >
                    <AddRoundedIcon sx={{ fontSize: 15 }} />
                    {addLabel}
                  </Box>
                  {skillSections.length > 0 && (
                    <Typography sx={{ fontSize: 11, color: MUTED, ml: { xs: 0, sm: 0.25 } }}>
                      {skillSections.length} {countLabel}
                    </Typography>
                  )}
                </Box>

                <Box id={`qb-section-${activeSection.tempId}`} sx={{ scrollMarginTop: 24, minWidth: 0 }}>
                  <MentorTestSectionCard
                    section={activeSection}
                    index={activeSectionIndex}
                    errors={sectionErrors[activeSection.tempId] ?? {}}
                    accentColor={accentColor}
                    disabled={disabled}
                    scoringMode={SCORING_MODE_AUTO}
                    totalScore={100}
                    questionCountAll={questionCount}
                    showScoreField={false}
                    lockSkillType
                    hideDelete={!canDeleteActiveSection}
                    questionBankMode
                    allSections={sections}
                    coursePublished={coursePublished}
                    persistedQuestionIds={persistedQuestionIds}
                    defaultExpanded
                    onChange={(nextSection) => onSectionChange(activeSection.tempId, nextSection)}
                    onDelete={() => onDeleteSection(activeSection.tempId)}
                  />
                </Box>
              </>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
