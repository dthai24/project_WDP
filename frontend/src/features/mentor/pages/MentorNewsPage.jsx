import { Box, Typography, alpha } from '@mui/material';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import MentorPageShell from '@/features/mentor/components/MentorPageShell';

export default function MentorNewsPage() {
  return (
    <MentorPageShell
      title="Tin tức"
      description="Quản lý bài viết và nội dung giới thiệu khóa học."
    >
      <Box
        sx={{
          py: 6,
          px: 3,
          textAlign: 'center',
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <ArticleRoundedIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.35, mb: 1.5 }} />
        <Typography sx={{ fontSize: 15, color: '#64748B' }}>
          Quản lý tin tức sẽ được bổ sung sau khi có bảng dữ liệu News.
        </Typography>
      </Box>
    </MentorPageShell>
  );
}
