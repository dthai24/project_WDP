/**
 * CourseCard ─ Card hiển thị một khóa học trong danh sách catalog
 */
import { Box, Card, CardContent, Chip, Typography, alpha, useTheme } from "@mui/material";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

// Icons
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";

// Local Components & Utils
import AppButton from "@/shared/ui/AppButton";
import AppProgressBar, { getProgressColor } from "@/shared/ui/AppProgressBar";
import CourseBookmarkButton from "./CourseBookmarkButton";
import { buildCourseDetailPath } from "@/features/courses/utils/courseListParams";

/* ─── HÀM HELPER ─── */
const MUTED = "#64748B";
const TEXT = "#0F172A";

function formatStudentCount(count) {
  if (count >= 1000) return count.toLocaleString("vi-VN");
  return String(count);
}

function normalizeCourse(course = {}) {
  const progress = course.progressPercentage ?? course.progress ?? 0;
  const isEnrolled = course.isEnrolled ?? progress > 0;
  return {
    courseId: course.CourseId ?? course.id,
    courseName: course.CourseName ?? course.title ?? "Khóa học",
    thumbnail: course.Thumbnail ?? null,
    category: course.Category ?? "",
    level: course.Level ?? "",
    instructor: course.Instructor ?? "",
    rating: course.Rating ?? null,
    reviewCount: course.ReviewCount ?? 0,
    studentCount: course.StudentCount ?? 0,
    totalLessons: course.TotalLessons ?? course.totalNodes ?? 0,
    totalNodes: course.TotalNodes ?? 0,
    totalMaterials: course.TotalMaterials ?? 0,
    progressPercentage: progress,
    isEnrolled,
  };
}

function getStatusChipStyle(isEnrolled, progress) {
  if (!isEnrolled) {
    return {
      label: "Chưa đăng ký",
      sx: { bgcolor: "rgba(100,116,139,0.10)", color: "#64748B", border: "1px solid rgba(100,116,139,0.18)" },
    };
  }
  if (progress >= 100) {
    return {
      label: "Hoàn thành",
      sx: { bgcolor: "rgba(4,120,87,0.12)", color: "#047857", border: "1px solid rgba(4,120,87,0.24)" },
    };
  }
  if (progress > 0) {
    return {
      label: "Đang học",
      sx: { bgcolor: "rgba(8,145,178,0.12)", color: "#0891B2", border: "1px solid rgba(8,145,178,0.20)" },
    };
  }
  return {
    label: "Đã đăng ký",
    sx: { bgcolor: "rgba(22,163,74,0.12)", color: "#16A34A", border: "1px solid rgba(22,163,74,0.20)" },
  };
}

function getMyCoursesStatusChip(progress) {
  if (progress >= 100) {
    return {
      label: "Hoàn thành",
      sx: { bgcolor: "rgba(4,120,87,0.12)", color: "#047857", border: "1px solid rgba(4,120,87,0.24)" },
    };
  }
  if (progress > 0) {
    return {
      label: "Đang học",
      sx: { bgcolor: "rgba(8,145,178,0.12)", color: "#0891B2", border: "1px solid rgba(8,145,178,0.20)" },
    };
  }
  return {
    label: "Chưa bắt đầu",
    sx: { bgcolor: "rgba(100,116,139,0.10)", color: "#64748B", border: "1px solid rgba(100,116,139,0.18)" },
  };
}

function getLevelChipStyle(level = "") {
  const l = level.toLowerCase();
  if (l.includes("cơ bản") || l.includes("sơ cấp")) {
    return { bgcolor: "rgba(56,189,248,0.12)", color: "#0284C7", border: "1px solid rgba(56,189,248,0.22)" };
  }
  if (l.includes("trung cấp")) {
    return { bgcolor: "rgba(245,158,11,0.12)", color: "#D97706", border: "1px solid rgba(245,158,11,0.22)" };
  }
  if (l.includes("nâng cao")) {
    return { bgcolor: "rgba(234,88,12,0.12)", color: "#EA580C", border: "1px solid rgba(234,88,12,0.22)" };
  }
  return { bgcolor: "#F1F5F9", color: "#64748B" };
}

