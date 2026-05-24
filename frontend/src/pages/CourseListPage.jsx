import { useEffect, useMemo, useState } from "react";
import { Box, Grid, Pagination, alpha, useTheme } from "@mui/material";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loading from "../components/common/Loading";
import EmptyState from "../components/common/EmptyState";
import CourseCard from "../components/course/CourseCard";
import CourseCatalogToolbar from "../components/course/CourseCatalogToolbar";
import { toast } from "../components/common/Toast";
import {
  buildActiveFilterChips,
  buildCourseListSearchParams,
  hasActiveCourseFilters,
  parseCourseListParams,
  resetCourseListParams,
} from "../utils/courseListParams";

const PAGE_SIZE = 8;

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

const MOCK_COURSES = [
  {
    courseId: 1,
    courseName: "Tiếng Anh Thương Mại & Giao Tiếp Công Sở",
    description:
      "Nắm vững các thuật ngữ cốt lõi trong môi trường kinh doanh, cách viết email chuyên nghiệp và kỹ năng giao tiếp trong họp.",
    category: "Giao tiếp",
    level: "Trung cấp",
    totalLessons: 8,
    totalNodes: 2,
    totalMaterials: 5,
    progressPercentage: 40,
    isEnrolled: true,
    popularity: 920,
    createdAt: "2026-05-22T09:00:00.000Z",
    thumbnail: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
  },
  {
    courseId: 2,
    courseName: "Kỹ năng thuyết trình tiếng Anh cho sinh viên",
    description:
      "Thực hành xây dựng slide, mở đầu hấp dẫn và trả lời câu hỏi tự tin bằng tiếng Anh trong bối cảnh học thuật và công việc.",
    category: "Giao tiếp",
    level: "Cơ bản",
    totalLessons: 12,
    totalNodes: 4,
    totalMaterials: 12,
    progressPercentage: 0,
    isEnrolled: false,
    popularity: 680,
    createdAt: "2026-05-24T08:00:00.000Z",
  },
  {
    courseId: 3,
    courseName: "Luyện viết IELTS Task 2",
    description:
      "Tổng hợp cấu trúc bài luận theo từng dạng đề và chiến lược phát triển ý tưởng để tăng band writing một cách bền vững.",
    category: "IELTS",
    level: "Nâng cao",
    totalLessons: 16,
    totalNodes: 6,
    totalMaterials: 20,
    progressPercentage: 75,
    isEnrolled: true,
    popularity: 1240,
    createdAt: "2026-05-20T10:00:00.000Z",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf93a163b78?w=800&q=80",
  },
  {
    courseId: 4,
    courseName: "TOEIC Listening & Reading 750+",
    description:
      "Luyện chiến lược làm bài nhanh, bẫy thường gặp và bộ từ vựng trọng tâm cho kỳ thi TOEIC.",
    category: "TOEIC",
    level: "Trung cấp",
    totalLessons: 20,
    totalNodes: 5,
    totalMaterials: 18,
    progressPercentage: 0,
    isEnrolled: false,
    popularity: 1100,
    createdAt: "2026-05-18T10:00:00.000Z",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
  },
  {
    courseId: 5,
    courseName: "Ngữ pháp tiếng Anh nền tảng",
    description:
      "Hệ thống hóa thì, cấu trúc câu và lỗi sai phổ biến giúp bạn viết và nói chính xác hơn.",
    category: "Ngữ pháp",
    level: "Cơ bản",
    totalLessons: 14,
    totalNodes: 7,
    totalMaterials: 22,
    progressPercentage: 15,
    isEnrolled: true,
    popularity: 860,
    createdAt: "2026-05-15T10:00:00.000Z",
  },
  {
    courseId: 6,
    courseName: "Phát âm chuẩn & Intonation",
    description:
      "Luyện âm cuối, nối âm, trọng âm và ngữ điệu tự nhiên qua bài tập nghe-nhại thực tế.",
    category: "Phát âm",
    level: "Trung cấp",
    totalLessons: 10,
    totalNodes: 3,
    totalMaterials: 9,
    progressPercentage: 0,
    isEnrolled: false,
    popularity: 540,
    createdAt: "2026-05-12T10:00:00.000Z",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
  },
  {
    courseId: 7,
    courseName: "IELTS Speaking Part 2 & 3",
    description:
      "Xây dựng câu trả lời mạch lạc, mở rộng ý và tự tin giao tiếp trong phòng thi IELTS.",
    category: "IELTS",
    level: "Trung cấp",
    totalLessons: 11,
    totalNodes: 4,
    totalMaterials: 14,
    progressPercentage: 0,
    isEnrolled: false,
    popularity: 990,
    createdAt: "2026-05-10T10:00:00.000Z",
  },
  {
    courseId: 8,
    courseName: "Giao tiếp đời sống hàng ngày",
    description:
      "Tình huống thực tế: mua sắm, du lịch, hỏi đường và trò chuyện xã giao tự nhiên.",
    category: "Giao tiếp",
    level: "Cơ bản",
    totalLessons: 9,
    totalNodes: 3,
    totalMaterials: 8,
    progressPercentage: 100,
    isEnrolled: true,
    popularity: 720,
    createdAt: "2026-05-08T10:00:00.000Z",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
  },
  {
    courseId: 9,
    courseName: "TOEIC Writing & Speaking 200+",
    description:
      "Rèn kỹ năng viết email, mô tả ảnh và trả lời phỏng vấn theo chuẩn TOEIC Writing & Speaking.",
    category: "TOEIC",
    level: "Nâng cao",
    totalLessons: 15,
    totalNodes: 5,
    totalMaterials: 16,
    progressPercentage: 0,
    isEnrolled: false,
    popularity: 780,
    createdAt: "2026-05-05T10:00:00.000Z",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
  },
  {
    courseId: 10,
    courseName: "Ngữ âm tiếng Anh Mỹ",
    description:
      "Phân biệt vowels & consonants, luyện accent Mỹ tự nhiên qua các bài tập shadow speaking.",
    category: "Phát âm",
    level: "Cơ bản",
    totalLessons: 12,
    totalNodes: 4,
    totalMaterials: 11,
    progressPercentage: 30,
    isEnrolled: true,
    popularity: 610,
    createdAt: "2026-05-01T10:00:00.000Z",
  },
];

async function fetchCourses() {
  // TODO: Replace with real API service when backend endpoint is available.
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_COURSES;
}

export default function CourseListPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const data = await fetchCourses();
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
  const handlePageChange = (_, value) => {
    updateFilters({ page: value });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContinueLearning = (course) => {
    // TODO: Replace with real learning route when available.
    navigate(`/courses/${course.courseId}`);
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
                  onEnroll={handleEnroll}
                  onContinueLearning={handleContinueLearning}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="medium"
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: "10px",
                    fontWeight: 600,
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
