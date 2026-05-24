import { useState } from "react";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Chip,
  InputBase,
  Link as MuiLink,
  Typography,
  alpha,
} from "@mui/material";
import { Link } from "react-router-dom";
import AppButton from "../components/common/AppButton";
import ChangePasswordDialog from "../components/profile/ChangePasswordDialog";
import { underlineFieldSx as valueUnderlineSx } from "../components/common/UnderlineFieldPopup";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const PRIMARY = "#0891B2";
const TEXT = "#0F172A";
const MUTED = "#64748B";
const SUCCESS = "#16A34A";
const ACCENT = "#EA580C";
const DIVIDER = "rgba(8,145,178,0.08)";

/* ─── Mock data ──────────────────────────────────────────────────────────── */
const INITIAL_PROFILE = {
  name: "Phúc Nguyễn",
  email: "phucnguyen@example.com",
  phone: "0987654321",
  dateOfBirth: "2003-05-20",
  role: "Học viên",
  joinedAt: "24/05/2026",
  currentLevel: "Cơ bản",
  goals: ["Giao tiếp", "IELTS", "Tiếng Anh đi làm"],
  stats: {
    learning: 3,
    completed: 1,
    saved: 2,
    averageProgress: 68,
  },
};


/* ─── Small inline helpers ───────────────────────────────────────────────── */

/** Section card wrapper */
function SectionCard({ children, sx = {} }) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: "16px",
        border: `1px solid ${DIVIDER}`,
        p: { xs: 2.5, md: 3 },
        mb: 2.5,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/** Section heading row */
function SectionHead({ title, icon: Icon, iconColor = PRIMARY, action }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.25 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        {Icon && <Icon sx={{ fontSize: 18, color: iconColor }} />}
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: TEXT }}>
          {title}
        </Typography>
      </Box>
      {action}
    </Box>
  );
}

const LEVEL_OPTIONS = ["Mới bắt đầu", "Cơ bản", "Trung cấp", "Nâng cao"];

