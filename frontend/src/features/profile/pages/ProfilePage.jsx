import { useState, useEffect, useMemo, useRef } from "react";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Chip,
  InputBase,
  Link as MuiLink,
  Typography,
  alpha,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import AppButton from "@/shared/ui/AppButton";
import { toast } from "@/shared/ui/Toast";
import ChangePasswordDialog from "@/features/auth/components/ChangePasswordDialog";
import { underlineFieldSx as valueUnderlineSx } from "@/shared/ui/UnderlineFieldPopup";
import ProfileImageCropDialog from "@/shared/ProfileImageCropDialog";
import {
  fetchUserProfile,
  uploadUserAvatar,
  fetchUserCourses,
  fetchUserCertificates,
} from "@/features/profile/services/profileService";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import {
  getStoredAvatarUrl,
  persistUserAvatar,
} from "@/features/profile/utils/profileAvatarUtils";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

/* --- Constants --- */
const PRIMARY = "#0891B2";
const TEXT = "#0F172A";
const MUTED = "#64748B";
const SUCCESS = "#16A34A";
const ACCENT = "#EA580C";
const DIVIDER = "rgba(8,145,178,0.08)";

/** Chuyển đổi đường dẫn thumbnail thành URL có thể hiển thị */
function resolveThumbnail(thumb) {
  if (!thumb || thumb === "CHƯA FIX LỖI ẢNH") return null;
  if (thumb.startsWith("http://") || thumb.startsWith("https://")) return thumb;
  // Đường dẫn local từ backend (VD: /uploads/courses/abc.jpg)
  if (thumb.startsWith("/")) return `http://localhost:5050${thumb}`;
  return null;
}

const INITIAL_PROFILE = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  role: "Hoc vien",
  joinedAt: "",
  currentLevel: "",
  goals: [],
  stats: {
    learning: 0,
    completed: 0,
    saved: 0,
    averageProgress: 0,
  },
};

/* --- Small inline helpers --- */

/** Section card wrapper */
function SectionCard({ children, sx = {} }) {
  return (
    <div
      className="bg-white rounded-2xl border mb-2.5 p-3 md:p-4"
      style={{ borderColor: DIVIDER, ...sx }}
    >
      {children}
    </div>
  );
}

/** Section heading row */
function SectionHead({ title, icon: Icon, iconColor = PRIMARY, action }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-2">
        {Icon && <Icon sx={{ fontSize: 18, color: iconColor }} />}
        <span
          className="text-[15px] font-bold"
          style={{ color: TEXT }}
        >
          {title}
        </span>
      </div>
      {action}
    </div>
  );
}

const LEVEL_OPTIONS = ["Moi bat dau", "Co ban", "Trung cap", "Nang cao"];

function formatDateDisplay(value) {
  if (!value) return "-";
  if (value.includes("/")) return value;
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

/** Label/value info field - read or inline edit */
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
    <div className="flex items-start gap-[10px] py-[10px]">
      <Icon
        sx={{ fontSize: 16, color: iconColor, flexShrink: 0, marginTop: "2px" }}
      />
      <div className="flex-1 min-w-0">
        <span
          className="text-[11px] font-medium block mb-[3px] leading-[1.2]"
          style={{ color: MUTED }}
        >
          {label}
        </span>
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
                "& .MuiInputBase-input": { p: 0, height: "auto" },
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
                "& .MuiInputBase-input": { p: 0, height: "auto" },
                "& .MuiInputBase-input::placeholder": {
                  color: MUTED,
                  opacity: 0.7,
                },
              }}
            />
          )
        ) : (
          <Box sx={valueUnderlineSx}>
            <span
              className="text-[13.5px] font-semibold leading-[1.4]"
              style={{
                color: readOnly && editing ? MUTED : TEXT,
              }}
            >
              {inputType === "date" ? formatDateDisplay(value) : value || "-"}
            </span>
          </Box>
        )}
      </div>
    </div>
  );
}