function getCategoryChipStyle(category = "") {
  const map = {
    "Giao tiếp": { bgcolor: "rgba(37,99,235,0.10)", color: "#2563EB" },
    "IELTS": { bgcolor: "rgba(124,58,237,0.10)", color: "#7C3AED" },
    "TOEIC": { bgcolor: "rgba(14,116,144,0.10)", color: "#0E7490" },
    "Ngữ pháp": { bgcolor: "rgba(15,23,42,0.08)", color: "#334155" },
    "Phát âm": { bgcolor: "rgba(236,72,153,0.10)", color: "#DB2777" },
  };
  return map[category] ?? { bgcolor: "#F1F5F9", color: "#64748B" };
}

/* ─── COMPONENT CON ─── */
function CourseThumbnail({ thumbnail }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: "100%",
        aspectRatio: "16 / 9",
        overflow: "hidden",
        bgcolor: alpha(theme.palette.primary.main, 0.06),
        backgroundImage: thumbnail ? `url(${thumbnail})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {!thumbnail && (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
          }}
        >
          <MenuBookOutlinedIcon sx={{ fontSize: 24 }} />
        </Box>
      )}
    </Box>
  );
}

function MetaInline({ icon: Icon, label }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Icon sx={{ fontSize: 15, color: "rgba(8,145,178,0.75)", flexShrink: 0 }} />
      <Typography sx={{ fontSize: 12.5, color: MUTED, fontWeight: 500, lineHeight: 1.2 }}>
        {label}
      </Typography>
    </Box>
  );
}

/* ─── COMPONENT CHÍNH ─── */
export default function CourseCard({
  course,
  variant = "catalog",
  isSaved = false,
  onToggleSave,
  onEnroll,
  onContinueLearning,
  onStartLearning,
  onClick,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Khởi tạo các biến logic
  const isCatalog = variant === "catalog";
  const isMyCourses = variant === "myCourses";
  const data = normalizeCourse(course);

  const statusChip = isMyCourses ? getMyCoursesStatusChip(data.progressPercentage) : getStatusChipStyle(data.isEnrolled, data.progressPercentage);
  const levelStyle = getLevelChipStyle(data.level);
  const categoryStyle = getCategoryChipStyle(data.category);

  const progressValue = Math.min(Math.max(data.progressPercentage, 0), 100);
  const progressTextColor = getProgressColor(progressValue);
  const isCompleted = progressValue >= 100;
  const isNotStarted = isMyCourses && progressValue === 0;
  const showProgress = isMyCourses || data.isEnrolled;
  const lastActivity = course.lastActivity;

  // Xử lý đường dẫn
  const listFromUrl = isMyCourses ? "/my-courses" : location.pathname === "/courses" ? `${location.pathname}${location.search}` : undefined;
  const detailPath = buildCourseDetailPath(data.courseId, searchParams, listFromUrl);

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "#FFFFFF",
        borderRadius: "18px",
        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        boxShadow: theme.ios18?.shadow?.sm,
        cursor: onClick ? "pointer" : "default",
        transition: [
          `transform 0.25s ${theme.ios18?.transition}`,
          `box-shadow 0.25s ${theme.ios18?.transition}`,
          `border-color 0.25s ${theme.ios18?.transition}`,
        ].join(", "),
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.ios18?.shadow?.md,
          borderColor: alpha(theme.palette.primary.main, 0.18),
        },
      }}
    >
      {/* ── Hình thu nhỏ ── */}
      <CourseThumbnail thumbnail={data.thumbnail} />

      {/* ── Nội dung thẻ ── */}
      <CardContent
        sx={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
          p: 2,
          "&:last-child": { pb: 2 },
        }}
      >
        {/* Nút lưu khóa học */}
        {isCatalog && onToggleSave && (
          <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}>
            <CourseBookmarkButton isSaved={isSaved} onToggle={onToggleSave} />
          </Box>
        )}

        {/* Tiêu đề */}
        <Typography
          component={Link}
          to={detailPath}
          onClick={(e) => e.stopPropagation()}
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            lineHeight: 1.35,
            color: TEXT,
            textDecoration: "none",
            cursor: "pointer",
            pr: isCatalog && onToggleSave ? 4 : 0,
            transition: `color 0.18s ${theme.ios18?.transition}`,
            "&:hover": { color: "primary.main" },
          }}
        >
          {data.courseName}
        </Typography>

        {/* Đánh giá & Học viên */}
        {(data.rating != null || data.studentCount > 0) && (
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.25 }}>
            {data.rating != null && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <StarRoundedIcon sx={{ fontSize: 15, color: "#F59E0B" }} />
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: TEXT, lineHeight: 1 }}>
                  {Number(data.rating).toFixed(1)}
                </Typography>
                {data.reviewCount > 0 && (
                  <Typography sx={{ fontSize: 11.5, color: MUTED, lineHeight: 1 }}>
                    ({data.reviewCount.toLocaleString("vi-VN")})
                  </Typography>
                )}
              </Box>
            )}
            {data.rating != null && data.studentCount > 0 && (
              <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#CBD5E1", flexShrink: 0 }} />
            )}
            {data.studentCount > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <PeopleOutlineRoundedIcon sx={{ fontSize: 15, color: "#94A3B8" }} />
                <Typography sx={{ fontSize: 12, color: MUTED, fontWeight: 500, lineHeight: 1 }}>
                  {formatStudentCount(data.studentCount)} học viên
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Trạng thái, Cấp độ, Danh mục */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          <Chip label={statusChip.label} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600, borderRadius: "99px", ...statusChip.sx }} />
          {data.level && <Chip label={data.level} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600, borderRadius: "99px", ...levelStyle }} />}
          {data.category && <Chip label={data.category} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600, borderRadius: "99px", ...categoryStyle }} />}
        </Box>

        {/* Thông tin Bài học, Chương, Học liệu */}
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, py: 0.5 }}>
          <MetaInline icon={MenuBookOutlinedIcon} label={`${data.totalLessons} bài`} />
          <MetaInline icon={RouteOutlinedIcon} label={`${data.totalNodes} chương`} />
          <MetaInline icon={ArticleOutlinedIcon} label={`${data.totalMaterials} học liệu`} />
        </Box>

        {/* Giảng viên */}
        {data.instructor && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
            <PersonOutlineOutlinedIcon sx={{ fontSize: 13, color: "#94A3B8", flexShrink: 0 }} />
            <Typography sx={{ fontSize: 11.5, color: MUTED, flexShrink: 0 }}>Giảng viên:</Typography>
            <Typography sx={{ fontSize: 12, color: TEXT, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {data.instructor}
            </Typography>
          </Box>
        )}

        {/* Thanh Tiến độ (Nếu đang học) */}
        {showProgress && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, fontSize: 11.5 }}>
                {isCompleted ? "Hoàn thành" : "Tiến độ"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {isCompleted && <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14, color: progressTextColor }} />}
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11.5, color: progressTextColor }}>
                  {data.progressPercentage}%
                </Typography>
              </Box>
            </Box>
            <AppProgressBar value={progressValue} height={6} />
          </Box>
        )}

        {/* Hoạt động gần nhất */}
        {isMyCourses && lastActivity && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: -0.25 }}>
            <AccessTimeOutlinedIcon sx={{ fontSize: 12, color: "#94A3B8" }} />
            <Typography variant="caption" sx={{ color: "#64748B", fontSize: 11.5, fontWeight: 500 }}>
              Học gần nhất: {lastActivity}
            </Typography>
          </Box>
        )}

        {/* ── Nút Hành Động Cuối Card ── */}
        <Box sx={{ mt: "auto", pt: 0.75 }}>
          {isMyCourses ? (
            <AppButton
              fullWidth
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                if (isCompleted) {
                  onContinueLearning?.(course);
                } else if (isNotStarted) {
                  onStartLearning?.(course) ?? onContinueLearning?.(course);
                } else {
                  onContinueLearning?.(course);
                }
              }}
            >
              {isCompleted ? "Ôn tập lại" : isNotStarted ? "Bắt đầu học" : "Tiếp tục học"}
            </AppButton>
          ) : data.isEnrolled ? (
            <AppButton
              fullWidth
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                onContinueLearning?.(course);
              }}
            >
              Tiếp tục học
            </AppButton>
          ) : (
            <AppButton
              fullWidth
              size="small"
              variant="accent"
              onClick={(e) => {
                e.stopPropagation();
                if (onEnroll) {
                  onEnroll(course);
                } else {
                  navigate(buildCourseDetailPath(data.courseId, searchParams, listFromUrl));
                }
              }}
            >
              Đăng ký
            </AppButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}