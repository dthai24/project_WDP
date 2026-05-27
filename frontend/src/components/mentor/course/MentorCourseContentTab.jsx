import { Box, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import { useNavigate } from 'react-router-dom';
import AppButton from '../../common/AppButton';
import EmptyState from '../../common/EmptyState';
import MentorCourseContentOutline from './MentorCourseContentOutline';
import { CREATE_CARD_SX, MUTED, TEXT } from './mentorCourseCreateStyles';

export default function MentorCourseContentTab({ course }) {
  const navigate = useNavigate();
  const paths = course.paths ?? [];
  const courseId = course.courseId;
  const contentEditPath = `/mentor/courses/${courseId}/content`;

  return (
    <Box sx={CREATE_CARD_SX}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: paths.length > 0 ? 3 : 0,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 17, fontWeight: 800, color: TEXT }}>
            Nội dung khóa học
          </Typography>
          {paths.length > 0 && (
            <Typography sx={{ fontSize: 13, color: MUTED, mt: 0.35 }}>
              {paths.length} chương · {course.totalLessons ?? 0} bài học ·{' '}
              {course.totalMaterials ?? 0} học liệu
            </Typography>
          )}
        </Box>
        {paths.length > 0 && (
          <AppButton
            variant="outlined"
            startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate(contentEditPath)}
            sx={{
              height: 34,
              borderRadius: '999px',
              fontSize: 12,
              fontWeight: 700,
              px: 1.5,
              flexShrink: 0,
            }}
          >
            Chỉnh sửa nội dung
          </AppButton>
        )}
      </Box>

      {paths.length === 0 ? (
        <EmptyState
          embedded
          icon={AutoStoriesOutlinedIcon}
          title="Khóa học chưa có nội dung"
          description="Thêm chương, bài học và học liệu để hoàn thiện khóa học."
          actionLabel="Xây nội dung"
          onAction={() => navigate(contentEditPath)}
        />
      ) : (
        <MentorCourseContentOutline paths={paths} />
      )}
    </Box>
  );
}
