import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { Link, useNavigate } from "react-router-dom";
import AppButton from "../common/AppButton";

/* ─── helpers ─── */

function normalizeCourse(course = {}) {
  const progress = course.progressPercentage ?? course.progress ?? 0;
  const isEnrolled = course.isEnrolled ?? progress > 0;
  return {
    courseId:          course.courseId ?? course.id,
    courseName:        course.courseName ?? course.title ?? "Khóa học",
    thumbnail:         course.thumbnail ?? null,
    category:          course.category ?? "",
    level:             course.level ?? "",
    totalLessons:      course.totalLessons ?? course.totalNodes ?? 0,
    totalNodes:        course.totalNodes ?? 0,
    totalMaterials:    course.totalMaterials ?? 0,
    progressPercentage: progress,
    isEnrolled,
  };
}

function getStatusChipStyle(isEnrolled, progress) {
  if (!isEnrolled) return {
    label: "Chưa đăng ký",
    sx: {
      bgcolor: "rgba(100,116,139,0.10)",
      color: "#64748B",
      border: "1px solid rgba(100,116,139,0.18)",
    },
  };
  if (progress >= 100) return {
    label: "Hoàn thành",
    sx: {
      bgcolor: "rgba(4,120,87,0.12)",
      color: "#047857",
      border: "1px solid rgba(4,120,87,0.24)",
    },
  };
  if (progress > 0) return {
    label: "Đang học",
    sx: {
      bgcolor: "rgba(8,145,178,0.12)",
      color: "#0891B2",
      border: "1px solid rgba(8,145,178,0.20)",
    },
  };
  return {
    label: "Đã đăng ký",
    sx: {
      bgcolor: "rgba(22,163,74,0.12)",
      color: "#16A34A",
      border: "1px solid rgba(22,163,74,0.20)",
    },
  };
}

function getLevelChipStyle(level = "") {
  const l = level.toLowerCase();
  if (l.includes("cơ bản") || l.includes("sơ cấp")) return {
    bgcolor: "rgba(56,189,248,0.12)",
    color: "#0284C7",
    border: "1px solid rgba(56,189,248,0.22)",
  };
  if (l.includes("trung cấp")) return {
    bgcolor: "rgba(245,158,11,0.12)",
    color: "#D97706",
    border: "1px solid rgba(245,158,11,0.22)",
  };
  if (l.includes("nâng cao")) return {
    bgcolor: "rgba(234,88,12,0.12)",
    color: "#EA580C",
    border: "1px solid rgba(234,88,12,0.22)",
  };
  return { bgcolor: "#F1F5F9", color: "#64748B" };
}

function getCategoryChipStyle(category = "") {
  const map = {
    "Giao tiếp": { bgcolor: "rgba(37,99,235,0.10)",  color: "#2563EB" },
    "IELTS":     { bgcolor: "rgba(124,58,237,0.10)", color: "#7C3AED" },
    "TOEIC":     { bgcolor: "rgba(14,116,144,0.10)", color: "#0E7490" },
    "Ngữ pháp":  { bgcolor: "rgba(15,23,42,0.08)",   color: "#334155" },
    "Phát âm":   { bgcolor: "rgba(236,72,153,0.10)", color: "#DB2777" },
  };
  return map[category] ?? { bgcolor: "#F1F5F9", color: "#64748B" };
}

function getProgressStyle(progress) {
  if (progress >= 100) {
    return {
      color: "#047857",
      trackColor: "rgba(4,120,87,0.14)",
      label: "Hoàn thành",
      completed: true,
    };
  }
  if (progress >= 70) {
    return {
      color: "#16A34A",
      trackColor: "rgba(22,163,74,0.12)",
      label: "Tiến độ",
      completed: false,
    };
  }
  if (progress >= 30) {
    return {
      color: "#0891B2",
      trackColor: "rgba(8,145,178,0.12)",
      label: "Tiến độ",
      completed: false,
    };
  }
  return {
    color: "#F59E0B",
    trackColor: "rgba(245,158,11,0.14)",
    label: "Tiến độ",
    completed: false,
  };
}

/* ─── sub-components ─── */

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

