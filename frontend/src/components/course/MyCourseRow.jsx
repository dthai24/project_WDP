import { useState } from "react";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AppButton from "../common/AppButton";
import MyCourseProgressSummary from "./MyCourseProgressSummary";
import { buildCourseDetailPath } from "../../utils/courseListParams";

const MUTED = "#64748B";
const TEXT = "#0F172A";
const PRIMARY = "#0891B2";
const SAVED = "#F59E0B";

const ghostIconSx = {
  p: 0.25,
  width: 28,
  height: 28,
  color: MUTED,
  bgcolor: "transparent",
  transition: "color 0.2s ease",
  "&:hover": {
    bgcolor: "transparent",
    color: PRIMARY,
  },
};

function normalizeCourse(course = {}) {
  const progress = course.progressPercentage ?? course.progress ?? 0;
  return {
    courseId: course.courseId ?? course.id,
    courseName: course.courseName ?? course.title ?? "Khóa học",
    thumbnail: course.thumbnail ?? null,
    category: course.category ?? "",
    level: course.level ?? "",
    totalLessons: course.totalLessons ?? 0,
    totalNodes: course.totalNodes ?? 0,
    totalMaterials: course.totalMaterials ?? 0,
    progressPercentage: progress,
    enrollmentStatus: course.enrollmentStatus ?? "none",
    isSaved: course.isSaved ?? false,
    currentStage: course.currentStage ?? null,
    currentLesson: course.currentLesson ?? null,
    lastActivity: course.lastActivity ?? null,
    modules: course.modules ?? [],
    currentLessonDetail: course.currentLessonDetail ?? null,
    recentLessons: course.recentLessons ?? [],
  };
}

function getLearningStatusChip() {
  return {
    label: "Đang học",
    sx: {
      bgcolor: "rgba(8,145,178,0.12)",
      color: PRIMARY,
      border: "1px solid rgba(8,145,178,0.20)",
    },
  };
}

function getCompletedStatusChip() {
  return {
    label: "Hoàn thành",
    sx: {
      bgcolor: "rgba(4,120,87,0.12)",
      color: "#047857",
      border: "1px solid rgba(4,120,87,0.24)",
    },
  };
}

function getSavedStatusChip() {
  return {
    label: "Đã lưu",
    sx: {
      bgcolor: "rgba(245,158,11,0.10)",
      color: "#D97706",
      border: "1px solid rgba(245,158,11,0.22)",
    },
  };
}

function getLevelChipStyle(level = "") {
  const l = level.toLowerCase();
  if (l.includes("cơ bản") || l.includes("sơ cấp")) {
    return {
      bgcolor: "rgba(56,189,248,0.12)",
      color: "#0284C7",
      border: "1px solid rgba(56,189,248,0.22)",
    };
  }
  if (l.includes("trung cấp")) {
    return {
      bgcolor: "rgba(245,158,11,0.12)",
      color: "#D97706",
      border: "1px solid rgba(245,158,11,0.22)",
    };
  }
  if (l.includes("nâng cao")) {
    return {
      bgcolor: "rgba(234,88,12,0.12)",
      color: "#EA580C",
      border: "1px solid rgba(234,88,12,0.22)",
    };
  }
  return { bgcolor: "#F1F5F9", color: "#64748B" };
}

function getCategoryChipStyle(category = "") {
  const map = {
    "Giao tiếp": { bgcolor: "rgba(37,99,235,0.10)", color: "#2563EB" },
    IELTS: { bgcolor: "rgba(124,58,237,0.10)", color: "#7C3AED" },
    TOEIC: { bgcolor: "rgba(14,116,144,0.10)", color: "#0E7490" },
    "Ngữ pháp": { bgcolor: "rgba(15,23,42,0.08)", color: "#334155" },
    "Phát âm": { bgcolor: "rgba(236,72,153,0.10)", color: "#DB2777" },
  };
  return map[category] ?? { bgcolor: "#F1F5F9", color: "#64748B" };
}

