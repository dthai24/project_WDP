import { Box, MenuItem, Select, Typography } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import { TEXT } from './mentorCourseCreateStyles';

const PRIMARY = '#0891B2';
const PRIMARY_SELECTED = '#0E7490';

// TODO: update backend/DB MaterialType to support TEXT
export const MATERIAL_TYPE_SELECT_OPTIONS = [
  { value: 'VIDEO', label: 'Video', icon: PlayCircleRoundedIcon, color: '#E11D48', soft: 'rgba(225,29,72,0.10)' },
  { value: 'TEXT', label: 'Văn bản', icon: ArticleRoundedIcon, color: '#0891B2', soft: 'rgba(8,145,178,0.10)' },
  { value: 'DOC', label: 'Tài liệu', icon: DescriptionRoundedIcon, color: '#2563EB', soft: 'rgba(37,99,235,0.10)' },
];

function getOption(value) {
  return MATERIAL_TYPE_SELECT_OPTIONS.find((opt) => opt.value === value) ?? MATERIAL_TYPE_SELECT_OPTIONS[0];
}

function TypeOptionIcon({ opt, size = 'md' }) {
  const Icon = opt.icon;
  const dim = size === 'sm' ? 22 : 24;
  const iconSize = size === 'sm' ? 16 : 18;

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        borderRadius: '6px',
        bgcolor: opt.soft,
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: iconSize, color: opt.color }} />
    </Box>
  );
}

export default function MentorMaterialTypeSelect({
  value,
  onChange,
  disabled = false,
  error = false,
}) {
  const selected = getOption(value);

  return (
    <Select
      value={value}
      onChange={onChange}
      disabled={disabled}
      IconComponent={KeyboardArrowDownRoundedIcon}
      renderValue={() => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, overflow: 'hidden' }}>
          <TypeOptionIcon opt={selected} size="sm" />
          <Typography
            component="span"
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {selected.label}
          </Typography>
        </Box>
      )}
      MenuProps={{
        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
        transformOrigin: { vertical: 'top', horizontal: 'left' },
        marginThreshold: 8,
        PaperProps: {
          sx: {
            mt: 1,
            borderRadius: '16px',
            border: '1px solid rgba(15,23,42,0.08)',
            boxShadow: '0 8px 24px rgba(15,23,42,0.08), 0 2px 8px rgba(15,23,42,0.04)',
            overflow: 'hidden',
          },
        },
        MenuListProps: {
          sx: { py: '6px', px: '6px' },
        },
      }}
      sx={{
        width: '100%',
        height: 40,
        borderRadius: '14px',
        bgcolor: '#fff',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: error ? '#DC2626' : 'rgba(15,23,42,0.10)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: error ? '#DC2626' : 'rgba(15,23,42,0.16)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: error ? '#DC2626' : PRIMARY,
          borderWidth: 1,
        },
        '& .MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          py: 0,
          pl: 1,
          pr: '28px !important',
          minHeight: '40px !important',
          boxSizing: 'border-box',
        },
        '& .MuiSelect-icon': {
          fontSize: 18,
          color: '#64748B',
          right: 8,
          top: 'calc(50% - 9px)',
        },
      }}
    >
      {MATERIAL_TYPE_SELECT_OPTIONS.map((opt) => {
        const isSelected = opt.value === value;

        return (
          <MenuItem
            key={opt.value}
            value={opt.value}
            sx={{
              borderRadius: '12px',
              minHeight: 40,
              height: 40,
              px: 1.25,
              py: 0,
              mb: 0.25,
              gap: 1,
              '&:last-of-type': { mb: 0 },
              '&:hover': { bgcolor: 'rgba(8,145,178,0.08)' },
              '&.Mui-selected': {
                bgcolor: 'rgba(8,145,178,0.10)',
                color: PRIMARY_SELECTED,
                '&:hover': { bgcolor: 'rgba(8,145,178,0.12)' },
              },
              '&.Mui-selected > .MuiSvgIcon-root': {
                display: 'none',
              },
            }}
          >
            <TypeOptionIcon opt={opt} />
            <Typography
              component="span"
              sx={{
                fontSize: 13,
                fontWeight: isSelected ? 600 : 500,
                color: isSelected ? PRIMARY_SELECTED : TEXT,
                lineHeight: 1.2,
              }}
            >
              {opt.label}
            </Typography>
          </MenuItem>
        );
      })}
    </Select>
  );
}
