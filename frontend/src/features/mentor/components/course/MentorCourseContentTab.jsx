import { Box, Typography, Button } from '@mui/material';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import { useNavigate } from 'react-router-dom';
import EmptyState from '@/shared/ui/EmptyState';
import MentorCourseContentOutline from './MentorCourseContentOutline';
import {
  CREATE_CARD_SX,
  MUTED,
  TEXT,
  PRIMARY,
} from './mentorCourseCreateStyles';
import { countMaterialsInPath, getCoursePaths } from '../../utils/mentorCourseContentUtils';

export default function MentorCourseContentTab({ course }) {
  const navigate = useNavigate();

  const paths = getCoursePaths(course);
  const courseId = course.CourseId;
  const editPath = `/mentor/courses/${courseId}/edit`;

  const materialCount = paths.reduce((sum, path) => {
    return sum + countMaterialsInPath(path);
  }, 0);

  return (
    <Box sx={CREATE_CARD_SX}>
      <Box sx={{ mb: paths.length > 0 ? 2 : 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography sx={{ fontSize: 17, fontWeight: 800, color: TEXT }}>
            Nội dung khóa học
          </Typography>

          <Button
            variant="contained"
            sx={{
              bgcolor: PRIMARY,
              color: '#fff',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '10px',
              px: 2,
              py: 0.75,
              '&:hover': {
                bgcolor: PRIMARY,
                opacity: 0.9,
              },
            }}
            onClick={() => navigate(`/mentor/courses/${courseId}/content/edit`)}
          >
            Xây nội dung
          </Button>
        </Box>

        <Typography sx={{ fontSize: 13, color: MUTED, mt: 0.35 }}>
          {paths.length} chương · {course.TotalLessons ?? 0} bài học ·{' '}
          {materialCount ?? 0} học liệu
        </Typography>
      </Box>

      {paths.length === 0 ? (
        <EmptyState
          embedded
          icon={AutoStoriesOutlinedIcon}
          title="Khóa học chưa có nội dung"
          description="Thêm chương, bài học và học liệu để hoàn thiện khóa học."
          actionLabel="Xây nội dung"
          onAction={() => navigate(`/mentor/courses/${courseId}/content/edit`)}
        />
      ) : (
        <MentorCourseContentOutline paths={paths} />
      )}
    </Box>
  );
}