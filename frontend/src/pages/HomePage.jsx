import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Chip,
  Divider,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import CollectionsBookmarkRoundedIcon from "@mui/icons-material/CollectionsBookmarkRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AppButton from "../components/common/AppButton";
import AppProgressBar, { getProgressColor } from "../components/common/AppProgressBar";
import heroImg from "../asset/image/herosection.png";

/* ─── constants ─────────────────────────────────────────── */

const PRIMARY   = "#0891B2";
const TEXT      = "#0F172A";
const MUTED     = "#64748B";
const BORDER    = "rgba(8,145,178,0.08)";

function getUser() {
  try { return JSON.parse(sessionStorage.getItem("user")) || {}; }
  catch { return {}; }
}

/* ─── mock data ──────────────────────────────────────────── */

const MOCK_CONTINUE_COURSE = {
  courseId: 3,
  courseName: "Luyện viết IELTS Task 2",
  category: "IELTS",
  level: "Nâng cao",
  instructor: "Trần Quốc Huy",
  progressPercentage: 68,
  currentStage: 3,
  currentLesson: 9,
  lastActivity: "Hôm qua",
  thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf93a163b78?w=600&q=75",
  currentLessonDetail: {
    stage: "Chặng 3: Luyện đề nâng cao",
    lesson: "Bài 9",
    title: "Từ nối & cohesion devices",
  },
};

const MOCK_PATHS = [
  {
    id: 1,
    title: "Mất gốc tiếng Anh",
    description: "Xây dựng lại nền tảng phát âm, ngữ pháp và từ vựng từ đầu.",
    courseCount: 4,
    thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=70",
    accent: "#38BDF8",
  },
  {
    id: 2,
    title: "Giao tiếp hằng ngày",
    description: "Thực hành hội thoại, từ vựng thực tế và kỹ năng nghe–nói.",
    courseCount: 5,
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=70",
    accent: "#0891B2",
  },
  {
    id: 3,
    title: "IELTS Writing",
    description: "Chinh phục Task 1 và Task 2 với lộ trình từ cơ bản đến nâng cao.",
    courseCount: 6,
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=70",
    accent: "#7C3AED",
  },
  {
    id: 4,
    title: "TOEIC nền tảng",
    description: "Luyện nghe, đọc và chiến lược làm bài thi TOEIC hiệu quả.",
    courseCount: 5,
    thumbnail: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&q=70",
    accent: "#EA580C",
  },
];

const MOCK_COURSES = [
  {
    courseId: 1,
    courseName: "Kỹ năng thuyết trình tiếng Anh cho sinh viên",
    category: "Giao tiếp",
    level: "Cơ bản",
    instructor: "Hoàng Thùy Linh",
    rating: 4.7,
    studentCount: 1240,
    totalLessons: 12,
    thumbnail: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&q=75",
  },
  {
    courseId: 2,
    courseName: "Tiếng Anh Thương Mại & Giao Tiếp Công Sở",
    category: "Giao tiếp",
    level: "Trung cấp",
    instructor: "Nguyễn Minh An",
    rating: 4.8,
    studentCount: 980,
    totalLessons: 8,
    thumbnail: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=500&q=75",
  },
  {
    courseId: 3,
    courseName: "Luyện viết IELTS Task 2",
    category: "IELTS",
    level: "Nâng cao",
    instructor: "Trần Quốc Huy",
    rating: 4.9,
    studentCount: 2100,
    totalLessons: 16,
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf93a163b78?w=500&q=75",
  },
  {
    courseId: 4,
    courseName: "Phát âm chuẩn & Intonation",
    category: "Phát âm",
    level: "Trung cấp",
    instructor: "Đỗ Khánh Vy",
    rating: 4.6,
    studentCount: 760,
    totalLessons: 10,
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=75",
  },
];

