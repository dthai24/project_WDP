import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Breadcrumbs,
  Chip,
  Grid,
  LinearProgress,
  Link as MuiLink,
  Typography,
  alpha,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AppButton from "../components/common/AppButton";
import CourseCard from "../components/course/CourseCard";

/* ─── Màu sắc theme ─── */
const PRIMARY = "#0891B2";
const PRIMARY_DARK = "#0E7490";
const ACCENT = "#EA580C";
const TEXT = "#0F172A";
const MUTED = "#64748B";
const BORDER = "rgba(8,145,178,0.09)";

/* ─── Mock data chi tiết khóa học ─── */
const MOCK_COURSE_DETAILS = {
  1: {
    id: 1,
    title: "Tiếng Anh Thương Mại & Giao Tiếp Công Sở",
    shortDescription:
      "Nắm vững thuật ngữ kinh doanh, viết email chuyên nghiệp và giao tiếp tự tin trong họp. Phù hợp cho người đi làm muốn thăng tiến bằng tiếng Anh.",
    thumbnail:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80",
    category: "Giao tiếp",
    level: "Trung cấp",
    isEnrolled: true,
    progress: 40,
    lessonCount: 8,
    stageCount: 2,
    materialCount: 5,
    duration: "6 giờ",
    updatedAt: "22/05/2026",
    outcomes: [
      "Nắm vững từ vựng thương mại thiết yếu",
      "Viết email, memo chuyên nghiệp đúng chuẩn",
      "Tự tin trong họp và thuyết trình bằng tiếng Anh",
      "Giao tiếp lịch sự, rõ ràng với đồng nghiệp quốc tế",
    ],
    modules: [
      {
        id: 1,
        title: "Chặng 1: Nền tảng từ vựng thương mại",
        lessonCount: 4,
        materialCount: 3,
        lessons: [
          { id: 1, title: "Giới thiệu khóa học & lộ trình học", type: "video", duration: "5 phút", isPreview: true, isCompleted: true },
          { id: 2, title: "Từ vựng cốt lõi trong môi trường công sở", type: "video", duration: "18 phút", isPreview: false, isCompleted: true },
          { id: 3, title: "Cách dùng từ chuyên ngành đúng ngữ cảnh", type: "article", duration: "10 phút", isPreview: false, isCompleted: false },
          { id: 4, title: "Bài tập từ vựng ôn tập", type: "article", duration: "8 phút", isPreview: false, isCompleted: false },
        ],
      },
      {
        id: 2,
        title: "Chặng 2: Viết email & giao tiếp văn bản",
        lessonCount: 4,
        materialCount: 2,
        lessons: [
          { id: 5, title: "Cấu trúc email chuyên nghiệp chuẩn mực", type: "video", duration: "15 phút", isPreview: true, isCompleted: false },
          { id: 6, title: "Viết email từ chối & đề xuất lịch sự", type: "video", duration: "20 phút", isPreview: false, isCompleted: false },
          { id: 7, title: "Tình huống: họp trực tuyến", type: "video", duration: "12 phút", isPreview: false, isCompleted: false },
          { id: 8, title: "Bài kiểm tra cuối chặng", type: "article", duration: "15 phút", isPreview: false, isCompleted: false },
        ],
      },
    ],
  },
  2: {
    id: 2,
    title: "Kỹ năng thuyết trình tiếng Anh cho sinh viên",
    shortDescription:
      "Thực hành xây dựng slide, mở đầu hấp dẫn và trả lời câu hỏi tự tin trong bối cảnh học thuật và công việc.",
    thumbnail: null,
    category: "Giao tiếp",
    level: "Cơ bản",
    isEnrolled: false,
    progress: 0,
    lessonCount: 12,
    stageCount: 4,
    materialCount: 12,
    duration: "9 giờ",
    updatedAt: "24/05/2026",
    outcomes: [
      "Thiết kế slide trình bày rõ ràng, chuyên nghiệp",
      "Mở đầu bài thuyết trình thu hút người nghe",
      "Trả lời câu hỏi mạch lạc bằng tiếng Anh",
      "Xây dựng sự tự tin trước đám đông",
    ],
    modules: [
      {
        id: 1,
        title: "Chặng 1: Chuẩn bị bài thuyết trình",
        lessonCount: 3,
        materialCount: 3,
        lessons: [
          { id: 1, title: "Phân tích cấu trúc bài thuyết trình", type: "video", duration: "12 phút", isPreview: true, isCompleted: false },
          { id: 2, title: "Kỹ thuật mở đầu gây ấn tượng", type: "video", duration: "15 phút", isPreview: false, isCompleted: false },
          { id: 3, title: "Thiết kế slide hiệu quả", type: "article", duration: "10 phút", isPreview: false, isCompleted: false },
        ],
      },
      {
        id: 2,
        title: "Chặng 2: Kỹ năng trình bày",
        lessonCount: 3,
        materialCount: 3,
        lessons: [
          { id: 4, title: "Ngôn ngữ cơ thể & giọng nói", type: "video", duration: "18 phút", isPreview: false, isCompleted: false },
          { id: 5, title: "Kết nối với khán giả", type: "video", duration: "14 phút", isPreview: false, isCompleted: false },
          { id: 6, title: "Xử lý tình huống bất ngờ", type: "article", duration: "8 phút", isPreview: false, isCompleted: false },
        ],
      },
      {
        id: 3,
        title: "Chặng 3: Phần Q&A",
        lessonCount: 3,
        materialCount: 3,
        lessons: [
          { id: 7, title: "Chiến thuật trả lời câu hỏi", type: "video", duration: "16 phút", isPreview: false, isCompleted: false },
          { id: 8, title: "Từ vựng học thuật thường dùng", type: "article", duration: "12 phút", isPreview: false, isCompleted: false },
          { id: 9, title: "Bài luyện tập Q&A thực tế", type: "article", duration: "10 phút", isPreview: false, isCompleted: false },
        ],
      },
      {
        id: 4,
        title: "Chặng 4: Thực hành tổng hợp",
        lessonCount: 3,
        materialCount: 3,
        lessons: [
          { id: 10, title: "Thuyết trình mẫu – phân tích chi tiết", type: "video", duration: "20 phút", isPreview: false, isCompleted: false },
          { id: 11, title: "Tự luyện với checklist đánh giá", type: "article", duration: "8 phút", isPreview: false, isCompleted: false },
          { id: 12, title: "Bài kiểm tra cuối khóa", type: "article", duration: "15 phút", isPreview: false, isCompleted: false },
        ],
      },
    ],
  },
};

