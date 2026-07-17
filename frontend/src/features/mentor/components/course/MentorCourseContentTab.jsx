import { Box, Typography } from '@mui/material';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import { useNavigate } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import EmptyState from '@/shared/ui/EmptyState';
import MentorCourseContentOutline from './MentorCourseContentOutline';
import MentorCardSectionTitle from './MentorCardSectionTitle';
import {
  CARD_SECTION_META_SX,
  CREATE_CARD_SX,
  DETAIL_SECTION_HEADER_SX,
} from './mentorCourseCreateStyles';
import { countMaterialsInPath, getCoursePaths } from '../../utils/mentorCourseContentUtils';

export default function MentorCourseContentTab({ course }) {
  const navigate = useNavigate();

  const paths = getCoursePaths(course);
  const courseId = course.CourseId;

  const materialCount = paths.reduce((sum, path) => {
    return sum + countMaterialsInPath(path);
  }, 0);

  return (
    <Box sx={CREATE_CARD_SX}>
      <Box sx={DETAIL_SECTION_HEADER_SX}>
        <MentorCardSectionTitle
          title="Nội dung khóa học"
          mb={0.35}
          action={
            <AppButton
              variant="contained"
              onClick={() => navigate(`/mentor/courses/${courseId}/content/edit`)}
              sx={{
                height: 34,
                borderRadius: '999px',
                fontSize: 12,
                fontWeight: 600,
                px: 1.5,
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' },
              }}
            >
              Xây nội dung
            </AppButton>
          }
        />

        <Typography sx={CARD_SECTION_META_SX}>
          {paths.length} chương · {(course.totalLessons ?? course.TotalLessons) ?? 0} bài học ·{' '}
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