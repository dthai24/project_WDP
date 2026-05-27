import { Box, Collapse, IconButton, InputBase, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MentorMaterialRow from './MentorMaterialRow';
import { ContentFieldLabel } from './MentorContentSectionHeading';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import {
  LESSON_THEME,
  contentAddButtonSx,
  contentFieldSx,
  lessonBlockSx,
} from './mentorCourseContentStyles';

export default function MentorLessonBlock({
  node,
  nodeIndex,
  errors = {},
  expanded = true,
  onToggle,
  onChange,
  onDelete,
  onAddMaterial,
  onMaterialChange,
  onMaterialDelete,
  disabled = false,
}) {
  const materialCount = (node.materials ?? []).length;

  return (
    <Box sx={lessonBlockSx()} data-content-error={`lesson-${node.tempId}`}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          py: 1,
          pr: 0.5,
        }}
      >
        <IconButton size="small" onClick={onToggle} sx={{ color: LESSON_THEME.color, p: 0.4 }}>
          {expanded ? (
            <ExpandLessRoundedIcon sx={{ fontSize: 18 }} />
          ) : (
            <ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>

        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '8px',
            bgcolor: LESSON_THEME.bg,
            border: `1px solid ${LESSON_THEME.border}`,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <AssignmentRoundedIcon sx={{ fontSize: 16, color: LESSON_THEME.color }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: MUTED, lineHeight: 1.3 }}>
            Bài {nodeIndex + 1}
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 700,
              color: TEXT,
              lineHeight: 1.35,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {node.NodeName || 'Chưa đặt tên bài học'}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 12, fontWeight: 600, color: MUTED, flexShrink: 0 }}>
          {materialCount} học liệu
        </Typography>

        <IconButton
          size="small"
          onClick={onDelete}
          disabled={disabled}
          aria-label="Xóa bài học"
          sx={{ color: MUTED, '&:hover': { color: '#DC2626', bgcolor: 'rgba(220,38,38,0.06)' } }}
        >
          <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ pb: 1.25, pr: { xs: 0.5, sm: 1 } }}>
          <ContentFieldLabel>Tên bài học *</ContentFieldLabel>
          <Box sx={contentFieldSx(Boolean(errors.NodeName), LESSON_THEME)}>
            <InputBase
              value={node.NodeName}
              onChange={(event) => onChange(node.tempId, { NodeName: event.target.value })}
              disabled={disabled}
              placeholder="Ví dụ: Bài 1 — Giới thiệu"
              fullWidth
              sx={{ fontSize: 14, fontWeight: 600, color: TEXT }}
            />
          </Box>
          {errors.NodeName && (
            <Typography sx={{ fontSize: 12, color: '#DC2626', mt: 0.35 }}>
              {errors.NodeName}
            </Typography>
          )}

          <ContentFieldLabel sx={{ mt: 1.1 }}>Mô tả bài học</ContentFieldLabel>
          <Box sx={contentFieldSx(false, LESSON_THEME)}>
            <InputBase
              value={node.Description}
              onChange={(event) => onChange(node.tempId, { Description: event.target.value })}
              disabled={disabled}
              placeholder="Mô tả ngắn (tuỳ chọn)"
              fullWidth
              multiline
              minRows={2}
              sx={{ fontSize: 13, color: TEXT, alignItems: 'flex-start' }}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            {materialCount === 0 ? (
              <Typography sx={{ fontSize: 13, color: MUTED, mb: 0.75, lineHeight: 1.5 }}>
                Bài học này chưa có học liệu.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                {(node.materials ?? []).map((material) => (
                  <MentorMaterialRow
                    key={material.tempId}
                    material={material}
                    errors={errors.materials?.[material.tempId] ?? {}}
                    onChange={onMaterialChange}
                    onDelete={onMaterialDelete}
                    disabled={disabled}
                  />
                ))}
              </Box>
            )}

            <Box
              component="button"
              type="button"
              onClick={onAddMaterial}
              disabled={disabled}
              sx={{
                ...contentAddButtonSx(LESSON_THEME),
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.6 : 1,
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 16 }} />
              Thêm học liệu
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
