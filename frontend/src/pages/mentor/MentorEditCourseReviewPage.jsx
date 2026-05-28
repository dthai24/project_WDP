import { useEffect, useMemo, useState } from 'react';
import { Box, Breadcrumbs, CircularProgress, Divider, Link as MuiLink, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppButton from '../../components/common/AppButton';
import { toast } from '../../components/common/Toast';
import MentorCourseInfoReview from '../../components/mentor/course/MentorCourseInfoReview';
import MentorCourseContentReview from '../../components/mentor/course/MentorCourseContentReview';
import { MUTED, PRIMARY, TEXT } from '../../components/mentor/course/mentorCourseCreateStyles';
import {
  fetchCourseCategories,
  fetchCourseLevels,
  updateCourseBasicInfo,
  updateCourseContent,
} from '../../services/mentorCourseService';
import {
  clearEditCourseDraft,
  loadEditCourseDraft,
} from '../../utils/mentorCourseEditStorage';

export default function MentorEditCourseReviewPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [draft, setDraft] = useState(null);
  const [ready, setReady] = useState(false);
  const [categoryLabel, setCategoryLabel] = useState('');
  const [levelLabel, setLevelLabel] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const saved = loadEditCourseDraft(courseId);
    if (!saved?.course) {
      toast.error('Không tìm thấy dữ liệu chỉnh sửa. Vui lòng thử lại.');
      navigate(`/mentor/courses/${courseId}`, { replace: true });
      return;
    }
    setDraft(saved);
    setReady(true);
  }, [courseId, navigate]);

  useEffect(() => {
    if (!draft?.course) return undefined;
    let cancelled = false;

    (async () => {
      const [categoryResult, levelResult] = await Promise.all([
        fetchCourseCategories(),
        fetchCourseLevels(),
      ]);
      if (cancelled) return;

      const category = (categoryResult.categories ?? []).find(
        (item) => String(item.value) === String(draft.course.CategoryId),
      );
      const level = (levelResult.levels ?? []).find(
        (item) => String(item.value) === String(draft.course.LevelId),
      );
      setCategoryLabel(category?.label ?? '');
      setLevelLabel(level?.label ?? '');
    })();

    return () => { cancelled = true; };
  }, [draft]);

  const paths = useMemo(() => draft?.paths ?? [], [draft]);

  const handleUpdate = async () => {
    if (!draft?.course) return;

    setUpdating(true);
    try {
      const [basicResult, contentResult] = await Promise.all([
        updateCourseBasicInfo(courseId, draft.course),
        updateCourseContent(courseId, paths),
      ]);

      if (!basicResult.ok || !contentResult.ok) {
        toast.error('Không thể cập nhật khóa học. Vui lòng thử lại.');
        return;
      }

      clearEditCourseDraft(courseId);
      toast.success('Đã cập nhật khóa học thành công.');
      navigate(`/mentor/courses/${courseId}`);
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setUpdating(false);
    }
  };

  if (!ready || !draft) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={32} sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator="/"
        sx={{ mb: 2, '& .MuiBreadcrumbs-separator': { color: MUTED, mx: 0.5 } }}
      >
        <MuiLink component={Link} to="/home" underline="hover" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
          Trang chủ
        </MuiLink>
        <MuiLink component={Link} to="/mentor/courses" underline="hover" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
          Khóa học của tôi
        </MuiLink>
        <MuiLink component={Link} to={`/mentor/courses/${courseId}`} underline="hover" sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
          Chi tiết khóa học
        </MuiLink>
        <Typography sx={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>
          Xem lại thay đổi
        </Typography>
      </Breadcrumbs>

      {/* Heading */}
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: 24, sm: 28 },
          fontWeight: 800,
          color: TEXT,
          letterSpacing: '-0.02em',
          mb: 0.5,
        }}
      >
        Xem lại thay đổi
      </Typography>
      <Typography sx={{ fontSize: 15, color: MUTED, mb: 2.5, maxWidth: 720, lineHeight: 1.55 }}>
        Kiểm tra các thay đổi trước khi cập nhật khóa học.
      </Typography>

      {/* Content grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 7fr) minmax(280px, 3fr)' },
          gap: { xs: 2, lg: 2.5 },
          alignItems: 'start',
          mt: 0.5,
        }}
      >
        {/* Left: info + content review */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <MentorCourseInfoReview
            course={draft.course}
            categoryLabel={categoryLabel}
            levelLabel={levelLabel}
          />
          <MentorCourseContentReview paths={paths} />
        </Box>

        {/* Right: action panel */}
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid rgba(15,23,42,0.08)',
            boxShadow: '0 1px 2px rgba(8,145,178,0.04)',
            p: { xs: 2.25, sm: 2.5 },
            position: { lg: 'sticky' },
            top: { lg: 24 },
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: TEXT, mb: 0.5 }}>
            Xác nhận cập nhật
          </Typography>
          <Typography sx={{ fontSize: 13, color: MUTED, mb: 2, lineHeight: 1.55 }}>
            Các thay đổi sẽ được áp dụng ngay khi bạn nhấn cập nhật.
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <AppButton
              onClick={handleUpdate}
              loading={updating}
              endIcon={!updating ? <CheckRoundedIcon sx={{ fontSize: 18 }} /> : undefined}
              sx={{
                height: 44,
                borderRadius: '999px',
                fontWeight: 700,
                bgcolor: PRIMARY,
                '&:hover': { bgcolor: '#0E7490' },
              }}
            >
              Cập nhật khóa học
            </AppButton>

            <AppButton
              variant="text"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate(`/mentor/courses/${courseId}/content/edit`)}
              disabled={updating}
              sx={{ height: 40, borderRadius: '999px', fontWeight: 700, color: MUTED }}
            >
              Quay lại chỉnh sửa nội dung
            </AppButton>

            <AppButton
              variant="text"
              onClick={() => navigate(`/mentor/courses/${courseId}/edit`)}
              disabled={updating}
              sx={{ height: 40, borderRadius: '999px', fontWeight: 600, color: MUTED, fontSize: 13 }}
            >
              Chỉnh sửa thông tin cơ bản
            </AppButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
