import { Box, IconButton, InputBase, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { MATERIAL_URL_PLACEHOLDERS } from '../../../utils/mentorCourseContentUtils';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import { MATERIAL_TYPE_THEME } from './mentorCourseContentStyles';
import { ContentFieldLabel } from './MentorContentSectionHeading';
import MentorMaterialTypeSelect from './MentorMaterialTypeSelect';
import MentorTextMaterialEditor from './MentorTextMaterialEditor';

function buildTypeChangePatch(currentType, nextType) {
  const patch = { MaterialType: nextType };
  if (nextType === 'TEXT') {
    patch.MaterialUrl = '';
  } else if (currentType === 'TEXT') {
    patch.Content = '';
  }
  return patch;
}

export default function MentorMaterialRow({
  material,
  errors = {},
  onChange,
  onDelete,
  disabled = false,
}) {
  const isText = material.MaterialType === 'TEXT';
  const typeTheme = MATERIAL_TYPE_THEME[material.MaterialType] ?? MATERIAL_TYPE_THEME.VIDEO;
  const placeholder = MATERIAL_URL_PLACEHOLDERS[material.MaterialType] ?? '';

  return (
    <Box
      data-content-error={`material-${material.tempId}`}
      sx={{
        py: 1.75,
        px: { xs: 0.5, sm: 0.75 },
        borderBottom: '1px dashed rgba(15,23,42,0.08)',
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

        <Box sx={{ flex: 1, minWidth: 0, pt: { sm: 2.5 } }}>
          <InputBase
            value={material.Title}
            onChange={(event) => onChange(material.tempId, { Title: event.target.value })}
            disabled={disabled}
            placeholder={isText ? 'Ví dụ: Đoạn đọc về chủ đề du lịch' : 'Tiêu đề học liệu *'}
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

        {!isText && (
          <Box
            sx={{
              flex: { xs: 'none', sm: 1.2 },
              minWidth: 0,
              width: { xs: '100%', sm: 'auto' },
              pt: { sm: 2.5 },
            }}
          >
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
            alignSelf: { sm: isText ? 'flex-start' : 'center' },
            pt: { sm: isText ? 2.5 : 0 },
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

      {isText && (
        <MentorTextMaterialEditor
          material={material}
          errors={errors}
          onChange={onChange}
          disabled={disabled}
        />
      )}
    </Box>
  );
}
