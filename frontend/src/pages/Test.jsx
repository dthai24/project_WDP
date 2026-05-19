import { useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Paper,
  Grid,
  Link,
  alpha,
  useTheme,
} from "@mui/material";

import MainLayout from "../components/layout/MainLayout";
import AppButton from "../components/common/AppButton";
import PageTitle from "../components/common/PageTitle";
import Loading from "../components/common/Loading";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";
import SearchBox from "../components/common/SearchBox";
import CourseCard from "../components/course/CourseCard";
import CourseList from "../components/course/CourseList";
import CourseFilter from "../components/course/CourseFilter";

const MOCK_COURSES = [
  {
    id: 1,
    title: "React cơ bản đến nâng cao",
    description: "Học React từ zero với hooks, context và best practices cho dự án thực tế.",
    level: "Cơ bản",
    duration: "12 giờ",
    students: 1280,
    price: 499000,
    progress: 45,
    tags: ["React", "Frontend"],
  },
  {
    id: 2,
    title: "Node.js & Express API",
    description: "Xây dựng REST API với Express, JWT authentication và MongoDB.",
    level: "Trung cấp",
    duration: "18 giờ",
    students: 856,
    price: 699000,
    progress: 0,
    tags: ["Node.js", "Backend"],
  },
  {
    id: 3,
    title: "UI/UX Design System",
    description: "Thiết kế giao diện minimal modern theo chuẩn iOS 18.",
    level: "Nâng cao",
    duration: "8 giờ",
    students: 432,
    price: 399000,
    progress: 100,
    tags: ["Design", "Figma"],
  },
];

function Section({ title, children }) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: theme.ios18?.radius?.lg ?? 16,
        bgcolor: "background.paper",
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        boxShadow: theme.ios18?.shadow?.sm,
      }}
    >
      <Typography
        variant="overline"
        sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.06em" }}
      >
        {title}
      </Typography>
      <Divider sx={{ my: 2, borderColor: alpha(theme.palette.primary.main, 0.12) }} />
      {children}
    </Paper>
  );
}

function ComponentShowcase() {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("Tất cả");
  const [category, setCategory] = useState("Tất cả");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [showEmptyList, setShowEmptyList] = useState(false);
  const [fullScreenLoading, setFullScreenLoading] = useState(false);

  const filteredCourses = MOCK_COURSES.filter((c) => {
    const matchLevel = level === "Tất cả" || c.level === level;
    const matchSearch =
      !search.trim() || c.title.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  return (
    <>
      <PageTitle
        title="Component Showcase"
        subtitle="Theme cam + xanh dương — iOS 18 minimal"
        action={
          <AppButton variant="secondary" onClick={() => setConfirmOpen(true)}>
            Mở ConfirmDialog
          </AppButton>
        }
      />

      <Section title="Bảng màu">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {[
            { label: "Primary", color: theme.palette.primary.main },
            { label: "Secondary", color: theme.palette.secondary.main },
            { label: "Accent", color: theme.palette.accent.main },
            { label: "Background", color: theme.palette.background.default },
            { label: "Paper", color: theme.palette.background.paper },
          ].map((item) => (
            <Box key={item.label} sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: item.color,
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                  mb: 0.5,
                }}
              />
              <Typography variant="caption" display="block" fontWeight={600}>
                {item.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.color}
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Link mẫu: <Link href="#">Xem chi tiết khóa học</Link>
        </Typography>
      </Section>

      <Section title="AppButton">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <AppButton variant="contained">Chính (Cam)</AppButton>
          <AppButton variant="secondary">Phụ (Xanh)</AppButton>
          <AppButton variant="outlined">Outlined</AppButton>
          <AppButton variant="outlinedSecondary">Outlined xanh</AppButton>
          <AppButton variant="text">Text link</AppButton>
          <AppButton variant="accent">Highlight</AppButton>
          <AppButton variant="contained" loading>
            Loading
          </AppButton>
        </Box>
      </Section>

      <Section title="SearchBox">
        <SearchBox
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm khóa học..."
        />
      </Section>

      <Section title="Loading">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          <Loading message="Đang tải dữ liệu..." />
          <AppButton
            variant="outlined"
            onClick={() => {
              setFullScreenLoading(true);
              setTimeout(() => setFullScreenLoading(false), 2000);
            }}
          >
            Fullscreen 2s
          </AppButton>
        </Box>
        {fullScreenLoading && <Loading fullScreen message="Fullscreen loading..." />}
      </Section>

      <Section title="EmptyState">
        <EmptyState
          title="Không tìm thấy kết quả"
          description="Thử đổi từ khóa hoặc bộ lọc khác."
          actionLabel="Xóa bộ lọc"
          onAction={() => {
            setSearch("");
            setLevel("Tất cả");
          }}
        />
      </Section>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
        title="Xác nhận hành động"
        message="Demo ConfirmDialog với theme cam mới."
        confirmLabel="Đồng ý"
        cancelLabel="Hủy bỏ"
      />

      <Section title="CourseFilter">
        <CourseFilter
          selectedLevel={level}
          selectedCategory={category}
          categories={["Lập trình", "Thiết kế", "DevOps"]}
          onLevelChange={setLevel}
          onCategoryChange={setCategory}
        />
      </Section>

      <Section title="CourseCard">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CourseCard
              course={MOCK_COURSES[0]}
              onEnroll={(id) => alert(`Mua khóa #${id}`)}
            />
          </Grid>
        </Grid>
      </Section>

      <Section title="CourseList">
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <AppButton
            size="small"
            variant="outlined"
            onClick={() => {
              setListLoading(true);
              setTimeout(() => setListLoading(false), 1500);
            }}
          >
            Giả lập loading
          </AppButton>
          <AppButton
            size="small"
            variant="outlined"
            onClick={() => setShowEmptyList((v) => !v)}
          >
            {showEmptyList ? "Hiện danh sách" : "Hiện empty"}
          </AppButton>
        </Box>
        <CourseList
          courses={showEmptyList ? [] : filteredCourses}
          loading={listLoading}
          onEnroll={(id) => alert(`Mua khóa #${id}`)}
          onCourseClick={(c) => alert(`Mở khóa: ${c.title}`)}
        />
      </Section>

      <Section title="Layout">
        <Typography variant="body2" color="text.secondary">
          Trang bọc bởi <strong>MainLayout</strong> — Header trắng, nền web{" "}
          <strong>#FFF7ED</strong>, card trắng.
        </Typography>
      </Section>
    </>
  );
}

export default function Test() {
  return (
    <MainLayout>
      <ComponentShowcase />
    </MainLayout>
  );
}
