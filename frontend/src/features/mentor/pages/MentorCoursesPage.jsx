/**
 * MentorCoursesPage  ─  Trang danh sách khóa học của Mentor
 *
 * Props: không có (page component, route: /mentor/courses)
 *
 * URL params (useSearchParams):
 *   q        : string  — tìm theo tên khóa học
 *   status   : string  — "all" | "published" | "draft"
 *   category : string
 *   level    : string
 *   sort     : string  — "newest" | "oldest" | "name_asc"
 *   page     : number
 *
 * ── Fetch data ───────────────────────────────────────────────────────────
 *   useEffect: gọi fetchMentorCourses(query) khi mount hoặc filter thay đổi
 *
 *   GET /api/mentor/courses?q=&status=&category=&level=&sort=&page=
 *   Header: x-user-id: "<mentorId>"
 *
 *   Response JSON:
 *   {
 *     success: true,
 *     courses: [
 *       {
 *         courseId, courseName, description, category, level,
 *         thumbnail, isPublished, createdAt, updatedAt,
 *         chapterCount, lessonCount, materialCount,
 *         studentCount, rating
 *       }
 *     ],
 *     total: number
 *   }
 */
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import MentorCoursesToolbar from '@/features/mentor/components/course/MentorCoursesToolbar';
import MentorCourseList from '@/features/mentor/components/course/MentorCourseList';
import MentorCourseListPagination, {
  MENTOR_COURSE_LIST_PAGE_SIZE,
} from '@/features/mentor/components/course/MentorCourseListPagination';
import { fetchMentorCourses, deleteMentorCourse } from '@/features/mentor/services/mentorCourseService';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import {
  filterAndSortMentorCourses,
  paginateMentorCourses,
} from '@/features/mentor/utils/mentorCourseUtils';
import {
  buildMentorCourseListSearchParams,
  hasActiveMentorCourseFilters,
  parseMentorCourseListParams,
  resetMentorCourseListParams,
} from '@/features/mentor/utils/mentorCourseListParams';

const PAGE_SIZE = MENTOR_COURSE_LIST_PAGE_SIZE;

export default function MentorCoursesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteCourseId, setDeleteCourseId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (courseId) => {
    setDeleteCourseId(courseId);
  };

  const loadMentorCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchMentorCourses();
      if (res.ok) {
        setCourses(Array.isArray(res.courses) ? res.courses : []);
      } else {
        console.error(res.message || "Không lấy được khóa học mentor");
        setCourses([]);
      }
    } catch (error) {
      console.error("LOAD MENTOR COURSES ERROR:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteCourseId) return;
    setDeleting(true);
    try {
      const res = await deleteMentorCourse(deleteCourseId);
      if (!res.ok) {
        toast.error(res.message || 'Xóa khóa học thất bại. Vui lòng thử lại.');
        return;
      }
      toast.success('Xóa khóa học thành công!');
      await loadMentorCourses();
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi xóa khóa học.');
    } finally {
      setDeleting(false);
      setDeleteCourseId(null);
    }
  };

  // URL is the single source of truth for all filter/search/sort/pagination state
  const queryState = useMemo(
    () => parseMentorCourseListParams(searchParams),
    [searchParams]
  );

  const showReset = hasActiveMentorCourseFilters(queryState);

  useEffect(() => {
    loadMentorCourses();
  }, [loadMentorCourses]);

  const updateQuery = (patch) => {
    const next = buildMentorCourseListSearchParams(
      { ...queryState, ...patch },
      searchParams
    );
    setSearchParams(next, { replace: true });
  };

  //Filter Courses
  const filteredCourses = useMemo(
    () => filterAndSortMentorCourses(courses, queryState),
    [courses, queryState]
  );

  const pagination = useMemo(
    () => paginateMentorCourses(filteredCourses, queryState.page, PAGE_SIZE),
    [filteredCourses, queryState.page]
  );

  // Auto-correct page if it exceeds totalPages after filtering
  useEffect(() => {
    if (!loading && queryState.page !== pagination.page) {
      updateQuery({ page: pagination.page });
    }
  }, [loading, queryState.page, pagination.page]);

  const handleCreateCourse = () => navigate('/mentor/courses/create');
  const handleStatusChange = (v) => updateQuery({ status: v, page: 1 });
  const handleCategoryChange = (v) => updateQuery({ category: v, page: 1 });
  const handleLevelChange = (v) => updateQuery({ level: v, page: 1 });
  const handleSortChange = (v) => updateQuery({ sort: v, page: 1 });
  const handlePageChange = (page) => {
    updateQuery({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleResetFilters = () =>
    setSearchParams(resetMentorCourseListParams(searchParams), { replace: true });

  const handleRemoveFilterChip = ({ type }) => {
    const defaults = {
      q: '',
      status: 'all',
      category: 'all',
      level: 'all',
      sort: 'updated_desc',
    };
    if (type in defaults) updateQuery({ [type]: defaults[type], page: 1 });
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold leading-[1.3]" style={{ color: '#0F172A' }}>
            Khóa học của tôi
          </h1>
          <p className="text-[14px] mt-1 leading-[1.55] max-w-[560px]" style={{ color: '#64748B' }}>
            Quản lý tất cả khóa học bạn đang giảng dạy.
          </p>
        </div>
      </div>

      <MentorCoursesToolbar
        keyword={queryState.q}
        statusFilter={queryState.status}
        onStatusChange={handleStatusChange}
        categoryFilter={queryState.category}
        onCategoryChange={handleCategoryChange}
        levelFilter={queryState.level}
        onLevelChange={handleLevelChange}
        sortBy={queryState.sort}
        onSortChange={handleSortChange}
        totalCount={filteredCourses.length}
        showReset={showReset}
        onReset={handleResetFilters}
        onRemoveFilterChip={handleRemoveFilterChip}
      />

      {!loading && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 1 }}>
          <AppButton
            startIcon={<AddRoundedIcon />}
            onClick={handleCreateCourse}
            sx={{
              height: 40,
              px: 3,
              fontSize: 13.5,
              fontWeight: 700,
              borderRadius: '999px',
              bgcolor: '#059669',
              color: '#fff',
              boxShadow: '0 1px 2px rgba(5,150,105,0.1)',
              '&:hover': { bgcolor: '#047857', boxShadow: 'none' },
            }}
          >
            Tạo khóa học mới
          </AppButton>
        </Box>
      )}

      <MentorCourseList
        courses={pagination.items}
        loading={loading}
        hasAnyCourses={courses.length > 0}
        showReset={showReset}
        onReset={handleResetFilters}
        onCreateCourse={handleCreateCourse}
        onDelete={handleDeleteClick}
      />

      {!loading && pagination.totalPages > 1 && (
        <>
          <Typography
            variant="caption"
            sx={{ display: 'block', textAlign: 'center', color: '#64748B', mt: 3, fontSize: 12 }}
          >
            Hiển thị {pagination.rangeStart}–{pagination.rangeEnd} trong tổng số{' '}
            {pagination.totalItems} khóa học
          </Typography>
          <MentorCourseListPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleteCourseId)}
        onClose={() => setDeleteCourseId(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa khóa học này?"
        message="Hành động này sẽ xóa vĩnh viễn khóa học cùng toàn bộ chương, bài học và học liệu đi kèm. Học viên đã đăng ký sẽ không thể truy cập khóa học này nữa."
        confirmLabel={deleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
        cancelLabel="Hủy"
        destructive
      />
    </div>
  );
}
