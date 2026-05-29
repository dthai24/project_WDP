/**
 * CourseListPage  ─  Trang danh sách khóa học (catalog)
 *
 * Props: không có (page component, route: /courses)
 *
 * URL params đọc qua useSearchParams:
 *   q        : string   — từ khóa tìm kiếm
 *   category : string   — lọc danh mục
 *   level    : string   — lọc cấp độ
 *   status   : string   — "enrolled" | "not_enrolled"
 *   sort     : string   — "newest" | "popular" | "rating"
 *   page     : number   — trang hiện tại
 *
 * ── Fetch data ───────────────────────────────────────────────────────────
 *   useEffect: gọi getCoursesApi(user?.userId) khi mount
 *
 *   GET /api/courses  (header tuỳ chọn: x-user-id)
 *
 *   Response JSON:
 *   {
 *     success: true,
 *     courses: [
 *       {
 *         courseId, title, description, category, level,
 *         instructor, thumbnail, duration, lessonCount,
 *         rating, reviewCount, studentCount, isFree,
 *         isEnrolled, progress
 *       }
 *     ]
 *   }
 *
 * ── API call (enroll) ────────────────────────────────────────────────────
 *   POST /api/courses/enroll  (qua enrollCourseApi)
 *
 *   Request JSON: { userId: number, courseId: number }
 *   Response JSON: { success: true, message: string }
 */
import { useEffect, useMemo, useState } from "react";
import { Box, Breadcrumbs, Grid, Link as MuiLink, Typography, alpha, useTheme } from "@mui/material";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Loading from "@/shared/ui/Loading";
import EmptyState from "@/shared/ui/EmptyState";
import CourseCard from "@/features/courses/components/CourseCard";
import useSavedCourses from "@/features/courses/hooks/useSavedCourses";
import CourseCatalogToolbar from "@/features/courses/components/CourseCatalogToolbar";
import CourseListPagination, {
  COURSE_LIST_PAGE_SIZE,
} from "@/features/courses/components/CourseListPagination";
import { toast } from "@/shared/ui/Toast";
import {
  buildActiveFilterChips,
  buildCourseDetailPath,
  buildCourseListSearchParams,
  hasActiveCourseFilters,
  parseCourseListParams,
  resetCourseListParams,
} from "@/features/courses/utils/courseListParams";
import { getCoursesApi, enrollCourseApi } from '@/features/auth/services/authService';
const PAGE_SIZE = COURSE_LIST_PAGE_SIZE;

const CATEGORY_OPTIONS = [
  { value: "Giao tiếp", label: "Giao tiếp" },
  { value: "IELTS", label: "IELTS" },
  { value: "TOEIC", label: "TOEIC" },
  { value: "Ngữ pháp", label: "Ngữ pháp" },
  { value: "Phát âm", label: "Phát âm" },
];

const LEVEL_OPTIONS = [
  { value: "Cơ bản", label: "Cơ bản" },
  { value: "Trung cấp", label: "Trung cấp" },
  { value: "Nâng cao", label: "Nâng cao" },
];

const STATUS_OPTIONS = [
  { value: "enrolled", label: "Đã đăng ký" },
  { value: "not_enrolled", label: "Chưa đăng ký" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "popular", label: "Phổ biến" },
  { value: "progress", label: "Tiến độ cao nhất" },
];

