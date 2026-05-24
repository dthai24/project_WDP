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

// const MOCK_COURSES = [
//   {
//     courseId: 1,
//     courseName: "Tiếng Anh Thương Mại & Giao Tiếp Công Sở",
//     description:
//       "Nắm vững các thuật ngữ cốt lõi trong môi trường kinh doanh, cách viết email chuyên nghiệp và kỹ năng giao tiếp trong họp.",
//     category: "Giao tiếp",
//     level: "Trung cấp",
//     instructor: "Nguyễn Minh An",
//     totalLessons: 8,
//     totalNodes: 2,
//     totalMaterials: 5,
//     progressPercentage: 40,
//     isEnrolled: true,
//     popularity: 920,
//     rating: 4.9,
//     reviewCount: 544,
//     studentCount: 22072,
//     createdAt: "2026-05-22T09:00:00.000Z",
//     thumbnail: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
//   },
//   {
//     courseId: 2,
//     courseName: "Kỹ năng thuyết trình tiếng Anh cho sinh viên",
//     description:
//       "Thực hành xây dựng slide, mở đầu hấp dẫn và trả lời câu hỏi tự tin bằng tiếng Anh trong bối cảnh học thuật và công việc.",
//     category: "Giao tiếp",
//     level: "Cơ bản",
//     instructor: "Hoàng Thùy Linh",
//     totalLessons: 12,
//     totalNodes: 4,
//     totalMaterials: 12,
//     progressPercentage: 0,
//     isEnrolled: false,
//     popularity: 680,
//     rating: 4.8,
//     reviewCount: 312,
//     studentCount: 15430,
//     createdAt: "2026-05-24T08:00:00.000Z",
//   },
//   {
//     courseId: 3,
//     courseName: "Luyện viết IELTS Task 2",
//     description:
//       "Tổng hợp cấu trúc bài luận theo từng dạng đề và chiến lược phát triển ý tưởng để tăng band writing một cách bền vững.",
//     category: "IELTS",
//     level: "Nâng cao",
//     instructor: "Trần Quốc Huy",
//     totalLessons: 16,
//     totalNodes: 6,
//     totalMaterials: 20,
//     progressPercentage: 75,
//     isEnrolled: true,
//     popularity: 1240,
//     createdAt: "2026-05-20T10:00:00.000Z",
//     thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf93a163b78?w=800&q=80",
//   },
//   {
//     courseId: 4,
//     courseName: "TOEIC Listening & Reading 750+",
//     description:
//       "Luyện chiến lược làm bài nhanh, bẫy thường gặp và bộ từ vựng trọng tâm cho kỳ thi TOEIC.",
//     category: "TOEIC",
//     level: "Trung cấp",
//     instructor: "Nguyễn Bảo Trân",
//     totalLessons: 20,
//     totalNodes: 5,
//     totalMaterials: 18,
//     progressPercentage: 0,
//     isEnrolled: false,
//     popularity: 1100,
//     createdAt: "2026-05-18T10:00:00.000Z",
//     thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
//   },
//   {
//     courseId: 5,
//     courseName: "Ngữ pháp tiếng Anh nền tảng",
//     description:
//       "Hệ thống hóa thì, cấu trúc câu và lỗi sai phổ biến giúp bạn viết và nói chính xác hơn.",
//     category: "Ngữ pháp",
//     level: "Cơ bản",
//     instructor: "Nguyễn Lan Anh",
//     totalLessons: 14,
//     totalNodes: 7,
//     totalMaterials: 22,
//     progressPercentage: 15,
//     isEnrolled: true,
//     popularity: 860,
//     createdAt: "2026-05-15T10:00:00.000Z",
//   },
//   {
//     courseId: 6,
//     courseName: "Phát âm chuẩn & Intonation",
//     description:
//       "Luyện âm cuối, nối âm, trọng âm và ngữ điệu tự nhiên qua bài tập nghe-nhại thực tế.",
//     category: "Phát âm",
//     level: "Trung cấp",
//     instructor: "Đỗ Khánh Vy",
//     totalLessons: 10,
//     totalNodes: 3,
//     totalMaterials: 9,
//     progressPercentage: 0,
//     isEnrolled: false,
//     popularity: 540,
//     createdAt: "2026-05-12T10:00:00.000Z",
//     thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
//   },
//   {
//     courseId: 7,
//     courseName: "IELTS Speaking Part 2 & 3",
//     description:
//       "Xây dựng câu trả lời mạch lạc, mở rộng ý và tự tin giao tiếp trong phòng thi IELTS.",
//     category: "IELTS",
//     level: "Trung cấp",
//     instructor: "Vũ Minh Tuấn",
//     totalLessons: 11,
//     totalNodes: 4,
//     totalMaterials: 14,
//     progressPercentage: 0,
//     isEnrolled: false,
//     popularity: 990,
//     createdAt: "2026-05-10T10:00:00.000Z",
//   },
//   {
//     courseId: 8,
//     courseName: "Giao tiếp đời sống hàng ngày",
//     description:
//       "Tình huống thực tế: mua sắm, du lịch, hỏi đường và trò chuyện xã giao tự nhiên.",
//     category: "Giao tiếp",
//     level: "Cơ bản",
//     instructor: "Lê Thu Hà",
//     totalLessons: 9,
//     totalNodes: 3,
//     totalMaterials: 8,
//     progressPercentage: 100,
//     isEnrolled: true,
//     popularity: 720,
//     createdAt: "2026-05-08T10:00:00.000Z",
//     thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
//   },
//   {
//     courseId: 9,
//     courseName: "TOEIC Writing & Speaking 200+",
//     description:
//       "Rèn kỹ năng viết email, mô tả ảnh và trả lời phỏng vấn theo chuẩn TOEIC Writing & Speaking.",
//     category: "TOEIC",
//     level: "Nâng cao",
//     instructor: "Trịnh Hoàng Nam",
//     totalLessons: 15,
//     totalNodes: 5,
//     totalMaterials: 16,
//     progressPercentage: 0,
//     isEnrolled: false,
//     popularity: 780,
//     createdAt: "2026-05-05T10:00:00.000Z",
//     thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
//   },
//   {
//     courseId: 10,
//     courseName: "Ngữ âm tiếng Anh Mỹ",
//     description:
//       "Phân biệt vowels & consonants, luyện accent Mỹ tự nhiên qua các bài tập shadow speaking.",
//     category: "Phát âm",
//     level: "Cơ bản",
//     instructor: "Mai Phương Anh",
//     totalLessons: 12,
//     totalNodes: 4,
//     totalMaterials: 11,
//     progressPercentage: 30,
//     isEnrolled: true,
//     popularity: 610,
//     createdAt: "2026-05-01T10:00:00.000Z",
//   },
//   {
//     courseId: 11,
//     courseName: "IELTS Reading: True/False/Not Given",
//     description:
//       "Chiến lược đọc nhanh, nhận diện paraphrase và xử lý dạng câu hỏi True/False/Not Given trong IELTS Reading.",
//     category: "IELTS",
//     level: "Trung cấp",
//     instructor: "Phạm Văn Đức",
//     totalLessons: 13,
//     totalNodes: 5,
//     totalMaterials: 15,
//     progressPercentage: 55,
//     isEnrolled: true,
//     popularity: 870,
//     createdAt: "2026-04-28T10:00:00.000Z",
//     thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
//   },
//   {
//     courseId: 12,
//     courseName: "TOEIC Part 7: Đọc hiểu nhanh",
//     description:
//       "Luyện đọc email, thông báo và bài quảng cáo trong Part 7 với mẹo quản lý thời gian hiệu quả.",
//     category: "TOEIC",
//     level: "Cơ bản",
//     instructor: "Lê Quang Huy",
//     totalLessons: 10,
//     totalNodes: 3,
//     totalMaterials: 10,
//     progressPercentage: 0,
//     isEnrolled: false,
//     popularity: 640,
//     createdAt: "2026-04-25T10:00:00.000Z",
//   },
//   {
//     courseId: 13,
//     courseName: "Email tiếng Anh chuyên nghiệp",
//     description:
//       "Viết email trang trọng, từ chối lịch sự và follow-up hiệu quả trong môi trường công việc quốc tế.",
//     category: "Giao tiếp",
//     level: "Trung cấp",
//     instructor: "Nguyễn Minh An",
//     totalLessons: 9,
//     totalNodes: 3,
//     totalMaterials: 8,
//     progressPercentage: 20,
//     isEnrolled: true,
//     popularity: 750,
//     createdAt: "2026-04-22T10:00:00.000Z",
//     thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80",
//   },
//   {
//     courseId: 14,
//     courseName: "Thì trong tiếng Anh: Tổng ôn",
//     description:
//       "Ôn tập 12 thì cơ bản và nâng cao, phân biệt cách dùng thực tế qua bài tập viết và chuyển đổi thì.",
//     category: "Ngữ pháp",
//     level: "Trung cấp",
//     instructor: "Nguyễn Lan Anh",
//     totalLessons: 18,
//     totalNodes: 6,
//     totalMaterials: 24,
//     progressPercentage: 0,
//     isEnrolled: false,
//     popularity: 930,
//     createdAt: "2026-04-18T10:00:00.000Z",
//   },
//   {
//     courseId: 15,
//     courseName: "Shadowing & Connected Speech",
//     description:
//       "Luyện nói theo người bản xứ, nắm quy tắc nối âm và rút gọn âm để nghe hiểu tự nhiên hơn.",
//     category: "Phát âm",
//     level: "Nâng cao",
//     instructor: "Đỗ Khánh Vy",
//     totalLessons: 14,
//     totalNodes: 4,
//     totalMaterials: 13,
//     progressPercentage: 65,
//     isEnrolled: true,
//     popularity: 580,
//     createdAt: "2026-04-15T10:00:00.000Z",
//     thumbnail: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80",
//   },
//   {
//     courseId: 16,
//     courseName: "IELTS Listening: Map & Diagram",
//     description:
//       "Kỹ năng nghe mô tả bản đồ, sơ đồ và quy trình — dạng bài thường gặp trong IELTS Listening.",
//     category: "IELTS",
//     level: "Cơ bản",
//     instructor: "Lê Quang Huy",
//     totalLessons: 11,
//     totalNodes: 4,
//     totalMaterials: 12,
//     progressPercentage: 0,
//     isEnrolled: false,
//     popularity: 810,
//     createdAt: "2026-04-12T10:00:00.000Z",
//   },
//   {
//     courseId: 17,
//     courseName: "Phỏng vấn xin việc bằng tiếng Anh",
//     description:
//       "Chuẩn bị câu trả lời STAR, mô tả kinh nghiệm và đặt câu hỏi ngược trong buổi phỏng vấn.",
//     category: "Giao tiếp",
//     level: "Nâng cao",
//     instructor: "Hoàng Thùy Linh",
//     totalLessons: 10,
//     totalNodes: 3,
//     totalMaterials: 9,
//     progressPercentage: 0,
//     isEnrolled: false,
//     popularity: 1050,
//     createdAt: "2026-04-08T10:00:00.000Z",
//     thumbnail: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
//   },
//   {
//     courseId: 18,
//     courseName: "TOEIC 900+: Chiến lược cao điểm",
//     description:
//       "Tổng hợp chiến thuật cho thí sinh mục tiêu 900+, tập trung vào bẫy và từ vựng học thuật.",
//     category: "TOEIC",
//     level: "Nâng cao",
//     instructor: "Nguyễn Bảo Trân",
//     totalLessons: 22,
//     totalNodes: 7,
//     totalMaterials: 25,
//     progressPercentage: 85,
//     isEnrolled: true,
//     popularity: 1320,
//     createdAt: "2026-04-05T10:00:00.000Z",
//     thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
//   },
//   {
//     courseId: 19,
//     courseName: "Mệnh đề & Câu phức tiếng Anh",
//     description:
//       "Relative clauses, conditionals và câu ghép phức tạp — nền tảng viết luận và báo cáo chuẩn học thuật.",
//     category: "Ngữ pháp",
//     level: "Nâng cao",
//     instructor: "Nguyễn Lan Anh",
//     totalLessons: 16,
//     totalNodes: 5,
//     totalMaterials: 19,
//     progressPercentage: 10,
//     isEnrolled: true,
//     popularity: 690,
//     createdAt: "2026-04-01T10:00:00.000Z",
//   },
//   {
//     courseId: 20,
//     courseName: "Luyện nghe podcast tiếng Anh",
//     description:
//       "Nghe podcast thực tế, ghi chú ý chính và tóm tắt nội dung — phù hợp trình độ trung cấp trở lên.",
//     category: "Phát âm",
//     level: "Trung cấp",
//     instructor: "Mai Phương Anh",
//     totalLessons: 12,
//     totalNodes: 4,
//     totalMaterials: 10,
//     progressPercentage: 0,
//     isEnrolled: false,
//     popularity: 560,
//     createdAt: "2026-03-28T10:00:00.000Z",
//     thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
//   },
// ];
function getSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "{}");
  } catch (error) {
    console.error("Parse session user error:", error);
    return {};
  }
}

