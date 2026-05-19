import { Box, Typography, alpha, useTheme } from "@mui/material";
import AppButton from "./AppButton";

export default function EmptyState({
  title = "Không có dữ liệu",
  description,
  actionLabel,
  onAction,
  embedded = false,
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        textAlign: "center",
        py: embedded ? 4 : 5,
        px: embedded ? 2 : 3,
        ...(embedded
          ? {
              borderRadius: 0,
              border: "none",
              backgroundColor: "transparent",
            }
          : {
              borderRadius: theme.shape.borderRadius,
              backgroundColor: alpha(theme.palette.primary.main, 0.03),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }),
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 3,
          borderRadius: 1,
          bgcolor: "primary.main",
          mx: "auto",
          mb: 2,
          opacity: 0.5,
        }}
      />
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 360, mx: "auto", mb: actionLabel ? 3 : 0 }}
        >
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <AppButton variant="outlined" onClick={onAction}>
          {actionLabel}
        </AppButton>
      )}
    </Box>
  );
}
