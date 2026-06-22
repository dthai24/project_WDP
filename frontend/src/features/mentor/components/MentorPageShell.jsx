import { Box, Typography } from '@mui/material';

export default function MentorPageShell({ title, description, children }) {
  return (
    <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto' }}>
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: 24, sm: 28 },
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '-0.02em',
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: 15, color: '#64748B', mb: 3, maxWidth: 640 }}>
        {description}
      </Typography>
      {children}
    </Box>
  );
}