const BENEFITS = [
  {
    icon: RouteOutlinedIcon,
    title: "Lộ trình rõ ràng",
    desc: "Từng bước học được thiết kế theo mục tiêu cụ thể, không loạn khi không biết học gì.",
    color: PRIMARY,
  },
  {
    icon: TrackChangesRoundedIcon,
    title: "Theo dõi tiến độ học",
    desc: "Dashboard tiến độ cho từng khóa học, luôn biết mình đang ở đâu trong lộ trình.",
    color: "#059669",
  },
  {
    icon: CollectionsBookmarkRoundedIcon,
    title: "Học liệu theo từng bài",
    desc: "Tài liệu PDF, bài luyện tập và ghi chú đính kèm theo mỗi bài học.",
    color: "#7C3AED",
  },
  {
    icon: AutoAwesomeRoundedIcon,
    title: "Gợi ý khóa học phù hợp",
    desc: "Hệ thống đề xuất khóa học dựa trên mục tiêu và tiến độ học tập của bạn.",
    color: "#EA580C",
  },
];

const ARTICLES = [
  {
    id: 1,
    title: "5 cách học từ vựng tiếng Anh hiệu quả",
    excerpt: "Không phải học thuộc lòng—hãy học trong ngữ cảnh, dùng spaced repetition và kết hợp hình ảnh.",
    category: "Mẹo học tập",
    date: "20 tháng 5, 2026",
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&q=70",
  },
  {
    id: 2,
    title: "Cách luyện nghe tiếng Anh mỗi ngày",
    excerpt: "Chỉ 20–30 phút mỗi ngày với đúng tài liệu, kỹ năng nghe của bạn sẽ cải thiện rõ rệt.",
    category: "Kỹ năng nghe",
    date: "15 tháng 5, 2026",
    thumbnail: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=500&q=70",
  },
  {
    id: 3,
    title: "Lộ trình IELTS Writing cho người mới bắt đầu",
    excerpt: "Từ phân tích đề bài đến hoàn thiện bài viết—hướng dẫn từng bước cho người mới.",
    category: "IELTS",
    date: "10 tháng 5, 2026",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=70",
  },
];

/* ─── sub-components ─────────────────────────────────────── */

function SectionHeader({ label, title, action, onAction }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        gap: 1,
        mb: 3,
      }}
    >
      <Box>
        {label && (
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: PRIMARY,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              mb: 0.5,
            }}
          >
            {label}
          </Typography>
        )}
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: 20, sm: 22, md: 24 },
            fontWeight: 700,
            color: TEXT,
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
          }}
        >
          {title}
        </Typography>
      </Box>
      {action && (
        <Box
          component="button"
          onClick={onAction}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: PRIMARY,
            fontSize: 13,
            fontWeight: 600,
            px: 0,
            py: 0,
            fontFamily: "inherit",
            transition: "opacity 0.2s ease",
            flexShrink: 0,
            "&:hover": { opacity: 0.75 },
          }}
        >
          {action}
          <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
        </Box>
      )}
    </Box>
  );
}

