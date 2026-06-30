/**
 * Mục lục nội dung + mục lục khóa học — cột phải workspace question bank.
 */
import { Box, Typography, alpha } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HeadphonesRoundedIcon from '@mui/icons-material/HeadphonesRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PlayLessonRoundedIcon from '@mui/icons-material/PlayLessonRounded';
import { Link } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import Loading from '@/shared/ui/Loading';
import MentorChapterCardMenu from '@/features/mentor/components/course/MentorChapterCardMenu';
import {
  BUILDER_PANEL_SX,
  CHAPTER_THEME,
  LESSON_THEME,
} from '@/features/mentor/components/course/mentorCourseContentStyles';
import { MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import { HEADER_HEIGHT } from '@/shared/layout/MainLayout';
import {
  getFilledTestQuestions,
  getNonEmptyQuestionBankSections,
  getQuestionBankSectionTabLabel,
  getSectionsBySkill,
  isQuestionActive,
  TEST_SKILL_CHIP_COLORS,
  TEST_SKILL_LABELS,
  TEST_SKILL_LISTENING,
  TEST_SKILL_READING,
  TEST_SKILL_WRITING,
} from '@/features/mentor/utils/mentorTestContentUtils';

const OUTLINE_SKILL_ITEMS = [
  { skill: TEST_SKILL_LISTENING, icon: HeadphonesRoundedIcon },
  { skill: TEST_SKILL_READING, icon: MenuBookRoundedIcon },
  { skill: TEST_SKILL_WRITING, icon: EditNoteRoundedIcon },
];

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

export default function MentorQuestionBankOutlinePanel({
  sections = [],
  activeSkill,
  activeSectionId = '',
  onNavigateToItem,
  courseName = '',
  courseCategory = '',
  chapterTitle = '',
  selectedPathName = '',
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
  const filledSections = getNonEmptyQuestionBankSections(sections);
  const hasContentOutline = filledSections.length > 0;

  const handleNavigate = (target) => {
    onNavigateToItem?.(target);
  };

  const selectedChapterName = selectedPathName || chapterTitle;

  return (
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
              {selectedChapterName ? (
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT, mt: 0.35 }}>
                  {selectedChapterName}
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
              {courseChapters.map((path, pathIndex) => {
                const nodes = path.Nodes ?? [];
                const chapterOrder = path.Order ?? pathIndex + 1;
                const isSelected = String(path.PathId) === String(selectedChapterId);

                return (
                  <Box key={path.PathId ?? pathIndex} sx={{ mb: 0.35 }}>
                    <OutlineNavItem
                      label={`Chương ${chapterOrder}: ${path.PathName || `Chương ${chapterOrder}`}`}
                      meta={nodes.length > 0 ? `${nodes.length} bài học` : 'Chưa có bài học'}
                      icon={MenuBookRoundedIcon}
                      iconColor={CHAPTER_THEME.color}
                      selected={isSelected}
                      onClick={() => onChapterSelect?.(String(path.PathId))}
                      trailing={
                        onChapterQuizSetup ? (
                          <MentorChapterCardMenu
                            onQuizSetup={() => onChapterQuizSetup(path, pathIndex)}
                          />
                        ) : null
                      }
                    />
                    {nodes.map((node, nodeIndex) => {
                      const nodeOrder = node.NodeOrder ?? nodeIndex + 1;
                      return (
                        <OutlineNavItem
                          key={node.NodeId ?? nodeIndex}
                          label={`Bài ${nodeOrder}: ${node.NodeName || `Bài ${nodeOrder}`}`}
                          icon={PlayLessonRoundedIcon}
                          iconColor={LESSON_THEME.color}
                          indent={1}
                          disabled
                        />
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
