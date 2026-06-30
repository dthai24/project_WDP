/**
 * Editor question bank — builder + skill nav + mục lục (gộp các phần con trước đây).
 */
import { Box, Typography, alpha } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import HeadphonesRoundedIcon from '@mui/icons-material/HeadphonesRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PlayLessonRoundedIcon from '@mui/icons-material/PlayLessonRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import { Link } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import Loading from '@/shared/ui/Loading';
import MentorChapterCardMenu from '@/features/mentor/components/course/MentorChapterCardMenu';
import MentorTestSectionCard from '@/features/mentor/components/course/MentorTestSectionCard';
import {
  BUILDER_PANEL_SX,
  CHAPTER_THEME,
  LESSON_THEME,
} from '@/features/mentor/components/course/mentorCourseContentStyles';
import { CREATE_CARD_SX, MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import { HEADER_HEIGHT } from '@/shared/layout/MainLayout';
import {
  SCORING_MODE_AUTO,
  TEST_SKILL_CHIP_COLORS,
  TEST_SKILL_LABELS,
  TEST_SKILL_LISTENING,
  TEST_SKILL_READING,
  TEST_SKILL_WRITING,
  getActiveFilledTestQuestions,
  getFilledTestQuestions,
  getNonEmptyQuestionBankSections,
  getQuestionBankSectionTabLabel,
  getSectionsBySkill,
  isQuestionActive,
  isQuestionBankWritingSkill,
} from '@/features/mentor/utils/mentorTestContentUtils';

const SKILL_NAV_ITEMS = [
  { skill: TEST_SKILL_LISTENING, label: TEST_SKILL_LABELS[TEST_SKILL_LISTENING], icon: HeadphonesRoundedIcon },
  { skill: TEST_SKILL_READING, label: TEST_SKILL_LABELS[TEST_SKILL_READING], icon: MenuBookRoundedIcon },
  { skill: TEST_SKILL_WRITING, label: TEST_SKILL_LABELS[TEST_SKILL_WRITING], icon: EditNoteRoundedIcon },
];

const OUTLINE_SKILL_ITEMS = [
  { skill: TEST_SKILL_LISTENING, icon: HeadphonesRoundedIcon },
  { skill: TEST_SKILL_READING, icon: MenuBookRoundedIcon },
  { skill: TEST_SKILL_WRITING, icon: EditNoteRoundedIcon },
];

function SkillNavButton({
  label,
  icon: Icon,
  color,
  sectionCount = 0,
  sectionUnit = 'bài',
  questionCount = 0,
  selected = false,
  disabled = false,
  hasError = false,
  onClick,
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.85,
        width: '100%',
        textAlign: 'left',
        border: selected
          ? `1px solid ${alpha(color, 0.35)}`
          : hasError
            ? '1px solid rgba(220,38,38,0.35)'
            : '1px solid transparent',
        borderRadius: '12px',
        bgcolor: selected ? alpha(color, 0.1) : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        font: 'inherit',
        px: 1,
        py: 0.85,
        transition: 'background-color 0.15s, border-color 0.15s',
        opacity: disabled ? 0.55 : 1,
        '&:hover': disabled ? undefined : { bgcolor: selected ? alpha(color, 0.14) : 'rgba(15,23,42,0.04)' },
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '10px',
          bgcolor: selected ? '#fff' : alpha(color, 0.1),
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 17, color }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: selected ? 700 : 600, color: selected ? color : TEXT, lineHeight: 1.3 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.15, lineHeight: 1.35 }}>
          {sectionCount} {sectionUnit} · {questionCount} câu hỏi
        </Typography>
      </Box>
    </Box>
  );
}

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

