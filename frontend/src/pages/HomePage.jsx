import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import PageTitle from '../components/common/PageTitle';
import EmptyState from '../components/common/EmptyState';
import { surfaceCardSx } from '../components/theme';

function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user')) || {};
  } catch {
    return {};
  }
}

const PLACEHOLDER_STATS = [
  { label: 'Khóa đang học', value: '—', icon: SchoolOutlinedIcon },
  { label: 'Lộ trình', value: '—', icon: RouteOutlinedIcon },
  { label: 'Tiến độ tuần', value: '—', icon: TrendingUpOutlinedIcon },
];

const cardSx = (theme) => ({
  height: '100%',
  ...surfaceCardSx(theme),
});

export default function HomePage() {
  const theme = useTheme();
  const user = getUser();
  const displayName = user.fullName || 'Học viên';
  const innerRadius = theme.ios18?.radius?.xs ?? 4;

  return (
    <Box>
      <PageTitle
        title={`Xin chào, ${displayName}`}
        subtitle="Trang chủ S.T.A.R Learning Path — nội dung học tập sẽ hiển thị tại đây."
      />

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {PLACEHOLDER_STATS.map(({ label, value, icon: Icon }) => (
          <Grid key={label} size={{ xs: 12, sm: 4 }}>
            <Card elevation={0} sx={cardSx(theme)}>
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 2.5,
                  '&:last-child': { pb: 2.5 },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: innerRadius,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {label}
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ ...cardSx(theme), minHeight: 280 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Bảng tin học tập
                </Typography>
                <Chip label="Sắp ra mắt" size="small" color="primary" variant="outlined" />
              </Box>
              <EmptyState
                embedded
                title="Chưa có hoạt động"
                description="Newsfeed và bài học gợi ý sẽ được cập nhật khi kết nối backend."
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={cardSx(theme)}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Gợi ý nhanh
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary' }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Hoàn thành khảo sát sở thích nếu chưa làm
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Khám phá lộ trình theo mục tiêu của bạn
                </Typography>
                <Typography component="li" variant="body2">
                  Theo dõi tiến độ từng khóa học
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
