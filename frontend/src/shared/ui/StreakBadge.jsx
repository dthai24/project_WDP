import { useState, useEffect } from "react";
import { Box, Typography, Popover, Grid } from "@mui/material";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export default function StreakBadge({ userId, alwaysActive = false, variant = "pill", displayName = "" }) {
  const [streak, setStreak] = useState(0);
  const [hasStudiedToday, setHasStudiedToday] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5050').replace(/\/+$/, '') + '/api';
    
    const fetchStreak = () => {
      fetch(`${API_BASE}/courses/streak`, {
        headers: { "x-user-id": String(userId) },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStreak(data.streak || 0);
            setHasStudiedToday(data.hasStudiedToday || false);
          }
        })
        .catch(() => {});
    };

    fetchStreak();

    const handleStreakUpdate = (e) => {
      if (e && e.detail && e.detail.hasStudiedToday) {
        setHasStudiedToday(true);
      }
      fetchStreak();
    };

    window.addEventListener("streakUpdate", handleStreakUpdate);
    return () => {
      window.removeEventListener("streakUpdate", handleStreakUpdate);
    };
  }, [userId]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  if (variant === "yellowBox") {
    return (
      <Box
        sx={{
          bgcolor: "#FFF8C9",
          borderRadius: 2,
          p: { xs: 2, md: 3 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: { xs: 2.5, md: 3 },
          border: "1px solid #FDE047",
        }}
      >
        <Typography sx={{ fontSize: 16, color: "#334155", fontWeight: 500 }}>
          Xin chào,{" "}
          <Box component="span" sx={{ color: "#0891B2", fontWeight: 700 }}>
            {displayName}
          </Box>{" "}
          bạn đã giữ vững{" "}
          <Box component="span" sx={{ color: "#EA580C", fontWeight: 700 }}>
            Chuỗi
          </Box>{" "}
          <Box
            component="span"
            sx={{
              bgcolor: "rgba(100,116,139,0.15)",
              color: "#64748B",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontWeight: 700,
              mx: 0.5,
            }}
          >
            {streak}
          </Box>{" "}
          ngày học!
        </Typography>

        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          <Box sx={{ width: "1px", height: 40, bgcolor: "rgba(234,88,12,0.2)", display: { xs: "none", md: "block" } }} />
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#EA580C", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
              🚀 Mục tiêu học tập
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#64748B", mb: 0.5 }}>
              Chưa có mục tiêu.
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#D97706", display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              🖊 Cập nhật Profile
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // Logic variant pill (dành cho Header)
  const isGray = !hasStudiedToday && !alwaysActive;
  
  const bgColor = isGray ? "rgba(100,116,139,0.10)" : "rgba(234,88,12,0.10)";
  const borderColor = isGray ? "rgba(100,116,139,0.20)" : "rgba(234,88,12,0.20)";
  const textColor = isGray ? "#64748B" : "#EA580C";

  // Mock calendar study status for last 7 days
  const daysOfWeek = ["Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7", "CN"];
  const studiedStatus = [true, true, true, false, hasStudiedToday, false, false];

  return (
    <>
      <Box
        onClick={handleOpen}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: 1.25,
          py: 0.5,
          borderRadius: "99px",
          bgcolor: bgColor,
          border: `1px solid ${borderColor}`,
          transition: "all 0.3s ease",
          cursor: "pointer",
          "&:hover": {
            transform: "scale(1.03)",
            boxShadow: "0 2px 8px rgba(234,88,12,0.15)",
          }
        }}
      >
        <LocalFireDepartmentRoundedIcon sx={{ fontSize: 18, color: textColor }} />
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: textColor }}>
          {streak} ngày
        </Typography>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            p: 2.5,
            width: 280,
            borderRadius: 3,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            border: "1px solid #f1f5f9"
          }
        }}
      >
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <LocalFireDepartmentRoundedIcon sx={{ fontSize: 40, color: "#EA580C", mb: 0.5 }} />
          <Typography sx={{ fontWeight: 800, fontSize: 16, color: "#1e293b" }}>
            Chuỗi Học Tập 🔥
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.5 }}>
            Bạn đang có chuỗi học tập liên tiếp <b>{streak} ngày</b>. Hãy duy trì mỗi ngày nhé!
          </Typography>
        </Box>

        <Box sx={{ bgcolor: "#f8fafc", p: 1.5, borderRadius: 2, mb: 1.5 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", mb: 1, textTransform: "uppercase", textAlign: "center" }}>
            Lịch học 7 ngày qua
          </Typography>
          <Grid container spacing={1} justifyContent="center">
            {daysOfWeek.map((day, idx) => (
              <Grid item key={idx} xs={1.7} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#64748b", mb: 0.5 }}>
                  {day}
                </Typography>
                {studiedStatus[idx] ? (
                  <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "#10b981" }} />
                ) : (
                  <Box sx={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #cbd5e1", mt: 0.25 }} />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>

        {hasStudiedToday ? (
          <Typography sx={{ fontSize: 11.5, color: "#10b981", fontWeight: 700, textAlign: "center" }}>
            🎉 Hôm nay bạn đã hoàn thành bài học!
          </Typography>
        ) : (
          <Typography sx={{ fontSize: 11.5, color: "#d97706", fontWeight: 700, textAlign: "center" }}>
            ⚡️ Hôm nay chưa có bài học nào được hoàn thành.
          </Typography>
        )}
      </Popover>
    </>
  );
}