function CategoryChip({ category }) {
  const map = {
    "Giao tiếp": { bgcolor: "rgba(37,99,235,0.10)",  color: "#2563EB" },
    "IELTS":     { bgcolor: "rgba(124,58,237,0.10)", color: "#7C3AED" },
    "TOEIC":     { bgcolor: "rgba(14,116,144,0.10)", color: "#0E7490" },
    "Ngữ pháp":  { bgcolor: "rgba(15,23,42,0.08)",   color: "#334155" },
    "Phát âm":   { bgcolor: "rgba(236,72,153,0.10)", color: "#DB2777" },
    "Mẹo học tập": { bgcolor: "rgba(245,158,11,0.10)", color: "#D97706" },
    "Kỹ năng nghe": { bgcolor: "rgba(8,145,178,0.10)", color: PRIMARY },
  };
  const style = map[category] ?? { bgcolor: "#F1F5F9", color: MUTED };
  return (
    <Chip
      label={category}
      size="small"
      sx={{
        ...style,
        fontSize: 11,
        fontWeight: 600,
        height: 22,
        borderRadius: "6px",
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}

/* ─── Section 1: Hero ────────────────────────────────────── */

const HERO_IMG = heroImg;

const HERO_STATS = [
  {
    title: "20+ khóa học",
    desc: "theo kỹ năng và mục tiêu",
    Icon: MenuBookOutlinedIcon,
    iconBg: "rgba(8,145,178,0.12)",
    iconColor: "#0891B2",
    iconBorder: "rgba(8,145,178,0.20)",
  },
  {
    title: "5 lộ trình",
    desc: "học theo từng chặng",
    Icon: RouteOutlinedIcon,
    iconBg: "rgba(124,58,237,0.12)",
    iconColor: "#7C3AED",
    iconBorder: "rgba(124,58,237,0.20)",
  },
  {
    title: "Theo dõi tiến độ",
    desc: "tiếp tục đúng bài đang học",
    Icon: TrackChangesRoundedIcon,
    iconBg: "rgba(5,150,105,0.12)",
    iconColor: "#059669",
    iconBorder: "rgba(5,150,105,0.20)",
  },
];

function HeroSection({ onExplore }) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 0,
        minHeight: { xs: 520, sm: 540, md: 620 },
        px: { xs: 3.5, sm: 5, md: 7 },
        py: { xs: 5, sm: 6, md: 8 },
        mb: { xs: 6, md: 6 },
        border: "none",
        boxShadow: "none",
        /* Raw image — no overlay wash on mobile, just a very light left-side assist */
        backgroundImage: [
          `linear-gradient(90deg,
            rgba(255,255,255,0.38) 0%,
            rgba(255,255,255,0.12) 22%,
            rgba(255,255,255,0.00) 52%
          )`,
          `url("${HERO_IMG}")`,
        ].join(", "),
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        /* Desktop: image shows at full fidelity, tiny left assist only */
        [`@media (min-width:600px)`]: {
          backgroundImage: [
            `linear-gradient(90deg,
              rgba(255,255,255,0.42) 0%,
              rgba(255,255,255,0.18) 18%,
              rgba(255,255,255,0.00) 44%
            )`,
            `url("${HERO_IMG}")`,
          ].join(", "),
          backgroundPosition: "center right",
        },
        /*
         * Soft-edge feather: fades the four outer edges into page white
         * so the image blends seamlessly without a hard frame.
         * Gradient layers stack: bottom fade → left/right side fades → top fade.
         */
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          background: `
            linear-gradient(180deg,
              rgba(255,255,255,0.10) 0%,
              rgba(255,255,255,0.00) 6%,
              rgba(255,255,255,0.00) 80%,
              rgba(255,255,255,0.55) 100%
            ),
            linear-gradient(90deg,
              rgba(255,255,255,0.00) 0%,
              rgba(255,255,255,0.00) 86%,
              rgba(255,255,255,0.55) 100%
            )
          `,
        },
      }}
    >
      {/* Hero content block */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          maxWidth: { xs: "100%", sm: 560, md: 560 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Title */}
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 30, sm: 36, md: 44 },
            fontWeight: 800,
            color: "#0B1324",
            letterSpacing: "-0.03em",
            lineHeight: 1.14,
            mb: 3,
            textShadow: "0 1px 2px rgba(255,255,255,0.35)",
          }}
        >
          Học tiếng Anh theo{" "}
          <Box component="span" sx={{ color: "#0E7490" }}>
            lộ trình cá nhân hóa
          </Box>
        </Typography>

        {/* Subtitle */}
        <Typography
          sx={{
            fontSize: { xs: 15, md: 16 },
            color: "#334155",
            fontWeight: 500,
            lineHeight: 1.7,
            mb: 4,
            maxWidth: 460,
            textShadow: "0 1px 1px rgba(255,255,255,0.25)",
          }}
        >
          Khám phá khóa học phù hợp, học theo từng chặng rõ ràng và theo dõi tiến độ của bạn mỗi ngày.
        </Typography>

        {/* CTA buttons */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <AppButton onClick={onExplore} sx={{ px: 3, py: 1.25, fontSize: 14 }}>
            Khám phá khóa học
          </AppButton>
          <AppButton
            variant="outlined"
            disabled
            sx={{ px: 3, py: 1.25, fontSize: 14, opacity: 0.65 }}
          >
            Xem lộ trình
          </AppButton>
        </Box>

       

        {/* Stats — no wrapper container, items laid out flat */}
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: "1px solid rgba(15,23,42,0.08)",
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 2.5, sm: 3.5 },
          }}
        >
          {HERO_STATS.map(({ title, desc, Icon, iconBg, iconColor, iconBorder }) => (
            <Box
              key={title}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.25,
                flex: "1 1 140px",
                minWidth: 120,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "10px",
                  bgcolor: iconBg,
                  color: iconColor,
                  border: `1px solid ${iconBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  mt: 0.2,
                }}
              >
                <Icon sx={{ fontSize: 17 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: TEXT,
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 11.5,
                    color: MUTED,
                    lineHeight: 1.4,
                    mt: 0.2,
                  }}
                >
                  {desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

/* ─── Section 2: Continue ────────────────────────────────── */

function ContinueSection({ course, onContinue, onExplore }) {
  const theme = useTheme();

  if (!course) {
    return (
      <Box sx={{ mb: { xs: 7, md: 9 } }}>
        <SectionHeader label="Tiếp tục học" title="Hôm nay học gì?" />
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: "20px",
            border: `1px solid ${BORDER}`,
            bgcolor: "rgba(8,145,178,0.03)",
            textAlign: "center",
          }}
        >
          <MenuBookOutlinedIcon sx={{ fontSize: 40, color: alpha("#0891B2", 0.3), mb: 1.5 }} />
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: TEXT, mb: 0.75 }}>
            Bạn chưa bắt đầu khóa học nào
          </Typography>
          <Typography sx={{ fontSize: 14, color: MUTED, mb: 2.5 }}>
            Khám phá khóa học phù hợp với mục tiêu của bạn.
          </Typography>
          <AppButton onClick={onExplore} sx={{ px: 3 }}>
            Khám phá khóa học
          </AppButton>
        </Box>
      </Box>
    );
  }

  const progress = Math.min(Math.max(course.progressPercentage ?? 0, 0), 100);
  const progressColor = getProgressColor(progress);

  return (
    <Box sx={{ mb: { xs: 7, md: 9 } }}>
      <SectionHeader label="Tiếp tục học" title="Hôm nay học gì?" />
      <Box
        sx={{
          position: "relative",
          p: { xs: 2.5, md: 3.5 },
          borderRadius: "20px",
          overflow: "hidden",
          bgcolor: "rgba(8,145,178,0.04)",
          border: `1px solid ${BORDER}`,
          boxShadow: "0 4px 24px rgba(8,145,178,0.06)",
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: 4,
            bgcolor: PRIMARY,
            borderRadius: "20px 0 0 20px",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { md: "center" },
            gap: { xs: 2.5, md: 4 },
          }}
        >
          {/* Thumbnail */}
          {course.thumbnail && (
            <Box
              component="img"
              src={course.thumbnail}
              alt={course.courseName}
              sx={{
                display: { xs: "none", sm: "block" },
                width: { sm: 100, md: 120 },
                height: { sm: 75, md: 90 },
                borderRadius: "12px",
                objectFit: "cover",
                flexShrink: 0,
                boxShadow: "0 4px 16px rgba(8,145,178,0.12)",
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
              <PlayCircleOutlineRoundedIcon sx={{ fontSize: 14, color: PRIMARY }} />
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Tiếp tục học
              </Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: 17, md: 20 }, fontWeight: 700, color: TEXT, lineHeight: 1.3, mb: 0.75 }}>
              {course.courseName}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 1.5 }}>
              {course.currentStage != null && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <PlaceOutlinedIcon sx={{ fontSize: 14, color: "#94A3B8" }} />
                  <Typography sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
                    Chặng {course.currentStage} · Bài {course.currentLesson}
                  </Typography>
                </Box>
              )}
              {course.lastActivity && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: "#94A3B8" }} />
                  <Typography sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
                    Học gần nhất: {course.lastActivity}
                  </Typography>
                </Box>
              )}
            </Box>
            {course.currentLessonDetail && (
              <Typography sx={{ fontSize: 13, color: TEXT, fontWeight: 500, mb: 1.5 }}>
                Bài hiện tại:{" "}
                <Box component="span" sx={{ color: PRIMARY, fontWeight: 600 }}>
                  {course.currentLessonDetail.lesson} · {course.currentLessonDetail.title}
                </Box>
              </Typography>
            )}
          </Box>

          {/* Progress + CTA */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              alignItems: { xs: "center", md: "flex-end" },
              gap: { xs: 2, md: 1.5 },
              flexShrink: 0,
              width: { xs: "100%", md: "auto" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: { xs: 1, md: "none" }, width: { md: 160 } }}>
              <AppProgressBar value={progress} height={7} sx={{ flex: 1 }} />
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: progressColor, minWidth: 36, textAlign: "right" }}>
                {progress}%
              </Typography>
            </Box>
            <AppButton
              variant="contained"
              onClick={() => onContinue?.(course)}
              sx={{ px: 2.5, py: 1, fontSize: 13, flexShrink: 0 }}
            >
              Tiếp tục học
            </AppButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ─── Section 3: Learning paths ──────────────────────────── */

function PathsSection() {
  const theme = useTheme();

  return (
    <Box sx={{ mb: { xs: 7, md: 9 } }}>
      <SectionHeader
        label="Lộ trình học"
        title="Lộ trình học nổi bật"
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
          gap: 2.5,
        }}
      >
        {MOCK_PATHS.map((path) => (
          <Box
            key={path.id}
            sx={{
              borderRadius: "18px",
              border: `1px solid ${BORDER}`,
              bgcolor: "#fff",
              overflow: "hidden",
              cursor: "default",
              transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 12px 32px rgba(8,145,178,0.10)",
                borderColor: `rgba(8,145,178,0.22)`,
              },
            }}
          >
            {/* Thumbnail */}
            <Box
              sx={{
                height: 130,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src={path.thumbnail}
                alt={path.title}
                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(135deg, ${alpha(path.accent, 0.45)} 0%, transparent 60%)`,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  left: 14,
                  width: 32,
                  height: 32,
                  borderRadius: "10px",
                  bgcolor: "rgba(255,255,255,0.92)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RouteOutlinedIcon sx={{ fontSize: 18, color: path.accent }} />
              </Box>
            </Box>

            {/* Body */}
            <Box sx={{ p: 2 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.3, mb: 0.75 }}>
                {path.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12.5,
                  color: MUTED,
                  lineHeight: 1.55,
                  mb: 2,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {path.description}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <MenuBookOutlinedIcon sx={{ fontSize: 13, color: MUTED }} />
                  <Typography sx={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>
                    {path.courseCount} khóa học
                  </Typography>
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: MUTED,
                    opacity: 0.65,
                    cursor: "default",
                  }}
                >
                  Sắp ra mắt
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ─── Section 4: Suggested courses ──────────────────────── */

function CoursesSection({ onExplore, onNavigateCourse }) {
  const theme = useTheme();

  return (
    <Box sx={{ mb: { xs: 7, md: 9 } }}>
      <SectionHeader
        label="Khóa học đề xuất"
        title="Được nhiều học viên chọn"
        action="Xem tất cả"
        onAction={onExplore}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "repeat(4, 1fr)" },
          gap: 2.5,
        }}
      >
        {MOCK_COURSES.map((course) => (
          <CourseHomeCard
            key={course.courseId}
            course={course}
            onClick={() => onNavigateCourse(course.courseId)}
          />
        ))}
      </Box>
    </Box>
  );
}