function getUserId(user) {
  return user.userId ?? user.UserId ?? user.id ?? user.Id;
}

function getUserRoleName(user) {
  const role =
    user?.roleName ??
    user?.RoleName ??
    user?.role ??
    user?.Role ??
    user?.roles?.[0] ??
    user?.Roles?.[0];

  return String(role || "").toLowerCase();
}
async function fetchCourses(userId, roleName) {
  if (roleName !== "student") {
    return [];
  }

  const res = await fetch("http://localhost:5000/api/courses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: Number(userId),
      roleName,
    }),
  });

  if (!res.ok) {
    throw new Error("Cannot fetch courses");
  }

  const result = await res.json();
  const rawCourses = result.data || [];

  return rawCourses.map((course) => ({
    courseId: course.courseId ?? course.CourseId,
    courseName: course.courseName ?? course.CourseName,
    description: course.description ?? course.Description ?? "",
    category: course.category ?? course.Category ?? "Giao tiếp",
    level: course.level ?? course.Level ?? "Cơ bản",
    instructor: course.instructor ?? course.Instructor ?? "Chưa cập nhật",
    totalLessons: course.totalLessons ?? course.TotalLessons ?? 0,
    totalNodes: course.totalNodes ?? course.TotalNodes ?? 0,
    totalMaterials: course.totalMaterials ?? course.TotalMaterials ?? 0,
    progressPercentage: course.progressPercentage ?? course.ProgressPercentage ?? 0,
    isEnrolled: course.isEnrolled ?? course.IsEnrolled ?? false,
    popularity: course.popularity ?? course.Popularity ?? 0,
    rating: course.rating ?? course.Rating ?? 0,
    reviewCount: course.reviewCount ?? course.ReviewCount ?? 0,
    studentCount: course.studentCount ?? course.StudentCount ?? 0,
    createdAt: course.createdAt ?? course.CreatedAt ?? new Date().toISOString(),
    thumbnail: course.thumbnail ?? course.Thumbnail ?? "",
  }));
}
export default function CourseListPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();


  const user = useMemo(() => getSessionUser(), []);
  const userId = getUserId(user);
  const roleName = getUserRoleName(user);

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

        if (roleName !== "student") {
          if (isMounted) {
            setCourses([]);
          }
          return;
        }

        const data = await fetchCourses(userId, roleName);

        if (isMounted) {
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch {
        toast.error("Không thể tải danh sách khóa học. Vui lòng thử lại.");

        if (isMounted) {
          setCourses([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, [userId, roleName]);

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