/** Learning stat row */
function StatRow({
  icon: Icon,
  iconColor,
  label,
  value,
  last = false,
  onClick,
  expanded = false,
  expandable = false,
  children,
}) {
  return (
    <div
      style={{
        borderBottom: last && !expanded ? "none" : `1px solid ${DIVIDER}`,
      }}
    >
      <div
        onClick={onClick}
        className={`flex items-center gap-3 py-[10px] ${
          expandable
            ? "cursor-pointer hover:bg-slate-50/70 rounded-xl px-1.5 transition-all"
            : ""
        }`}
      >
        <div
          className="w-[34px] h-[34px] rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: alpha(iconColor, 0.1) }}
        >
          <Icon sx={{ fontSize: 17, color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <span
            className="text-[12px] font-medium leading-[1.2] block"
            style={{ color: MUTED }}
          >
            {label}
          </span>
          <span
            className="text-[15px] font-bold leading-[1.4] block"
            style={{ color: TEXT }}
          >
            {value}
          </span>
        </div>
        {expandable && (
          <div className="text-slate-400 text-[11px] font-bold flex items-center gap-1 flex-shrink-0 select-none">
            <span>{expanded ? "Thu gọn" : "Xem chi tiết"}</span>
            <span className="text-[10px]">{expanded ? "▲" : "▼"}</span>
          </div>
        )}
      </div>
      {expandable && expanded && children && (
        <div className="pl-[46px] pr-1 pb-3 pt-0.5 space-y-2 border-t border-dashed border-slate-100/50 mt-1">
          {children}
        </div>
      )}
    </div>
  );
}

// -- Safe State Initialization Helpers --
const getInitialUser = () => {
  try {
    const userRaw = localStorage.getItem("user");
    return userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {
    return null;
  }
};

const getInitialAvatar = () => getStoredAvatarUrl();

/* --- Page --- */
export default function ProfilePage() {
  const location = useLocation();
  const isAdminShell = location.pathname.startsWith("/admin");
  const breadcrumbHome = isAdminShell
    ? { to: "/admin/accounts", label: "Quản trị" }
    : { to: "/home", label: "Trang chủ" };

  const currentUser = useMemo(() => getInitialUser(), []);

  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(getInitialAvatar);
  const [formData, setFormData] = useState({
    name: INITIAL_PROFILE.name,
    phone: INITIAL_PROFILE.phone,
    dateOfBirth: INITIAL_PROFILE.dateOfBirth,
    currentLevel: INITIAL_PROFILE.currentLevel,
  });

  const [applyMentorOpen, setApplyMentorOpen] = useState(false);
  const [submittingApply, setSubmittingApply] = useState(false);
  const [levelsList, setLevelsList] = useState([]);
  const [applyForm, setApplyForm] = useState({
    name: '',
    email: '',
    age: '',
    levels: [],
    evidence: '',
  });
  const [coursesList, setCoursesList] = useState([]);
  const [certificatesList, setCertificatesList] = useState([]);
  const [expandedStat, setExpandedStat] = useState(null); // 'learning' | 'completed' | 'certificates' | null

  useEffect(() => {
    const cUser = getInitialUser();
    if (!cUser?.userId) return;

    const fetchProfile = async () => {
      try {
        const data = await fetchUserProfile();
        const p = data?.profile;
        if (data?.success && p) {
          if (p.avatarUrl) {
            const resolvedAvatar = persistUserAvatar(p.avatarUrl);
            setAvatarUrl(resolvedAvatar);
          }

          setProfile((prev) => ({
            ...prev,
            name: data.profile.name || "",
            email: data.profile.email || "",
            phone: data.profile.phone || "",
            dateOfBirth: data.profile.dateOfBirth?.split("T")[0] || "",
            currentLevel: data.profile.currentLevel || "",
            joinedAt: data.profile.joinedAt
              ? new Date(data.profile.joinedAt).toLocaleDateString("vi-VN", {
                  timeZone: "UTC",
                })
              : "",
            stats: data.profile.stats || prev.stats,
            rawLearningGoal: data.profile.learningGoal || "",
            rawCategories: data.profile.categories || [],
            goals: [
              ...(data.profile.learningGoal
                ? [`Muc tieu: ${data.profile.learningGoal}`]
                : []),
              ...(data.profile.categories
                ? data.profile.categories.map((c) => c.displayName)
                : []),
            ],
          }));

          setFormData((prevForm) => ({
            ...prevForm,
            name: p.name || prevForm.name,
            phone: p.phone || prevForm.phone,
            dateOfBirth: p.dateOfBirth
              ? p.dateOfBirth.split("T")[0]
              : prevForm.dateOfBirth,
          }));
        }
      } catch (err) {
        console.error("Loi khi tai ho so:", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchCoursesAndCertificates = async () => {
      try {
        const result = await fetchUserCourses();
        if (result.success && Array.isArray(result.data)) {
          setCoursesList(result.data);
        }

        if (currentUser?.userId) {
          const certResult = await fetchUserCertificates(currentUser.userId);
          if (certResult.success && Array.isArray(certResult.certificates)) {
            setCertificatesList(certResult.certificates);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải khóa học và chứng chỉ:", err);
      }
    };
    fetchCoursesAndCertificates();
  }, [currentUser]);

  const initials = (profile?.name || "Nguoi dung")
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!currentUser?.userId) return;

    try {
      const response = await fetch(
        "http://localhost:5050/api/users/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser.userId,
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setProfile((prev) => ({ ...prev, ...formData }));
        setEditMode(false);

        const updatedUser = { ...currentUser, fullName: formData.name };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
        toast.success("Cập nhật hồ sơ thành công!");
      } else {
        toast.error("Cập nhật thất bại: " + data.message);
      }
    } catch (err) {
      console.error("Loi cap nhat ho so:", err);
      toast.error("Đã xảy ra lỗi khi cập nhật hồ sơ.");
    }
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

  // ==========================================
  // LOGIC XU LY ANH DAI DIEN
  // ==========================================
  const fileInputRef = useRef(null);
  const [tempImageSrc, setTempImageSrc] = useState(null);
  const handleAvatarClick = () => {
    setCropperOpen(true);
  };

  const handleAvatarSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui long chon file anh hop le.");
      return;
    }

    setTempImageSrc(URL.createObjectURL(file));
    setCropperOpen(true);
  };

  const mergeAvatarWithFrame = (faceBase64, frameUrl) => {
    return new Promise((resolve, reject) => {
      const FRAME_SIZE = 500;
      const FACE_SIZE = 380;
      const FACE_X = (FRAME_SIZE - FACE_SIZE) / 2;
      const FACE_Y = (FRAME_SIZE - FACE_SIZE) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = FRAME_SIZE;
      canvas.height = FRAME_SIZE;
      const ctx = canvas.getContext("2d");
      const faceImg = new Image();
      faceImg.crossOrigin = "Anonymous";
      faceImg.src = faceBase64;

      faceImg.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          FACE_X + FACE_SIZE / 2,
          FACE_Y + FACE_SIZE / 2,
          FACE_SIZE / 2,
          0,
          Math.PI * 2
        );
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(faceImg, FACE_X, FACE_Y, FACE_SIZE, FACE_SIZE);
        ctx.restore();

        const frameImg = new Image();
        frameImg.crossOrigin = "Anonymous";
        frameImg.src = frameUrl;
        frameImg.onload = () => {
          ctx.drawImage(frameImg, 0, 0, FRAME_SIZE, FRAME_SIZE);
          resolve(canvas.toDataURL("image/png"));
        };
        frameImg.onerror = () => reject("Loi tai Khung");
      };
      faceImg.onerror = () => reject("Loi tai Mat");
    });
  };

  const handleAvatarUpload = async ({ faceBase64, frameUrl }) => {
    if (!currentUser?.userId) {
      toast.error("Vui long dang nhap lai de cap nhat anh dai dien.");
      return;
    }

    try {
      localStorage.setItem("rawAvatar", faceBase64);
      localStorage.setItem("rawFrame", frameUrl || "");

      const mergedBase64 = frameUrl
        ? await mergeAvatarWithFrame(faceBase64, frameUrl)
        : faceBase64;
      const res = await fetch(mergedBase64);
      const blob = await res.blob();
      const data = await uploadUserAvatar(blob);

      if (!data.success) {
        toast.error(data.message ?? "Khong the cap nhat anh dai dien");
        return;
      }

      const finalUrl = persistUserAvatar(data.avatarUrl);
      setAvatarUrl(finalUrl);
      setProfile((prev) => ({ ...prev, avatarUrl: finalUrl }));
      toast.success("Da cap nhat anh dai dien");

      setCropperOpen(false);
      if (tempImageSrc?.startsWith("blob:")) {
        URL.revokeObjectURL(tempImageSrc);
      }
      setTempImageSrc(null);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Tai anh that bai");
    }
  };

  // ==========================================
  // STATE: CAP NHAT MUC TIEU VA LINH VUC
  // ==========================================
  const [openGoals, setOpenGoals] = useState(false);
  const [allCats, setAllCats] = useState([]);
  const [goalInput, setGoalInput] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);

  const handleOpenPopup = async () => {
    const res = await fetch("http://localhost:5050/api/categories");
    const data = await res.json();
    setAllCats(data.data);
    setGoalInput(profile.rawLearningGoal || "");
    setSelectedCats(
      profile.rawCategories
        ? profile.rawCategories.map((c) => c.categoryId)
        : []
    );
    setOpenGoals(true);
  };

  const saveGoals = async () => {
    await fetch("http://localhost:5050/api/users/goals", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": currentUser.userId,
      },
      body: JSON.stringify({
        learningGoal: goalInput,
        categoryIds: selectedCats,
      }),
    });
    window.location.reload();
  };

  useEffect(() => {
    if (profile.name) {
      setApplyForm((prev) => ({
        ...prev,
        name: profile.name,
        email: profile.email,
      }));
    }
  }, [profile]);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/lookup/levels");
        const data = await res.json();
        if (data.success) {
          setLevelsList(data.data || []);
        }
      } catch (err) {
        console.error("Loi tai levels:", err);
      }
    };
    fetchLevels();
  }, []);

  const handleApplySubmit = async () => {
    if (!applyForm.name.trim() || !applyForm.age || !applyForm.evidence.trim()) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }
    if (applyForm.levels.length === 0) {
      toast.error("Vui lòng chọn ít nhất một trình độ giảng dạy.");
      return;
    }

    setSubmittingApply(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5050/api/users/apply-mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: applyForm.name,
          email: applyForm.email,
          age: applyForm.age,
          levels: applyForm.levels,
          evidence: applyForm.evidence,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Gửi đơn ứng tuyển thành công! Đang chờ phê duyệt.");
        setApplyMentorOpen(false);
        setApplyForm((prev) => ({ ...prev, age: '', levels: [], evidence: '' }));
      } else {
        toast.error(data.message || "Gửi đơn ứng tuyển thất bại.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi hệ thống.");
    } finally {
      setSubmittingApply(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* --- Breadcrumb --- */}
      <Breadcrumbs
        separator="/"
        sx={{
          mb: 2.5,
          "& .MuiBreadcrumbs-separator": { color: MUTED, mx: 0.5 },
        }}
      >
        <MuiLink
          component={Link}
          to={breadcrumbHome.to}
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
          {breadcrumbHome.label}
        </MuiLink>
        <Typography sx={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>
          Hồ sơ cá nhân
        </Typography>
      </Breadcrumbs>
 
      {/* --- Profile Header --- */}
      <div
        className="rounded-[20px] p-3 md:p-4 mb-4 flex flex-wrap items-center gap-3 md:gap-4"
        style={{
          backgroundColor: alpha(PRIMARY, 0.02),
          border: `1px solid ${DIVIDER}`,
        }}
      >
        {/* Avatar */}
        <Tooltip title="Đổi ảnh đại diện" placement="bottom">
          <div
            onClick={handleAvatarClick}
            className="relative w-[72px] h-[72px] md:w-[88px] md:h-[88px] flex-shrink-0 cursor-pointer rounded-full overflow-hidden group"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <Avatar
                sx={{
                  width: "100%",
                  height: "100%",
                  bgcolor: PRIMARY,
                  fontSize: { xs: 26, md: 32 },
                  fontWeight: 700,
                  boxShadow: `0 4px 16px ${alpha(PRIMARY, 0.28)}`,
                  letterSpacing: 1,
                }}
              >
                {initials}
              </Avatar>
            )}
            {/* Camera hover overlay */}
            <div className="absolute inset-0 rounded-full bg-cyan-600/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M12 15.2A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4zm7-12H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V6.2A3 3 0 0 0 19 3.2z" />
              </svg>
            </div>
          </div>
        </Tooltip>
 
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="text-xl md:text-2xl font-bold leading-[1.2]"
              style={{ color: TEXT }}
            >
              {profile.name}
            </span>
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
          </div>
          <p className="text-[13.5px] mb-1" style={{ color: MUTED }}>
            {profile.email}
          </p>
          <div className="flex items-center gap-1">
            <CalendarTodayOutlinedIcon
              sx={{ fontSize: 13, color: MUTED }}
            />
            <span className="text-[12px]" style={{ color: MUTED }}>
              Tham gia từ {profile.joinedAt}
            </span>
          </div>
        </div>
      </div>

      {/* --- 2-column layout --- */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* --- Left column --- */}
        <div className="flex-[1_1_65%] min-w-0 w-full">
          {/* Thông tin cá nhân */}
          <SectionCard>
            <SectionHead
              title="Thông tin cá nhân"
              icon={PersonRoundedIcon}
              iconColor="#2563EB"
              action={
                editMode ? (
                  <div className="flex gap-2">
                    <AppButton
                      size="small"
                      variant="contained"
                      startIcon={<CheckRoundedIcon />}
                      onClick={handleSave}
                      sx={{
                        fontSize: 12,
                        height: 28,
                        px: 1.25,
                        minWidth: "auto",
                      }}
                    >
                      Lưu
                    </AppButton>
                    <AppButton
                      size="small"
                      variant="outlined"
                      onClick={handleCancel}
                      sx={{
                        fontSize: 12,
                        height: 28,
                        px: 1.25,
                        minWidth: "auto",
                      }}
                    >
                      Hủy
                    </AppButton>
                  </div>
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

            <div>
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
                value={
                  editMode ? formData.dateOfBirth : profile.dateOfBirth
                }
                editing={editMode}
                name="dateOfBirth"
                onChange={handleFormChange}
                inputType="date"
              />
            </div>
          </SectionCard>

          {/* Mục tiêu học tập */}
          {profile.role?.toLowerCase() !== 'admin' && (
            <SectionCard>
              <SectionHead
                title="Mục tiêu học tập"
                icon={RocketLaunchIcon}
                iconColor={ACCENT}
                action={
                  <AppButton
                    size="small"
                    variant="text"
                    onClick={handleOpenPopup}
                    sx={{ fontSize: 12, px: 1, minWidth: "auto", height: 28 }}
                  >
                    Cập nhật
                  </AppButton>
                }
              />
              <div className="flex flex-wrap gap-[10px]">
                {profile?.goals?.map((goal) => (
                  <Chip
                    key={goal}
                    icon={
                      <AutoAwesomeIcon
                        sx={{
                          fontSize: "14px !important",
                          color: `${ACCENT} !important`,
                        }}
                      />
                    }
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
                  onClick={handleOpenPopup}
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
              </div>
            </SectionCard>
          )}


        </div>

        {/* --- Right column --- */}
        <div
          className="flex-[0_0_35%] w-full lg:max-w-[420px]"
        >
          <div className="lg:sticky" style={{ top: 84 }}>
            {/* Tổng quan học tập */}
            {profile.role?.toLowerCase() !== 'admin' && (
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
                  value={`${profile?.stats?.learning || 0} khóa`}
                  expandable={profile?.stats?.learning > 0}
                  expanded={expandedStat === "learning"}
                  onClick={() => setExpandedStat(prev => prev === "learning" ? null : "learning")}
                >
                  {coursesList.filter(c => !c.isCompleted).length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">Không tìm thấy khoá học nào.</p>
                  ) : (
                    <div className="space-y-2">
                      {coursesList.filter(c => !c.isCompleted).map(course => (
                        <Link
                          key={course.courseId}
                          to={`/my-courses/${course.courseId}/learn`}
                          className="flex flex-col gap-1 p-2 rounded-xl border border-slate-100 hover:border-cyan-500/30 hover:bg-cyan-50/10 transition-all font-sans text-left decoration-none block"
                        >
                          <span className="text-[12px] font-bold text-slate-700 truncate block">
                            {course.courseName}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-500" style={{ width: `${course.progress}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-cyan-600">{course.progress}%</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </StatRow>
                <StatRow
                  icon={CheckCircleRoundedIcon}
                  iconColor={SUCCESS}
                  label="Khóa hoàn thành"
                  value={`${profile?.stats?.completed || 0} khóa`}
                  expandable={profile?.stats?.completed > 0}
                  expanded={expandedStat === "completed"}
                  onClick={() => setExpandedStat(prev => prev === "completed" ? null : "completed")}
                >
                  {coursesList.filter(c => c.isCompleted).length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">Không tìm thấy khoá học nào.</p>
                  ) : (
                    <div className="space-y-2">
                      {coursesList.filter(c => c.isCompleted).map(course => {
                        const cert = certificatesList.find(
                          c => (c.courseId?._id || c.courseId) === course.courseId
                        );

                        return (
                          <div
                            key={course.courseId}
                            className="flex flex-col gap-2 p-2.5 rounded-xl border border-slate-100 font-sans text-left bg-white"
                          >
                            <Link
                              to={`/my-courses/${course.courseId}/learn`}
                              className="text-[12px] font-bold text-slate-700 hover:text-emerald-600 transition-colors truncate block decoration-none"
                            >
                              {course.courseName}
                            </Link>

                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                                ✓ Đã hoàn thành
                              </span>
                              {cert && (
                                <Link
                                  to={`/certificate/${cert.certificateCode}`}
                                  target="_blank"
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-lg text-[9.5px] font-bold transition-all decoration-none flex items-center gap-1"
                                >
                                  <WorkspacePremiumIcon sx={{ fontSize: 12 }} />
                                  Xem chứng chỉ
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </StatRow>

                <StatRow
                  icon={WorkspacePremiumIcon}
                  iconColor="#d97706"
                  label="Chứng chỉ của tôi"
                  value={`${certificatesList.length} chứng chỉ`}
                  expandable={certificatesList.length > 0}
                  expanded={expandedStat === "certificates"}
                  onClick={() => setExpandedStat(prev => prev === "certificates" ? null : "certificates")}
                  last
                >
                  <div className="space-y-2">
                    {certificatesList.map(cert => (
                      <div
                        key={cert._id}
                        className="flex flex-col gap-2 p-2.5 rounded-xl border border-slate-100 font-sans text-left bg-white"
                      >
                        <span className="text-[12px] font-bold text-slate-700 truncate block">
                          {cert.courseId?.courseName || 'Khóa học của StarLearning'}
                        </span>

                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[9px] text-slate-400 font-medium">
                            Cấp ngày: {new Date(cert.issuedAt).toLocaleDateString('vi-VN')}
                          </span>

                          <Link
                            to={`/certificate/${cert.certificateCode}`}
                            target="_blank"
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 rounded-lg text-[9.5px] font-bold transition-all decoration-none flex items-center gap-1"
                          >
                            <WorkspacePremiumIcon sx={{ fontSize: 12 }} />
                            Xem chứng chỉ
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </StatRow>
              </SectionCard>
            )}

            {/* Cài đặt tài khoản */}
            <SectionCard>
              <SectionHead
                title="Cài đặt tài khoản"
                icon={LockOutlinedIcon}
                iconColor={MUTED}
              />
              <div className="flex items-center gap-3 py-[6px]">
                <LockOutlinedIcon
                  sx={{ fontSize: 17, color: MUTED }}
                />
                <span
                  className="flex-1 text-[13px] font-semibold"
                  style={{ color: TEXT }}
                >
                  Đổi mật khẩu
                </span>
                <AppButton
                  size="small"
                  variant="outlined"
                  onClick={() => setPasswordDialogOpen(true)}
                  sx={{
                    fontSize: 11,
                    height: 28,
                    px: 1.5,
                    minWidth: "auto",
                  }}
                >
                  Thay đổi
                </AppButton>
              </div>
              {(profile.role?.toLowerCase() === "student" || profile.role === "Hoc vien") && (
                <div className="flex items-center gap-3 py-[6px] border-t border-slate-100 mt-2 pt-2">
                  <PersonRoundedIcon sx={{ fontSize: 17, color: MUTED }} />
                  <span
                    className="flex-1 text-[13px] font-semibold"
                    style={{ color: TEXT }}
                  >
                    Ứng tuyển làm Mentor
                  </span>
                  <AppButton
                    size="small"
                    variant="contained"
                    onClick={() => setApplyMentorOpen(true)}
                    sx={{
                      fontSize: 11,
                      height: 28,
                      px: 1.5,
                      minWidth: "auto",
                    }}
                  >
                    Đăng ký
                  </AppButton>
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />

      {/* Mentor Application Dialog */}
      <Dialog
        open={applyMentorOpen}
        onClose={() => setApplyMentorOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: TEXT }}>
          Ung tuyen lam Mentor
        </DialogTitle>

        <DialogContent dividers>
          <Typography sx={{ fontSize: 13, color: MUTED, mb: 3 }}>
            Vui long cung cap day du thong tin nang luc va chung chi cua ban de tro thanh giang vien/mentor tren he thong.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Ho va ten"
              size="small"
              fullWidth
              value={applyForm.name}
              onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
            />

            <TextField
              label="Email"
              size="small"
              fullWidth
              disabled
              value={applyForm.email}
            />

            <TextField
              label="Tuoi"
              size="small"
              fullWidth
              type="number"
              value={applyForm.age}
              onChange={(e) => setApplyForm({ ...applyForm, age: e.target.value })}
            />

            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT, mb: 1 }}>
                Trinh do giang day ung tuyen
              </Typography>
              <FormGroup sx={{ flexDirection: 'row', gap: 1 }}>
                {levelsList.map((lv) => (
                  <FormControlLabel
                    key={lv.levelId}
                    control={
                      <Checkbox
                        size="small"
                        checked={applyForm.levels.includes(lv.levelId)}
                        onChange={(e) => {
                          const nextLevels = e.target.checked
                            ? [...applyForm.levels, lv.levelId]
                            : applyForm.levels.filter((id) => id !== lv.levelId);
                          setApplyForm({ ...applyForm, levels: nextLevels });
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: 13 }}>{lv.displayName}</Typography>}
                    sx={{ width: '45%', m: 0 }}
                  />
                ))}
              </FormGroup>
            </Box>

            <TextField
              label="Tai lieu minh chuong (Link anh/url chung chi...)"
              size="small"
              fullWidth
              required
              multiline
              rows={3}
              placeholder="Nhap duong dan den chung chi Google Drive, Dropbox hoac noi dung mo ta nang luc cua ban..."
              value={applyForm.evidence}
              onChange={(e) => setApplyForm({ ...applyForm, evidence: e.target.value })}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <AppButton
            variant="outlined"
            onClick={() => setApplyMentorOpen(false)}
            disabled={submittingApply}
          >
            Huy
          </AppButton>
          <AppButton
            variant="contained"
            onClick={handleApplySubmit}
            loading={submittingApply}
          >
            Gui don ung tuyen
          </AppButton>
        </DialogActions>
      </Dialog>
      {/* --- File input hidden --- */}
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleAvatarSelected}
      />
      {/* Crop dialog */}
      <ProfileImageCropDialog
        open={cropperOpen}
        imageSrc={tempImageSrc || localStorage.getItem("rawAvatar") || ""}
        initialFrame={localStorage.getItem("rawFrame") || ""}
        onClose={() => {
          setCropperOpen(false);
          if (tempImageSrc?.startsWith("blob:")) {
            URL.revokeObjectURL(tempImageSrc);
          }
          setTempImageSrc(null);
        }}
        onSave={handleAvatarUpload}
      />
      <Dialog
        open={openGoals}
        onClose={() => setOpenGoals(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: TEXT }}>
          Cap nhat Muc tieu & Linh vuc
        </DialogTitle>

        <DialogContent dividers>
          <Typography
            sx={{ fontSize: 14, fontWeight: 600, mb: 1, color: TEXT }}
          >
            Muc tieu hoc tap
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Vi du: Lay bang gioi, Tim viec lam..."
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Typography
            sx={{ fontSize: 14, fontWeight: 600, mb: 1, color: TEXT }}
          >
            Linh vuc quan tam
          </Typography>
          <FormGroup sx={{ flexDirection: "row", gap: 1 }}>
            {allCats.map((cat) => (
              <FormControlLabel
                key={cat.categoryId}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedCats.includes(cat.categoryId)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCats([
                          ...selectedCats,
                          cat.categoryId,
                        ]);
                      } else {
                        setSelectedCats(
                          selectedCats.filter(
                            (id) => id !== cat.categoryId
                          )
                        );
                      }
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: 14 }}>
                    {cat.displayName}
                  </Typography>
                }
                sx={{ width: "45%", m: 0 }}
              />
            ))}
          </FormGroup>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <AppButton
            variant="outlined"
            onClick={() => setOpenGoals(false)}
          >
            Huy
          </AppButton>
          <AppButton variant="contained" onClick={saveGoals}>
            Luu
          </AppButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
