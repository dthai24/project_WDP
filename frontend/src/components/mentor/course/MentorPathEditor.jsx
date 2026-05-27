import { Box, Collapse, IconButton, InputBase, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import MentorNodeEditor from './MentorNodeEditor';
import MentorContentSectionHeading, { MentorContentBlockHeading, ContentFieldLabel } from './MentorContentSectionHeading';
import { CREATE_CARD_SX, MUTED } from './mentorCourseCreateStyles';
import {
  CHAPTER_THEME,
  LESSON_THEME,
  contentAddButtonSx,
  contentFieldSx,
} from './mentorCourseContentStyles';

export default function MentorPathEditor({
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
  disabled = false,
}) {
  return (
    <Box
      sx={{
        ...CREATE_CARD_SX,
        p: 0,
        overflow: 'hidden',
        borderLeft: `4px solid ${CHAPTER_THEME.color}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          bgcolor: CHAPTER_THEME.bg,
          borderBottom: expanded ? `1px solid ${CHAPTER_THEME.border}` : 'none',
        }}
      >
        <IconButton size="small" onClick={onToggle} sx={{ color: CHAPTER_THEME.color }}>
          {expanded ? (
            <ExpandLessRoundedIcon sx={{ fontSize: 22 }} />
          ) : (
            <ExpandMoreRoundedIcon sx={{ fontSize: 22 }} />
          )}
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <MentorContentSectionHeading
            compact
            Icon={MenuBookRoundedIcon}
            meta={`Chương ${pathIndex + 1}`}
            title={path.PathName || 'Chưa đặt tên chương'}
            theme={CHAPTER_THEME}
          />
        </Box>

        <IconButton
          size="small"
          onClick={onDelete}
          disabled={disabled}
          aria-label="Xóa chương"
          sx={{ color: MUTED, '&:hover': { color: '#DC2626', bgcolor: 'rgba(220,38,38,0.06)' } }}
        >
          <DeleteOutlineRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 2, py: 1.75 }}>
          <ContentFieldLabel>Tên chương *</ContentFieldLabel>
          <Box sx={contentFieldSx(Boolean(errors.PathName), CHAPTER_THEME)}>
            <InputBase
              value={path.PathName}
              onChange={(event) => onChange(path.tempId, { PathName: event.target.value })}
              disabled={disabled}
              placeholder="Ví dụ: TOEIC 900+: Chiến lược cao điểm"
              fullWidth
              sx={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}
            />
          </Box>
          {errors.PathName && (
            <Typography sx={{ fontSize: 12, color: '#DC2626', mt: 0.35 }}>
              {errors.PathName}
            </Typography>
          )}

          <ContentFieldLabel sx={{ mt: 1.5 }}>Mô tả chương</ContentFieldLabel>
          <Box sx={contentFieldSx(false, CHAPTER_THEME)}>
            <InputBase
              value={path.Description}
              onChange={(event) => onChange(path.tempId, { Description: event.target.value })}
              disabled={disabled}
              placeholder="Mô tả ngắn cho chương (tuỳ chọn)"
              fullWidth
              multiline
              minRows={2}
              sx={{ fontSize: 14, color: '#0F172A', alignItems: 'flex-start' }}
            />
          </Box>

          <Box
            sx={{
              mt: 2.25,
              pt: 2,
              borderTop: `1px dashed ${LESSON_THEME.border}`,
            }}
          >
            <MentorContentBlockHeading Icon={AssignmentRoundedIcon} label="Bài" theme={LESSON_THEME} />

            {errors._nodes && (
              <Typography sx={{ fontSize: 12, color: '#DC2626', mb: 1 }}>
                {errors._nodes}
              </Typography>
            )}

            {(path.nodes ?? []).length === 0 ? (
              <Typography sx={{ fontSize: 13, color: MUTED, mb: 1.25, lineHeight: 1.5 }}>
                Chưa có bài. Thêm ít nhất một bài cho chương này.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 1.25 }}>
                {(path.nodes ?? []).map((node, nodeIndex) => (
                  <MentorNodeEditor
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
              Thêm bài
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
