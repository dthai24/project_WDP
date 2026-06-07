import { Box, Typography } from '@mui/material';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../common/EmptyState';
import MentorCourseContentOutline from './MentorCourseContentOutline';
import { CREATE_CARD_SX, MUTED, TEXT } from './mentorCourseCreateStyles';

export default function MentorCourseContentTab({ course }) {
  const navigate = useNavigate();
  const paths = course.paths ?? [];
  const courseId = course.courseId;
  const editPath = `/mentor/courses/${courseId}/edit`;

  return (
    <Box sx={CREATE_CARD_SX}>
      <Box sx={{ mb: paths.length > 0 ? 3 : 0 }}>
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

      {paths.length === 0 ? (
        <EmptyState
          embedded
          icon={AutoStoriesOutlinedIcon}
          title="Khóa học chưa có nội dung"
          description="Thêm chương, bài học và học liệu để hoàn thiện khóa học."
          actionLabel="Xây nội dung"
          onAction={() => navigate(editPath)}
        />
      ) : (
        <MentorCourseContentOutline paths={paths} />
      )}
    </Box>
  );
}
