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
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import RadioButtonUncheckedOutlinedIcon from "@mui/icons-material/RadioButtonUncheckedOutlined";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
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
        title: "Chặng 1: Nền tảng từ vựng thương mại",
        lessons: [
          mkLesson(1, "Giới thiệu khóa học & lộ trình học", "5 phút", "video", "completed"),
          mkLesson(2, "Từ vựng cốt lõi trong môi trường công sở", "18 phút", "video", "completed"),
          mkLesson(3, "Cách dùng từ chuyên ngành đúng ngữ cảnh", "10 phút", "reading", "current"),
          mkLesson(4, "Bài tập từ vựng ôn tập", "8 phút", "quiz", "not_started"),
        ],
      },
      {
        id: 2,
        title: "Chặng 2: Viết email & giao tiếp văn bản",
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
        title: "Chặng 1: Nền tảng",
        lessons: [
          mkLesson(10, "Tổng quan IELTS Writing Task 2", "10 phút", "video", "completed"),
          mkLesson(11, "Cấu trúc bài luận 4 đoạn", "14 phút", "reading", "completed"),
          mkLesson(12, "Từ nối & cohesion devices", "11 phút", "reading", "completed"),
        ],
      },
      {
        id: 2,
        title: "Chặng 2: Kỹ năng chính",
        lessons: [
          mkLesson(13, "Phân tích đề Opinion Essay", "16 phút", "video", "completed"),
          mkLesson(14, "Viết Introduction chuẩn", "18 phút", "reading", "completed"),
          mkLesson(15, "Triển khai Body Paragraphs", "22 phút", "video", "completed"),
          mkLesson(16, "Viết Conclusion & tổng kết", "13 phút", "reading", "completed"),
        ],
      },
      {
        id: 3,
        title: "Chặng 3: Luyện đề nâng cao",
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
        title: "Chặng 4: Ôn tập tổng hợp",
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
        title: "Chặng 1: Thì cơ bản",
        lessons: [
          mkLesson(30, "Thì hiện tại đơn & liên tục", "15 phút", "video", "completed"),
          mkLesson(31, "Thì quá khứ đơn & liên tục", "14 phút", "reading", "current"),
          mkLesson(32, "Bài tập thì cơ bản", "10 phút", "quiz", "not_started"),
        ],
      },
      {
        id: 2,
        title: "Chặng 2: Câu phức & điều kiện",
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
        title: "Chặng 1: Nguyên âm",
        lessons: [
          mkLesson(40, "Hệ thống nguyên âm tiếng Anh", "12 phút", "video", "completed"),
          mkLesson(41, "Luyện âm /æ/, /ʌ/, /ɑ:/", "16 phút", "video", "completed"),
          mkLesson(42, "Bài tập luyện nguyên âm", "8 phút", "quiz", "current"),
        ],
      },
      {
        id: 2,
        title: "Chặng 2: Phụ âm & liên kết âm",
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
  video: PlayCircleOutlineOutlinedIcon,
  reading: ArticleOutlinedIcon,
  quiz: QuizOutlinedIcon,
};

const TYPE_LABEL = { video: "Video", reading: "Bài đọc", quiz: "Bài tập" };

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

  const TypeIcon = TYPE_ICON[currentLesson?.type] ?? ArticleOutlinedIcon;
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
          <Typography sx={{ fontSize: 12.5, color: MUTED, fontWeight: 500, mb: 0.5 }}>
            {rawData.courseTitle}
          </Typography>
          {rawData.instructor && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.75 }}>
              <PersonOutlineOutlinedIcon sx={{ fontSize: 14, color: MUTED }} />
              <Typography sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
                Giảng viên: {rawData.instructor}
              </Typography>
            </Box>
          )}
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: 20, md: 26 },
              color: TEXT,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              mb: 0.75,
            }}
          >
            {currentLesson?.title ?? "Chọn bài học"}
          </Typography>
          {currentMod && (
            <Typography sx={{ fontSize: 13.5, color: PRIMARY, fontWeight: 600 }}>
              {currentMod.title}
            </Typography>
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
              <Chip
                icon={<TypeIcon sx={{ fontSize: "14px !important" }} />}
                label={TYPE_LABEL[currentLesson?.type] ?? "Bài học"}
                size="small"
                sx={{ height: 24, fontSize: 11, fontWeight: 600, borderRadius: "99px" }}
              />
              {currentMod && (
                <Chip
                  label={currentMod.title}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: "99px",
                    bgcolor: alpha(PRIMARY, 0.08),
                    color: PRIMARY,
                  }}
                />
              )}
              {currentLesson?.duration && (
                <Chip
                  label={currentLesson.duration}
                  size="small"
                  sx={{ height: 24, fontSize: 11, color: MUTED, borderRadius: "99px" }}
                />
              )}
            </Box>

            {/* Lesson objectives */}
            {currentLesson?.content?.objectives?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: TEXT, mb: 1.25 }}>
                  Mục tiêu bài học
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5, color: MUTED }}>
                  {currentLesson.content.objectives.map((item, i) => (
                    <Typography
                      component="li"
                      key={i}
                      sx={{ fontSize: 14, lineHeight: 1.65, mb: 0.5 }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {/* Lesson body */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: TEXT, mb: 1 }}>
                Nội dung bài học
              </Typography>
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
                  {currentLesson.materials.map((file) => (
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
                      }}
                    >
                      <AttachFileOutlinedIcon sx={{ fontSize: 16, color: MUTED }} />
                      <Typography sx={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>
                        {file.title}
                      </Typography>
                    </Box>
                  ))}
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
                startIcon={<ChevronLeftRoundedIcon />}
                sx={{ minWidth: 120 }}
              >
                Bài trước
              </AppButton>

              <AppButton
                size="small"
                variant={isCompleted ? "outlined" : "contained"}
                onClick={handleToggleComplete}
                startIcon={isCompleted ? <CheckRoundedIcon /> : undefined}
                sx={{ minWidth: 190 }}
              >
                {isCompleted ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
              </AppButton>

              <AppButton
                size="small"
                variant="contained"
                disabled={currentIndex >= allLessons.length - 1}
                onClick={handleNext}
                endIcon={<ChevronRightRoundedIcon />}
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
                          const LIcon = TYPE_ICON[lesson.type] ?? ArticleOutlinedIcon;

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
                                  <CheckCircleOutlineOutlinedIcon
                                    sx={{ fontSize: 17, color: SUCCESS }}
                                  />
                                ) : isActive ? (
                                  <PlayCircleOutlineOutlinedIcon
                                    sx={{ fontSize: 17, color: PRIMARY }}
                                  />
                                ) : (
                                  <RadioButtonUncheckedOutlinedIcon
                                    sx={{ fontSize: 17, color: "#CBD5E1" }}
                                  />
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
                                  <LIcon sx={{ fontSize: 11, color: MUTED }} />
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