function MetaItem({ icon: Icon, label }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Icon sx={{ fontSize: 12, color: "#94A3B8", flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500, lineHeight: 1, fontSize: 11.5 }}>
        {label}
      </Typography>
    </Box>
  );
}

/* ─── main component ─── */

export default function CourseCard({
  course,
  onEnroll,
  onContinueLearning,
  onClick,
}) {
  const theme   = useTheme();
  const navigate = useNavigate();
  const data         = normalizeCourse(course);
  const statusChip   = getStatusChipStyle(data.isEnrolled, data.progressPercentage);
  const levelStyle   = getLevelChipStyle(data.level);
  const categoryStyle = getCategoryChipStyle(data.category);
  const progressStyle = getProgressStyle(data.progressPercentage);
  const detailPath = `/courses/${data.courseId}`;

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
      {/* ── Thumbnail — clean, no overlaid chips ── */}
      <CourseThumbnail thumbnail={data.thumbnail} />

      {/* ── Body ── */}
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
          p: 2,
          "&:last-child": { pb: 2 },
        }}
      >
        {/* Title link */}
        <Typography
          component={Link}
          to={detailPath}
          onClick={(e) => e.stopPropagation()}
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            lineHeight: 1.35,
            color: "#0F172A",
            textDecoration: "none",
            cursor: "pointer",
            transition: `color 0.18s ${theme.ios18?.transition}`,
            "&:hover": { color: "primary.main" },
          }}
        >
          {data.courseName}
        </Typography>

        {/* Chip row — status + level + category */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          <Chip
            label={statusChip.label}
            size="small"
            sx={{ height: 22, fontSize: 11, fontWeight: 600, borderRadius: "99px", ...statusChip.sx }}
          />
          {data.level && (
            <Chip
              label={data.level}
              size="small"
              sx={{ height: 22, fontSize: 11, fontWeight: 600, borderRadius: "99px", ...levelStyle }}
            />
          )}
          {data.category && (
            <Chip
              label={data.category}
              size="small"
              sx={{ height: 22, fontSize: 11, fontWeight: 600, borderRadius: "99px", ...categoryStyle }}
            />
          )}
        </Box>

        {/* Metadata */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
          <MetaItem icon={MenuBookOutlinedIcon} label={`${data.totalLessons} bài học`} />
          <MetaItem icon={RouteOutlinedIcon}    label={`${data.totalNodes} chặng`} />
          <MetaItem icon={ArticleOutlinedIcon}  label={`${data.totalMaterials} học liệu`} />
        </Box>

        {/* Progress bar — only when enrolled */}
        {data.isEnrolled && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, fontSize: 11.5 }}>
                {progressStyle.label}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {progressStyle.completed && (
                  <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14, color: progressStyle.color }} />
                )}
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11.5, color: progressStyle.color }}>
                  {data.progressPercentage}%
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(Math.max(data.progressPercentage, 0), 100)}
              sx={{
                height: progressStyle.completed ? 7 : 6,
                borderRadius: 99,
                bgcolor: progressStyle.trackColor,
                "& .MuiLinearProgress-bar": {
                  borderRadius: 99,
                  backgroundColor: progressStyle.color,
                  ...(progressStyle.completed && {
                    backgroundImage: "linear-gradient(90deg, #047857 0%, #059669 100%)",
                  }),
                },
              }}
            />
          </Box>
        )}

        {/* Action button — distinct colors by state */}
        <Box sx={{ mt: "auto", pt: 0.75 }}>
          {data.isEnrolled ? (
            <AppButton
              fullWidth
              size="small"
              variant="contained"
              onClick={(e) => { e.stopPropagation(); onContinueLearning?.(course); }}
            >
              Tiếp tục học
            </AppButton>
          ) : (
            // Đăng ký dẫn đến trang detail, không đăng ký trực tiếp ở list
            <AppButton
              fullWidth
              size="small"
              variant="accent"
              onClick={(e) => {
                e.stopPropagation();
                if (onEnroll) {
                  onEnroll(course);
                } else {
                  navigate(`/courses/${data.courseId}`);
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
