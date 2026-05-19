import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  LinearProgress,
  alpha,
  useTheme,
} from "@mui/material";
import AppButton from "../common/AppButton";

export default function CourseCard({ course, onEnroll, onClick }) {
  const theme = useTheme();
  const {
    id,
    title = "Khóa học",
    description = "",
    thumbnail,
    level = "Cơ bản",
    duration = "—",
    students = 0,
    progress = 0,
    tags = [],
  } = course ?? {};

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: `box-shadow 0.2s ${theme.ios18?.transition}`,
        "&:hover": onClick ? { boxShadow: theme.ios18?.shadow?.md } : {},
      }}
      onClick={onClick}
    >
      <CardMedia
        component="div"
        sx={{
          height: 120,
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
          backgroundImage: thumbnail ? `url(${thumbnail})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <Chip
          label={level}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            fontWeight: 600,
            fontSize: 11,
            height: 24,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          }}
        />
      </CardMedia>

      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5, pt: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </Typography>

        {tags.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: 11,
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  color: "text.secondary",
                }}
              />
            ))}
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {duration}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {students} học viên
          </Typography>
        </Box>

        {progress > 0 && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Tiến độ
              </Typography>
              <Typography variant="caption" fontWeight={600} color="primary.main">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 2,
                  backgroundColor: theme.palette.primary.main,
                },
              }}
            />
          </Box>
        )}

        {onEnroll && (
          <AppButton
            fullWidth
            size="small"
            variant={progress > 0 ? "outlined" : "contained"}
            onClick={(e) => {
              e.stopPropagation();
              onEnroll(id);
            }}
            sx={{ mt: "auto" }}
          >
            {progress > 0 ? "Tiếp tục học" : "Đăng ký"}
          </AppButton>
        )}
      </CardContent>
    </Card>
  );
}