/* Fallback detail khi không tìm thấy theo id */
function buildFallbackDetail(id) {
  return {
    id: Number(id),
    title: `Khóa học #${id}`,
    shortDescription: "Thông tin chi tiết đang được cập nhật.",
    thumbnail: null,
    category: "Giao tiếp",
    level: "Cơ bản",
    isEnrolled: false,
    progress: 0,
    lessonCount: 0,
    stageCount: 0,
    materialCount: 0,
    duration: "—",
    updatedAt: "—",
    outcomes: [],
    modules: [],
  };
}

/* Khóa học liên quan mock */
const RELATED_COURSES = [
  {
    courseId: 7,
    courseName: "IELTS Speaking Part 2 & 3",
    description: "Xây dựng câu trả lời mạch lạc, tự tin giao tiếp trong phòng thi IELTS.",
    category: "IELTS",
    level: "Trung cấp",
    totalLessons: 11,
    totalNodes: 4,
    totalMaterials: 14,
    progressPercentage: 0,
    isEnrolled: false,
  },
  {
    courseId: 8,
    courseName: "Giao tiếp đời sống hàng ngày",
    description: "Tình huống mua sắm, du lịch, hỏi đường và trò chuyện xã giao tự nhiên.",
    category: "Giao tiếp",
    level: "Cơ bản",
    totalLessons: 9,
    totalNodes: 3,
    totalMaterials: 8,
    progressPercentage: 100,
    isEnrolled: true,
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
  },
  {
    courseId: 6,
    courseName: "Phát âm chuẩn & Intonation",
    description: "Luyện âm cuối, nối âm, trọng âm và ngữ điệu tự nhiên qua bài tập nghe-nhại.",
    category: "Phát âm",
    level: "Trung cấp",
    totalLessons: 10,
    totalNodes: 3,
    totalMaterials: 9,
    progressPercentage: 0,
    isEnrolled: false,
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
  },
];

/* ─── Chip style helpers (đồng bộ với CourseCard) ─── */

