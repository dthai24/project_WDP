/**
 * MyCourseRow  ─  Dòng hiển thị một khóa học trong "Khóa học của tôi"
 *
 * Props:
 *   course : {
 *     courseId:           number,
 *     title:              string,
 *     thumbnail:          string,
 *     category:           string,
 *     level:              string,
 *     instructor:         string,
 *     progressPercentage: number,    // 0–100
 *     enrollmentStatus:   string,    // "in_progress" | "completed"
 *     lastActivity:       string,    // "2 ngày trước"
 *     currentStage:       string,    // tên chương hiện tại
 *     currentLesson:      string,    // tên bài học hiện tại
 *     lessonCount:        number,
 *     completedLessons:   number,
 *     modules?:           array      // cấu trúc chương nếu có
 *   }
 *   onContinue: (courseId) => void   — navigate đến /my-courses/:courseId/learn
 *   onClick   : (courseId) => void   — navigate đến /courses/:courseId (detail)
 */
import { useState } from "react";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
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
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AppButton from "@/shared/ui/AppButton";
import ThumbnailImage from "@/shared/ui/ThumbnailImage";
import AppProgressBar, { getProgressColor } from "@/shared/ui/AppProgressBar";
import MyCourseProgressSummary from "./MyCourseProgressSummary";
import { buildCourseDetailPath } from "@/features/courses/utils/courseListParams";
import { resolveCategoryChipSx, resolveLevelChipSx } from "@/shared/catalog/catalogRegistry";


const MUTED = "#64748B";
const TEXT = "#0F172A";
const PRIMARY = "#0891B2";

const ghostIconSx = {
  transition: "all 0.2s ease",
  "&:hover": { bgcolor: "rgba(15,23,42,0.04)" },
};

function normalizeCourse(course = {}) {
  const progress = course.progressPercentage ?? course.progress ?? 0;
  return {
    courseId: course.courseId ?? course.id,
    courseName: course.courseName ?? course.title ?? "Khóa học",
    thumbnail: course.Thumbnail ?? course.thumbnail ?? null,
    category: course.category ?? "",
    level: course.level ?? "",
    instructor: course.instructor ?? "",
    totalLessons: course.totalLessons ?? 0,
    totalNodes: course.totalNodes ?? course.chapterCount ?? 0,
    totalMaterials: course.totalMaterials ?? 0,
    progressPercentage: progress,
    enrollmentStatus: course.enrollmentStatus ?? "none",
    currentStage: course.currentStage ?? null,
    currentLesson: course.currentLesson ?? null,
    lastActivity: course.lastActivity ?? null,
    modules: course.modules ?? [],
    currentLessonDetail: course.currentLessonDetail ?? null,
    recentLessons: course.recentLessons ?? [],
    quizDoneCount: course.quizDoneCount ?? 0,
    chapterCount: course.chapterCount ?? course.totalNodes ?? 0,
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

function RowTopActions({ showExpand, expanded, onExpandToggle }) {
  if (!showExpand) return null;

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
    </Box>
  );
}

export default function MyCourseRow({
  course,
  variant = "learning",
  onAction,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [expanded, setExpanded] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const data = normalizeCourse(course);
  const isCompleted = variant === "completed";
  const isLearning = variant === "learning";
  const canExpand = data.modules.length > 0 || data.currentLessonDetail;
  const progressValue = Math.min(Math.max(data.progressPercentage, 0), 100);
  const detailPath = buildCourseDetailPath(data.courseId, searchParams, "/my-courses");
  const learningPath = `/my-courses/${data.courseId}/learn`;
  const titlePath = detailPath;
  const progressTextColor = getProgressColor(progressValue);

  const statusChip = isCompleted ? getCompletedStatusChip() : getLearningStatusChip();

  const actionLabel = isCompleted ? "Ôn tập lại" : "Tiếp tục học";

  const handleAction = () => {
    navigate(learningPath);
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
          pr: { xs: 2, md: canExpand ? 7 : 2.25 },
        }}
      >
        <ThumbnailImage
          src={data.thumbnail}
          label={data.courseName}
          alt={data.courseName}
          iconSize={20}
          sx={{
            width: { xs: "100%", md: 160 },
            flexShrink: 0,
            aspectRatio: "16 / 9",
            borderRadius: "12px",
          }}
        />

        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
          {/* Row 1: Category & Level */}
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {data.category || "Chưa phân loại"} • Trình độ {data.level || "Mọi cấp độ"}
          </Typography>

          {/* Row 2: Title & Status Badges */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography
              component={Link}
              to={titlePath}
              sx={{
                fontWeight: 800,
                fontSize: 16,
                lineHeight: 1.3,
                color: TEXT,
                textDecoration: "none",
                transition: `color 0.18s ${theme.ios18?.transition}`,
                "&:hover": { color: "primary.main" },
              }}
            >
              {data.courseName}
            </Typography>
            <Chip
              label={statusChip.label}
              size="small"
              sx={{
                height: 18,
                fontSize: 9,
                fontWeight: 800,
                textTransform: "uppercase",
                borderRadius: "4px",
                px: 0.5,
                ...statusChip.sx
              }}
            />
            {data.quizDoneCount > 0 && (
              <Chip
                label={`${data.quizDoneCount} Quiz`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: 9,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  borderRadius: "4px",
                  bgcolor: "rgba(124,58,237,0.08)",
                  color: "#7c3aed",
                  border: "1px solid rgba(124,58,237,0.16)",
                  px: 0.5,
                }}
              />
            )}
          </Box>

          {/* Row 3: Meta details */}
          <Typography sx={{ fontSize: 12.5, color: MUTED, display: "flex", alignItems: "center", gap: 0.75 }}>
            <span>Bởi {data.instructor || "English Master Team"}</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>{data.chapterCount} chương</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>{data.totalLessons} bài học</span>
          </Typography>

          {/* Row 4: Study location */}
          {isLearning && data.currentStage != null && data.currentLesson != null && (
            <Typography sx={{ fontSize: 12.5, color: "#475569", fontWeight: 500 }}>
              Đang ở: <span style={{ color: PRIMARY, fontWeight: 600 }}>Chương {data.currentStage} · Bài {data.currentLesson}</span>
              {data.lastActivity && <span style={{ color: MUTED, fontWeight: 400 }}> ({data.lastActivity})</span>}
            </Typography>
          )}

          {/* Row 5: Progress Bar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5 }}>
            <AppProgressBar value={progressValue} height={5} sx={{ flex: 1 }} />
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: progressTextColor,
                minWidth: 32,
                textAlign: "right",
              }}
            >
              {progressValue}%
            </Typography>
          </Box>
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
            variant="contained"
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
