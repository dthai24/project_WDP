import { useEffect, useMemo, useState } from "react";
import { Box, Breadcrumbs, Link as MuiLink, Stack, Typography, alpha, useTheme } from "@mui/material";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import MyCourseRow from "../components/course/MyCourseRow";
import MyCoursesToolbar from "../components/course/MyCoursesToolbar";
import MyCourseContinueSection from "../components/course/MyCourseContinueSection";
import CourseListPagination, {
  COURSE_LIST_PAGE_SIZE,
} from "../components/course/CourseListPagination";
import EmptyState from "../components/common/EmptyState";
import useSavedCourses from "../hooks/useSavedCourses";
import { buildActiveFilterChips, buildCourseDetailPath } from "../utils/courseListParams";

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

const SORT_OPTIONS = [
  { value: "recent", label: "Gần đây nhất" },
  { value: "progress", label: "Tiến độ cao nhất" },
  { value: "name", label: "Tên A-Z" },
];

const DEFAULT_FILTERS = {
  statusTab: "all",
  categories: [],
  levels: [],
  sort: "recent",
  page: 1,
};

/** Khóa đã đăng ký / đang học / hoàn thành — TODO: thay bằng API */
const MOCK_ENROLLED_COURSES = [
  {
    courseId: 1,
    courseName: "Tiếng Anh Thương Mại & Giao Tiếp Công Sở",
    category: "Giao tiếp",
    level: "Trung cấp",
    instructor: "Nguyễn Minh An",
    totalLessons: 8,
    totalNodes: 2,
    totalMaterials: 5,
    progressPercentage: 40,
    enrollmentStatus: "learning",
    currentStage: 1,
    currentLesson: 3,
    lastActivity: "2 ngày trước",
    lastActivityOrder: 2,
    thumbnail: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
    modules: [
      { id: 1, title: "Chặng 1: Nền tảng từ vựng", completedLessons: 3, totalLessons: 3, status: "completed" },
      { id: 2, title: "Chặng 2: Email & giao tiếp", completedLessons: 1, totalLessons: 4, status: "learning" },
    ],
    currentLessonDetail: {
      stage: "Chặng 2: Email & giao tiếp",
      lesson: "Bài 3",
      title: "Cấu trúc email chuyên nghiệp",
    },
    recentLessons: [
      { id: 1, label: "Bài 2 · Từ vựng cốt lõi công sở", isCompleted: true },
      { id: 2, label: "Bài 3 · Cấu trúc email chuyên nghiệp", isCompleted: false, isCurrent: true },
    ],
  },
  {
    courseId: 3,
    courseName: "Luyện viết IELTS Task 2",
    category: "IELTS",
    level: "Nâng cao",
    instructor: "Trần Quốc Huy",
    totalLessons: 16,
    totalNodes: 6,
    totalMaterials: 20,
    progressPercentage: 75,
    enrollmentStatus: "learning",
    currentStage: 4,
    currentLesson: 11,
    lastActivity: "Hôm qua",
    lastActivityOrder: 1,
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf93a163b78?w=800&q=80",
    modules: [
      { id: 1, title: "Chặng 1: Nền tảng", completedLessons: 3, totalLessons: 3, status: "completed" },
      { id: 2, title: "Chặng 2: Kỹ năng chính", completedLessons: 4, totalLessons: 4, status: "completed" },
      { id: 3, title: "Chặng 3: Luyện đề nâng cao", completedLessons: 2, totalLessons: 5, status: "learning" },
      { id: 4, title: "Chặng 4: Ôn tập tổng hợp", completedLessons: 0, totalLessons: 4, status: "not_started" },
    ],
    currentLessonDetail: {
      stage: "Chặng 3: Luyện đề nâng cao",
      lesson: "Bài 11",
      title: "Phân tích đề bài phức tạp",
    },
    recentLessons: [
      { id: 1, label: "Bài 9 · Mở bài hiệu quả", isCompleted: true },
      { id: 2, label: "Bài 10 · Thân bài logic", isCompleted: true },
      { id: 3, label: "Bài 11 · Phân tích đề bài phức tạp", isCompleted: false, isCurrent: true },
    ],
  },
  {
    courseId: 8,
    courseName: "Giao tiếp đời sống hàng ngày",
    category: "Giao tiếp",
    level: "Cơ bản",
    instructor: "Lê Thu Hà",
    totalLessons: 9,
    totalNodes: 3,
    totalMaterials: 8,
    progressPercentage: 100,
    enrollmentStatus: "completed",
    lastActivity: "5 ngày trước",
    lastActivityOrder: 5,
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    modules: [
      { id: 1, title: "Chặng 1: Chào hỏi & giới thiệu", completedLessons: 3, totalLessons: 3, status: "completed" },
      { id: 2, title: "Chặng 2: Mua sắm & du lịch", completedLessons: 3, totalLessons: 3, status: "completed" },
      { id: 3, title: "Chặng 3: Tình huống xã giao", completedLessons: 3, totalLessons: 3, status: "completed" },
    ],
    currentLessonDetail: null,
    recentLessons: [
      { id: 1, label: "Bài 7 · Hỏi đường", isCompleted: true },
      { id: 2, label: "Bài 8 · Đặt phòng khách sạn", isCompleted: true },
      { id: 3, label: "Bài 9 · Bài kiểm tra cuối khóa", isCompleted: true },
    ],
  },
  {
    courseId: 11,
    courseName: "IELTS Reading: True/False/Not Given",
    category: "IELTS",
    level: "Trung cấp",
    instructor: "Phạm Văn Đức",
    totalLessons: 13,
    totalNodes: 5,
    totalMaterials: 15,
    progressPercentage: 55,
    enrollmentStatus: "learning",
    currentStage: 2,
    currentLesson: 7,
    lastActivity: "3 ngày trước",
    lastActivityOrder: 3,
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    modules: [
      { id: 1, title: "Chặng 1: Chiến lược cơ bản", completedLessons: 4, totalLessons: 4, status: "completed" },
      { id: 2, title: "Chặng 2: T/F/NG nâng cao", completedLessons: 2, totalLessons: 5, status: "learning" },
      { id: 3, title: "Chặng 3: Luyện đề thực chiến", completedLessons: 0, totalLessons: 4, status: "not_started" },
    ],
    currentLessonDetail: {
      stage: "Chặng 2: T/F/NG nâng cao",
      lesson: "Bài 7",
      title: "Nhận diện bẫy Not Given",
    },
    recentLessons: [
      { id: 1, label: "Bài 5 · Đọc lướt & quét thông tin", isCompleted: true },
      { id: 2, label: "Bài 6 · Paraphrase trong đề", isCompleted: true },
      { id: 3, label: "Bài 7 · Nhận diện bẫy Not Given", isCompleted: false, isCurrent: true },
    ],
  },
];

