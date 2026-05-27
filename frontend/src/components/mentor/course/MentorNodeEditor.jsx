import { Box, Collapse, IconButton, InputBase, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CollectionsBookmarkRoundedIcon from '@mui/icons-material/CollectionsBookmarkRounded';
import MentorMaterialEditor from './MentorMaterialEditor';
import MentorContentSectionHeading, { MentorContentBlockHeading, ContentFieldLabel } from './MentorContentSectionHeading';
import { MUTED } from './mentorCourseCreateStyles';
import {
  LESSON_THEME,
  MATERIAL_SECTION_THEME,
  contentAddButtonSx,
  contentFieldSx,
} from './mentorCourseContentStyles';

export default function MentorNodeEditor({
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
  return (
    <Box
      sx={{
        borderRadius: '16px',
        border: `1px solid ${LESSON_THEME.border}`,
        bgcolor: '#fff',
        overflow: 'hidden',
        borderLeft: `3px solid ${LESSON_THEME.color}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.25,
          py: 1.1,
          bgcolor: LESSON_THEME.bg,
          borderBottom: expanded ? `1px solid ${LESSON_THEME.border}` : 'none',
        }}
      >
        <IconButton size="small" onClick={onToggle} sx={{ color: LESSON_THEME.color }}>
          {expanded ? (
            <ExpandLessRoundedIcon sx={{ fontSize: 20 }} />
          ) : (
            <ExpandMoreRoundedIcon sx={{ fontSize: 20 }} />
          )}
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <MentorContentSectionHeading
            compact
            Icon={AssignmentRoundedIcon}
            meta={`Bài ${nodeIndex + 1}`}
            title={node.NodeName || 'Chưa đặt tên bài'}
            theme={LESSON_THEME}
          />
        </Box>

        <IconButton
          size="small"
          onClick={onDelete}
          disabled={disabled}
          aria-label="Xóa bài"
          sx={{ color: MUTED, '&:hover': { color: '#DC2626', bgcolor: 'rgba(220,38,38,0.06)' } }}
        >
          <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 1.5 }}>
          <ContentFieldLabel>Tên bài *</ContentFieldLabel>
          <Box sx={contentFieldSx(Boolean(errors.NodeName), LESSON_THEME)}>
            <InputBase
              value={node.NodeName}
              onChange={(event) => onChange(node.tempId, { NodeName: event.target.value })}
              disabled={disabled}
              placeholder="Ví dụ: Bài 1 — Giới thiệu"
              fullWidth
              sx={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}
            />
          </Box>
          {errors.NodeName && (
            <Typography sx={{ fontSize: 12, color: '#DC2626', mt: 0.35, mb: 1 }}>
              {errors.NodeName}
            </Typography>
          )}

          <ContentFieldLabel sx={{ mt: 1.25 }}>Mô tả</ContentFieldLabel>
          <Box sx={contentFieldSx(false, LESSON_THEME)}>
            <InputBase
              value={node.Description}
              onChange={(event) => onChange(node.tempId, { Description: event.target.value })}
              disabled={disabled}
              placeholder="Mô tả ngắn cho bài (tuỳ chọn)"
              fullWidth
              multiline
              minRows={2}
              sx={{ fontSize: 14, color: '#0F172A', alignItems: 'flex-start' }}
            />
          </Box>

          <Box
            sx={{
              mt: 1.75,
              pt: 1.5,
              borderTop: `1px dashed ${MATERIAL_SECTION_THEME.border}`,
            }}
          >
            <MentorContentBlockHeading
              Icon={CollectionsBookmarkRoundedIcon}
              label="Học liệu"
              theme={MATERIAL_SECTION_THEME}
            />

            {(node.materials ?? []).length === 0 ? (
              <Typography sx={{ fontSize: 13, color: MUTED, mb: 1, lineHeight: 1.5 }}>
                Chưa có học liệu. Thêm video, tài liệu hoặc bài kiểm tra.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                {(node.materials ?? []).map((material) => (
                  <MentorMaterialEditor
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
                ...contentAddButtonSx(MATERIAL_SECTION_THEME),
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
