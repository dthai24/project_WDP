import { useState, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  MenuItem,
  MenuList,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { surfaceCardSx } from "../theme";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useNavigate } from "react-router-dom";
import Logo from "../common/Logo";
import SearchBox from "../common/SearchBox";
import { toast } from "../common/Toast";

const MENU_CLOSE_DELAY = 200;
const PROJECT_NAME = "S.T.A.R Learning Path";

export default function Header({
  showUser = true,
  onLogout,
  logoHeight = 36,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const closeTimer = useRef(null);

  const [search, setSearch] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userRaw = sessionStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openUserMenu = () => {
    clearCloseTimer();
    setUserMenuOpen(true);
  };

  const scheduleCloseUserMenu = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setUserMenuOpen(false);
    }, MENU_CLOSE_DELAY);
  };

  const closeUserMenu = () => {
    clearCloseTimer();
    setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    if (userMenuOpen) closeUserMenu();
    else openUserMenu();
  };

  const handleLogout = () => {
    closeUserMenu();
    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.removeItem("user");
      toast.info("Đã đăng xuất thành công.");
      navigate("/login", { replace: true });
    }
  };

  const handleProfile = () => {
    closeUserMenu();
    navigate("/profile");
  };

  const userZoneHandlers = isMobile
    ? {}
    : {
        onMouseEnter: openUserMenu,
        onMouseLeave: scheduleCloseUserMenu,
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          <Logo height={logoHeight} to="/home" />
          <Typography
            component="span"
            sx={{
              display: { xs: "none", sm: "block" },
              fontSize: { sm: 14, md: 15 },
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "text.primary",
              whiteSpace: "nowrap",
            }}
          >
            {PROJECT_NAME}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            px: { xs: 0, sm: 2 },
            minWidth: 0,
          }}
        >
          <SearchBox
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            placeholder="Tìm kiếm khóa học, lộ trình..."
            sx={{ width: "100%", maxWidth: 480 }}
          />
        </Box>

        {showUser && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
            <IconButton
              aria-label="Thông báo"
              size="medium"
              sx={{
                color: "text.secondary",
                borderRadius: theme.ios18?.radius?.xs,
                "&:hover": {
                  color: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <NotificationsOutlinedIcon />
            </IconButton>

            {user && (
              <Box {...userZoneHandlers} sx={{ position: "relative" }}>
                <Box
                  onClick={isMobile ? toggleUserMenu : undefined}
                  role="button"
                  tabIndex={0}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleUserMenu();
                    }
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    py: 0.5,
                    px: 1,
                    borderRadius: theme.ios18?.radius?.xs,
                    cursor: "pointer",
                    transition: `background-color 0.2s ${theme.ios18?.transition}`,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                    },
                  }}
                >
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
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      maxWidth: { xs: 100, sm: 140 },
                      display: { xs: "none", sm: "block" },
                    }}
                    noWrap
                  >
                    {user.fullName || "Học viên"}
                  </Typography>
                </Box>

                {userMenuOpen && (
                  <Card
                    elevation={0}
                    onMouseEnter={clearCloseTimer}
                    onMouseLeave={scheduleCloseUserMenu}
                    sx={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      mt: 0.25,
                      minWidth: 200,
                      zIndex: theme.zIndex.appBar + 2,
                      overflow: "hidden",
                      ...surfaceCardSx(theme),
                    }}
                  >
                    <MenuList
                      dense
                      disablePadding
                      autoFocusItem={false}
                      sx={{
                        py: 0.5,
                        "& .MuiMenuItem-root": {
                          borderRadius: theme.ios18.radius.xs,
                          mx: 1,
                          my: 0.25,
                        },
                      }}
                    >
                      <MenuItem onClick={handleProfile}>
                        <ListItemIcon>
                          <PersonOutlineOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primaryTypographyProps={{ fontSize: 14 }}>
                          Hồ sơ cá nhân
                        </ListItemText>
                      </MenuItem>
                      <Divider sx={{ my: 0.5 }} />
                      <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                        <ListItemIcon>
                          <LogoutOutlinedIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Đăng xuất"
                          primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                        />
                      </MenuItem>
                    </MenuList>
                  </Card>
                )}
              </Box>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