/** Khóa chỉ lưu, chưa đăng ký — TODO: thay bằng API */
const MOCK_SAVED_CATALOG = [
  {
    courseId: 2,
    courseName: "Kỹ năng thuyết trình tiếng Anh cho sinh viên",
    category: "Giao tiếp",
    level: "Cơ bản",
    instructor: "Hoàng Thùy Linh",
    totalLessons: 12,
    totalNodes: 4,
    totalMaterials: 12,
    progressPercentage: 0,
    enrollmentStatus: "none",
    savedAtOrder: 1,
    thumbnail: null,
  },
  {
    courseId: 4,
    courseName: "TOEIC Listening & Reading 750+",
    category: "TOEIC",
    level: "Trung cấp",
    instructor: "Nguyễn Bảo Trân",
    totalLessons: 20,
    totalNodes: 5,
    totalMaterials: 18,
    progressPercentage: 0,
    enrollmentStatus: "none",
    savedAtOrder: 2,
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
  },
  {
    courseId: 6,
    courseName: "Phát âm chuẩn & Intonation",
    category: "Phát âm",
    level: "Trung cấp",
    instructor: "Đỗ Khánh Vy",
    totalLessons: 10,
    totalNodes: 3,
    totalMaterials: 9,
    progressPercentage: 0,
    enrollmentStatus: "none",
    savedAtOrder: 3,
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
  },
  {
    courseId: 7,
    courseName: "IELTS Speaking Part 2 & 3",
    category: "IELTS",
    level: "Trung cấp",
    instructor: "Vũ Minh Tuấn",
    totalLessons: 11,
    totalNodes: 4,
    totalMaterials: 14,
    progressPercentage: 0,
    enrollmentStatus: "none",
    savedAtOrder: 4,
    thumbnail: null,
  },
];

