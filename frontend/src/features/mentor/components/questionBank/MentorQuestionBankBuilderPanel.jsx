/**
 * Editor câu hỏi — cột giữa workspace question bank.
 */
import { useEffect, useState } from 'react';
import { Box, Typography, alpha } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AppButton from '@/shared/ui/AppButton';
import MentorTestSectionCard from '@/features/mentor/components/course/MentorTestSectionCard';
import MentorQuestionBankDeletedQuestionsDialog from '@/features/mentor/components/questionBank/MentorQuestionBankDeletedQuestionsDialog';
import { CREATE_CARD_SX, MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import {
  SCORING_MODE_AUTO,
  TEST_SKILL_CHIP_COLORS,
  getFilledTestQuestions,
  getQuestionBankSectionTabLabel,
  getSectionDeletedQuestions,
  isQuestionBankWritingSkill,
  restoreDeletedQuestionToSection,
} from '@/features/mentor/utils/mentorTestContentUtils';
import {
  getSectionDisplayQuestionCount,
  hasSectionUnsavedChanges,
} from '@/features/mentor/utils/questionBankApiMappers';

function BaiTab({ label, selected, disabled, accentColor, hasContent = false, isDirty = false, onClick }) {
  const StatusIcon = hasContent ? CheckCircleOutlineRoundedIcon : RadioButtonUncheckedRoundedIcon;
  const statusColor = hasContent ? '#047857' : alpha(MUTED, 0.85);

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={
        isDirty
          ? 'Có thay đổi chưa cập nhật'
          : hasContent
            ? 'Đã có câu hỏi'
            : 'Chưa có câu hỏi'
      }
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.25,
        py: 0.55,
        borderRadius: '999px',
        border: selected
          ? `1px solid ${alpha(accentColor, 0.4)}`
          : isDirty
            ? '1px solid rgba(245,158,11,0.45)'
            : '1px solid rgba(15,23,42,0.1)',
        bgcolor: selected ? alpha(accentColor, 0.1) : isDirty ? 'rgba(245,158,11,0.08)' : '#fff',
        color: selected ? accentColor : isDirty ? '#B45309' : TEXT,
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
      {isDirty ? (
        <Box
          component="span"
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: '#F59E0B',
            flexShrink: 0,
          }}
        />
      ) : null}
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
  sectionBaselines = {},
  sectionSourceBaselines = {},
  activeSectionDirty = false,
  hasPendingSectionDeletes = false,
  updatingSection = false,
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
  onQuestionsFullyRestored,
  onDeleteSection,
  onUpdateSection,
  onRegisterSectionControls,
}) {
  const [deletedDialogOpen, setDeletedDialogOpen] = useState(false);
  const accentColor = TEST_SKILL_CHIP_COLORS[activeSkill]?.color ?? PRIMARY;
  const isWritingSkill = isQuestionBankWritingSkill(activeSkill);
  const addLabel = isWritingSkill ? 'Thêm nhóm câu hỏi' : 'Thêm bài';
  const countLabel = isWritingSkill ? 'nhóm' : 'bài';
  const deletedQuestions = getSectionDeletedQuestions(activeSection);
  const deletedSectionLabel = activeSection
    ? getQuestionBankSectionTabLabel(activeSection, sections)
    : '';

  const handleRestoreDeletedQuestion = (question) => {
    if (!activeSection || !question) return;
    const prevDeletedCount = deletedQuestions.length;
    const nextSection = restoreDeletedQuestionToSection(activeSection, question);
    const nextDeletedCount = getSectionDeletedQuestions(nextSection).length;

    if (prevDeletedCount > 0 && nextDeletedCount === 0) {
      onQuestionsFullyRestored?.(activeSection.tempId, nextSection);
      return;
    }

    onSectionChange?.(activeSection.tempId, nextSection);
  };

  useEffect(() => {
    if (deletedDialogOpen && deletedQuestions.length === 0) {
      setDeletedDialogOpen(false);
    }
  }, [deletedDialogOpen, deletedQuestions.length]);

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
                      hasContent={
                        getSectionDisplayQuestionCount(section) > 0
                        || getFilledTestQuestions(section?.Questions).length > 0
                      }
                      isDirty={hasSectionUnsavedChanges(section, sectionBaselines, sectionSourceBaselines)}
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

                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    mb: 1.5,
                    p: 1.25,
                    borderRadius: '12px',
                    bgcolor: activeSectionDirty ? 'rgba(245,158,11,0.08)' : 'rgba(15,23,42,0.03)',
                    border: `1px solid ${activeSectionDirty ? 'rgba(245,158,11,0.22)' : 'rgba(15,23,42,0.06)'}`,
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: activeSectionDirty ? '#92400E' : MUTED, lineHeight: 1.5 }}>
                    {hasPendingSectionDeletes && !activeSectionDirty
                      ? 'Có section đã đánh dấu xóa. Lưu thay đổi để xóa trên server.'
                      : activeSectionDirty
                        ? hasPendingSectionDeletes
                          ? 'Section có thay đổi chưa lưu và có section chờ xóa. Lưu để đồng bộ.'
                          : 'Section này có thay đổi chưa lưu. Cập nhật trước khi chuyển sang bài/kỹ năng khác.'
                        : 'Section đã đồng bộ. Bạn có thể chuyển sang phần khác.'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flexShrink: 0 }}>
                    {deletedQuestions.length > 0 ? (
                      <AppButton
                        onClick={() => setDeletedDialogOpen(true)}
                        sx={{
                          height: 36,
                          px: 2,
                          fontSize: 13,
                          fontWeight: 700,
                          borderRadius: '999px',
                          bgcolor: '#F59E0B',
                          color: '#fff',
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#D97706', boxShadow: 'none' },
                        }}
                      >
                        Những câu hỏi đã xóa
                      </AppButton>
                    ) : null}
                    <AppButton
                      startIcon={<SaveOutlinedIcon />}
                      onClick={onUpdateSection}
                      disabled={disabled || updatingSection || !activeSectionDirty}
                      sx={{
                        height: 36,
                        px: 2,
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: '999px',
                        bgcolor: PRIMARY,
                        color: '#fff',
                        boxShadow: 'none',
                        flexShrink: 0,
                        '&:hover': { bgcolor: '#0E7490', boxShadow: 'none' },
                        '&.Mui-disabled': { bgcolor: 'rgba(15,23,42,0.12)', color: MUTED },
                      }}
                    >
                      {updatingSection ? 'Đang cập nhật...' : 'Cập nhật section'}
                    </AppButton>
                  </Box>
                </Box>

                <MentorQuestionBankDeletedQuestionsDialog
                  open={deletedDialogOpen}
                  onClose={() => setDeletedDialogOpen(false)}
                  deletedQuestions={deletedQuestions}
                  sectionLabel={deletedSectionLabel}
                  onRestoreQuestion={handleRestoreDeletedQuestion}
                />

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
                    onRegisterSectionControls={onRegisterSectionControls}
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
