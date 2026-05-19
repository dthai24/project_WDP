import { Box, TextField, Typography, alpha, useTheme } from "@mui/material";

export default function SearchBox({
  value,
  onChange,
  onClear,
  placeholder = "Tìm kiếm...",
  fullWidth = true,
  sx,
  ...props
}) {
  const theme = useTheme();

  const handleClear = () => {
    onChange?.({ target: { value: "" } });
    onClear?.();
  };

  return (
    <Box sx={{ position: "relative", width: fullWidth ? "100%" : "auto", ...sx }}>
      <TextField
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        fullWidth={fullWidth}
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: theme.ios18?.radius?.pill ?? 9999,
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            pr: value ? 7 : 2,
            transition: `all 0.2s ${theme.ios18?.transition}`,
            "& fieldset": {
              borderColor: alpha(theme.palette.primary.main, 0.12),
            },
            "&:hover fieldset": {
              borderColor: alpha(theme.palette.primary.main, 0.25),
            },
            "&.Mui-focused": {
              backgroundColor: "#fff",
              "& fieldset": {
                borderColor: theme.palette.primary.main,
                borderWidth: 1,
              },
            },
          },
        }}
        {...props}
      />
      {value ? (
        <Typography
          component="button"
          type="button"
          onClick={handleClear}
          sx={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 600,
            color: "primary.main",
            p: 0,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Xóa
        </Typography>
      ) : null}
    </Box>
  );
}