const ENROLLED_IDS = new Set(MOCK_ENROLLED_COURSES.map((c) => c.courseId));

function getRowVariant(course) {
  if (course.enrollmentStatus === "completed") return "completed";
  if (course.enrollmentStatus === "learning") return "learning";
  return "saved";
}

function matchesStatusTab(course, tab) {
  if (tab === "all") return true;
  if (tab === "learning") return course.enrollmentStatus === "learning";
  if (tab === "completed") return course.enrollmentStatus === "completed";
  if (tab === "saved") return course.enrollmentStatus === "none";
  return true;
}

function hasActiveFilters(filters, keyword = "") {
  return (
    Boolean(keyword) ||
    filters.categories.length > 0 ||
    filters.levels.length > 0
  );
}

function matchesKeyword(course, keyword) {
  if (!keyword) return true;
  const kw = keyword.toLowerCase();
  return (
    course.courseName.toLowerCase().includes(kw) ||
    course.category.toLowerCase().includes(kw) ||
    (course.instructor?.toLowerCase().includes(kw) ?? false)
  );
}

function pickContinueCourse(courses) {
  const learning = courses
    .filter((c) => c.enrollmentStatus === "learning")
    .sort((a, b) => (a.lastActivityOrder ?? 99) - (b.lastActivityOrder ?? 99));
  return learning[0] ?? null;
}

function getSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "{}");
  } catch (error) {
    console.error("Parse session user error:", error);
    return {};
  }
}

function getUserId(user) {
  return user?.userId ?? user?.UserId ?? user?.id ?? user?.Id;
}

function getUserRole(user) {
  const role =
    user?.roleName ??
    user?.RoleName ??
    user?.role ??
    user?.Role ??
    user?.roles?.[0] ??
    user?.Roles?.[0];

  return Array.isArray(role) ? role[0] : role;
}

async function fetchMyCourses(userId, roleName) {
  const res = await fetch("http://localhost:5000/api/courses/my-courses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: Number(userId),
      roleName: String(roleName),
    }),
  });

  if (!res.ok) {
    throw new Error("Cannot fetch my courses");
  }

  const result = await res.json();
  return result.data || [];
}
function normalizeCourse(course, isSaved) {
  const courseId = course.courseId ?? course.CourseId;

  return {
    courseId,
    courseName: course.courseName ?? course.CourseName ?? "Chưa có tên khóa học",
    description: course.description ?? course.Description ?? "",
    category: course.category ?? course.Category ?? "Giao tiếp",
    level: course.level ?? course.Level ?? "Cơ bản",
    instructor: course.instructor ?? course.Instructor ?? "Chưa cập nhật",
    totalLessons: course.totalLessons ?? course.TotalLessons ?? 0,
    totalNodes: course.totalNodes ?? course.TotalNodes ?? 0,
    totalMaterials: course.totalMaterials ?? course.TotalMaterials ?? 0,
    progressPercentage: course.progressPercentage ?? course.ProgressPercentage ?? 0,
    enrollmentStatus:
      course.enrollmentStatus ??
      course.EnrollmentStatus ??
      "learning",
    currentStage: course.currentStage ?? course.CurrentStage,
    currentLesson: course.currentLesson ?? course.CurrentLesson,
    lastActivity: course.lastActivity ?? course.LastActivity ?? "",
    lastActivityOrder: course.lastActivityOrder ?? course.LastActivityOrder ?? 99,
    thumbnail: course.thumbnail ?? course.Thumbnail ?? "",
    modules: course.modules ?? course.Modules ?? [],
    currentLessonDetail:
      course.currentLessonDetail ?? course.CurrentLessonDetail ?? null,
    recentLessons: course.recentLessons ?? course.RecentLessons ?? [],
    isSaved: isSaved(courseId),
  };
}