function getProgressGradient(progress) {
  const value = Math.max(0, Math.min(progress, 100));
  if (value === 0) return "#94A3B8";
  if (value >= 100) return "linear-gradient(90deg, #22C55E 0%, #16A34A 100%)";
  if (value >= 90) return "linear-gradient(90deg, #0891B2 0%, #F59E0B 100%)";
  return "linear-gradient(90deg, #EA580C 0%, #F59E0B 45%, #0891B2 100%)";
}

function getProgressTextColor(progress) {
  const value = Math.max(0, Math.min(progress, 100));
  if (value === 0) return "#94A3B8";
  if (value >= 100) return "#16A34A";
  if (value >= 90) return "#F59E0B";
  if (value >= 30) return PRIMARY;
  return "#EA580C";
}

function MetaItem({ icon: Icon, label }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Icon sx={{ fontSize: 13, color: "#94A3B8", flexShrink: 0 }} />
      <Typography sx={{ fontSize: 12, color: MUTED, fontWeight: 500, lineHeight: 1.2 }}>
        {label}
      </Typography>
    </Box>
  );
}

function RowTopActions({ showBookmark, isSaved, onBookmarkToggle, showExpand, expanded, onExpandToggle }) {
  if (!showBookmark && !showExpand) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: { xs: 10, md: 12 },
        right: { xs: 10, md: 12 },
        display: "flex",
        alignItems: "center",
        gap: 0.25,
        zIndex: 1,
      }}
    >
      {showBookmark && (
        <Tooltip title={isSaved ? "Bỏ lưu" : "Lưu khóa học"}>
          <IconButton
            size="small"
            aria-label={isSaved ? "Bỏ lưu" : "Lưu khóa học"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookmarkToggle?.();
            }}
            sx={{
              ...ghostIconSx,
              color: isSaved ? SAVED : MUTED,
              "&:hover": { bgcolor: "transparent", color: isSaved ? SAVED : PRIMARY },
            }}
          >
            {isSaved ? (
              <BookmarkRoundedIcon sx={{ fontSize: 20 }} />
            ) : (
              <BookmarkBorderRoundedIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Tooltip>
      )}
      {showExpand && (
        <Tooltip title={expanded ? "Thu gọn" : "Xem tiến độ khóa học"}>
          <IconButton
            size="small"
            aria-label={expanded ? "Thu gọn" : "Xem tiến độ khóa học"}
            onClick={() => onExpandToggle?.()}
            sx={ghostIconSx}
          >
            {expanded ? (
              <ExpandLessRoundedIcon sx={{ fontSize: 20 }} />
            ) : (
              <ExpandMoreRoundedIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

export default function MyCourseRow({
  course,
  variant = "learning",
  onAction,
  onUnsave,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [expanded, setExpanded] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const data = normalizeCourse(course);
  const isSavedRow = variant === "saved";
  const isCompleted = variant === "completed";
  const isLearning = variant === "learning";
  const canExpand = !isSavedRow && (data.modules.length > 0 || data.currentLessonDetail);
  const progressValue = Math.min(Math.max(data.progressPercentage, 0), 100);
  const detailPath = buildCourseDetailPath(data.courseId, searchParams, "/my-courses");
  const progressTextColor = getProgressTextColor(progressValue);

  const statusChip = isSavedRow
    ? getSavedStatusChip()
    : isCompleted
      ? getCompletedStatusChip()
      : getLearningStatusChip();

  const actionLabel = isSavedRow ? "Xem chi tiết" : isCompleted ? "Ôn tập lại" : "Tiếp tục học";

  const handleAction = () => {
    if (isSavedRow) {
      navigate(detailPath);
      return;
    }
    onAction?.(course);
  };

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "#FFFFFF",
        borderRadius: "18px",
        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        boxShadow: theme.ios18?.shadow?.sm,
        overflow: "hidden",
        transition: [
          `box-shadow 0.25s ${theme.ios18?.transition}`,
          `border-color 0.25s ${theme.ios18?.transition}`,
        ].join(", "),
        "&:hover": {
          boxShadow: theme.ios18?.shadow?.md,
          borderColor: alpha(theme.palette.primary.main, 0.18),
        },
      }}
    >
      <RowTopActions
        showBookmark={isSavedRow && Boolean(onUnsave)}
        isSaved={isSavedRow}
        onBookmarkToggle={onUnsave}
        showExpand={canExpand}
        expanded={expanded}
        onExpandToggle={() => setExpanded((prev) => !prev)}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          gap: { xs: 2, md: 2.5 },
          p: { xs: 2, md: 2.25 },
          pt: { xs: 4.5, md: 2.25 },
          pr: { xs: 2, md: canExpand || isSavedRow ? 7 : 2.25 },
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", md: 160 },
            flexShrink: 0,
            aspectRatio: "16 / 9",
            borderRadius: "12px",
            overflow: "hidden",
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            backgroundImage: data.thumbnail ? `url(${data.thumbnail})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!data.thumbnail && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
              }}
            >
              <MenuBookOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1.25 }}>
          <Typography
            component={Link}
            to={detailPath}
            sx={{
              fontWeight: 700,
              fontSize: { xs: 16, md: 17 },
              lineHeight: 1.35,
              color: TEXT,
              textDecoration: "none",
              pr: { xs: 5, md: 0 },
              transition: `color 0.18s ${theme.ios18?.transition}`,
              "&:hover": { color: "primary.main" },
            }}
          >
            {data.courseName}
          </Typography>

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
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: "99px",
                  ...getLevelChipStyle(data.level),
                }}
              />
            )}
            {data.category && (
              <Chip
                label={data.category}
                size="small"
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: "99px",
                  ...getCategoryChipStyle(data.category),
                }}
              />
            )}
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            <MetaItem icon={MenuBookOutlinedIcon} label={`${data.totalLessons} bài học`} />
            <MetaItem icon={RouteOutlinedIcon} label={`${data.totalNodes} chặng`} />
            <MetaItem icon={ArticleOutlinedIcon} label={`${data.totalMaterials} học liệu`} />
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {isSavedRow && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BookmarkRoundedIcon sx={{ fontSize: 13, color: SAVED }} />
                <Typography sx={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>
                  Đã lưu để học sau
                </Typography>
              </Box>
            )}
            {isLearning && data.currentStage != null && data.currentLesson != null && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PlaceOutlinedIcon sx={{ fontSize: 13, color: "#94A3B8" }} />
                <Typography sx={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>
                  Đang ở: Chặng {data.currentStage} · Bài {data.currentLesson}
                </Typography>
              </Box>
            )}
            {!isSavedRow && data.lastActivity && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: "#94A3B8" }} />
                <Typography sx={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>
                  Học gần nhất: {data.lastActivity}
                </Typography>
              </Box>
            )}
          </Box>

          {!isSavedRow && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.25 }}>
              <LinearProgress
                variant="determinate"
                value={progressValue}
                sx={{
                  flex: 1,
                  height: 6,
                  borderRadius: 99,
                  bgcolor: "rgba(100,116,139,0.12)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 99,
                    background: getProgressGradient(progressValue),
                  },
                }}
              />
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: progressTextColor,
                  minWidth: 36,
                  textAlign: "right",
                }}
              >
                {progressValue}%
              </Typography>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            width: { xs: "100%", md: "auto" },
            alignSelf: { xs: "stretch", md: "center" },
          }}
        >
          <AppButton
            fullWidth={isMobile}
            size="small"
            variant={isSavedRow ? "outlined" : "contained"}
            onClick={handleAction}
            sx={{ minWidth: { md: 140 }, whiteSpace: "nowrap" }}
          >
            {actionLabel}
          </AppButton>
        </Box>
      </Box>

      {canExpand && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box
            sx={{
              px: { xs: 2, md: 2.25 },
              pb: { xs: 2, md: 2.25 },
              pt: 2,
              borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            }}
          >
            <MyCourseProgressSummary course={course} />
          </Box>
        </Collapse>
      )}
    </Box>
  );
}
