import { Box, Typography } from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import { MUTED, PRIMARY, TEXT } from './mentorCourseCreateStyles';

function MetricInline({ icon: Icon, label, value, iconColor }) {
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

export default function MentorCourseMetricsInline({ course }) {
  const metrics = [
    {
      icon: GroupsRoundedIcon,
      label: 'Học viên',
      value: course.studentCount ?? 0,
      iconColor: PRIMARY,
    },
    {
      icon: StarRoundedIcon,
      label: 'Đánh giá',
      value: course.rating != null ? course.rating.toFixed(1) : '—',
      iconColor: '#D97706',
    },
    {
      icon: MenuBookRoundedIcon,
      label: 'Bài học',
      value: course.totalLessons ?? 0,
      iconColor: '#0E7490',
    },
    {
      icon: FolderRoundedIcon,
      label: 'Chương',
      value: course.totalChapters ?? 0,
      iconColor: '#7C3AED',
    },
    {
      icon: DescriptionRoundedIcon,
      label: 'Học liệu',
      value: course.totalMaterials ?? 0,
      iconColor: '#475569',
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: { xs: 1.25, sm: 2, md: 2.5 },
        mt: 1.25,
      }}
    >
      {metrics.map((metric) => (
        <MetricInline key={metric.label} {...metric} />
      ))}
    </Box>
  );
}
