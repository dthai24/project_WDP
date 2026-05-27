import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Breadcrumbs,
  Chip,
  Link as MuiLink,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppButton from "../components/common/AppButton";
import AppProgressBar, { getProgressColor } from "../components/common/AppProgressBar";
import EmptyState from "../components/common/EmptyState";

const PRIMARY = "#0891B2";
const TEXT = "#0F172A";
const MUTED = "#64748B";
const SUCCESS = "#16A34A";
const DIVIDER = "rgba(8,145,178,0.08)";

/* ─── Mock data ─────────────────────────────────────────────────────────── */

function mkLesson(id, title, duration, type, status) {
  return {
    id,
    title,
    duration,
    type, // "video" | "reading" | "quiz"
    status, // "completed" | "current" | "not_started"
    content: {
      objectives: [
        "Nắm vững mục tiêu và kết quả mong đợi của bài học.",
        "Áp dụng kiến thức vào tình huống thực tế.",
      ],
      body: `${title}: Đây là nội dung bài học mô phỏng. Khi có backend, phần này sẽ hiển thị bài đọc, slide hoặc transcript tương ứng.`,
    },
    materials:
      status !== "not_started"
        ? [
            { id: 1, title: "Slide bài giảng.pdf" },
            { id: 2, title: "Bài tập thực hành.docx" },
          ]
        : [],
  };
}