function getStatusChip(isEnrolled, progress) {
  if (!isEnrolled) return { label: "Chưa đăng ký", sx: { bgcolor: "rgba(100,116,139,0.10)", color: MUTED, border: "1px solid rgba(100,116,139,0.18)" } };
  if (progress >= 100) return { label: "Hoàn thành", sx: { bgcolor: "rgba(4,120,87,0.12)", color: "#047857", border: "1px solid rgba(4,120,87,0.24)" } };
  if (progress > 0) return { label: "Đang học", sx: { bgcolor: "rgba(8,145,178,0.12)", color: PRIMARY, border: "1px solid rgba(8,145,178,0.20)" } };
  return { label: "Đã đăng ký", sx: { bgcolor: "rgba(22,163,74,0.12)", color: "#16A34A", border: "1px solid rgba(22,163,74,0.20)" } };
}

function getLevelChipSx(level = "") {
  const l = level.toLowerCase();
  if (l.includes("cơ bản")) return { bgcolor: "rgba(56,189,248,0.12)", color: "#0284C7", border: "1px solid rgba(56,189,248,0.22)" };
  if (l.includes("trung cấp")) return { bgcolor: "rgba(245,158,11,0.12)", color: "#D97706", border: "1px solid rgba(245,158,11,0.22)" };
  if (l.includes("nâng cao")) return { bgcolor: "rgba(234,88,12,0.12)", color: ACCENT, border: "1px solid rgba(234,88,12,0.22)" };
  return { bgcolor: "#F1F5F9", color: MUTED };
}

function getCategoryChipSx(category = "") {
  const map = {
    "Giao tiếp": { bgcolor: "rgba(37,99,235,0.10)", color: "#2563EB" },
    "IELTS": { bgcolor: "rgba(124,58,237,0.10)", color: "#7C3AED" },
    "TOEIC": { bgcolor: "rgba(14,116,144,0.10)", color: PRIMARY_DARK },
    "Ngữ pháp": { bgcolor: "rgba(15,23,42,0.08)", color: "#334155" },
    "Phát âm": { bgcolor: "rgba(236,72,153,0.10)", color: "#DB2777" },
  };
  return map[category] ?? { bgcolor: "#F1F5F9", color: MUTED };
}

function getProgressStyle(progress) {
  if (progress >= 100) return { color: "#047857", trackColor: "rgba(4,120,87,0.14)", completed: true };
  if (progress >= 70) return { color: "#16A34A", trackColor: "rgba(22,163,74,0.12)", completed: false };
  if (progress >= 30) return { color: PRIMARY, trackColor: "rgba(8,145,178,0.12)", completed: false };
  return { color: "#F59E0B", trackColor: "rgba(245,158,11,0.14)", completed: false };
}

/* ─── Sub-components ─── */

/** Placeholder thumbnail theo theme */
function CourseThumbnailHero({ thumbnail }) {
  return (
    <Box
      sx={{
        width: "100%",
        aspectRatio: "16 / 9",
        borderRadius: "18px",
        overflow: "hidden",
        bgcolor: "rgba(8,145,178,0.06)",
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
            width: 72,
            height: 72,
            borderRadius: "50%",
            bgcolor: alpha(PRIMARY, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: PRIMARY,
          }}
        >
          <MenuBookOutlinedIcon sx={{ fontSize: 36 }} />
        </Box>
      )}
    </Box>
  );
}

/** Icon + text hàng metadata */
function MetaRow({ icon: Icon, label, value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Icon sx={{ fontSize: 18, color: MUTED, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 14, color: MUTED, fontWeight: 500 }}>
        {label}:&nbsp;<Box component="span" sx={{ color: TEXT, fontWeight: 600 }}>{value}</Box>
      </Typography>
    </Box>
  );
}

/** Card bọc section */
function SectionCard({ children, sx }) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: `1px solid ${BORDER}`,
        borderRadius: "18px",
        boxShadow: "0 1px 6px rgba(8,145,178,0.06)",
        p: { xs: 2.5, sm: 3 },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/** Tiêu đề section */
function SectionTitle({ children }) {
  return (
    <Typography
      variant="h6"
      sx={{ fontWeight: 700, color: TEXT, fontSize: { xs: 16, sm: 18 }, mb: 2.5 }}
    >
      {children}
    </Typography>
  );
}

/* ─── Sections ─── */