function CourseHomeCard({ course, onClick }) {
  const theme = useTheme();
  const levelColors = {
    "Cơ bản":   { bg: "rgba(56,189,248,0.10)", text: "#0284C7" },
    "Trung cấp": { bg: "rgba(245,158,11,0.10)", text: "#D97706" },
    "Nâng cao":  { bg: "rgba(234,88,12,0.10)", text: "#EA580C" },
  };
  const lvl = levelColors[course.level] ?? { bg: "#F1F5F9", text: MUTED };

  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: "18px",
        border: `1px solid ${BORDER}`,
        bgcolor: "#fff",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 32px rgba(8,145,178,0.10)",
          borderColor: "rgba(8,145,178,0.22)",
        },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          height: 160,
          overflow: "hidden",
          bgcolor: alpha(PRIMARY, 0.06),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {course.thumbnail ? (
          <Box
            component="img"
            src={course.thumbnail}
            alt={course.courseName}
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <MenuBookOutlinedIcon sx={{ fontSize: 36, color: alpha(PRIMARY, 0.3) }} />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {/* Category + Level */}
        <Box sx={{ display: "flex", gap: 0.75, mb: 1.25, flexWrap: "wrap" }}>
          <CategoryChip category={course.category} />
          <Chip
            label={course.level}
            size="small"
            sx={{
              bgcolor: lvl.bg,
              color: lvl.text,
              fontSize: 11,
              fontWeight: 600,
              height: 22,
              borderRadius: "6px",
              "& .MuiChip-label": { px: 1 },
            }}
          />
        </Box>

        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 700,
            color: TEXT,
            lineHeight: 1.35,
            mb: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 38,
          }}
        >
          {course.courseName}
        </Typography>

        {/* Meta */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <StarRoundedIcon sx={{ fontSize: 13, color: "#F59E0B" }} />
            <Typography sx={{ fontSize: 12, color: TEXT, fontWeight: 600 }}>{course.rating}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PeopleOutlineRoundedIcon sx={{ fontSize: 13, color: MUTED }} />
            <Typography sx={{ fontSize: 12, color: MUTED }}>
              {course.studentCount >= 1000
                ? `${(course.studentCount / 1000).toFixed(1)}k`
                : course.studentCount}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <MenuBookOutlinedIcon sx={{ fontSize: 13, color: MUTED }} />
            <Typography sx={{ fontSize: 12, color: MUTED }}>{course.totalLessons} bài</Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: BORDER, mb: 1.5 }} />
        <Typography sx={{ fontSize: 12, color: MUTED }}>{course.instructor}</Typography>
      </Box>
    </Box>
  );
}

