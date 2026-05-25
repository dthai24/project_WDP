import { useEffect, useMemo, useState } from "react";
import { Box, Breadcrumbs, Grid, Link as MuiLink, Typography, alpha, useTheme } from "@mui/material";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Loading from "../components/common/Loading";
import EmptyState from "../components/common/EmptyState";
import CourseCard from "../components/course/CourseCard";
import useSavedCourses from "../hooks/useSavedCourses";
import CourseCatalogToolbar from "../components/course/CourseCatalogToolbar";
import CourseListPagination, {
  COURSE_LIST_PAGE_SIZE,
} from "../components/course/CourseListPagination";
import { toast } from "../components/common/Toast";
import {
  buildActiveFilterChips,
  buildCourseDetailPath,
  buildCourseListSearchParams,
  hasActiveCourseFilters,
  parseCourseListParams,
  resetCourseListParams,
} from "../utils/courseListParams";

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

async function fetchCourses(userId) {
  try {
    const headers = {};
    if (userId) {
      headers["x-user-id"] = userId;
    }
    const res = await fetch("http://localhost:5000/api/courses", { headers });
    const data = await res.json();
    if (data.success && data.courses) {
      return data.courses;
    }
    return [];
  } catch (err) {
    console.error("Error fetching courses:", err);
    throw err;
  }
}

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
        const userRaw = sessionStorage.getItem("user");
        const currentUser = userRaw ? JSON.parse(userRaw) : null;
        
        const data = await fetchCourses(currentUser?.userId);
        if (isMounted) setCourses(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Không thể tải danh sách khóa học. Vui lòng thử lại.");
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

  const handleEnroll = (course) => {
    // TODO: Replace with enroll API call.
    setCourses((prev) =>
      prev.map((item) =>
        item.courseId === course.courseId
          ? { ...item, isEnrolled: true, progressPercentage: 0 }
          : item
      )
    );
    toast.success(`Bạn đã đăng ký khóa "${course.courseName}"`);
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