/** Section 1: Hero */
function HeroSection({ course, isEnrolled, onEnroll, onContinue }) {
  const statusChip = getStatusChip(isEnrolled, course.progress);
  const progressStyle = getProgressStyle(course.progress);

  return (
    <Grid container spacing={{ xs: 3, md: 5 }} alignItems="flex-start">
      {/* Cột trái: thông tin */}
      <Grid item xs={12} md={7}>
        {/* Breadcrumb */}
        <Breadcrumbs
          separator="/"
          sx={{ mb: 2, "& .MuiBreadcrumbs-separator": { color: MUTED, mx: 0.5 } }}
        >
          <MuiLink
            component={Link}
            to="/courses"
            underline="hover"
            sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}
          >
            Khóa học
          </MuiLink>
          <Typography sx={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>
            {course.title}
          </Typography>
        </Breadcrumbs>

        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: TEXT,
            lineHeight: 1.25,
            fontSize: { xs: 22, sm: 26, md: 30 },
            mb: 1.5,
          }}
        >
          {course.title}
        </Typography>

        {/* Short description */}
        <Typography
          sx={{ fontSize: 15, color: MUTED, lineHeight: 1.7, mb: 2.5 }}
        >
          {course.shortDescription}
        </Typography>

        {/* Chip row */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2.5 }}>
          <Chip
            label={statusChip.label}
            size="small"
            sx={{ height: 24, fontSize: 12, fontWeight: 600, borderRadius: "99px", ...statusChip.sx }}
          />
          {course.level && (
            <Chip
              label={course.level}
              size="small"
              sx={{ height: 24, fontSize: 12, fontWeight: 600, borderRadius: "99px", ...getLevelChipSx(course.level) }}
            />
          )}
          {course.category && (
            <Chip
              label={course.category}
              size="small"
              sx={{ height: 24, fontSize: 12, fontWeight: 600, borderRadius: "99px", ...getCategoryChipSx(course.category) }}
            />
          )}
        </Box>

        {/* Metadata */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 1.5, sm: 2.5 }, mb: isEnrolled ? 3 : 0 }}>
          <MetaRow icon={MenuBookOutlinedIcon} label="Bài học" value={`${course.lessonCount} bài`} />
          <MetaRow icon={RouteOutlinedIcon} label="Chặng" value={`${course.stageCount} chặng`} />
          <MetaRow icon={ArticleOutlinedIcon} label="Học liệu" value={`${course.materialCount} tài liệu`} />
          {course.duration && (
            <MetaRow icon={AccessTimeOutlinedIcon} label="Thời lượng" value={course.duration} />
          )}
        </Box>

        {/* Progress bar — chỉ khi đã đăng ký */}
        {isEnrolled && (
          <Box sx={{ mt: 0 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontSize: 13, color: MUTED, fontWeight: 600 }}>
                Tiến độ học tập
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {progressStyle.completed && (
                  <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 15, color: progressStyle.color }} />
                )}
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: progressStyle.color }}>
                  {course.progress}%
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(Math.max(course.progress, 0), 100)}
              sx={{
                height: 8,
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
      </Grid>

      {/* Cột phải: thumbnail + CTA */}
      <Grid item xs={12} md={5}>
        <Box sx={{ position: { md: "sticky" }, top: { md: 88 } }}>
          <CourseThumbnailHero thumbnail={course.thumbnail} />

          {/* CTA card */}
          <SectionCard sx={{ mt: 2, p: 2.5 }}>
            {course.progress >= 100 ? (
              <>
                <AppButton fullWidth variant="contained" onClick={onContinue} sx={{ borderRadius: "12px", py: 1.25, fontSize: 15, fontWeight: 700, mb: 1.25 }}>
                  Ôn tập lại
                </AppButton>
                <Typography sx={{ fontSize: 12.5, color: MUTED, textAlign: "center", lineHeight: 1.5 }}>
                  Bạn đã hoàn thành khóa học này. Tiếp tục ôn luyện để củng cố kiến thức.
                </Typography>
              </>
            ) : isEnrolled ? (
              <>
                <AppButton fullWidth variant="contained" onClick={onContinue} sx={{ borderRadius: "12px", py: 1.25, fontSize: 15, fontWeight: 700, mb: 1.25 }}>
                  Tiếp tục học
                </AppButton>
                <Typography sx={{ fontSize: 12.5, color: MUTED, textAlign: "center", lineHeight: 1.5 }}>
                  Hãy tiếp tục lộ trình học của bạn ngay hôm nay.
                </Typography>
              </>
            ) : (
              <>
                <AppButton fullWidth variant="accent" onClick={onEnroll} sx={{ borderRadius: "12px", py: 1.25, fontSize: 15, fontWeight: 700, mb: 1.25 }}>
                  Đăng ký khóa học
                </AppButton>
                <Typography sx={{ fontSize: 12.5, color: MUTED, textAlign: "center", lineHeight: 1.5 }}>
                  Bạn có thể bắt đầu học ngay sau khi đăng ký.
                </Typography>
              </>
            )}
          </SectionCard>
        </Box>
      </Grid>
    </Grid>
  );
}

