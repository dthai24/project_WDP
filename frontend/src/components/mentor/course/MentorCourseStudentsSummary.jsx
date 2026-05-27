import { Box, Typography } from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { PRIMARY, TEXT, MUTED } from './mentorCourseCreateStyles';

function StatInline({ icon: Icon, label, value, iconColor }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Icon sx={{ fontSize: 16, color: iconColor, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 13, color: MUTED, lineHeight: 1.4 }}>
        {label}:{' '}
        <Box component="span" sx={{ color: TEXT, fontWeight: 700 }}>
          {value}
        </Box>
      </Typography>
    </Box>
  );
}

export default function MentorCourseStudentsSummary({ stats, loading = false }) {
  const items = [
    {
      icon: GroupsRoundedIcon,
      label: 'Tổng học viên',
      value: loading ? '—' : stats.totalStudents ?? 0,
      iconColor: PRIMARY,
    },
    {
      icon: PlayCircleOutlineRoundedIcon,
      label: 'Đang học',
      value: loading ? '—' : stats.learningCount ?? 0,
      iconColor: PRIMARY,
    },
    {
      icon: CheckCircleOutlineRoundedIcon,
      label: 'Hoàn thành',
      value: loading ? '—' : stats.completedCount ?? 0,
      iconColor: '#047857',
    },
    {
      icon: TrendingUpRoundedIcon,
      label: 'Tiến độ TB',
      value: loading ? '—' : `${stats.averageProgress ?? 0}%`,
      iconColor: '#7C3AED',
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: { xs: 1.25, sm: 2, md: 2.5 },
        mb: 2.5,
      }}
    >
      {items.map((item) => (
        <StatInline key={item.label} {...item} />
      ))}
    </Box>
  );
}
