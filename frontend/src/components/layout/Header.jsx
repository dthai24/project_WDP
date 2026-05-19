import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Logo from "../common/Logo";

export default function Header({
  navLinks = [],
  showUser = true,
  onLogout,
  logoHeight = 36,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const userRaw = sessionStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#FFFFFF",
        color: "text.primary",
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        boxShadow: theme.ios18?.shadow?.sm,
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: { xs: 56, sm: 60 } }}>
        <Logo height={logoHeight} to="/" />

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, flex: 1 }}>
          {navLinks.map((link) => (
            <Typography
              key={link.to}
              component={RouterLink}
              to={link.to}
              sx={{
                px: 2,
                py: 1,
                borderRadius: theme.ios18?.radius?.pill,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                color: "text.secondary",
                transition: `color 0.2s ${theme.ios18?.transition}, background-color 0.2s`,
                "&:hover": {
                  color: "secondary.main",
                  backgroundColor: alpha(theme.palette.secondary.main, 0.06),
                },
              }}
            >
              {link.label}
            </Typography>
          ))}
        </Box>

        <Box sx={{ flex: 1, display: { xs: "block", md: "none" } }} />

        {showUser && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Button
              size="small"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
                display: { xs: "none", sm: "inline-flex" },
              }}
            >
              Thông báo
            </Button>
            {user && (
              <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: 13,
                    fontWeight: 600,
                    bgcolor: "primary.main",
                  }}
                >
                  {(user.fullName || user.email || "?")[0].toUpperCase()}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 120 }} noWrap>
                  {user.fullName || "Học viên"}
                </Typography>
              </Box>
            )}
            <Button
              size="small"
              onClick={handleLogout}
              sx={{ color: "error.main", fontWeight: 600 }}
            >
              Đăng xuất
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