/** Section 2: Bạn sẽ học được gì */
function OutcomesSection({ outcomes }) {
  if (!outcomes?.length) return null;
  return (
    <SectionCard>
      <SectionTitle>Bạn sẽ học được gì</SectionTitle>
      <Grid container spacing={1.5}>
        {outcomes.map((item, i) => (
          <Grid item xs={12} sm={6} key={i}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  bgcolor: alpha(PRIMARY, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  mt: "1px",
                }}
              >
                <CheckRoundedIcon sx={{ fontSize: 13, color: PRIMARY }} />
              </Box>
              <Typography sx={{ fontSize: 14, color: TEXT, lineHeight: 1.6 }}>
                {item}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </SectionCard>
  );
}

/** Icon bài học theo type */
function LessonIcon({ type }) {
  const Icon = type === "video" ? PlayCircleOutlineOutlinedIcon : ArticleRoundedIcon;
  return <Icon sx={{ fontSize: 17, color: MUTED, flexShrink: 0 }} />;
}

/** Section 3: Nội dung khóa học (Accordion) */
function CurriculumSection({ modules, isEnrolled }) {
  const [expanded, setExpanded] = useState(modules[0]?.id ?? false);

  const handleChange = (id) => (_, isOpen) => setExpanded(isOpen ? id : false);

  if (!modules?.length) return null;

  return (
    <SectionCard sx={{ p: 0, overflow: "hidden" }}>
      <Box sx={{ px: { xs: 2.5, sm: 3 }, pt: { xs: 2.5, sm: 3 }, pb: 1 }}>
        <SectionTitle>Nội dung khóa học</SectionTitle>
      </Box>

      {modules.map((mod) => (
        <Accordion
          key={mod.id}
          expanded={expanded === mod.id}
          onChange={handleChange(mod.id)}
          disableGutters
          elevation={0}
          sx={{
            "&:before": { display: "none" },
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreRoundedIcon sx={{ color: PRIMARY }} />}
            sx={{
              px: { xs: 2.5, sm: 3 },
              py: 0,
              minHeight: 56,
              bgcolor: expanded === mod.id ? alpha(PRIMARY, 0.04) : "transparent",
              transition: "background-color 0.18s ease",
              "&:hover": { bgcolor: alpha(PRIMARY, 0.04) },
              "& .MuiAccordionSummary-content": { my: 0, alignItems: "center", gap: 2 },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: TEXT, lineHeight: 1.4 }}>
                {mod.title}
              </Typography>
              <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.25 }}>
                {mod.lessonCount} bài học · {mod.materialCount} tài liệu
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ p: 0, pb: 1 }}>
            {mod.lessons.map((lesson) => {
              const isLocked = !isEnrolled && !lesson.isPreview;
              return (
                <Box
                  key={lesson.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: { xs: 2.5, sm: 3 },
                    py: 1.1,
                    borderTop: `1px solid ${alpha(BORDER, 0.5)}`,
                    opacity: isLocked ? 0.55 : 1,
                  }}
                >
                  {isLocked ? (
                    <LockOutlinedIcon sx={{ fontSize: 17, color: MUTED, flexShrink: 0 }} />
                  ) : (
                    <LessonIcon type={lesson.type} />
                  )}

                  <Typography
                    sx={{
                      flex: 1,
                      fontSize: 13.5,
                      color: isLocked ? MUTED : TEXT,
                      fontWeight: lesson.isCompleted ? 600 : 500,
                      lineHeight: 1.4,
                      textDecoration: lesson.isCompleted ? "none" : "none",
                    }}
                  >
                    {lesson.title}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                    {lesson.isPreview && !isEnrolled && (
                      <Chip
                        label="Xem thử"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          borderRadius: "99px",
                          bgcolor: alpha(PRIMARY, 0.1),
                          color: PRIMARY,
                        }}
                      />
                    )}
                    {lesson.isCompleted && (
                      <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16, color: "#047857" }} />
                    )}
                    {lesson.duration && (
                      <Typography sx={{ fontSize: 12, color: MUTED }}>
                        {lesson.duration}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </AccordionDetails>
        </Accordion>
      ))}
    </SectionCard>
  );
}

