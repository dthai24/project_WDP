import { useCallback, useState } from 'react';
import { Box, Collapse, IconButton, InputBase, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import {
  countLearningMaterials,
  filterLearningMaterials,
} from '@/features/mentor/utils/mentorCourseContentUtils';
import MentorMaterialRow from './MentorMaterialRow';
import { ContentFieldLabel, ContentShortDescriptionField } from './MentorContentSectionHeading';
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
  onMaterialReorder,
  disabled = false,
  courseId = null,
  chapterId = null,
}) {
  const materials = filterLearningMaterials(node.materials ?? []);
  const materialCount = countLearningMaterials(node.materials);
  const canReorder = materialCount > 1 && !disabled;

  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const resetDragState = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  const handleDragStart = useCallback(
    (index) => (event) => {
      if (!canReorder) return;
      setDragIndex(index);
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    },
    [canReorder],
  );

  const handleDragOver = useCallback(
    (index) => (event) => {
      if (!canReorder || dragIndex === null) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      if (overIndex !== index) setOverIndex(index);
    },
    [canReorder, dragIndex, overIndex],
  );

  const handleDrop = useCallback(
    (index) => (event) => {
      if (!canReorder) return;
      event.preventDefault();
      const fromIndex =
        dragIndex ?? Number.parseInt(event.dataTransfer.getData('text/plain'), 10);
      if (Number.isNaN(fromIndex) || fromIndex === index) {
        resetDragState();
        return;
      }
      onMaterialReorder(fromIndex, index);
      resetDragState();
    },
    [canReorder, dragIndex, onMaterialReorder, resetDragState],
  );

  const handleDragEnd = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

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

          <ContentShortDescriptionField
            label="Mô tả ngắn"
            value={node.Description}
            onChange={(event) => onChange(node.tempId, { Description: event.target.value })}
            disabled={disabled}
            theme={LESSON_THEME}
            placeholder="Mô tả ngắn về nội dung bài học (tuỳ chọn)"
            labelSx={{ mt: 1.1 }}
          />

          <Box sx={{ mt: 2 }}>
            {materialCount === 0 ? (
              <Typography sx={{ fontSize: 13, color: MUTED, mb: 0.75, lineHeight: 1.5 }}>
                Bài học này chưa có học liệu.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                {materials.map((material, materialIndex) => (
                  <MentorMaterialRow
                    key={material.tempId}
                    material={material}
                    errors={errors.materials?.[material.tempId] ?? {}}
                    onChange={onMaterialChange}
                    onDelete={onMaterialDelete}
                    disabled={disabled}
                    courseId={courseId}
                    chapterId={chapterId}
                    showDragHandle={canReorder}
                    isDragging={dragIndex === materialIndex}
                    isDragOver={overIndex === materialIndex && dragIndex !== materialIndex}
                    onDragHandleStart={handleDragStart(materialIndex)}
                    onDragHandleEnd={handleDragEnd}
                    onDragOver={handleDragOver(materialIndex)}
                    onDrop={handleDrop(materialIndex)}
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