/* ─── Section 5: Benefits ────────────────────────────────── */

function BenefitsSection() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mb: { xs: 7, md: 9 },
        p: { xs: 3, md: 5 },
        borderRadius: "24px",
        border: `1px solid ${BORDER}`,
        background: "linear-gradient(135deg, rgba(8,145,178,0.04) 0%, rgba(56,189,248,0.03) 100%)",
      }}
    >
      <Box sx={{ textAlign: "center", mb: { xs: 3.5, md: 5 } }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: PRIMARY,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            mb: 1,
          }}
        >
          Điểm mạnh
        </Typography>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: 20, sm: 22, md: 26 },
            fontWeight: 700,
            color: TEXT,
            letterSpacing: "-0.02em",
          }}
        >
          Vì sao chọn S.T.A.R Learning Path?
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
          gap: 3,
        }}
      >
        {BENEFITS.map((item) => (
          <Box key={item.title}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                bgcolor: alpha(item.color, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.75,
              }}
            >
              <item.icon sx={{ fontSize: 24, color: item.color }} />
            </Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: TEXT, lineHeight: 1.3, mb: 0.75 }}>
              {item.title}
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: MUTED, lineHeight: 1.65 }}>
              {item.desc}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ─── Section 6: Articles ────────────────────────────────── */

function ArticlesSection() {
  return (
    <Box sx={{ mb: { xs: 7, md: 9 } }}>
      <SectionHeader
        label="Tin tức & Mẹo học"
        title="Bài viết mới nhất"
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
          gap: 2.5,
        }}
      >
        {ARTICLES.map((article) => (
          <Box
            key={article.id}
            sx={{
              borderRadius: "18px",
              border: `1px solid ${BORDER}`,
              bgcolor: "#fff",
              overflow: "hidden",
              transition: "transform 0.22s ease, box-shadow 0.22s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 12px 32px rgba(8,145,178,0.09)",
              },
            }}
          >
            {/* Thumbnail */}
            <Box
              sx={{
                height: 180,
                overflow: "hidden",
                bgcolor: alpha(PRIMARY, 0.05),
              }}
            >
              <Box
                component="img"
                src={article.thumbnail}
                alt={article.title}
                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease", "&:hover": { transform: "scale(1.04)" } }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </Box>

            {/* Content */}
            <Box sx={{ p: 2.25 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
                <CategoryChip category={article.category} />
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: MUTED }} />
                  <Typography sx={{ fontSize: 11, color: MUTED }}>{article.date}</Typography>
                </Box>
              </Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: TEXT,
                  lineHeight: 1.35,
                  mb: 0.875,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {article.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  color: MUTED,
                  lineHeight: 1.6,
                  mb: 2,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {article.excerpt}
              </Typography>
              <Box
                component="span"
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: PRIMARY,
                  cursor: "default",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.4,
                  opacity: 0.7,
                }}
              >
                Đọc thêm <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ─── Section 7: CTA block ───────────────────────────────── */

function CtaBlock({ onExplore, onMyCourses }) {
  return (
    <Box
      sx={{
        p: { xs: 3.5, md: 6 },
        borderRadius: "24px",
        border: `1px solid ${BORDER}`,
        background: "linear-gradient(135deg, rgba(8,145,178,0.08) 0%, rgba(56,189,248,0.06) 100%)",
        textAlign: "center",
        mb: { xs: 2, md: 4 },
      }}
    >
      <Typography
        component="h2"
        sx={{
          fontSize: { xs: 22, sm: 26, md: 30 },
          fontWeight: 800,
          color: TEXT,
          letterSpacing: "-0.025em",
          lineHeight: 1.2,
          mb: 1.25,
        }}
      >
        Sẵn sàng bắt đầu lộ trình học của bạn?
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: 14, md: 15 },
          color: MUTED,
          lineHeight: 1.65,
          mb: 3.5,
          maxWidth: 520,
          mx: "auto",
        }}
      >
        Khám phá khóa học phù hợp và theo dõi tiến độ học tập ngay hôm nay.
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1.5 }}>
        <AppButton onClick={onExplore} sx={{ px: 3.5, py: 1.25, fontSize: 14 }}>
          Khám phá khóa học
        </AppButton>
        <AppButton variant="outlined" onClick={onMyCourses} sx={{ px: 3.5, py: 1.25, fontSize: 14 }}>
          Khóa học của tôi
        </AppButton>
      </Box>
    </Box>
  );
}

