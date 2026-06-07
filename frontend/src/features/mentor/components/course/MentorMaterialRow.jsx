import { Box, IconButton, InputBase, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import {
  getDocDefaultFields,
  getVideoDefaultFields,
  MATERIAL_URL_LABELS,
  MATERIAL_URL_PLACEHOLDERS,
} from '@/features/mentor/utils/mentorCourseContentUtils';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import {
  CONTENT_FIELD_LABEL_SX,
  DELETE_ICON_BTN_SX,
  contentInputSx,
  materialRowSx,
} from './mentorCourseContentStyles';
import { ContentFieldLabel } from './MentorContentSectionHeading';
import MentorMaterialTypeSelect from './MentorMaterialTypeSelect';
import MentorTextMaterialEditor from './MentorTextMaterialEditor';
import MentorDocumentMaterialEditor from './MentorDocumentMaterialEditor';
import MentorVideoMaterialEditor from './MentorVideoMaterialEditor';

function buildTypeChangePatch(currentType, nextType) {
  const patch = { MaterialType: nextType };

  if (nextType === 'TEXT') {
    patch.MaterialUrl = '';
    patch.EmbedUrl = null;
    patch.SourceType = undefined;
    patch.File = null;
    patch.FileName = null;
    patch.FileSize = null;
  } else if (nextType === 'DOC') {
    patch.Content = '';
    patch.EmbedUrl = null;
    Object.assign(patch, getDocDefaultFields());
  } else if (nextType === 'VIDEO') {
    patch.Content = '';
    patch.File = null;
    patch.FileName = null;
    patch.FileSize = null;
    Object.assign(patch, getVideoDefaultFields());
  } else if (currentType === 'TEXT') {
    patch.Content = '';
  } else if (currentType === 'DOC') {
    patch.SourceType = undefined;
    patch.File = null;
    patch.FileName = null;
    patch.FileSize = null;
    patch.MaterialUrl = '';
    patch.EmbedUrl = null;
  } else if (currentType === 'VIDEO') {
    patch.EmbedUrl = null;
    patch.MaterialUrl = '';
  }

  return patch;
}

export default function MentorMaterialRow({
  material,
  materialIndex = 0,
  errors = {},
  onChange,
  onDelete,
  disabled = false,
  showDragHandle = false,
  isDragging = false,
  isDragOver = false,
  onDragHandleStart,
  onDragHandleEnd,
  onDragOver,
  onDrop,
  courseId = null,
  chapterId = null,
}) {
  const isText = material.MaterialType === 'TEXT';
  const isDoc = material.MaterialType === 'DOC';
  const isVideo = material.MaterialType === 'VIDEO';
  const showUrlField = !isText && !isDoc && !isVideo;
  const placeholder = MATERIAL_URL_PLACEHOLDERS[material.MaterialType] ?? '';
  const urlLabel = MATERIAL_URL_LABELS[material.MaterialType] ?? 'Link';

  return (
    <Box
      data-content-error={`material-${material.tempId}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      sx={{
        ...materialRowSx(isDragOver),
        opacity: isDragging ? 0.45 : 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1.25,
        }}
      >
        <Typography sx={{ ...CONTENT_FIELD_LABEL_SX, mb: 0, fontWeight: 700 }}>
          Học liệu {materialIndex + 1}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          {showDragHandle ? (
            <Box
              draggable
              onDragStart={onDragHandleStart}
              onDragEnd={onDragHandleEnd}
              aria-label="Kéo để đổi thứ tự học liệu"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                color: MUTED,
                cursor: 'grab',
                touchAction: 'none',
                userSelect: 'none',
                '&:active': { cursor: 'grabbing' },
                '&:hover': { color: TEXT },
              }}
            >
              <DragIndicatorRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
          ) : null}
          <IconButton
            size="small"
            onClick={() => onDelete(material.tempId)}
            disabled={disabled}
            aria-label="Xóa học liệu"
            sx={DELETE_ICON_BTN_SX}
          >
            <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'minmax(140px, 180px) minmax(0, 1fr)' },
          gap: { xs: 1.5, sm: 1.75 },
          alignItems: 'start',
        }}
      >
        <Box>
          <ContentFieldLabel>Loại học liệu</ContentFieldLabel>
          <MentorMaterialTypeSelect
            value={material.MaterialType}
            onChange={(event) =>
              onChange(
                material.tempId,
                buildTypeChangePatch(material.MaterialType, event.target.value),
              )
            }
            disabled={disabled}
            error={Boolean(errors.MaterialType)}
          />
          {errors.MaterialType && (
            <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.35 }}>
              {errors.MaterialType}
            </Typography>
          )}
        </Box>

        <Box>
          <ContentFieldLabel>Tiêu đề{isText ? '' : ' *'}</ContentFieldLabel>
          <InputBase
            value={material.Title}
            onChange={(event) => onChange(material.tempId, { Title: event.target.value })}
            disabled={disabled}
            placeholder={
              isText
                ? 'Ví dụ: Đoạn văn về chủ đề du lịch (tuỳ chọn)'
                : isDoc
                  ? 'Ví dụ: Slide bài giảng tuần 1'
                  : 'Ví dụ: Video giới thiệu bài học'
            }
            fullWidth
            sx={contentInputSx(Boolean(errors.Title))}
          />
          {errors.Title && (
            <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.35 }}>{errors.Title}</Typography>
          )}
        </Box>
      </Box>

      {showUrlField && (
        <Box sx={{ mt: 1.5 }}>
          <ContentFieldLabel>{urlLabel}</ContentFieldLabel>
          <InputBase
            value={material.MaterialUrl}
            onChange={(event) => onChange(material.tempId, { MaterialUrl: event.target.value })}
            disabled={disabled}
            placeholder={placeholder}
            fullWidth
            sx={contentInputSx(Boolean(errors.MaterialUrl))}
          />
          {errors.MaterialUrl && (
            <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.35 }}>
              {errors.MaterialUrl}
            </Typography>
          )}
        </Box>
      )}

      {isVideo && (
        <Box sx={{ mt: 1.5 }}>
          <MentorVideoMaterialEditor
            material={material}
            errors={errors}
            onChange={onChange}
            disabled={disabled}
          />
        </Box>
      )}

      {isDoc && (
        <Box sx={{ mt: 1.5 }}>
          <MentorDocumentMaterialEditor
            material={material}
            errors={errors}
            onChange={onChange}
            disabled={disabled}
          />
        </Box>
      )}

      {isText && (
        <Box sx={{ mt: 1.5 }}>
          <MentorTextMaterialEditor
            material={material}
            errors={errors}
            onChange={onChange}
            disabled={disabled}
          />
        </Box>
      )}
    </Box>
  );
}
