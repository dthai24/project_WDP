/**
 * MyCoursesListPage  —  Danh sách khóa học của tôi
 * Redesigned: Premium English Learning Experience
 *
 * Route: /my-courses
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  MagnifyingGlass,
  Funnel,
  SortAscending,
  Clock,
  ChartLine,
  TextAa,
  X,
  CaretDown,
  PlayCircle,
  CheckCircle,
  ArrowRight,
  Sparkle,
} from "@phosphor-icons/react";
import MyCourseRow from "@/features/courses/components/MyCourseRow";
import MyCoursesToolbar from "@/features/courses/components/MyCoursesToolbar";
import MyCourseContinueSection from "@/features/courses/components/MyCourseContinueSection";
import CourseListPagination, {
  COURSE_LIST_PAGE_SIZE,
} from "@/features/courses/components/CourseListPagination";
import EmptyState from "@/shared/ui/EmptyState";
import { buildActiveFilterChips, buildCourseDetailPath } from "@/features/courses/utils/courseListParams";
import { getMyCoursesApi } from "@/features/auth/services/authService";

const PAGE_SIZE = COURSE_LIST_PAGE_SIZE;

const SORT_OPTIONS = [
  { value: "recent", label: "Hoạt động gần nhất" },
  { value: "progress", label: "Tiến độ cao nhất" },
  { value: "name", label: "Tên khóa học (A-Z)" },
];

const DEFAULT_FILTERS = {
  statusTab: "all",
  categories: [],
  levels: [],
  sort: "recent",
  page: 1,
};

const STATUS_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "learning", label: "Đang học" },
  { value: "completed", label: "Đã hoàn thành" },
];

function getRowVariant(course) {
  if (course.enrollmentStatus === "completed") return "completed";
  return "learning";
}

function matchesStatusTab(course, tab) {
  if (tab === "all") return true;
  if (tab === "learning") return course.enrollmentStatus === "learning";
  if (tab === "completed") return course.enrollmentStatus === "completed";
  return true;
}

function hasActiveFilters(filters, keyword = "") {
  return Boolean(keyword) || filters.categories.length > 0 || filters.levels.length > 0;
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

export default function MyCoursesListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const keyword = (searchParams.get("keyword") ?? "").trim();
  const [allCourses, setAllCourses] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);

  useEffect(() => {
    async function fetchLookups() {
      try {
        const [catRes, levRes] = await Promise.all([
          fetch("http://localhost:5000/api/categories"),
          fetch("http://localhost:5000/api/levels"),
        ]);
        const catData = await catRes.json();
        const levData = await levRes.json();
        if (catData.success) {
          setCategoryOptions(catData.data.map((c) => ({ value: c.displayName, label: c.displayName })));
        }
        if (levData.success) {
          setLevelOptions(levData.data.map((l) => ({ value: l.displayName, label: l.displayName })));
        }
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    }
    fetchLookups();
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const rawUser = localStorage.getItem("user");
        if (!rawUser) return;
        const user = JSON.parse(rawUser);
        const userId = user.userId || user.UserId || user.id || user.Id;
        const roleName = Array.isArray(user.roles)
          ? typeof user.roles[0] === "string"
            ? user.roles[0]
            : user.roles[0]?.roleName || user.roles[0]?.RoleName
          : user.roles || user.roleName || user.RoleName || user.role;
        if (!userId || !roleName) return;

        const res = await fetch("http://localhost:5000/api/courses/my-courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: Number(userId), roleName: String(roleName).toLowerCase() }),
        });
        const result = await res.json();
        if (!res.ok || !result.success) return;

        const mappedData = [];
        const rawData = result.data || [];
        for (let i = 0; i < rawData.length; i++) {
          const dbCourse = rawData[i];
          let currentProgress = dbCourse.progress ?? 0;
          let status = currentProgress >= 100 ? "completed" : "learning";
          let courseImage = dbCourse.Thumbnail || dbCourse.thumbnail;
          if (courseImage === "CHƯA FIX LỖI ẢNH") courseImage = null;
          mappedData.push({
            courseId: dbCourse.CourseId,
            courseName: dbCourse.CourseName,
            thumbnail: courseImage,
            category: dbCourse.CategoryDisplayName || dbCourse.CategoryName || "Chưa phân loại",
            level: dbCourse.LevelDisplayName || dbCourse.levelName || "Cơ bản",
            instructor: dbCourse.Instructor || "S.T.A.R Mentor Team",
            totalLessons: dbCourse.TotalLessons || 0,
            totalNodes: dbCourse.Paths?.length || 0,
            progressPercentage: currentProgress,
            enrollmentStatus: status,
            modules: dbCourse.Paths || [],
          });
        }
        setAllCourses(mappedData);
      } catch (error) {
        console.log("Fetch courses error:", error);
      }
    };
    getData();
  }, []);

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
    if (keyword) list = list.filter((course) => matchesKeyword(course, keyword));
    if (filters.categories.length > 0) {
      list = list.filter((course) => filters.categories.includes(course.category));
    }
    if (filters.levels.length > 0) {
      list = list.filter((course) => filters.levels.includes(course.level));
    }
    list.sort((a, b) => {
      if (filters.sort === "progress") return b.progressPercentage - a.progressPercentage;
      if (filters.sort === "name") return a.courseName.localeCompare(b.courseName, "vi");
      const orderA = a.lastActivityOrder ?? a.savedAtOrder ?? 99;
      const orderB = b.lastActivityOrder ?? b.savedAtOrder ?? 99;
      return orderA - orderB;
    });
    return list;
  }, [allCourses, filters, keyword]);

  const continueCourse = useMemo(() => pickContinueCourse(filteredCourses), [filteredCourses]);
  const showContinueSection =
    continueCourse && (filters.statusTab === "all" || filters.statusTab === "learning");

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-[13px] mb-6">
        <Link to="/home" className="text-slate-400 hover:text-emerald-600 font-medium transition-colors">
          Trang chủ
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-semibold">Khóa học của tôi</span>
      </nav>

      {/* ── Page Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          Khóa học của tôi
        </h1>
        <p className="text-[14px] text-slate-400 mt-1">
          Tiếp tục học tập và theo dõi tiến độ của bạn
        </p>
      </div>

      {/* ── Status Tabs ── */}
      <div className="flex items-center gap-1 mb-5 bg-slate-50 rounded-xl p-1 border border-slate-100 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => updateFilters({ statusTab: tab.value, page: 1 })}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              filters.statusTab === tab.value
                ? "bg-white text-emerald-600 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <MyCoursesToolbar
        statusTab={filters.statusTab}
        onStatusTabChange={(value) => updateFilters({ statusTab: value, page: 1 })}
        categories={filters.categories}
        onCategoriesChange={(e) => updateFilters({ categories: e.target.value, page: 1 })}
        categoryOptions={categoryOptions}
        levels={filters.levels}
        onLevelsChange={(e) => updateFilters({ levels: e.target.value, page: 1 })}
        levelOptions={levelOptions}
        sortBy={filters.sort}
        onSortChange={(e) => updateFilters({ sort: e.target.value, page: 1 })}
        sortOptions={SORT_OPTIONS}
        totalCount={filteredCourses.length}
        activeFilterChips={activeFilterChips}
        onRemoveFilterChip={handleRemoveFilterChip}
        showReset={showReset}
        onReset={handleResetFilters}
      />

      {/* ── Continue Section ── */}
      {showContinueSection && (
        <div className="mb-5">
          <MyCourseContinueSection
            course={continueCourse}
            onContinue={handleLearningAction}
          />
        </div>
      )}

      {/* ── Course List / Empty State ── */}
      {!hasAnyCourse || filteredCourses.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-slate-100 bg-slate-50/30">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <BookOpen size={32} className="text-emerald-400" />
            </div>
          </div>
          <EmptyState
            embedded
            title={
              hasAnyCourse
                ? "Không tìm thấy khóa học phù hợp"
                : "Bạn chưa đăng ký khóa học nào"
            }
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
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {pageCourses.map((course) => (
              <MyCourseRow
                key={course.courseId}
                course={course}
                variant={getRowVariant(course)}
                onAction={handleLearningAction}
              />
            ))}
          </div>

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
    </div>
  );
}