/* ─── Main page ──────────────────────────────────────────── */

export default function HomePage() {
  const navigate = useNavigate();

  const user = useMemo(() => getUser(), []);
  const displayName = user.fullName || "Học viên";

  // TODO: replace with real API call
  const continueCourse = MOCK_CONTINUE_COURSE;

  const handleExplore = () => navigate("/courses");
  const handleMyCourses = () => navigate("/my-courses");
  const handleContinue = (course) => navigate(`/my-courses/${course.courseId}/learn`);
  const handleCourseNav = (courseId) => navigate(`/courses/${courseId}`);

  const [courses, setCourses] = useState([]);
  useEffect(() => {
    const getData = async () => {
      const res = await fetch('http://localhost:5000/api/courses');
      const result = await res.json();

      if (!result.success) {
        console.error(result.message);
        return;
      }

      setCourses(result.data);
    }
    getData()
  }, [])

  return (
    /* Wide root — hero can breathe at full width */
    <Box
      sx={{
        width: "100%",
        maxWidth: 1600,
        mx: "auto",
        px: { xs: 0, sm: 0, md: 0, lg: 0 },
      }}
    >
      {/* Greeting */}
      <Typography
        sx={{
          fontSize: 13,
          color: MUTED,
          fontWeight: 500,
          mb: { xs: 2.5, md: 3 },
        }}
      >
        Xin chào,{" "}
        <Box component="span" sx={{ color: PRIMARY, fontWeight: 700 }}>
          {displayName}
        </Box>{" "}
        
      </Typography>

      {/* Hero spans the full wide container */}
      <HeroSection onExplore={handleExplore} />

      {/* Remaining sections sit in a tighter content column */}
      <Box sx={{ maxWidth: 1360, mx: "auto", width: "100%" }}>
        <ContinueSection
          course={continueCourse}
          onContinue={handleContinue}
          onExplore={handleExplore}
        />

        <PathsSection />

        <CoursesSection
          courses={courses}
          onExplore={handleExplore}
          onNavigateCourse={handleCourseNav}
        />

        <BenefitsSection />

        <ArticlesSection />

        <CtaBlock onExplore={handleExplore} onMyCourses={handleMyCourses} />
      </Box>
    </Box>
  );
}
