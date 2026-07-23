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
  { value: "not_started", label: "Chưa học" },
  { value: "completed", label: "Đã hoàn thành" },
];

function getRowVariant(course) {
  if (course.enrollmentStatus === "completed") return "completed";
  if (course.enrollmentStatus === "learning") return "learning";
  if (course.enrollmentStatus === "not_started") return "not_started";
  return "not_joined";
}

function matchesStatusTab(course, tab) {
  if (tab === "all") return true;
  if (tab === "learning") return course.enrollmentStatus === "learning";
  if (tab === "completed") return course.enrollmentStatus === "completed";
  if (tab === "not_started") return course.enrollmentStatus === "not_started" || course.enrollmentStatus === "not_joined";
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
    .filter((c) => c.enrollmentStatus === "learning" || c.progressPercentage > 0)
    .sort((a, b) => (b.progressPercentage ?? 0) - (a.progressPercentage ?? 0));
  return learning[0] ?? courses[0] ?? null;
}

export default function MyCoursesListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const keyword = (searchParams.get("keyword") ?? "").trim();
  const [searchQuery, setSearchQuery] = useState(keyword);
  const [allCourses, setAllCourses] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);

  // Đồng bộ từ khoá từ URL khi có thay đổi (ví dụ: khi reset bộ lọc)
  useEffect(() => {
    setSearchQuery(keyword);
  }, [keyword]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    const next = new URLSearchParams(searchParams);
    if (val.trim()) {
      next.set("keyword", val.trim());
    } else {
      next.delete("keyword");
    }
    next.delete("page");
    setSearchParams(next, { replace: true });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    const next = new URLSearchParams(searchParams);
    next.delete("keyword");
    setSearchParams(next, { replace: true });
  };


  useEffect(() => {
    async function fetchLookups() {
      try {
        const [catRes, levRes] = await Promise.all([
          fetch("http://localhost:5050/api/categories"),
          fetch("http://localhost:5050/api/levels"),
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
        const token = localStorage.getItem("token");
        const userRaw = localStorage.getItem("user");
        let userId = "";
        if (userRaw) {
          try {
            const u = JSON.parse(userRaw);
            userId = u?.userId || u?._id || "";
          } catch (e) {}
        }

        const headers = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        if (userId) headers["x-user-id"] = String(userId);

        const [enrolledRes, allCoursesRes] = await Promise.all([
          fetch("http://localhost:5050/api/users/courses", { headers }),
          fetch("http://localhost:5050/api/courses/student")
        ]);

        const enrolledResult = await enrolledRes.json();
        const allCoursesResult = await allCoursesRes.json();

        let enrolledCourses = [];
        if (enrolledRes.ok && enrolledResult.success) {
          enrolledCourses = enrolledResult.data || [];
        }

        let publishedCourses = [];
        if (allCoursesRes.ok && allCoursesResult.success) {
          publishedCourses = allCoursesResult.data || [];
        }

        const enrolledMap = new Map();
        enrolledCourses.forEach((c) => {
          if (c.courseId) {
            enrolledMap.set(c.courseId.toString(), c);
          }
        });

        const mapped = publishedCourses.map((c) => {
          const courseId = c._id.toString();
          const enrolled = enrolledMap.get(courseId);

          let progress = enrolled ? (enrolled.progress ?? 0) : 0;

          // Real-time progress synchronization from LocalStorage
          const localProgress1 = localStorage.getItem(`course_progress_${courseId}_${userId}`);
          const localProgress2 = localStorage.getItem(`course_progress_${courseId}`);
          if (localProgress1 != null || localProgress2 != null) {
            const p1 = localProgress1 ? parseInt(localProgress1, 10) : 0;
            const p2 = localProgress2 ? parseInt(localProgress2, 10) : 0;
            const maxLocal = Math.max(isNaN(p1) ? 0 : p1, isNaN(p2) ? 0 : p2);
            if (maxLocal > progress) {
              progress = maxLocal;
            }
          }

          let status = "not_joined";
          if (enrolled || progress > 0) {
            if (progress >= 100) {
              status = "completed";
            } else if (progress > 0) {
              status = "learning";
            } else {
              status = "not_started";
            }
          }

          let thumbnail = c.thumbnail;
          if (!thumbnail || thumbnail === "CHƯA FIX LỖI ẢNH") thumbnail = null;
          if (thumbnail && thumbnail.startsWith("/")) {
            thumbnail = `http://localhost:5050${thumbnail}`;
          }

          return {
            courseId: courseId,
            courseName: c.courseName,
            thumbnail,
            category: c.categoryId?.displayName || "Chưa phân loại",
            level: c.levelId?.displayName || "Cơ bản",
            instructor: c.instructorId?.fullName || "English Master Mentor Team",
            totalLessons: c.totalLessons ?? 0,
            totalNodes: c.chapterCount ?? 0,
            progressPercentage: progress,
            enrollmentStatus: status,
            enrollmentDate: enrolled ? enrolled.enrollmentDate : null,
            quizDoneCount: enrolled ? enrolled.quizDoneCount : 0,
            chapterCount: c.chapterCount ?? 0,
            certificateCode: enrolled ? enrolled.certificateCode : null,
          };
        });

        setAllCourses(mapped);
      } catch (error) {
        console.error("Fetch my courses error:", error);
      }
    };
    getData();
  }, []);


  const showReset = hasActiveFilters(filters, keyword);
  const activeFilterChips = useMemo(
    () => buildActiveFilterChips({ ...filters, keyword, statuses: [] }),
    [filters, keyword]
  );

  // Đếm số khoá học theo danh mục và trình độ (hiển thị trong filter)
  const categoryCountMap = useMemo(() => {
    const map = {};
    allCourses.forEach(c => {
      map[c.category] = (map[c.category] || 0) + 1;
    });
    return map;
  }, [allCourses]);

  const levelCountMap = useMemo(() => {
    const map = {};
    allCourses.forEach(c => {
      map[c.level] = (map[c.level] || 0) + 1;
    });
    return map;
  }, [allCourses]);

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
    setSearchQuery("");
    const next = new URLSearchParams(searchParams);
    next.delete("keyword");
    next.delete("page");
    setSearchParams(next, { replace: true });
    updateFilters({ categories: [], levels: [], page: 1 });
  };


  const handleLearningAction = (course) => {
    navigate(`/my-courses/${course.courseId}/learn`);
  };

  const stats = useMemo(() => {
    let learning = 0;
    let completed = 0;
    let notStarted = 0;

    allCourses.forEach((c) => {
      if (c.enrollmentStatus === "completed") completed++;
      else if (c.enrollmentStatus === "learning") learning++;
      else notStarted++;
    });

    return { total: allCourses.length, learning, completed, notStarted };
  }, [allCourses]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-6">
        <Link to="/home" className="hover:text-brand-600 transition-colors">
          Trang chủ
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-semibold">Khóa học của tôi</span>
      </nav>

      {/* ── Page Header & Stats Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold mb-2">
            <Sparkle size={14} weight="fill" className="text-brand-500" />
            <span>Lộ trình học cá nhân</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Khóa học của tôi
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Theo dõi tiến độ, xem lại các khóa học dở dang và chinh phục mục tiêu tiếng Anh của bạn.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl px-4 py-3 text-center min-w-[100px]">
            <span className="block text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng số</span>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-100 shadow-sm rounded-2xl px-4 py-3 text-center min-w-[100px]">
            <span className="block text-2xl font-black text-emerald-600">{stats.learning}</span>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Đang học</span>
          </div>
          <div className="bg-brand-50/60 border border-brand-100 shadow-sm rounded-2xl px-4 py-3 text-center min-w-[100px]">
            <span className="block text-2xl font-black text-brand-600">{stats.completed}</span>
            <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">Hoàn thành</span>
          </div>
        </div>
      </div>

      {/* ── Continue Section ── */}
      {showContinueSection && (
        <MyCourseContinueSection
          course={continueCourse}
          onContinue={handleLearningAction}
        />
      )}

      {/* ── Search Bar & Filter Section ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs mb-6 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {STATUS_TABS.map((tab) => {
              const active = filters.statusTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => updateFilters({ statusTab: tab.value, page: 1 })}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <MagnifyingGlass
              size={16}
              weight="bold"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm tên khóa học, giảng viên..."
              className="w-full bg-slate-50/80 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl py-2 pl-9 pr-9 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:ring-4 focus:ring-brand-500/10"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={14} weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* Toolbar Dropdowns */}
        <MyCoursesToolbar
          statusTab={filters.statusTab}
          onStatusTabChange={(value) => updateFilters({ statusTab: value, page: 1 })}
          categories={filters.categories}
          onCategoriesChange={(e) => updateFilters({ categories: e.target.value, page: 1 })}
          categoryOptions={categoryOptions}
          categoryCountMap={categoryCountMap}
          levels={filters.levels}
          onLevelsChange={(e) => updateFilters({ levels: e.target.value, page: 1 })}
          levelOptions={levelOptions}
          levelCountMap={levelCountMap}
          sortBy={filters.sort}
          onSortChange={(e) => updateFilters({ sort: e.target.value, page: 1 })}
          sortOptions={SORT_OPTIONS}
          totalCount={filteredCourses.length}
          activeFilterChips={activeFilterChips}
          onRemoveFilterChip={handleRemoveFilterChip}
          showReset={showReset}
          onReset={handleResetFilters}
        />
      </div>

      {/* ── Course List / Empty State ── */}
      {!hasAnyCourse || filteredCourses.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center shadow-sm">
              <BookOpen size={32} className="text-brand-500" />
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
                : "Khám phá các khóa học phù hợp để bắt đầu lộ trình học của bạn."
            }
            actionLabel={hasAnyCourse ? "Xóa bộ lọc" : "Khám phá khóa học"}
            onAction={() => (hasAnyCourse ? handleResetFilters() : navigate("/courses"))}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3.5">
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
        </div>
      )}
    </div>
  );
}
