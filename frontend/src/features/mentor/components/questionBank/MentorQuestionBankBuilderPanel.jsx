/**
 * Main builder — dùng chung Create & Detail Question Bank.
 */
import { Box, Typography } from '@mui/material';
import MentorTestSectionCard from '@/features/mentor/components/course/MentorTestSectionCard';
import MentorQuestionBankBaiNav from '@/features/mentor/components/questionBank/MentorQuestionBankBaiNav';
import { CREATE_CARD_SX, MUTED, PRIMARY } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import {
  SCORING_MODE_AUTO,
  TEST_SKILL_CHIP_COLORS,
  getSectionBaiNumber,
} from '@/features/mentor/utils/mentorTestContentUtils';

export default function MentorQuestionBankBuilderPanel({
  sections = [],
  activeSkill,
  activeSection,
  activeSectionIndex = 0,
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
  return (
    <Box id="question-bank-builder-root">
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
                <MentorQuestionBankBaiNav
                  skillSections={skillSections}
                  allSections={sections}
                  activeSkill={activeSkill}
                  activeSectionId={activeSection.tempId}
                  accentColor={TEST_SKILL_CHIP_COLORS[activeSkill]?.color ?? PRIMARY}
                  disabled={disabled}
                  onSelect={onSectionSelect}
                  onAdd={onAddBai}
                />
                <Box
                  id={`qb-section-${activeSection.tempId}`}
                  sx={{ scrollMarginTop: 24, minWidth: 0 }}
                >
                  <MentorTestSectionCard
                    section={activeSection}
                    index={activeSectionIndex}
                    errors={sectionErrors[activeSection.tempId] ?? {}}
                    accentColor={TEST_SKILL_CHIP_COLORS[activeSkill]?.color ?? '#7C3AED'}
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