export default function CourseListPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isSaved, toggleSave } = useSavedCourses();

  const filters = useMemo(
    () => parseCourseListParams(searchParams),
    [searchParams]
  );

  const showReset = hasActiveCourseFilters(filters);
  const activeFilterChips = useMemo(() => buildActiveFilterChips(filters), [filters]);

  const updateFilters = (patch, options = {}) => {
    const next = buildCourseListSearchParams({ ...filters, ...patch }, searchParams);
    setSearchParams(next, { replace: options.replace ?? true });
  };

  useEffect(() => {
    let isMounted = true;

    async function loadCourses() {
      try {
        setLoading(true);
        const userRaw = sessionStorage.getItem('user');
        const currentUser = userRaw ? JSON.parse(userRaw) : null;

        const { ok, data } = await getCoursesApi(currentUser?.userId);
        if (!isMounted) return;

        if (ok && data.success && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else {
          toast.error('Không thể tải danh sách khóa học.');
          setCourses([]);
        }
      } catch (err) {
        console.error(err);
        toast.error('Không thể tải danh sách khóa học. Vui lòng thử lại.');
        if (isMounted) setCourses([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCourses = useMemo(() => {
    const keyword = filters.keyword.toLowerCase();
    const filtered = courses.filter((course) => {
      if (keyword) {
        const matchSearch =
          course.courseName.toLowerCase().includes(keyword) ||
          course.description.toLowerCase().includes(keyword) ||
          course.category.toLowerCase().includes(keyword);
        if (!matchSearch) return false;
      }
      if (filters.categories.length > 0 && !filters.categories.includes(course.category)) {
        return false;
      }
      if (filters.levels.length > 0 && !filters.levels.includes(course.level)) {
        return false;
      }
      if (filters.statuses.length > 0) {
        const matchesStatus = filters.statuses.some((status) => {
          if (status === "enrolled") return course.isEnrolled;
          if (status === "not_enrolled") return !course.isEnrolled;
          return false;
        });
        if (!matchesStatus) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (filters.sort === "popular") {
        return (b.popularity ?? 0) - (a.popularity ?? 0);
      }
      if (filters.sort === "progress") {
        return (b.progressPercentage ?? 0) - (a.progressPercentage ?? 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [courses, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const currentPage = Math.min(filters.page, totalPages);
  const pageCourses = filteredCourses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    if (filters.page !== currentPage) {
      updateFilters({ page: currentPage });
    }
  }, [filters.page, currentPage]);

  const handleCategoriesChange = (event) => {
    updateFilters({ categories: event.target.value, page: 1 });
  };
  const handleLevelsChange = (event) => {
    updateFilters({ levels: event.target.value, page: 1 });
  };
  const handleStatusesChange = (event) => {
    updateFilters({ statuses: event.target.value, page: 1 });
  };
  const handleSortChange = (event) => {
    updateFilters({ sort: event.target.value, page: 1 });
  };
  const handlePageChange = (value) => {
    updateFilters({ page: value });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContinueLearning = (course) => {
    // TODO: Replace with real learning route when available.
    navigate(buildCourseDetailPath(course.courseId, searchParams, `${location.pathname}${location.search}`));
  };

  const handleEnroll = async (course) => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  if (!user.userId) {
    toast.error('Vui lòng đăng nhập để đăng ký khóa học.');
    return;
  }

  const { ok, data } = await enrollCourseApi(user.userId, course.courseId);
  if (ok && data.success) {
    setCourses((prev) =>
      prev.map((item) =>
        item.courseId === course.courseId
          ? { ...item, isEnrolled: true, progressPercentage: 0 }
          : item
      )
    );
    toast.success(`Đã đăng ký khóa "${course.courseName}" thành công!`);
  } else {
    toast.error(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
  }
};

  const handleRemoveFilterChip = (chip) => {
    if (chip.type === "keyword") {
      updateFilters({ keyword: "", page: 1 });
      return;
    }
    if (chip.type === "category") {
      updateFilters({
        categories: filters.categories.filter((value) => value !== chip.value),
        page: 1,
      });
      return;
    }
    if (chip.type === "level") {
      updateFilters({
        levels: filters.levels.filter((value) => value !== chip.value),
        page: 1,
      });
      return;
    }
    if (chip.type === "status") {
      updateFilters({
        statuses: filters.statuses.filter((value) => value !== chip.value),
        page: 1,
      });
    }
  };

  const handleResetFilters = () => {
    setSearchParams(resetCourseListParams(searchParams), { replace: true });
  };

  const handleClearFilters = () => {
    handleResetFilters();
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1280, mx: "auto" }}>
      {/* Breadcrumb */}
      <Breadcrumbs
        separator="/"
        sx={{ mb: 2.5, "& .MuiBreadcrumbs-separator": { color: "#64748B", mx: 0.5 } }}
      >
        <MuiLink
          component={Link}
          to="/home"
          underline="hover"
          sx={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}
        >
          Trang chủ
        </MuiLink>
        <Typography sx={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>
          Khóa học
        </Typography>
      </Breadcrumbs>

      <CourseCatalogToolbar
        categories={filters.categories}
        onCategoriesChange={handleCategoriesChange}
        categoryOptions={CATEGORY_OPTIONS}
        levels={filters.levels}
        onLevelsChange={handleLevelsChange}
        levelOptions={LEVEL_OPTIONS}
        statuses={filters.statuses}
        onStatusesChange={handleStatusesChange}
        statusOptions={STATUS_OPTIONS}
        sortBy={filters.sort}
        onSortChange={handleSortChange}
        sortOptions={SORT_OPTIONS}
        totalCount={filteredCourses.length}
        activeFilterChips={activeFilterChips}
        onRemoveFilterChip={handleRemoveFilterChip}
        showReset={showReset}
        onReset={handleResetFilters}
      />

      {loading ? (
        <Loading message="Đang tải danh sách khóa học..." />
      ) : filteredCourses.length === 0 ? (
        <Box
          sx={{
            py: 7,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "background.paper",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          }}
        >
          <MenuBookOutlinedIcon
            sx={{ fontSize: 48, color: "primary.main", opacity: 0.3, mb: 1.5 }}
          />
          <EmptyState
            embedded
            title="Không tìm thấy khóa học phù hợp"
            description={
              filters.keyword
                ? "Thử đổi từ khóa tìm kiếm hoặc chọn bộ lọc khác."
                : "Thử chọn bộ lọc khác để xem thêm khóa học."
            }
            actionLabel="Xóa bộ lọc"
            onAction={handleClearFilters}
          />
        </Box>
      ) : (
        <>
          <Grid container spacing={2.5}>
            {pageCourses.map((course) => (
              <Grid key={course.courseId} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <CourseCard
                  course={course}
                  isSaved={isSaved(course.courseId)}
                  onToggleSave={() => toggleSave(course.courseId)}
                  onEnroll={handleEnroll}
                  onContinueLearning={handleContinueLearning}
                />
              </Grid>
            ))}
          </Grid>

          <CourseListPagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </Box>
  );
}
