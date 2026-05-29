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
import { ContentFieldLabel, ContentShortDescriptionField } from './MentorContentSectionHeading';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import {
  CHAPTER_THEME,
  CHAPTER_HEADER_BG,
  LESSON_THEME,
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
}) {
  const lessonCount = (path.nodes ?? []).length;

  return (
    <Box sx={chapterCardSx(expanded)} data-content-error={`chapter-${path.tempId}`}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1.25,
          bgcolor: CHAPTER_HEADER_BG,
          borderBottom: expanded ? '1px solid rgba(15,23,42,0.06)' : 'none',
        }}
      >
        <IconButton size="small" onClick={onToggle} sx={{ color: CHAPTER_THEME.color, p: 0.5 }}>
          {expanded ? (
            <ExpandLessRoundedIcon sx={{ fontSize: 20 }} />
          ) : (
            <ExpandMoreRoundedIcon sx={{ fontSize: 20 }} />
          )}
        </IconButton>

        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: CHAPTER_THEME.bg,
            border: `1px solid ${CHAPTER_THEME.border}`,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <MenuBookRoundedIcon sx={{ fontSize: 18, color: CHAPTER_THEME.color }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: MUTED, lineHeight: 1.3 }}>
            Chương {pathIndex + 1}
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 700,
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

        <Typography sx={{ fontSize: 12, fontWeight: 600, color: MUTED, flexShrink: 0 }}>
          {lessonCount} bài học
        </Typography>

        <IconButton
          size="small"
          onClick={onDelete}
          disabled={disabled}
          aria-label="Xóa chương"
          sx={{ color: MUTED, '&:hover': { color: '#DC2626', bgcolor: 'rgba(220,38,38,0.06)' } }}
        >
          <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 1.75, py: 1.5 }}>
          <ContentFieldLabel>Tên chương *</ContentFieldLabel>
          <Box sx={contentFieldSx(Boolean(errors.PathName), CHAPTER_THEME)}>
            <InputBase
              value={path.PathName}
              onChange={(event) => onChange(path.tempId, { PathName: event.target.value })}
              disabled={disabled}
              placeholder="Ví dụ: TOEIC 900+: Chiến lược cao điểm"
              fullWidth
              sx={{ fontSize: 15, fontWeight: 700, color: TEXT }}
            />
          </Box>
          {errors.PathName && (
            <Typography sx={{ fontSize: 12, color: '#DC2626', mt: 0.35 }}>
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
            labelSx={{ mt: 1.25 }}
          />

          <Box sx={{ mt: 2 }}>
            {errors._nodes && (
              <Typography sx={{ fontSize: 12, color: '#DC2626', mb: 0.75 }}>
                {errors._nodes}
              </Typography>
            )}

            {lessonCount === 0 ? (
              <Typography sx={{ fontSize: 13, color: MUTED, mb: 1, lineHeight: 1.5 }}>
                Chương này chưa có bài học.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1 }}>
                {(path.nodes ?? []).map((node, nodeIndex) => (
                  <MentorLessonBlock
                    key={node.tempId}
                    node={node}
                    nodeIndex={nodeIndex}
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
                ...contentAddButtonSx(LESSON_THEME),
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.6 : 1,
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 18 }} />
              Thêm bài học
            </Box>

            <Box
              sx={{
                mt: 2,
                pt: 1.75,
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
                  <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#059669', flexShrink: 0 }} />
                ) : (
                  <CloudOffOutlinedIcon sx={{ fontSize: 18, color: '#D97706', flexShrink: 0 }} />
                )}
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isSaved ? '#059669' : '#D97706',
                    lineHeight: 1.4,
                  }}
                >
                  {isSaved ? 'Chương đã lưu' : 'Chương chưa lưu'}
                </Typography>
              </Box>

              <AppButton
                variant="outlined"
                onClick={onSave}
                loading={saving}
                disabled={disabled}
                sx={{
                  height: 36,
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: 13,
                  px: 2,
                  borderColor: CHAPTER_THEME.border,
                  color: CHAPTER_THEME.color,
                  '&:hover': {
                    borderColor: CHAPTER_THEME.color,
                    bgcolor: CHAPTER_THEME.bg,
                  },
                }}
              >
                Lưu
              </AppButton>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
