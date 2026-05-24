import { useState, useRef, useEffect } from "react";
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
  Tooltip,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { surfaceCardSx } from "../theme";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../common/Logo";
import SearchBox from "../common/SearchBox";
import { toast } from "../common/Toast";
import {
  buildCourseListSearchParams,
  parseCourseListParams,
} from "../../utils/courseListParams";

const MENU_CLOSE_DELAY = 200;
const KEYWORD_DEBOUNCE_MS = 300;
const PROJECT_NAME = "S.T.A.R Learning Path";

export default function Header({
  showUser = true,
  onLogout,
  logoHeight = 36,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const closeTimer = useRef(null);
  const keywordDebounceRef = useRef(null);

  const isCoursePage = location.pathname === "/courses";
  const [search, setSearch] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (isCoursePage) {
      setSearch(searchParams.get("keyword") || "");
    }
  }, [isCoursePage, searchParams]);

  useEffect(
    () => () => {
      if (keywordDebounceRef.current) {
        clearTimeout(keywordDebounceRef.current);
      }
    },
    []
  );

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

  const applyCourseKeyword = (value) => {
    const current = parseCourseListParams(searchParams);
    const next = buildCourseListSearchParams(
      { ...current, keyword: value.trim(), page: 1 },
      searchParams
    );
    setSearchParams(next, { replace: true });
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);

    if (!isCoursePage) return;

    if (keywordDebounceRef.current) {
      clearTimeout(keywordDebounceRef.current);
    }
    keywordDebounceRef.current = setTimeout(() => {
      applyCourseKeyword(value);
    }, KEYWORD_DEBOUNCE_MS);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key !== "Enter") return;

    if (keywordDebounceRef.current) {
      clearTimeout(keywordDebounceRef.current);
    }

    if (isCoursePage) {
      applyCourseKeyword(search);
      return;
    }

    const trimmed = search.trim();
    if (trimmed) {
      navigate(`/courses?keyword=${encodeURIComponent(trimmed)}`);
    }
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
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            showClear={!isCoursePage}
            placeholder={
              isCoursePage ? "Tìm khóa học..." : "Tìm kiếm khóa học, lộ trình..."
            }
            sx={{ width: "100%", maxWidth: 480 }}
          />
        </Box>

        {showUser && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
            {user && (
              <Tooltip title="Khóa học của tôi">
                <Box
                  component="button"
                  type="button"
                  onClick={() => navigate("/my-courses")}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    py: 1,
                    px: isMobile ? 1 : 1.75,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    bgcolor: "rgba(8,145,178,0.08)",
                    color: "#0891B2",
                    borderRadius: "99px",
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      bgcolor: "rgba(8,145,178,0.14)",
                    },
                  }}
                >
                  <MenuBookOutlinedIcon sx={{ fontSize: 18 }} />
                  {!isMobile && "Khóa học của tôi"}
                </Box>
              </Tooltip>
            )}

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
