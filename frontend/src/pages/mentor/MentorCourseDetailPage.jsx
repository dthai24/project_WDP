import { useCallback, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import MentorCourseDetailHeader from '../../components/mentor/course/MentorCourseDetailHeader';
import MentorCourseOverviewTab from '../../components/mentor/course/MentorCourseOverviewTab';
import MentorCourseContentTab from '../../components/mentor/course/MentorCourseContentTab';
import MentorCourseStudentsTab from '../../components/mentor/course/MentorCourseStudentsTab';
import {
  fetchMentorCourseDetail,
  updateCoursePublishStatus,
} from '../../services/mentorCourseService';
import {
  MENTOR_COURSE_DETAIL_TABS,
  parseMentorCourseDetailTab,
} from '../../utils/mentorCourseDetailUtils';

export default function MentorCourseDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const activeTab = parseMentorCourseDetailTab(searchParams);

  const loadCourse = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await fetchMentorCourseDetail(courseId);

    if (!result.ok || !result.course) {
      setCourse(null);
      setError(result.message ?? 'Không tìm thấy khóa học.');
    } else {
      setCourse(result.course);
    }

    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const handleTabChange = (tab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', tab);
        return next;
      },
      { replace: true }
    );
  };

  const renderActiveTabPanel = () => {
    switch (activeTab) {
      case MENTOR_COURSE_DETAIL_TABS.CONTENT:
        return <MentorCourseContentTab course={course} />;
      case MENTOR_COURSE_DETAIL_TABS.STUDENTS:
        return <MentorCourseStudentsTab courseId={course.courseId} />;
      case MENTOR_COURSE_DETAIL_TABS.COURSE:
        return <MentorCourseOverviewTab course={course} />;
      default:
        return <MentorCourseOverviewTab course={course} />;
    }
  };

  const handlePublishToggle = async () => {
    if (!course || publishing) return;

    const nextPublished = course.status !== 'published';
    setPublishing(true);

    const result = await updateCoursePublishStatus(course.courseId, nextPublished);

    if (result.ok && result.course) {
      setCourse(result.course);
    }

    setPublishing(false);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto' }}>
        <Loading message="Đang tải khóa học..." />
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto' }}>
        <EmptyState
          variant="error"
          title="Không tìm thấy khóa học"
          description={error ?? 'Khóa học không tồn tại hoặc bạn không có quyền truy cập.'}
          actionLabel="Quay lại danh sách"
          onAction={() => navigate('/mentor/courses')}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto' }}>
      <MentorCourseDetailHeader
        course={course}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onPublishToggle={handlePublishToggle}
        publishing={publishing}
      />

      <Box key={activeTab}>{renderActiveTabPanel()}</Box>
    </Box>
  );
}