const MOCK_LEARNING = {
  1: {
    courseTitle: "Tiếng Anh Thương Mại & Giao Tiếp Công Sở",
    instructor: "Nguyễn Minh An",
    modules: [
      {
        id: 1,
        title: "Chương 1: Nền tảng từ vựng thương mại",
        lessons: [
          mkLesson(1, "Giới thiệu khóa học & lộ trình học", "5 phút", "video", "completed"),
          mkLesson(2, "Từ vựng cốt lõi trong môi trường công sở", "18 phút", "video", "completed"),
          mkLesson(3, "Cách dùng từ chuyên ngành đúng ngữ cảnh", "10 phút", "reading", "current"),
          mkLesson(4, "Bài tập từ vựng ôn tập", "8 phút", "quiz", "not_started"),
        ],
      },
      {
        id: 2,
        title: "Chương 2: Viết email & giao tiếp văn bản",
        lessons: [
          mkLesson(5, "Cấu trúc email chuyên nghiệp chuẩn mực", "15 phút", "video", "not_started"),
          mkLesson(6, "Viết email từ chối & đề xuất lịch sự", "20 phút", "reading", "not_started"),
          mkLesson(7, "Kỹ năng trả lời email nội bộ", "12 phút", "video", "not_started"),
        ],
      },
    ],
  },
  3: {
    courseTitle: "Luyện viết IELTS Task 2",
    instructor: "Trần Quốc Huy",
    modules: [
      {
        id: 1,
        title: "Chương 1: Nền tảng",
        lessons: [
          mkLesson(10, "Tổng quan IELTS Writing Task 2", "10 phút", "video", "completed"),
          mkLesson(11, "Cấu trúc bài luận 4 đoạn", "14 phút", "reading", "completed"),
          mkLesson(12, "Từ nối & cohesion devices", "11 phút", "reading", "completed"),
        ],
      },
      {
        id: 2,
        title: "Chương 2: Kỹ năng chính",
        lessons: [
          mkLesson(13, "Phân tích đề Opinion Essay", "16 phút", "video", "completed"),
          mkLesson(14, "Viết Introduction chuẩn", "18 phút", "reading", "completed"),
          mkLesson(15, "Triển khai Body Paragraphs", "22 phút", "video", "completed"),
          mkLesson(16, "Viết Conclusion & tổng kết", "13 phút", "reading", "completed"),
        ],
      },
      {
        id: 3,
        title: "Chương 3: Luyện đề nâng cao",
        lessons: [
          mkLesson(17, "Phân tích đề Discussion Essay", "20 phút", "video", "completed"),
          mkLesson(18, "Luyện tập đề thực tế", "25 phút", "quiz", "completed"),
          mkLesson(19, "Chấm điểm & phân tích bài mẫu", "18 phút", "reading", "current"),
          mkLesson(20, "Sửa bài viết cá nhân", "30 phút", "reading", "not_started"),
          mkLesson(21, "Đề thi thử số 1", "45 phút", "quiz", "not_started"),
        ],
      },
      {
        id: 4,
        title: "Chương 4: Ôn tập tổng hợp",
        lessons: [
          mkLesson(22, "Tổng kết kỹ năng viết IELTS", "15 phút", "reading", "not_started"),
          mkLesson(23, "Đề thi thử số 2", "45 phút", "quiz", "not_started"),
          mkLesson(24, "Đề thi thử số 3 + đáp án", "45 phút", "quiz", "not_started"),
        ],
      },
    ],
  },
  8: {
    courseTitle: "Ngữ pháp tiếng Anh từ cơ bản đến nâng cao",
    instructor: "Lê Thu Hà",
    modules: [
      {
        id: 1,
        title: "Chương 1: Thì cơ bản",
        lessons: [
          mkLesson(30, "Thì hiện tại đơn & liên tục", "15 phút", "video", "completed"),
          mkLesson(31, "Thì quá khứ đơn & liên tục", "14 phút", "reading", "current"),
          mkLesson(32, "Bài tập thì cơ bản", "10 phút", "quiz", "not_started"),
        ],
      },
      {
        id: 2,
        title: "Chương 2: Câu phức & điều kiện",
        lessons: [
          mkLesson(33, "Mệnh đề quan hệ", "18 phút", "video", "not_started"),
          mkLesson(34, "Câu điều kiện loại 1 và 2", "20 phút", "reading", "not_started"),
          mkLesson(35, "Bài tập câu phức", "12 phút", "quiz", "not_started"),
        ],
      },
    ],
  },
  11: {
    courseTitle: "Phát âm chuẩn giọng Mỹ - Anh",
    instructor: "Phạm Văn Đức",
    modules: [
      {
        id: 1,
        title: "Chương 1: Nguyên âm",
        lessons: [
          mkLesson(40, "Hệ thống nguyên âm tiếng Anh", "12 phút", "video", "completed"),
          mkLesson(41, "Luyện âm /æ/, /ʌ/, /ɑ:/", "16 phút", "video", "completed"),
          mkLesson(42, "Bài tập luyện nguyên âm", "8 phút", "quiz", "current"),
        ],
      },
      {
        id: 2,
        title: "Chương 2: Phụ âm & liên kết âm",
        lessons: [
          mkLesson(43, "Âm /θ/ và /ð/ — th sounds", "14 phút", "video", "not_started"),
          mkLesson(44, "Kỹ thuật liên kết âm tự nhiên", "18 phút", "reading", "not_started"),
        ],
      },
    ],
  },
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function flatLessons(mods) {
  return mods.flatMap((m) => m.lessons);
}

function findLessonAndModule(mods, lessonId) {
  for (const mod of mods) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) return { lesson, mod };
  }
  return { lesson: null, mod: null };
}

function getInitialLessonId(mods) {
  const all = flatLessons(mods);
  return (all.find((l) => l.status === "current") ?? all[0])?.id ?? null;
}

function computeProgress(mods) {
  const all = flatLessons(mods);
  if (!all.length) return 0;
  return Math.round(
    (all.filter((l) => l.status === "completed").length / all.length) * 100
  );
}

const TYPE_ICON = {
  video: PlayCircleRoundedIcon,
  reading: ArticleRoundedIcon,
  quiz: AssignmentRoundedIcon,
};

const TYPE_LABEL = { video: "Video", reading: "Bài đọc", quiz: "Bài tập" };

const ICON_COLORS = {
  route: "#7C3AED",
  instructor: "#2563EB",
  duration: "#D97706",
  video: PRIMARY,
  reading: "#0EA5E9",
  quiz: "#EA580C",
  objective: SUCCESS,
  content: "#6366F1",
  pdf: "#DC2626",
  doc: "#1D4ED8",
  file: "#64748B",
  download: PRIMARY,
};

const TYPE_ICON_COLOR = {
  video: ICON_COLORS.video,
  reading: ICON_COLORS.reading,
  quiz: ICON_COLORS.quiz,
};

const META_TEXT_SX = { fontSize: 12, color: MUTED, fontWeight: 500, lineHeight: 1.2 };

