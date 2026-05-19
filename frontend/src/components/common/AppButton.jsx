import { Button, CircularProgress, alpha, useTheme } from "@mui/material";

const VARIANT_STYLES = {
  contained: (theme) => ({
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
  outlined: (theme) => ({
    borderColor: alpha(theme.palette.primary.main, 0.3),
    color: theme.palette.primary.main,
    backgroundColor: "transparent",
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.06),
    },
  }),
  text: (theme) => ({
    color: theme.palette.primary.main,
    "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
  }),
  glass: (theme) => ({
    ...theme.ios18?.glass,
    color: theme.palette.primary.main,
    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.95)" },
  }),
  accent: (theme) => ({
    backgroundColor: theme.palette.accent?.main ?? "#EA580C",
    color: "#fff",
    "&:hover": {
      backgroundColor: theme.palette.accent?.dark ?? "#C2410C",
    },
  }),
};

export default function AppButton({
  children,
  variant = "contained",
  loading = false,
  disabled,
  fullWidth,
  sx,
  ...props
}) {
  const theme = useTheme();
  const styleFn = VARIANT_STYLES[variant] ?? VARIANT_STYLES.contained;
  const muiVariant = variant === "glass" || variant === "accent" ? "contained" : variant;

  return (
    <Button
      variant={muiVariant}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      sx={{
        ...styleFn(theme),
        opacity: disabled ? 0.5 : 1,
        ...sx,
      }}
      {...props}
    >
      {loading ? <CircularProgress size={22} color="inherit" /> : children}
    </Button>
  );
}
