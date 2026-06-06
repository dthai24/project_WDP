import { Box, IconButton, InputBase, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import {
  getDocDefaultFields,
  getTestDefaultFields,
  getVideoDefaultFields,
  MATERIAL_URL_LABELS,
  MATERIAL_URL_PLACEHOLDERS,
} from '@/features/mentor/utils/mentorCourseContentUtils';
import MentorTestMaterialEditor from './MentorTestMaterialEditor';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import { MATERIAL_TYPE_THEME } from './mentorCourseContentStyles';
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
  } else if (nextType === 'TEST') {
    patch.Content = '';
    patch.File = null;
    patch.FileName = null;
    patch.FileSize = null;
    patch.EmbedUrl = null;
    patch.SourceType = undefined;
    Object.assign(patch, getTestDefaultFields());
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
  } else if (currentType === 'TEST') {
    patch.Description = undefined;
    patch.Sections = undefined;
    patch.TotalScore = undefined;
    patch.ScoringMode = undefined;
    patch.QuestionBankId = undefined;
    patch.QuestionBankTitle = undefined;
    patch.QuestionBankScope = undefined;
    patch.TestSource = undefined;
    patch.FinalTestConfig = undefined;
    patch.TestSkill = undefined;
    patch.AudioUrl = undefined;
    patch.Questions = undefined;
    patch.MaterialUrl = '';
  }

  return patch;
}

export default function MentorMaterialRow({
  material,
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
  const isTest = material.MaterialType === 'TEST';
  const showUrlField = !isText && !isDoc && !isVideo && !isTest;
  const typeTheme = MATERIAL_TYPE_THEME[material.MaterialType] ?? MATERIAL_TYPE_THEME.VIDEO;
  const placeholder = MATERIAL_URL_PLACEHOLDERS[material.MaterialType] ?? '';
  const urlLabel = MATERIAL_URL_LABELS[material.MaterialType] ?? 'Link';
  const fieldLabelSx = { mb: 0.5, fontSize: 12, fontWeight: 700, color: '#64748B' };

  return (
    <Box
      data-content-error={`material-${material.tempId}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      sx={{
        py: 1.75,
        px: { xs: 0.5, sm: 0.75 },
        borderBottom: '1px dashed rgba(15,23,42,0.08)',
        borderTop: isDragOver ? `2px solid ${typeTheme.color}` : '2px solid transparent',
        opacity: isDragging ? 0.45 : 1,
        transition: 'opacity 0.15s ease, border-color 0.15s ease',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          gap: { xs: 1.25, sm: 1.25 },
        }}
      >
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
              width: { xs: '100%', sm: 28 },
              minWidth: { sm: 28 },
              flexShrink: 0,
              alignSelf: { sm: 'flex-start' },
              pt: { sm: 2.5 },
              color: MUTED,
              cursor: 'grab',
              touchAction: 'none',
              userSelect: 'none',
              '&:active': { cursor: 'grabbing' },
              '&:hover': { color: typeTheme.color },
            }}
          >
            <DragIndicatorRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
        ) : null}
        <Box
          sx={{
            width: { xs: '100%', sm: 160 },
            minWidth: { sm: 150 },
            maxWidth: { sm: 170 },
            flexShrink: 0,
          }}
        >
          <ContentFieldLabel sx={{ mb: 0.5, fontSize: 12, fontWeight: 700, color: '#64748B' }}>
            Loại học liệu
          </ContentFieldLabel>
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
            <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.25 }}>{errors.MaterialType}</Typography>
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ContentFieldLabel sx={fieldLabelSx}>
            Tiêu đề{isText ? '' : ' *'}
          </ContentFieldLabel>
          <InputBase
            value={material.Title}
            onChange={(event) => onChange(material.tempId, { Title: event.target.value })}
            disabled={disabled}
            placeholder={
              isText
                ? 'Ví dụ: Đoạn văn về chủ đề du lịch (tuỳ chọn)'
                : isDoc
                  ? 'Ví dụ: Slide bài giảng tuần 1'
                  : isTest
                    ? 'Ví dụ: Bài kiểm tra đọc hiểu tuần 1'
                    : 'Ví dụ: Video giới thiệu bài học'
            }
            fullWidth
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: TEXT,
              px: 1,
              py: 0.65,
              borderRadius: '10px',
              border: `1px solid ${errors.Title ? '#DC2626' : 'rgba(15,23,42,0.12)'}`,
              bgcolor: '#fff',
              '&:focus-within': { borderColor: errors.Title ? '#DC2626' : typeTheme.color },
            }}
          />
          {errors.Title && (
            <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.25 }}>{errors.Title}</Typography>
          )}
        </Box>

        {showUrlField && (
          <Box
            sx={{
              flex: { xs: 'none', sm: 1.2 },
              minWidth: 0,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <ContentFieldLabel sx={fieldLabelSx}>{urlLabel}</ContentFieldLabel>
            <InputBase
              value={material.MaterialUrl}
              onChange={(event) => onChange(material.tempId, { MaterialUrl: event.target.value })}
              disabled={disabled}
              placeholder={placeholder}
              fullWidth
              sx={{
                fontSize: 13,
                color: TEXT,
                px: 1,
                py: 0.65,
                borderRadius: '10px',
                border: `1px solid ${errors.MaterialUrl ? '#DC2626' : 'rgba(15,23,42,0.12)'}`,
                bgcolor: '#fff',
                '&:focus-within': { borderColor: errors.MaterialUrl ? '#DC2626' : typeTheme.color },
              }}
            />
            {errors.MaterialUrl && (
              <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.25 }}>{errors.MaterialUrl}</Typography>
            )}
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: { xs: 'flex-end', sm: 'center' },
            alignItems: 'center',
            width: { sm: 40 },
            flexShrink: 0,
            alignSelf: { sm: 'flex-start' },
            pt: { sm: 2.5 },
            mt: { xs: -0.25, sm: 0 },
          }}
        >
          <IconButton
            size="small"
            onClick={() => onDelete(material.tempId)}
            disabled={disabled}
            aria-label="Xóa học liệu"
            sx={{ color: MUTED, '&:hover': { color: '#DC2626', bgcolor: 'rgba(220,38,38,0.06)' } }}
          >
            <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {isVideo && (
        <MentorVideoMaterialEditor
          material={material}
          errors={errors}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {isDoc && (
        <MentorDocumentMaterialEditor
          material={material}
          errors={errors}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {isText && (
        <MentorTextMaterialEditor
          material={material}
          errors={errors}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {isTest && (
        <MentorTestMaterialEditor
          material={material}
          errors={errors}
          onChange={onChange}
          disabled={disabled}
          courseId={courseId}
          chapterId={chapterId}
        />
      )}
    </Box>
  );
}
