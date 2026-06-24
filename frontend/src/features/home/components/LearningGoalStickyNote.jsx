import { Box, Divider, Typography, alpha } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { getStreakColor } from "@/shared/utils/streakUtils";

const PRIMARY = "#0891B2";
const TEXT = "#0F172A";
const MUTED = "#64748B";
const STICKY_BG = "#FFF7C2";
const STICKY_BORDER = "rgba(234,179,8,0.35)";

export default function LearningGoalStickyNote({
  displayName = "Học viên",
  streak = 0,
  isLoggedIn = false,
  goal = "",
  loading = false,
  overlay = false,
}) {
  const trimmedGoal = String(goal ?? "").trim();
  const hasGoal = trimmedGoal.length > 0;

  const compact = overlay;

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: compact ? 2 : { xs: 0, md: 2.5 },
          px: compact ? 2.25 : { xs: 2, sm: 2.5 },
          py: compact ? 1.5 : { xs: 2, sm: 2.25 },
          bgcolor: STICKY_BG,
          borderRadius: compact ? "2px 12px 12px 12px" : "2px 16px 16px 16px",
          border: `1px solid ${STICKY_BORDER}`,
          boxShadow: compact
            ? `0 8px 20px ${alpha("#854D0E", 0.14)}, 0 2px 4px ${alpha("#854D0E", 0.08)}`
            : `
            0 10px 24px ${alpha("#854D0E", 0.12)},
            0 2px 6px ${alpha("#854D0E", 0.08)},
            inset 0 1px 0 rgba(255,255,255,0.65)
          `,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: compact ? 12 : 18,
            width: compact ? 40 : 56,
            height: compact ? 10 : 14,
            bgcolor: alpha("#FDE68A", 0.85),
            borderRadius: "0 0 5px 5px",
            boxShadow: `inset 0 -1px 0 ${alpha("#CA8A04", 0.18)}`,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: 0,
            height: 0,
            borderStyle: "solid",
            borderWidth: compact ? "0 16px 16px 0" : "0 22px 22px 0",
            borderColor: `transparent ${alpha("#FEF08A", 0.95)} transparent transparent`,
          },
        }}
      >
        <Box
          sx={{
            flex: "0 0 auto",
            alignSelf: "center",
            mt: compact ? 0.25 : 0.5,
          }}
        >
          <Typography
            sx={{
              fontSize: compact ? 12.5 : { xs: 14, md: 15 },
              color: TEXT,
              fontWeight: 500,
              lineHeight: compact ? 1.45 : 1.65,
              whiteSpace: "nowrap",
            }}
          >
            Xin chào,{" "}
            <Box component="span" sx={{ color: PRIMARY, fontWeight: 700 }}>
              {displayName}
            </Box>
            {isLoggedIn ? (
              <>
                {" "}
                bạn đã giữ vững{" "}
                <Box component="span" sx={{ color: "#EA580C", fontWeight: 700 }}>
                  Chuỗi
                </Box>{" "}
                <Box component="span" sx={{ fontWeight: 700, color: getStreakColor(streak) }}>
                  {streak}
                </Box>{" "}
                ngày học!
              </>
            ) : (
              "!"
            )}
          </Typography>
        </Box>

        {isLoggedIn && (
          <>
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                borderColor: alpha("#CA8A04", 0.22),
                mt: compact ? 0.25 : 0.5,
                mb: compact ? 0.25 : 0,
              }}
            />

            <Box sx={{ flex: 1, minWidth: 0, alignSelf: "center" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: compact ? 0.35 : 1.1,
                }}
              >
                <RocketLaunchOutlinedIcon
                  sx={{ fontSize: compact ? 14 : 17, color: "#CA8A04" }}
                />
                <Typography
                  sx={{
                    fontSize: compact ? 10.5 : 12,
                    fontWeight: 800,
                    color: "#92400E",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Mục tiêu học tập
                </Typography>
              </Box>

              {loading ? (
                <Typography
                  sx={{
                    fontSize: compact ? 12 : 14,
                    color: MUTED,
                    fontStyle: "italic",
                  }}
                >
                  Đang tải...
                </Typography>
              ) : hasGoal ? (
                <Typography
                  sx={{
                    fontSize: compact ? 12 : { xs: 14, sm: 15 },
                    color: TEXT,
                    fontWeight: 600,
                    lineHeight: 1.45,
                    display: "-webkit-box",
                    WebkitLineClamp: compact ? 1 : "unset",
                    WebkitBoxOrient: "vertical",
                    overflow: compact ? "hidden" : "visible",
                    wordBreak: "break-word",
                  }}
                >
                  {trimmedGoal}
                </Typography>
              ) : (
                <Box>
                  <Typography
                    sx={{
                      fontSize: compact ? 10.5 : 14,
                      color: MUTED,
                      lineHeight: 1.45,
                      mb: compact ? 0.4 : 1,
                    }}
                  >
                    Chưa có mục tiêu.
                  </Typography>
                  <Box
                    component={RouterLink}
                    to="/profile"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.35,
                      fontSize: compact ? 10.5 : 13,
                      fontWeight: 700,
                      color: "#B45309",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    <EditOutlinedIcon sx={{ fontSize: compact ? 12 : 15 }} />
                    Cập nhật Profile
                  </Box>
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
