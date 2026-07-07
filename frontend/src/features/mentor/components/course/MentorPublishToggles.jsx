import { Box, Switch, Typography } from '@mui/material';
import {
  isNodeActive,
  isPathActive,
} from '@/features/mentor/utils/mentorCourseContentUtils';
import { MUTED } from './mentorCourseCreateStyles';

export function PathPublishToggle({ path, onChange, disabled = false }) {
  const published = isPathActive(path);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1,
        py: 0.35,
        borderRadius: '999px',
        bgcolor: published ? 'rgba(4,120,87,0.08)' : 'rgba(100,116,139,0.08)',
        border: `1px solid ${published ? 'rgba(4,120,87,0.2)' : 'rgba(15,23,42,0.08)'}`,
        flexShrink: 0,
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: published ? '#047857' : MUTED }}>
        Xuất bản
      </Typography>
      <Switch
        size="small"
        checked={published}
        onChange={(event) => onChange(path.tempId, { IsActive: event.target.checked ? 1 : 0 })}
        disabled={disabled}
        inputProps={{ 'aria-label': 'Xuất bản chương cho học viên' }}
        sx={{
          m: 0,
          '& .MuiSwitch-switchBase.Mui-checked': { color: '#047857' },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#047857' },
        }}
      />
    </Box>
  );
}

export function NodePublishToggle({ node, onChange, disabled = false }) {
  const published = isNodeActive(node);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1,
        py: 0.35,
        borderRadius: '999px',
        bgcolor: published ? 'rgba(4,120,87,0.08)' : 'rgba(100,116,139,0.08)',
        border: `1px solid ${published ? 'rgba(4,120,87,0.2)' : 'rgba(15,23,42,0.08)'}`,
        flexShrink: 0,
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: published ? '#047857' : MUTED }}>
        Xuất bản
      </Typography>
      <Switch
        size="small"
        checked={published}
        onChange={(event) => onChange(node.tempId, { IsActive: event.target.checked ? 1 : 0 })}
        disabled={disabled}
        inputProps={{ 'aria-label': 'Xuất bản bài học cho học viên' }}
        sx={{
          m: 0,
          '& .MuiSwitch-switchBase.Mui-checked': { color: '#047857' },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#047857' },
        }}
      />
    </Box>
  );
}