export default function MyCoursesListPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { savedIds, isSaved, unsave } = useSavedCourses();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const keyword = (searchParams.get("keyword") ?? "").trim();

  const sessionUser = useMemo(() => getSessionUser(), []);
  const userId = getUserId(sessionUser);
  const role = getUserRole(sessionUser);

  useEffect(() => {
    let isMounted = true;

    async function loadMyCourses() {
      if (!userId || !role) {
        if (isMounted) {
          setCourses([]);
          setError("Thiếu userId hoặc role. Hãy đăng nhập lại.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await fetchMyCourses(userId, role);

        if (isMounted) {
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Fetch my courses error:", error.message);

        if (isMounted) {
          setCourses([]);
          setError("Không thể tải khóa học của tôi. Vui lòng thử lại.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMyCourses();

    return () => {
      isMounted = false;
    };
  }, [userId, role]);
  const allCourses = useMemo(() => {
    return courses.map((course) => normalizeCourse(course, isSaved));
  }, [courses, isSaved]);
  const showReset = hasActiveFilters(filters, keyword);
  const activeFilterChips = useMemo(
    () => buildActiveFilterChips({ ...filters, keyword, statuses: [] }),
    [filters, keyword]
  );

  const updateFilters = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const filteredCourses = useMemo(() => {
    let list = allCourses.filter((course) => matchesStatusTab(course, filters.statusTab));

    if (keyword) {
      list = list.filter((course) => matchesKeyword(course, keyword));
    }
    if (filters.categories.length > 0) {
      list = list.filter((course) => filters.categories.includes(course.category));
    }
    if (filters.levels.length > 0) {
      list = list.filter((course) => filters.levels.includes(course.level));
    }

    list.sort((a, b) => {
      if (filters.sort === "progress") {
        return b.progressPercentage - a.progressPercentage;
      }
      if (filters.sort === "name") {
        return a.courseName.localeCompare(b.courseName, "vi");
      }
      const orderA = a.lastActivityOrder ?? a.savedAtOrder ?? 99;
      const orderB = b.lastActivityOrder ?? b.savedAtOrder ?? 99;
      return orderA - orderB;
    });

    return list;
  }, [allCourses, filters, keyword]);

  const continueCourse = useMemo(() => pickContinueCourse(filteredCourses), [filteredCourses]);
  const showContinueSection =
    continueCourse &&
    (filters.statusTab === "all" || filters.statusTab === "learning");

  const hasAnyCourse = allCourses.length > 0;
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const currentPage = Math.min(filters.page, totalPages);
  const pageCourses = filteredCourses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    if (filters.page !== currentPage) updateFilters({ page: currentPage });
  }, [filters.page, currentPage]);

  const handleRemoveFilterChip = (chip) => {
    if (chip.type === "keyword") {
      const next = new URLSearchParams(searchParams);
      next.delete("keyword");
      next.delete("page");
      setSearchParams(next, { replace: true });
      updateFilters({ page: 1 });
      return;
    }
    if (chip.type === "category") {
      updateFilters({ categories: filters.categories.filter((v) => v !== chip.value), page: 1 });
    } else if (chip.type === "level") {
      updateFilters({ levels: filters.levels.filter((v) => v !== chip.value), page: 1 });
    }
  };

  const handleResetFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("keyword");
    next.delete("page");
    setSearchParams(next, { replace: true });
    updateFilters({ categories: [], levels: [], page: 1 });
  };

  const handleLearningAction = (course) => {
    navigate(`/my-courses/${course.courseId}/learn`);
  };

  const renderEmptyState = () => {
    if (filters.statusTab === "saved") {
      return (
        <Box sx={{ py: 7, textAlign: "center", borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}` }}>
          <BookmarkBorderRoundedIcon sx={{ fontSize: 48, color: "#F59E0B", opacity: 0.45, mb: 1.5 }} />
          <EmptyState
            embedded
            title="Bạn chưa lưu khóa học nào"
            description="Lưu các khóa học bạn quan tâm để quay lại sau."
            actionLabel="Khám phá khóa học"
            onAction={() => navigate("/courses")}
          />
        </Box>
      );
    }

    return (
      <Box sx={{ py: 7, textAlign: "center", borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}` }}>
        <MenuBookOutlinedIcon sx={{ fontSize: 48, color: "primary.main", opacity: 0.3, mb: 1.5 }} />
        <EmptyState
          embedded
          title={hasAnyCourse ? "Không tìm thấy khóa học phù hợp" : "Bạn chưa đăng ký khóa học nào"}
          description={
            hasAnyCourse
              ? keyword
                ? "Thử từ khóa khác hoặc xóa bộ lọc để xem thêm khóa học."
                : "Thử chọn bộ lọc khác để xem thêm khóa học."
              : "Khám phá các khóa học phù hợp để bắt đầu lộ trình học."
          }
          actionLabel={hasAnyCourse ? "Xóa bộ lọc" : "Khám phá khóa học"}
          onAction={() => (hasAnyCourse ? handleResetFilters() : navigate("/courses"))}
        />
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1280, mx: "auto" }}>
      <Breadcrumbs
        separator="/"
        sx={{ mb: 2.5, "& .MuiBreadcrumbs-separator": { color: "#64748B", mx: 0.5 } }}
      >
        <MuiLink component={Link} to="/home" underline="hover" sx={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>
          Trang chủ
        </MuiLink>
        <Typography sx={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>
          Khóa học của tôi
        </Typography>
      </Breadcrumbs>

      <MyCoursesToolbar
        statusTab={filters.statusTab}
        onStatusTabChange={(value) => updateFilters({ statusTab: value, page: 1 })}
        categories={filters.categories}
        onCategoriesChange={(e) => updateFilters({ categories: e.target.value, page: 1 })}
        categoryOptions={CATEGORY_OPTIONS}
        levels={filters.levels}
        onLevelsChange={(e) => updateFilters({ levels: e.target.value, page: 1 })}
        levelOptions={LEVEL_OPTIONS}
        sortBy={filters.sort}
        onSortChange={(e) => updateFilters({ sort: e.target.value, page: 1 })}
        sortOptions={SORT_OPTIONS}
        totalCount={filteredCourses.length}
        activeFilterChips={activeFilterChips}
        onRemoveFilterChip={handleRemoveFilterChip}
        showReset={showReset}
        onReset={handleResetFilters}
      />

      {showContinueSection && (
        <MyCourseContinueSection
          course={continueCourse}
          onContinue={handleLearningAction}
        />
      )}

      {!hasAnyCourse || filteredCourses.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <Stack spacing={2}>
            {pageCourses.map((course) => (
              <MyCourseRow
                key={course.courseId}
                course={course}
                variant={getRowVariant(course)}
                onAction={handleLearningAction}
                onUnsave={
                  course.enrollmentStatus === "none"
                    ? () => unsave(course.courseId)
                    : undefined
                }
              />
            ))}
          </Stack>

          <CourseListPagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(value) => {
              updateFilters({ page: value });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </Box>
  );
}