/** Section 4: Thông tin khóa học */
function CourseInfoSection({ course }) {
  const infos = [
    { icon: SchoolOutlinedIcon, label: "Trình độ", value: course.level },
    { icon: MenuBookOutlinedIcon, label: "Danh mục", value: course.category },
    { icon: MenuBookOutlinedIcon, label: "Số bài học", value: `${course.lessonCount} bài` },
    { icon: RouteOutlinedIcon, label: "Số chặng", value: `${course.stageCount} chặng` },
    { icon: ArticleOutlinedIcon, label: "Học liệu", value: `${course.materialCount} tài liệu` },
    { icon: AccessTimeOutlinedIcon, label: "Thời lượng", value: course.duration || "—" },
    { icon: CalendarTodayOutlinedIcon, label: "Cập nhật", value: course.updatedAt || "—" },
  ];

  return (
    <SectionCard>
      <SectionTitle>Thông tin khóa học</SectionTitle>
      <Grid container spacing={1.5}>
        {infos.map(({ icon: Icon, label, value }) => (
          <Grid item xs={12} sm={6} md={4} key={label}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                p: 1.5,
                bgcolor: alpha(PRIMARY, 0.03),
                borderRadius: "10px",
                border: `1px solid ${BORDER}`,
              }}
            >
              <Icon sx={{ fontSize: 18, color: PRIMARY, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: 11.5, color: MUTED, fontWeight: 500 }}>{label}</Typography>
                <Typography sx={{ fontSize: 13.5, color: TEXT, fontWeight: 700 }}>{value}</Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </SectionCard>
  );
}

/** Section 5: Khóa học liên quan */
function RelatedCoursesSection() {
  const navigate = useNavigate();
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color: TEXT, fontSize: { xs: 16, sm: 18 }, mb: 2.5 }}
      >
        Khóa học liên quan
      </Typography>
      <Grid container spacing={2.5}>
        {RELATED_COURSES.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.courseId}>
            <CourseCard
              course={course}
              onEnroll={() => navigate(`/courses/${course.courseId}`)}
              onContinueLearning={() => navigate(`/courses/${course.courseId}`)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

/* ─── Main Page ─── */

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const courseData = MOCK_COURSE_DETAILS[Number(id)] ?? buildFallbackDetail(id);

  // Enrollment state — tạm dùng local state, sau này kết nối API
  const [isEnrolled, setIsEnrolled] = useState(courseData.isEnrolled);
  const [progress] = useState(courseData.progress);

  const course = { ...courseData, isEnrolled, progress };

  const handleEnroll = () => {
    // TODO: gọi API đăng ký khóa học
    setIsEnrolled(true);
  };

  const handleContinue = () => {
    // TODO: điều hướng tới /learning/:id khi có trang learning
    console.log("Navigate to learning:", id);
    navigate(`/learning/${id}`);
  };

  return (
    <Box sx={{ maxWidth: 1180, mx: "auto" }}>
      {/* Hero */}
      <HeroSection
        course={course}
        isEnrolled={isEnrolled}
        onEnroll={handleEnroll}
        onContinue={handleContinue}
      />

      {/* Outcomes */}
      <Box sx={{ mt: 4 }}>
        <OutcomesSection outcomes={course.outcomes} />
      </Box>

      {/* Curriculum */}
      <Box sx={{ mt: 3 }}>
        <CurriculumSection modules={course.modules} isEnrolled={isEnrolled} />
      </Box>

      {/* Course info */}
      <Box sx={{ mt: 3 }}>
        <CourseInfoSection course={course} />
      </Box>

      {/* Related courses */}
      <Box sx={{ mt: 5 }}>
        <RelatedCoursesSection />
      </Box>
    </Box>
  );
}