function getMaterialFileMeta(title = "") {
  const lower = title.toLowerCase();
  if (lower.endsWith(".pdf")) {
    return { Icon: PictureAsPdfRoundedIcon, color: ICON_COLORS.pdf };
  }
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) {
    return { Icon: DescriptionRoundedIcon, color: ICON_COLORS.doc };
  }
  return { Icon: InsertDriveFileRoundedIcon, color: ICON_COLORS.file };
}

function HeaderMetaItem({ icon: Icon, iconColor = PRIMARY, children }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Icon sx={{ fontSize: 15, color: iconColor, flexShrink: 0 }} />
      {children}
    </Box>
  );
}

function LessonChip({ icon: Icon, label, iconColor = MUTED, sx = {} }) {
  return (
    <Chip
      icon={<Icon sx={{ fontSize: "14px !important", color: `${iconColor} !important` }} />}
      label={label}
      size="small"
      sx={{
        height: 26,
        fontSize: 11,
        fontWeight: 600,
        borderRadius: "99px",
        bgcolor: alpha(iconColor === MUTED ? PRIMARY : iconColor, 0.06),
        border: `1px solid ${alpha(iconColor === MUTED ? PRIMARY : iconColor, 0.14)}`,
        color: MUTED,
        ...sx,
      }}
    />
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function CourseLearningPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const rawData = MOCK_LEARNING[Number(courseId)] ?? null;

  // All hooks must be called before any early return
  const [modules, setModules] = useState(() =>
    rawData ? JSON.parse(JSON.stringify(rawData.modules)) : []
  );
  const [currentLessonId, setCurrentLessonId] = useState(() =>
    rawData ? getInitialLessonId(JSON.parse(JSON.stringify(rawData.modules))) : null
  );

  const allLessons = useMemo(() => flatLessons(modules), [modules]);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const { lesson: currentLesson, mod: currentMod } = findLessonAndModule(modules, currentLessonId);
  const progress = useMemo(() => computeProgress(modules), [modules]);

  if (!rawData) {
    return (
      <Box sx={{ maxWidth: 1280, mx: "auto", py: 8 }}>
        <EmptyState
          variant="error"
          icon={SearchOffRoundedIcon}
          title="Không tìm thấy khóa học"
          description="Khóa học này chưa có nội dung học hoặc bạn chưa đăng ký."
          actionLabel="Về Khóa học của tôi"
          onAction={() => navigate("/my-courses")}
        />
      </Box>
    );
  }

  const handleSelectLesson = (id) => setCurrentLessonId(id);

  const handleToggleComplete = () => {
    if (!currentLesson) return;
    const next = currentLesson.status === "completed" ? "current" : "completed";
    setModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((l) =>
          l.id === currentLessonId ? { ...l, status: next } : l
        ),
      }))
    );
  };

  const handlePrev = () => {
    if (currentIndex > 0) handleSelectLesson(allLessons[currentIndex - 1].id);
  };

  const handleNext = () => {
    if (currentIndex < allLessons.length - 1)
      handleSelectLesson(allLessons[currentIndex + 1].id);
  };

  const TypeIcon = TYPE_ICON[currentLesson?.type] ?? ArticleRoundedIcon;
  const isCompleted = currentLesson?.status === "completed";

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto" }}>
      {/* ── Breadcrumb ── */}
      <Breadcrumbs
        separator="/"
        sx={{ mb: 2.5, "& .MuiBreadcrumbs-separator": { color: MUTED, mx: 0.5 } }}
      >
        <MuiLink
          component={Link}
          to="/my-courses"
          underline="none"
          sx={{
            fontSize: 13,
            color: MUTED,
            fontWeight: 500,
            "&:hover": { color: PRIMARY },
          }}
        >
          Khóa học của tôi
        </MuiLink>
        <MuiLink
          component={Link}
          to={`/courses/${courseId}`}
          underline="none"
          sx={{
            fontSize: 13,
            color: MUTED,
            fontWeight: 500,
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "block",
            "&:hover": { color: PRIMARY },
          }}
        >
          {rawData.courseTitle}
        </MuiLink>
        <Typography
          sx={{
            fontSize: 13,
            color: TEXT,
            fontWeight: 600,
            maxWidth: 180,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {currentLesson?.title ?? "Bài học"}
        </Typography>
      </Breadcrumbs>

      {/* ── Course / lesson header ── */}
      <Box
        sx={{
          mb: 3,
          pb: 2.5,
          borderBottom: `1px solid ${DIVIDER}`,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, color: MUTED, fontWeight: 500, mb: 0.75 }}>
            {rawData.courseTitle}
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: 20, md: 26 },
              color: TEXT,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              mb: 1.25,
            }}
          >
            {currentLesson?.title ?? "Chọn bài học"}
          </Typography>
          {currentLesson && (
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: { xs: 1.25, sm: 1.75 } }}>
              {currentMod && (
                <HeaderMetaItem icon={RouteRoundedIcon} iconColor={ICON_COLORS.route}>
                  <Typography sx={META_TEXT_SX}>{currentMod.title}</Typography>
                </HeaderMetaItem>
              )}
              {rawData.instructor && (
                <HeaderMetaItem icon={PersonRoundedIcon} iconColor={ICON_COLORS.instructor}>
                  <Typography sx={META_TEXT_SX}>
                    <Box component="span" sx={{ color: TEXT, fontWeight: 600, fontSize: 12 }}>
                      {rawData.instructor}
                    </Box>
                  </Typography>
                </HeaderMetaItem>
              )}
              {currentLesson.type && (
                <HeaderMetaItem
                  icon={TYPE_ICON[currentLesson.type] ?? ArticleRoundedIcon}
                  iconColor={TYPE_ICON_COLOR[currentLesson.type] ?? ICON_COLORS.reading}
                >
                  <Typography sx={META_TEXT_SX}>
                    {TYPE_LABEL[currentLesson.type] ?? currentLesson.type}
                  </Typography>
                </HeaderMetaItem>
              )}
              {currentLesson.duration && (
                <HeaderMetaItem icon={AccessTimeRoundedIcon} iconColor={ICON_COLORS.duration}>
                  <Typography sx={META_TEXT_SX}>{currentLesson.duration}</Typography>
                </HeaderMetaItem>
              )}
            </Box>
          )}
        </Box>

        {/* Progress block */}
        <Box
          sx={{
            minWidth: 220,
            width: { xs: "100%", sm: "auto" },
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
            <Typography sx={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>
              Tiến độ khóa học
            </Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: getProgressColor(progress) }}>
              {progress}%
            </Typography>
          </Box>
          <AppProgressBar value={progress} height={7} />
        </Box>
      </Box>

      {/* ── 2-col layout ── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column-reverse", lg: "row" },
          gap: 3,
          alignItems: "flex-start",
        }}
      >
        {/* ── Main lesson content ── */}
        <Box sx={{ flex: "1 1 65%", minWidth: 0, width: "100%" }}>
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "16px",
              border: `1px solid ${DIVIDER}`,
              boxShadow: theme.ios18?.shadow?.sm,
              p: { xs: 2.5, md: 3.5 },
            }}
          >
            {/* Video placeholder */}
            {currentLesson?.type === "video" && (
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  borderRadius: "12px",
                  mb: 3,
                  bgcolor: alpha(PRIMARY, 0.05),
                  border: `1px solid ${DIVIDER}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <PlayCircleOutlineOutlinedIcon
                  sx={{ fontSize: 56, color: PRIMARY, opacity: 0.4 }}
                />
                <Typography sx={{ fontSize: 13, color: MUTED }}>Video bài học</Typography>
              </Box>
            )}

            {/* Type + module chips */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2.5 }}>
              <LessonChip
                icon={TypeIcon}
                iconColor={TYPE_ICON_COLOR[currentLesson?.type] ?? ICON_COLORS.reading}
                label={TYPE_LABEL[currentLesson?.type] ?? "Bài học"}
                sx={{ color: TYPE_ICON_COLOR[currentLesson?.type] ?? ICON_COLORS.reading, border: "none" }}
              />
              {currentMod && (
                <LessonChip
                  icon={RouteRoundedIcon}
                  iconColor={ICON_COLORS.route}
                  label={currentMod.title}
                />
              )}
              {currentLesson?.duration && (
                <LessonChip
                  icon={AccessTimeRoundedIcon}
                  iconColor={ICON_COLORS.duration}
                  label={currentLesson.duration}
                />
              )}
            </Box>

            {/* Lesson objectives */}
            {currentLesson?.content?.objectives?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: TEXT, mb: 1.25 }}>
                  Mục tiêu bài học
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {currentLesson.content.objectives.map((item, i) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <CheckCircleRoundedIcon
                        sx={{ fontSize: 18, color: ICON_COLORS.objective, mt: 0.15, flexShrink: 0 }}
                      />
                      <Typography sx={{ fontSize: 14, color: MUTED, lineHeight: 1.65 }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Lesson body */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                <MenuBookRoundedIcon sx={{ fontSize: 18, color: ICON_COLORS.content }} />
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: TEXT }}>
                  Nội dung bài học
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 14, color: MUTED, lineHeight: 1.8 }}>
                {currentLesson?.content?.body ?? "Nội dung bài học sẽ được cập nhật."}
              </Typography>
            </Box>

            {/* Materials */}
            {currentLesson?.materials?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: TEXT, mb: 1.25 }}>
                  Tài liệu kèm theo
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                  {currentLesson.materials.map((file) => {
                    const { Icon: FileIcon, color: fileColor } = getMaterialFileMeta(file.title);
                    return (
                      <Box
                        key={file.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          py: 1,
                          px: 1.5,
                          borderRadius: "10px",
                          border: `1px solid ${DIVIDER}`,
                          transition: "border-color 0.2s ease, background-color 0.2s ease",
                          "&:hover": {
                            borderColor: "rgba(8,145,178,0.18)",
                            bgcolor: "rgba(8,145,178,0.03)",
                            "& .material-download": { color: ICON_COLORS.download, opacity: 1 },
                          },
                        }}
                      >
                        <FileIcon sx={{ fontSize: 18, color: fileColor, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 13, color: TEXT, fontWeight: 500, flex: 1, minWidth: 0 }}>
                          {file.title}
                        </Typography>
                        <DownloadRoundedIcon
                          className="material-download"
                          sx={{ fontSize: 16, color: MUTED, flexShrink: 0, opacity: 0.55, transition: "color 0.2s ease, opacity 0.2s ease" }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* ── Navigation buttons ── */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
                pt: 3,
                mt: 1,
                borderTop: `1px solid ${DIVIDER}`,
              }}
            >
              <AppButton
                size="small"
                variant="outlined"
                disabled={currentIndex <= 0}
                onClick={handlePrev}
                startIcon={<ArrowBackRoundedIcon />}
                sx={{ minWidth: 120 }}
              >
                Bài trước
              </AppButton>

              <AppButton
                size="small"
                variant={isCompleted ? "outlined" : "contained"}
                onClick={handleToggleComplete}
                startIcon={
                  isCompleted ? (
                    <CheckCircleRoundedIcon sx={{ fontSize: "18px !important" }} />
                  ) : (
                    <CheckRoundedIcon sx={{ fontSize: "18px !important" }} />
                  )
                }
                sx={{
                  minWidth: 190,
                  fontWeight: 600,
                  ...(isCompleted
                    ? {
                        borderColor: alpha(SUCCESS, 0.5),
                        color: SUCCESS,
                        bgcolor: alpha(SUCCESS, 0.08),
                        "&:hover": {
                          borderColor: SUCCESS,
                          bgcolor: alpha(SUCCESS, 0.14),
                        },
                      }
                    : {
                        bgcolor: SUCCESS,
                        color: "#fff",
                        boxShadow: `0 2px 8px ${alpha(SUCCESS, 0.28)}`,
                        "&:hover": {
                          bgcolor: "#15803D",
                          boxShadow: `0 3px 10px ${alpha(SUCCESS, 0.34)}`,
                        },
                      }),
                }}
              >
                {isCompleted ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
              </AppButton>

              <AppButton
                size="small"
                variant="contained"
                disabled={currentIndex >= allLessons.length - 1}
                onClick={handleNext}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ minWidth: 120 }}
              >
                Bài tiếp theo
              </AppButton>
            </Box>
          </Box>
        </Box>

        {/* ── Lesson list sidebar ── */}
        <Box sx={{ flex: "0 0 32%", width: "100%", maxWidth: { lg: 400 } }}>
          <Box sx={{ position: { lg: "sticky" }, top: 84 }}>
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: "16px",
                border: `1px solid ${DIVIDER}`,
                boxShadow: theme.ios18?.shadow?.sm,
                overflow: "hidden",
              }}
            >
              {/* Sidebar header */}
              <Box
                sx={{
                  px: 2.5,
                  py: 1.75,
                  borderBottom: `1px solid ${DIVIDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT }}>
                  Nội dung khóa học
                </Typography>
                <Typography sx={{ fontSize: 12, color: MUTED }}>
                  {allLessons.filter((l) => l.status === "completed").length}/
                  {allLessons.length} bài
                </Typography>
              </Box>

              {/* Accordion module list */}
              <Box
                sx={{
                  px: 1,
                  py: 1,
                  maxHeight: { lg: "calc(100vh - 260px)" },
                  overflowY: "auto",
                }}
              >
                {modules.map((mod) => {
                  const doneCount = mod.lessons.filter(
                    (l) => l.status === "completed"
                  ).length;
                  const isActiveModule = mod.lessons.some((l) => l.id === currentLessonId);
                  const modPercent =
                    mod.lessons.length > 0
                      ? Math.round((doneCount / mod.lessons.length) * 100)
                      : 0;

                  return (
                    <Accordion
                      key={mod.id}
                      defaultExpanded={isActiveModule}
                      disableGutters
                      elevation={0}
                      sx={{
                        bgcolor: "transparent",
                        "&:before": { display: "none" },
                        boxShadow: "none",
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: MUTED }} />
                        }
                        sx={{
                          minHeight: 44,
                          px: 1,
                          "& .MuiAccordionSummary-content": { my: 1 },
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                          <Typography
                            sx={{
                              fontSize: 12.5,
                              fontWeight: 600,
                              color: isActiveModule ? PRIMARY : TEXT,
                              lineHeight: 1.4,
                            }}
                          >
                            {mod.title}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.2 }}>
                            {doneCount}/{mod.lessons.length} bài
                          </Typography>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails sx={{ px: 0.5, pt: 0, pb: 1 }}>
                        {/* Mini progress bar per module */}
                        <AppProgressBar value={modPercent} height={3} sx={{ px: 1, mb: 0.75 }} />

                        {mod.lessons.map((lesson) => {
                          const isActive = lesson.id === currentLessonId;
                          const LIcon = TYPE_ICON[lesson.type] ?? ArticleRoundedIcon;

                          return (
                            <Box
                              key={lesson.id}
                              component="button"
                              type="button"
                              onClick={() => handleSelectLesson(lesson.id)}
                              sx={{
                                width: "100%",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1,
                                py: 1,
                                px: 1.25,
                                border: "none",
                                borderRadius: "10px",
                                cursor: "pointer",
                                textAlign: "left",
                                fontFamily: "inherit",
                                bgcolor: isActive ? alpha(PRIMARY, 0.08) : "transparent",
                                transition: "background-color 0.15s ease",
                                "&:hover": {
                                  bgcolor: isActive
                                    ? alpha(PRIMARY, 0.1)
                                    : alpha(PRIMARY, 0.04),
                                },
                              }}
                            >
                              <Box sx={{ pt: 0.1, flexShrink: 0 }}>
                                {lesson.status === "completed" ? (
                                  <CheckCircleRoundedIcon sx={{ fontSize: 18, color: SUCCESS }} />
                                ) : isActive ? (
                                  <PlayCircleRoundedIcon sx={{ fontSize: 18, color: PRIMARY }} />
                                ) : (
                                  <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 18, color: "#CBD5E1" }} />
                                )}
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontSize: 12.5,
                                    fontWeight: isActive ? 600 : 500,
                                    color: isActive ? PRIMARY : TEXT,
                                    lineHeight: 1.35,
                                  }}
                                >
                                  {lesson.title}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mt: 0.25,
                                  }}
                                >
                                  <LIcon sx={{ fontSize: 11, color: TYPE_ICON_COLOR[lesson.type] ?? ICON_COLORS.reading }} />
                                  <Typography sx={{ fontSize: 11, color: MUTED }}>
                                    {lesson.duration}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