function OutlineNavItem({
  label,
  meta,
  icon: Icon,
  iconColor,
  indent = 0,
  selected = false,
  muted = false,
  disabled = false,
  onClick,
  trailing = null,
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.25, width: '100%' }}>
      <Box
        component="button"
        type="button"
        onClick={onClick}
        disabled={disabled || !onClick}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 0.65,
          flex: 1,
          minWidth: 0,
          textAlign: 'left',
          border: selected ? `1px solid ${alpha(PRIMARY, 0.35)}` : '1px solid transparent',
          background: 'none',
          cursor: onClick && !disabled ? 'pointer' : 'default',
          font: 'inherit',
          pl: indent * 1.5 + 0.5,
          pr: 0.5,
          py: 0.55,
          borderRadius: '10px',
          bgcolor: selected ? alpha(PRIMARY, 0.08) : 'transparent',
          opacity: muted ? 0.55 : disabled ? 0.55 : 1,
          transition: 'background-color 0.15s, border-color 0.15s',
          '&:hover':
            onClick && !disabled && !selected
              ? { bgcolor: 'rgba(8,145,178,0.06)' }
              : onClick && !disabled && selected
                ? { bgcolor: alpha(PRIMARY, 0.12) }
                : undefined,
        }}
      >
        {Icon ? (
          <Icon sx={{ fontSize: 15, color: selected ? PRIMARY : iconColor, mt: 0.15, flexShrink: 0 }} />
        ) : (
          <Box sx={{ width: 6, height: 6, borderRadius: '999px', bgcolor: iconColor ?? MUTED, mt: 0.55, flexShrink: 0, ml: 0.45 }} />
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontSize: indent >= 2 ? 12 : indent === 0 ? 13 : 12,
              fontWeight: selected ? 700 : indent === 0 ? 700 : 600,
              color: selected ? PRIMARY : TEXT,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {label}
          </Typography>
          {meta ? (
            <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.15, lineHeight: 1.35 }}>{meta}</Typography>
          ) : null}
        </Box>
        {selected && !trailing ? (
          <CheckCircleRoundedIcon sx={{ fontSize: 16, color: PRIMARY, mt: 0.1, flexShrink: 0 }} />
        ) : null}
      </Box>
      {trailing ? (
        <Box sx={{ flexShrink: 0, mt: 0.15 }} onClick={(e) => e.stopPropagation()}>
          {trailing}
        </Box>
      ) : null}
    </Box>
  );
}