function formatDateDisplay(value) {
  if (!value) return "—";
  if (value.includes("/")) return value;
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

/** Label/value info field — read or inline edit */
function InfoRow({
  icon: Icon,
  iconColor = MUTED,
  label,
  value,
  editing = false,
  name,
  onChange,
  inputType = "text",
  selectOptions = LEVEL_OPTIONS,
  readOnly = false,
  placeholder,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.25,
        py: 1.4,
      }}
    >
      <Icon sx={{ fontSize: 16, color: iconColor, flexShrink: 0, mt: 0.25 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 11, color: MUTED, fontWeight: 500, mb: 0.4, lineHeight: 1.2 }}>
          {label}
        </Typography>
        {editing && !readOnly ? (
          inputType === "select" ? (
            <InputBase
              name={name}
              value={value}
              onChange={onChange}
              fullWidth
              component="select"
              sx={{
                ...valueUnderlineSx,
                fontSize: 13.5,
                fontWeight: 600,
                color: TEXT,
                lineHeight: 1.4,
                "& select": {
                  p: 0,
                  font: "inherit",
                  color: "inherit",
                  background: "transparent",
                },
              }}
            >
              {selectOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </InputBase>
          ) : inputType === "date" ? (
            <InputBase
              name={name}
              value={value}
              onChange={onChange}
              type="date"
              fullWidth
              sx={{
                ...valueUnderlineSx,
                fontSize: 13.5,
                fontWeight: 600,
                color: TEXT,
                lineHeight: 1.4,
                "& .MuiInputBase-input": {
                  p: 0,
                  height: "auto",
                },
                "& input[type='date']::-webkit-calendar-picker-indicator": {
                  opacity: 0.55,
                  cursor: "pointer",
                },
              }}
            />
          ) : (
            <InputBase
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              fullWidth
              sx={{
                ...valueUnderlineSx,
                fontSize: 13.5,
                fontWeight: 600,
                color: TEXT,
                lineHeight: 1.4,
                "& .MuiInputBase-input": {
                  p: 0,
                  height: "auto",
                },
                "& .MuiInputBase-input::placeholder": {
                  color: MUTED,
                  opacity: 0.7,
                },
              }}
            />
          )
        ) : (
          <Box sx={valueUnderlineSx}>
            <Typography
              sx={{
                fontSize: 13.5,
                color: readOnly && editing ? MUTED : TEXT,
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {inputType === "date" ? formatDateDisplay(value) : value || "—"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/** Learning stat row */
function StatRow({ icon: Icon, iconColor, label, value, last = false, children }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1.25,
        borderBottom: last ? "none" : `1px solid ${DIVIDER}`,
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "10px",
          bgcolor: alpha(iconColor, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 17, color: iconColor }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, color: MUTED, fontWeight: 500, lineHeight: 1.2 }}>
          {label}
        </Typography>
        {children ?? (
          <Typography sx={{ fontSize: 15, color: TEXT, fontWeight: 700, lineHeight: 1.4 }}>
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  );
}


/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: INITIAL_PROFILE.name,
    phone: INITIAL_PROFILE.phone,
    dateOfBirth: INITIAL_PROFILE.dateOfBirth,
    currentLevel: INITIAL_PROFILE.currentLevel,
  });
  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    setProfile((prev) => ({ ...prev, ...formData }));
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      phone: profile.phone,
      dateOfBirth: profile.dateOfBirth,
      currentLevel: profile.currentLevel,
    });
    setEditMode(false);
  };

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto" }}>
      {/* ── Breadcrumb ── */}
      <Breadcrumbs
        separator="/"
        sx={{ mb: 2.5, "& .MuiBreadcrumbs-separator": { color: MUTED, mx: 0.5 } }}
      >
        <MuiLink
          component={Link}
          to="/home"
          underline="none"
          sx={{
            fontSize: 13,
            color: MUTED,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 0.4,
            "&:hover": { color: PRIMARY },
          }}
        >
          <HomeOutlinedIcon sx={{ fontSize: 14 }} />
          Trang chủ
        </MuiLink>
        <Typography sx={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>
          Hồ sơ cá nhân
        </Typography>
      </Breadcrumbs>

      {/* ── Profile Header ── */}
      <Box
        sx={{
          bgcolor: alpha(PRIMARY, 0.02),
          border: `1px solid ${DIVIDER}`,
          borderRadius: "20px",
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: { xs: 2, md: 3 },
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            width: { xs: 72, md: 88 },
            height: { xs: 72, md: 88 },
            bgcolor: PRIMARY,
            fontSize: { xs: 26, md: 32 },
            fontWeight: 700,
            flexShrink: 0,
            boxShadow: `0 4px 16px ${alpha(PRIMARY, 0.28)}`,
            letterSpacing: 1,
          }}
        >
          {initials}
        </Avatar>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography
              sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 700, color: TEXT, lineHeight: 1.2 }}
            >
              {profile.name}
            </Typography>
            <Chip
              label={profile.role}
              size="small"
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: alpha(PRIMARY, 0.1),
                color: PRIMARY,
                borderRadius: "99px",
              }}
            />
          </Box>
          <Typography sx={{ fontSize: 13.5, color: MUTED, mb: 0.75 }}>
            {profile.email}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: MUTED }} />
            <Typography sx={{ fontSize: 12, color: MUTED }}>
              Tham gia từ {profile.joinedAt}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── 2-column layout ── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 3,
          alignItems: "flex-start",
        }}
      >
        {/* ── Left column ── */}
        <Box sx={{ flex: "1 1 65%", minWidth: 0, width: "100%" }}>
          {/* Thông tin cá nhân */}
          <SectionCard>
            <SectionHead
              title="Thông tin cá nhân"
              icon={PersonRoundedIcon}
              iconColor="#2563EB"
              action={
                editMode ? (
                  <Box sx={{ display: "flex", gap: 0.75 }}>
                    <AppButton
                      size="small"
                      variant="contained"
                      startIcon={<CheckRoundedIcon />}
                      onClick={handleSave}
                      sx={{ fontSize: 12, height: 28, px: 1.25, minWidth: "auto" }}
                    >
                      Lưu
                    </AppButton>
                    <AppButton
                      size="small"
                      variant="outlined"
                      onClick={handleCancel}
                      sx={{ fontSize: 12, height: 28, px: 1.25, minWidth: "auto" }}
                    >
                      Hủy
                    </AppButton>
                  </Box>
                ) : (
                  <AppButton
                    size="small"
                    variant="text"
                    onClick={() => setEditMode(true)}
                    sx={{ fontSize: 12, px: 1, minWidth: "auto", height: 28 }}
                  >
                    Chỉnh sửa
                  </AppButton>
                )
              }
            />

            <Box>
              <InfoRow
                icon={PersonRoundedIcon}
                iconColor="#2563EB"
                label="Họ và tên"
                value={editMode ? formData.name : profile.name}
                editing={editMode}
                name="name"
                onChange={handleFormChange}
              />
              <InfoRow
                icon={EmailOutlinedIcon}
                iconColor={PRIMARY}
                label="Email"
                value={profile.email}
                editing={editMode}
                readOnly
              />
              <InfoRow
                icon={PhoneOutlinedIcon}
                iconColor="#16A34A"
                label="Số điện thoại"
                value={editMode ? formData.phone : profile.phone}
                editing={editMode}
                name="phone"
                onChange={handleFormChange}
              />
              <InfoRow
                icon={CakeOutlinedIcon}
                iconColor={ACCENT}
                label="Ngày sinh"
                value={editMode ? formData.dateOfBirth : profile.dateOfBirth}
                editing={editMode}
                name="dateOfBirth"
                onChange={handleFormChange}
                inputType="date"
              />
            </Box>
          </SectionCard>

          {/* Mục tiêu học tập */}
          <SectionCard>
            <SectionHead
              title="Mục tiêu học tập"
              icon={RocketLaunchIcon}
              iconColor={ACCENT}
              action={
                <AppButton
                  size="small"
                  variant="text"
                  sx={{ fontSize: 12, px: 1, minWidth: "auto", height: 28 }}
                >
                  Cập nhật
                </AppButton>
              }
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.875 }}>
              {profile.goals.map((goal) => (
                <Chip
                  key={goal}
                  icon={<AutoAwesomeIcon sx={{ fontSize: "14px !important", color: `${ACCENT} !important` }} />}
                  label={goal}
                  size="small"
                  sx={{
                    height: 28,
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: "99px",
                    bgcolor: alpha(ACCENT, 0.06),
                    border: `1px solid ${alpha(ACCENT, 0.18)}`,
                    color: TEXT,
                  }}
                />
              ))}
              <Chip
                label="+ Thêm mục tiêu"
                size="small"
                sx={{
                  height: 28,
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: "99px",
                  bgcolor: "transparent",
                  border: `1px dashed ${alpha(MUTED, 0.4)}`,
                  color: MUTED,
                  cursor: "pointer",
                  "&:hover": { borderColor: PRIMARY, color: PRIMARY },
                  transition: "border-color 0.2s, color 0.2s",
                }}
              />
            </Box>
          </SectionCard>
        </Box>

        {/* ── Right column ── */}
        <Box sx={{ flex: "0 0 35%", width: "100%", maxWidth: { lg: 420 } }}>
          <Box sx={{ position: { lg: "sticky" }, top: 84 }}>

            {/* Tổng quan học tập */}
            <SectionCard>
              <SectionHead
                title="Tổng quan học tập"
                icon={MenuBookOutlinedIcon}
                iconColor={PRIMARY}
              />
              <StatRow
                icon={MenuBookOutlinedIcon}
                iconColor={PRIMARY}
                label="Khóa đang học"
                value={`${profile.stats.learning} khóa`}
              />
              <StatRow
                icon={CheckCircleRoundedIcon}
                iconColor={SUCCESS}
                label="Khóa hoàn thành"
                value={`${profile.stats.completed} khóa`}
                last
              />
            </SectionCard>

            {/* Cài đặt tài khoản */}
            <SectionCard>
              <SectionHead
                title="Cài đặt tài khoản"
                icon={LockOutlinedIcon}
                iconColor={MUTED}
              />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 0.75,
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: 17, color: MUTED }} />
                <Typography sx={{ flex: 1, fontSize: 13, color: TEXT, fontWeight: 600 }}>
                  Đổi mật khẩu
                </Typography>
                <AppButton
                  size="small"
                  variant="outlined"
                  onClick={() => setPasswordDialogOpen(true)}
                  sx={{ fontSize: 11, height: 28, px: 1.5, minWidth: "auto" }}
                >
                  Thay đổi
                </AppButton>
              </Box>
            </SectionCard>


          </Box>
        </Box>
      </Box>

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />
    </Box>
  );
}
