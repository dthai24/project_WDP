import { Box, Typography } from '@mui/material';
import { CONTENT_CARD_META_SX, CONTENT_CARD_TITLE_SX } from './mentorCourseContentStyles';

export function ContentFieldLabel({ children, sx }) {
  return (
    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B', mb: 0.5, lineHeight: 1.35, ...sx }}>
      {children}
    </Typography>
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
