import { Box, IconButton, InputBase, MenuItem, Select, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import {
  MATERIAL_TYPE_LABELS,
  MATERIAL_TYPES,
  MATERIAL_URL_PLACEHOLDERS,
} from '../../../utils/mentorCourseContentUtils';
import { ContentFieldLabel } from './MentorContentSectionHeading';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import { MATERIAL_TYPE_THEME, contentFieldSx } from './mentorCourseContentStyles';

const TYPE_ICONS = {
  VIDEO: PlayCircleRoundedIcon,
  DOC: DescriptionRoundedIcon,
  TEST: QuizRoundedIcon,
};

const SELECT_MENU_PROPS = {
  PaperProps: {
    sx: {
      mt: 0.75,
      borderRadius: '12px',
      border: '1px solid rgba(15,23,42,0.08)',
      boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
      '& .MuiMenuItem-root': {
        fontSize: 14,
        fontWeight: 500,
        color: TEXT,
        py: 1,
        px: 1.25,
        gap: 1,
      },
    },
  },
};

function MaterialTypeSelect({ value, onChange, disabled }) {
  const typeTheme = MATERIAL_TYPE_THEME[value] ?? MATERIAL_TYPE_THEME.VIDEO;
  const SelectedIcon = TYPE_ICONS[value] ?? PlayCircleRoundedIcon;

  return (
    <Select
      value={value}
      onChange={onChange}
      disabled={disabled}
      displayEmpty
      IconComponent={KeyboardArrowDownRoundedIcon}
      MenuProps={SELECT_MENU_PROPS}
      renderValue={(selected) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, minWidth: 0 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              bgcolor: typeTheme.soft,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <SelectedIcon sx={{ fontSize: 16, color: typeTheme.color }} />
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: TEXT, lineHeight: 1.3 }}>
            {MATERIAL_TYPE_LABELS[selected] ?? 'Chọn loại'}
          </Typography>
        </Box>
      )}
      sx={{
        width: '100%',
        bgcolor: '#fff',
        borderRadius: '10px',
        border: `1px solid ${typeTheme.border}`,
        color: TEXT,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '& .MuiSelect-select': {
          py: 0.85,
          pl: 1.1,
          pr: '32px !important',
          display: 'flex',
          alignItems: 'center',
        },
        '& .MuiSelect-icon': {
          color: MUTED,
          fontSize: 22,
          right: 8,
        },
        '&:hover': {
          borderColor: typeTheme.color,
        },
        '&.Mui-focused': {
          borderColor: typeTheme.color,
          boxShadow: `0 0 0 3px ${typeTheme.soft}`,
        },
        '&.Mui-disabled': {
          opacity: 0.65,
          bgcolor: 'rgba(15,23,42,0.02)',
        },
      }}
    >
      {MATERIAL_TYPES.map((type) => {
        const ItemIcon = TYPE_ICONS[type];
        const itemTheme = MATERIAL_TYPE_THEME[type];
        return (
          <MenuItem key={type} value={type}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: itemTheme.soft,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <ItemIcon sx={{ fontSize: 16, color: itemTheme.color }} />
            </Box>
            {MATERIAL_TYPE_LABELS[type]}
          </MenuItem>
        );
      })}
    </Select>
  );
}

export default function MentorMaterialEditor({
  material,
  errors = {},
  onChange,
  onDelete,
  disabled = false,
}) {
  const typeTheme = MATERIAL_TYPE_THEME[material.MaterialType] ?? MATERIAL_TYPE_THEME.VIDEO;
  const Icon = TYPE_ICONS[material.MaterialType] ?? PlayCircleRoundedIcon;
  const placeholder = MATERIAL_URL_PLACEHOLDERS[material.MaterialType] ?? '';
  const fieldTheme = { color: typeTheme.color, border: 'rgba(15,23,42,0.12)' };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr auto' },
        gap: { xs: 1.25, sm: 1.5 },
        alignItems: 'start',
        p: 1.5,
        borderRadius: '14px',
        bgcolor: typeTheme.bg,
        border: '1px solid rgba(15,23,42,0.08)',
        borderLeft: `3px solid ${typeTheme.color}`,
        boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: { xs: '100%', sm: 168 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              bgcolor: typeTheme.soft,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 18, color: typeTheme.color }} />
          </Box>
          <ContentFieldLabel sx={{ mb: 0 }}>Loại học liệu *</ContentFieldLabel>
        </Box>

        <MaterialTypeSelect
          value={material.MaterialType}
          onChange={(event) => onChange(material.tempId, { MaterialType: event.target.value })}
          disabled={disabled}
        />

        {errors.MaterialType && (
          <Typography sx={{ fontSize: 12, color: '#DC2626', mt: 0.15 }}>
            {errors.MaterialType}
          </Typography>
        )}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <ContentFieldLabel>Tiêu đề *</ContentFieldLabel>
        <Box sx={contentFieldSx(Boolean(errors.Title), fieldTheme)}>
          <InputBase
            value={material.Title}
            onChange={(event) => onChange(material.tempId, { Title: event.target.value })}
            disabled={disabled}
            placeholder="Tên học liệu"
            fullWidth
            sx={{ fontSize: 14, fontWeight: 600, color: TEXT }}
          />
        </Box>
        {errors.Title && (
          <Typography sx={{ fontSize: 12, color: '#DC2626', mt: 0.25 }}>
            {errors.Title}
          </Typography>
        )}

        <ContentFieldLabel sx={{ mt: 1.1 }}>Link học liệu</ContentFieldLabel>
        <Box sx={contentFieldSx(Boolean(errors.MaterialUrl), fieldTheme)}>
          <InputBase
            value={material.MaterialUrl}
            onChange={(event) => onChange(material.tempId, { MaterialUrl: event.target.value })}
            disabled={disabled}
            placeholder={placeholder}
            fullWidth
            sx={{ fontSize: 13, color: TEXT }}
          />
        </Box>
        {errors.MaterialUrl && (
          <Typography sx={{ fontSize: 12, color: '#DC2626', mt: 0.25 }}>
            {errors.MaterialUrl}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-end', sm: 'center' }, pt: { sm: 3.5 } }}>
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
  );
}