function truncateQuestionLabel(text, max = 48) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return 'Chưa có nội dung';
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
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
  onSkillChange,
  onNavigateToItem,
  courseName = '',
  courseCategory = '',
  chapterTitle = '',
  courseChapters = [],
  chaptersLoading = false,
  selectedChapterId = '',
  chapterError = '',
  courseId = '',
  courseOutlineHint = 'Chọn chương để tạo hoặc mở ngân hàng câu hỏi tương ứng.',
  onChapterSelect,
  onChapterQuizSetup,
  onCourseQuizSetup,
}) {
  const accentColor = TEST_SKILL_CHIP_COLORS[activeSkill]?.color ?? PRIMARY;
  const isWritingSkill = isQuestionBankWritingSkill(activeSkill);
  const addLabel = isWritingSkill ? 'Thêm nhóm câu hỏi' : 'Thêm bài';
  const countLabel = isWritingSkill ? 'nhóm' : 'bài';

  const baiCountBySkill = SKILL_NAV_ITEMS.reduce((acc, { skill }) => {
    acc[skill] = getNonEmptyQuestionBankSections(getSectionsBySkill(sections, skill)).length;
    return acc;
  }, {});

  const countBySkill = SKILL_NAV_ITEMS.reduce((acc, { skill }) => {
    acc[skill] = getSectionsBySkill(sections, skill).reduce(
      (sum, section) => sum + getFilledTestQuestions(section?.Questions).length,
      0,
    );
    return acc;
  }, {});

  const errorBySkill = SKILL_NAV_ITEMS.reduce((acc, { skill }) => {
    acc[skill] = getSectionsBySkill(sections, skill).some((section) => Boolean(sectionErrors[section.tempId]));
    return acc;
  }, {});

  const filledSections = getNonEmptyQuestionBankSections(sections);
  const hasContentOutline = filledSections.length > 0;

  const handleNavigate = (target) => {
    onNavigateToItem?.(target);
  };

  return (
    <Box
      id="question-bank-builder-root"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: { xs: 2, lg: 2.5 },
        alignItems: 'start',
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', lg: 200 },
          flexShrink: 0,
          alignSelf: 'flex-start',
          position: { lg: 'sticky' },
          top: { lg: HEADER_HEIGHT + 16 },
          zIndex: 2,
        }}
      >
        <Box sx={{ ...BUILDER_PANEL_SX, p: 1.25 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: MUTED,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              mb: 1,
              px: 0.5,
            }}
          >
            Kỹ năng
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.35 }}>
            {SKILL_NAV_ITEMS.map(({ skill, label, icon }) => {
              const theme = TEST_SKILL_CHIP_COLORS[skill];
              return (
                <SkillNavButton
                  key={skill}
                  label={label}
                  icon={icon}
                  color={theme.color}
                  sectionCount={baiCountBySkill[skill]}
                  sectionUnit={skill === TEST_SKILL_WRITING ? 'nhóm' : 'bài'}
                  questionCount={countBySkill[skill]}
                  selected={activeSkill === skill}
                  disabled={disabled}
                  hasError={errorBySkill[skill]}
                  onClick={() => onSkillChange?.(skill)}
                />
              );
            })}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          width: '100%',
          maxWidth: { lg: 1280 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 7fr) minmax(280px, 3fr)' },
          gap: { xs: 2, lg: 2.5 },
          alignItems: 'start',
        }}
      >
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

        <Box
          sx={{
            position: { lg: 'sticky' },
            top: { lg: HEADER_HEIGHT + 16 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignSelf: 'flex-start',
          }}
        >
          <Box sx={{ ...BUILDER_PANEL_SX, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, mb: 1.25 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '10px',
                  bgcolor: 'rgba(8,145,178,0.08)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <ListAltRoundedIcon sx={{ fontSize: 18, color: PRIMARY }} />
              </Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Mục lục nội dung</Typography>
            </Box>

            {!hasContentOutline ? (
              <Typography sx={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
                Thêm câu hỏi để xem mục lục và điều hướng nhanh.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.25,
                  maxHeight: { lg: 'calc(100vh - 280px)' },
                  minHeight: 120,
                  overflowY: 'auto',
                  pr: 0.25,
                  mr: -0.25,
                }}
              >
                {OUTLINE_SKILL_ITEMS.map(({ skill, icon: Icon }) => {
                  const skillSectionsOutline = getNonEmptyQuestionBankSections(getSectionsBySkill(sections, skill));
                  if (skillSectionsOutline.length === 0) return null;

                  const theme = TEST_SKILL_CHIP_COLORS[skill];
                  const skillQuestionCount = skillSectionsOutline.reduce(
                    (sum, section) => sum + getFilledTestQuestions(section?.Questions).length,
                    0,
                  );

                  return (
                    <Box key={skill} sx={{ mb: 0.35 }}>
                      <OutlineNavItem
                        label={TEST_SKILL_LABELS[skill]}
                        meta={`${skillSectionsOutline.length} bài · ${skillQuestionCount} câu`}
                        icon={Icon}
                        iconColor={theme?.color ?? PRIMARY}
                        selected={activeSkill === skill}
                        onClick={() => handleNavigate({ type: 'skill', skill })}
                      />

                      {skillSectionsOutline.map((section) => {
                        const questions = getFilledTestQuestions(section?.Questions ?? []);
                        const sectionLabel = getQuestionBankSectionTabLabel(section, sections);
                        const isSectionActive =
                          activeSkill === skill && String(activeSectionId) === String(section.tempId);

                        return (
                          <Box key={section.tempId}>
                            <OutlineNavItem
                              label={sectionLabel}
                              meta={`${questions.length} câu hỏi`}
                              icon={MenuBookRoundedIcon}
                              iconColor={theme?.color ?? PRIMARY}
                              indent={1}
                              selected={isSectionActive}
                              onClick={() =>
                                handleNavigate({ type: 'section', skill, sectionTempId: section.tempId })
                              }
                            />

                            {questions.map((question, questionIndex) => (
                              <OutlineNavItem
                                key={question.tempId}
                                label={`Câu ${questionIndex + 1}: ${truncateQuestionLabel(question.QuestionText)}`}
                                meta={!isQuestionActive(question) ? 'Ẩn khỏi quiz mới' : undefined}
                                icon={null}
                                iconColor={theme?.color ?? PRIMARY}
                                indent={2}
                                muted={!isQuestionActive(question)}
                                onClick={() =>
                                  handleNavigate({
                                    type: 'question',
                                    skill,
                                    sectionTempId: section.tempId,
                                    questionTempId: question.tempId,
                                  })
                                }
                              />
                            ))}
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          <Box sx={{ ...BUILDER_PANEL_SX, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75, mb: 1.25 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Mục lục khóa học</Typography>
              {onCourseQuizSetup && courseId ? (
                <MentorChapterCardMenu variant="course" onQuizSetup={onCourseQuizSetup} />
              ) : null}
            </Box>

            <Box
              sx={{
                p: 1.25,
                mb: 1.5,
                borderRadius: '12px',
                bgcolor: 'rgba(8,145,178,0.05)',
                border: '1px solid rgba(8,145,178,0.12)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <MenuBookRoundedIcon sx={{ fontSize: 18, color: PRIMARY, mt: 0.15, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: MUTED, mb: 0.25 }}>
                    Khóa học · Chương
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.4 }}>
                    {courseName || '—'}
                  </Typography>
                  {chapterTitle ? (
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT, mt: 0.35 }}>
                      {chapterTitle}
                    </Typography>
                  ) : null}
                  {courseCategory ? (
                    <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.35 }}>{courseCategory}</Typography>
                  ) : null}
                </Box>
              </Box>
            </Box>

            {chaptersLoading ? (
              <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                <Loading size={24} />
              </Box>
            ) : courseChapters.length === 0 ? (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: 'rgba(15,23,42,0.03)',
                  border: '1px dashed rgba(15,23,42,0.12)',
                }}
              >
                <Typography sx={{ fontSize: 13, color: MUTED, lineHeight: 1.55, mb: 1.25 }}>
                  Khóa học này chưa có chương. Tạo chương trước khi tạo ngân hàng câu hỏi theo chương.
                </Typography>
                {courseId ? (
                  <AppButton
                    component={Link}
                    to={`/mentor/courses/${courseId}/content/edit`}
                    variant="outlined"
                    size="small"
                    endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
                    sx={{ height: 34, fontSize: 12, fontWeight: 600, borderRadius: '999px' }}
                  >
                    Tạo chương cho khóa học
                  </AppButton>
                ) : null}
              </Box>
            ) : (
              <>
                <Typography sx={{ fontSize: 12, color: MUTED, mb: 1, lineHeight: 1.45 }}>{courseOutlineHint}</Typography>
                {chapterError ? (
                  <Typography sx={{ fontSize: 12, color: '#DC2626', mb: 1, lineHeight: 1.45 }}>{chapterError}</Typography>
                ) : null}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.25,
                    maxHeight: { lg: 280 },
                    overflowY: 'auto',
                    pr: 0.25,
                    mr: -0.25,
                  }}
                >
                  {courseChapters.map((chapter, chapterIndex) => {
                    const chapterId = chapter.chapterId ?? chapter.PathId;
                    const chapterTitleItem =
                      chapter.chapterTitle ?? chapter.PathName ?? `Chương ${chapterIndex + 1}`;
                    const lessons =
                      chapter.lessons ??
                      (chapter.Nodes ?? []).map((node, nodeIndex) => ({
                        lessonId: node.NodeId ?? node.lessonId,
                        lessonTitle: node.NodeName ?? node.lessonTitle ?? `Bài ${nodeIndex + 1}`,
                      }));
                    const isSelected = String(chapterId) === String(selectedChapterId);

                    return (
                      <Box key={chapterId ?? chapterIndex} sx={{ mb: 0.35 }}>
                        <OutlineNavItem
                          label={`Chương ${chapterIndex + 1}: ${chapterTitleItem}`}
                          meta={lessons.length > 0 ? `${lessons.length} bài học` : 'Chưa có bài học'}
                          icon={MenuBookRoundedIcon}
                          iconColor={CHAPTER_THEME.color}
                          selected={isSelected}
                          onClick={() => onChapterSelect?.(String(chapterId))}
                          trailing={
                            onChapterQuizSetup ? (
                              <MentorChapterCardMenu
                                onQuizSetup={() => onChapterQuizSetup(chapter, chapterIndex)}
                              />
                            ) : null
                          }
                        />
                        {lessons.map((lesson, lessonIndex) => (
                          <OutlineNavItem
                            key={lesson.lessonId}
                            label={`Bài ${lessonIndex + 1}: ${lesson.lessonTitle}`}
                            icon={PlayLessonRoundedIcon}
                            iconColor={LESSON_THEME.color}
                            indent={1}
                            disabled
                          />
                        ))}
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
