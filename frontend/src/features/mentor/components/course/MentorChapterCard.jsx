import { Box, Collapse, IconButton, InputBase, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import AppButton from '@/shared/ui/AppButton';
import MentorLessonBlock from './MentorLessonBlock';
import MentorChapterCardMenu from './MentorChapterCardMenu';
import { ContentFieldLabel, ContentShortDescriptionField } from './MentorContentSectionHeading';
import { MUTED, PRIMARY, TEXT } from './mentorCourseCreateStyles';
import {
  CHAPTER_THEME,
  CONTENT_SECTION_LABEL_SX,
  DELETE_ICON_BTN_SX,
  ICON_BTN_SX,
  chapterCardSx,
  contentAddButtonSx,
  contentFieldSx,
} from './mentorCourseContentStyles';

export default function MentorChapterCard({
  path,
  pathIndex,
  errors = {},
  expanded = true,
  expandedNodes = {},
  onToggle,
  onToggleNode,
  onChange,
  onDelete,
  onAddNode,
  onNodeChange,
  onNodeDelete,
  onAddMaterial,
  onMaterialChange,
  onMaterialDelete,
  onMaterialReorder,
  disabled = false,
  isSaved = false,
  saving = false,
  onSave,
  courseId = null,
  chapterId = null,
  onQuizSetup,
  quizSetupDisabled = false,
  quizSetupDisabledReason = '',
}) {


  console.log("pathsssss", path)

  const nodesNormal = (path.Nodes ?? path.nodes)
  const lessonCount = (nodesNormal ?? []).length;
  return (
    <Box sx={chapterCardSx(expanded)} data-content-error={`chapter-${path.tempId}`}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: expanded ? `1px solid rgba(15,23,42,0.06)` : 'none',
        }}
      >
        <IconButton size="small" onClick={onToggle} sx={ICON_BTN_SX} aria-label="Thu gọn chương">
          {expanded ? (
            <ExpandLessRoundedIcon sx={{ fontSize: 20 }} />
          ) : (
            <ExpandMoreRoundedIcon sx={{ fontSize: 20 }} />
          )}
        </IconButton>

        <MenuBookRoundedIcon sx={{ fontSize: 20, color: PRIMARY, flexShrink: 0 }} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: MUTED, lineHeight: 1.3 }}>
            Chương {pathIndex + 1}
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.35,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {path.PathName || 'Chưa đặt tên chương'}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 12, fontWeight: 500, color: MUTED, flexShrink: 0 }}>
          {lessonCount} bài học
        </Typography>

        <MentorChapterCardMenu
          disabled={disabled}
          quizSetupDisabled={quizSetupDisabled}
          quizSetupDisabledReason={quizSetupDisabledReason}
          onQuizSetup={onQuizSetup}
        />

        <IconButton
          size="small"
          onClick={onDelete}
          disabled={disabled}
          aria-label="Xóa chương"
          sx={DELETE_ICON_BTN_SX}
        >
          <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 2, py: 2.5 }}>
          <ContentFieldLabel>Tên chương *</ContentFieldLabel>
          <Box sx={contentFieldSx(Boolean(errors.PathName), CHAPTER_THEME)}>
            <InputBase
              value={path.PathName}
              onChange={(event) => onChange(path.tempId, { PathName: event.target.value })}
              disabled={disabled}
              placeholder="Ví dụ: TOEIC 900+: Chiến lược cao điểm"
              fullWidth
              sx={{ fontSize: 14, fontWeight: 500, color: TEXT, width: '100%' }}
            />
          </Box>
          {errors.PathName && (
            <Typography sx={{ fontSize: 12, color: '#DC2626', mt: 0.5 }}>
              {errors.PathName}
            </Typography>
          )}

          <ContentShortDescriptionField
            label="Mô tả ngắn"
            value={path.Description}
            onChange={(event) => onChange(path.tempId, { Description: event.target.value })}
            disabled={disabled}
            theme={CHAPTER_THEME}
            placeholder="Mô tả ngắn về nội dung chương (tuỳ chọn)"
            labelSx={{ mt: 2 }}
          />

          <Box sx={{ mt: 3 }}>
            <Typography sx={CONTENT_SECTION_LABEL_SX}>Bài học</Typography>

            {errors._nodes && (
              <Typography sx={{ fontSize: 12, color: '#DC2626', mb: 1 }}>
                {errors._nodes}
              </Typography>
            )}

            {lessonCount === 0 ? (
              <Typography sx={{ fontSize: 13, color: MUTED, mb: 1.5, lineHeight: 1.55 }}>
                Chương này chưa có bài học.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mb: 1.5 }}>
                {(nodesNormal ?? []).map((node, nodeIndex) => (
                  <MentorLessonBlock
                    key={node.tempId}
                    node={node}
                    nodeIndex={nodeIndex}
                    courseId={courseId}
                    chapterId={chapterId}
                    errors={errors.nodes?.[node.tempId] ?? {}}
                    expanded={expandedNodes[node.tempId] !== false}
                    onToggle={() => onToggleNode(node.tempId)}
                    onChange={onNodeChange}
                    onDelete={() => onNodeDelete(path.tempId, node.tempId)}
                    onAddMaterial={() => onAddMaterial(path.tempId, node.tempId)}
                    onMaterialChange={(materialTempId, patch) =>
                      onMaterialChange(path.tempId, node.tempId, materialTempId, patch)
                    }
                    onMaterialDelete={(materialTempId) =>
                      onMaterialDelete(path.tempId, node.tempId, materialTempId)
                    }
                    onMaterialReorder={(fromIndex, toIndex) =>
                      onMaterialReorder(path.tempId, node.tempId, fromIndex, toIndex)
                    }
                    disabled={disabled}
                  />
                ))}
              </Box>
            )}

            <Box
              component="button"
              type="button"
              onClick={onAddNode}
              disabled={disabled}
              sx={{
                ...contentAddButtonSx(),
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.6 : 1,
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 18 }} />
              Thêm bài học
            </Box>

            <Box
              sx={{
                mt: 2.5,
                pt: 2,
                borderTop: '1px solid rgba(15,23,42,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                {isSaved ? (
                  <CheckCircleRoundedIcon sx={{ fontSize: 17, color: '#059669', flexShrink: 0 }} />
                ) : (
                  <CloudOffOutlinedIcon sx={{ fontSize: 17, color: MUTED, flexShrink: 0 }} />
                )}
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: isSaved ? '#059669' : MUTED,
                    lineHeight: 1.4,
                  }}
                >
                  {isSaved ? 'Chương đã lưu' : 'Chưa lưu'}
                </Typography>
              </Box>

              <AppButton
                variant="outlined"
                onClick={onSave}
                loading={saving}
                disabled={disabled}
                sx={{
                  height: 36,
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: 13,
                  px: 2,
                  borderColor: 'rgba(15,23,42,0.12)',
                  color: TEXT,
                  '&:hover': {
                    borderColor: PRIMARY,
                    bgcolor: 'rgba(8,145,178,0.04)',
                  },
                }}
              >
                Lưu chương
              </AppButton>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
