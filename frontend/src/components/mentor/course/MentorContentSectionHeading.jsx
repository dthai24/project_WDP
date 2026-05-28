import { Box, InputBase, Typography } from '@mui/material';
import { CONTENT_SHORT_DESCRIPTION_MAX } from '../../../utils/mentorCourseContentUtils';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import { CONTENT_CARD_META_SX, CONTENT_CARD_TITLE_SX, contentFieldSx } from './mentorCourseContentStyles';

export function ContentFieldLabel({ children, sx }) {
  return (
    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B', mb: 0.5, lineHeight: 1.35, ...sx }}>
      {children}
    </Typography>
  );
}

export function ContentShortDescriptionField({
  label = 'Mô tả ngắn',
  value,
  onChange,
  disabled = false,
  theme,
  placeholder = 'Mô tả ngắn (tuỳ chọn)',
  maxLength = CONTENT_SHORT_DESCRIPTION_MAX,
  labelSx,
  containerSx,
}) {
  const charCount = String(value ?? '').length;

  const handleChange = (event) => {
    const next = event.target.value.slice(0, maxLength);
    if (next === event.target.value) {
      onChange(event);
      return;
    }
    onChange({ ...event, target: { ...event.target, value: next } });
  };

  return (
    <Box sx={containerSx}>
      <ContentFieldLabel sx={labelSx}>{label}</ContentFieldLabel>
      <Box sx={contentFieldSx(false, theme)}>
        <InputBase
          value={value ?? ''}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          fullWidth
          multiline
          minRows={2}
          inputProps={{ maxLength }}
          sx={{ fontSize: 13, color: TEXT, alignItems: 'flex-start' }}
        />
      </Box>
      <Typography
        sx={{
          fontSize: 11,
          color: charCount >= maxLength ? '#DC2626' : MUTED,
          mt: 0.35,
          lineHeight: 1.3,
          textAlign: 'right',
        }}
      >
        {charCount}/{maxLength}
      </Typography>
    </Box>
  );
}

export default function MentorContentSectionHeading({
  Icon,
  meta,
  title,
  theme,
  action,
  compact = false,
}) {
  const iconSize = compact ? 32 : 36;
  const iconFontSize = compact ? 18 : 20;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
      <Box
        sx={{
          width: iconSize,
          height: iconSize,
          borderRadius: compact ? '10px' : '12px',
          bgcolor: theme.bg,
          border: `1px solid ${theme.border}`,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: iconFontSize, color: theme.color }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {meta && (
          <Typography sx={{ ...CONTENT_CARD_META_SX, fontSize: compact ? 11 : 12 }}>
            {meta}
          </Typography>
        )}
        <Typography
          sx={{
            ...CONTENT_CARD_TITLE_SX,
            fontSize: compact ? 14 : 15,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </Typography>
      </Box>

      {action}
    </Box>
  );
}

export function MentorContentBlockHeading({ Icon, label, theme, sx }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, mb: 1, ...sx }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '8px',
          bgcolor: theme.bg,
          border: `1px solid ${theme.border}`,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 16, color: theme.color }} />
      </Box>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A', lineHeight: 1.35 }}>
        {label}
      </Typography>
    </Box>
  );
}
