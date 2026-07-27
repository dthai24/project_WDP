import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AppButton from '@/shared/ui/AppButton';
import { toast } from '@/shared/ui/Toast';
import MentorCourseCreateStepIndicator from '@/features/mentor/components/course/MentorCourseCreateStepIndicator';
import MentorCourseQuizzesTab from '@/features/mentor/components/course/MentorCourseQuizzesTab';
import { fetchMentorCourseDetail } from '@/features/mentor/services/mentorCourseService';
import { PRIMARY, TEXT, MUTED } from '@/features/mentor/components/course/mentorCourseCreateStyles';

export default function MentorEditCourseTestPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchMentorCourseDetail(courseId);
      if (cancelled) return;
      if (!result.success) {
        toast.error('Không thể tải thông tin khóa học.');
        navigate(`/mentor/courses/${courseId}`, { replace: true });
        return;
      }
      setCourse(result.course);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [courseId, navigate]);

  if (loading || !course) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={32} sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-4">
        <h1 className="text-[22px] sm:text-[24px] font-bold leading-[1.3]" style={{ color: TEXT }}>
          Thêm bài kiểm tra
        </h1>
        <p className="text-[14px] mt-1 leading-[1.55] max-w-[620px]" style={{ color: MUTED }}>
          Quản lý câu hỏi bài kiểm tra cuối khóa — thay đổi được lưu ngay lập tức cho học viên.
        </p>
      </div>

      <MentorCourseCreateStepIndicator currentStep={3} />

      <MentorCourseQuizzesTab course={course} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.25, mt: 1 }}>
        <AppButton
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(`/mentor/courses/${courseId}/content/edit`)}
          sx={{ minWidth: 120, height: 44, borderRadius: '999px', fontWeight: 700 }}
        >
          Quay lại
        </AppButton>
        <AppButton
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={() => navigate(`/mentor/courses/${courseId}/writing`)}
          sx={{ minWidth: 128, height: 44, borderRadius: '999px', fontWeight: 700, bgcolor: PRIMARY, '&:hover': { bgcolor: '#0E7490' } }}
        >
          Tiếp theo
        </AppButton>
      </Box>
    </div>
  );
}
