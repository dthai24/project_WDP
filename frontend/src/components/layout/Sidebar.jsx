import { NavLink } from "react-router-dom";
import { Box, Stack, Typography, Tooltip } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";

export const SIDEBAR_WIDTH = 76;

const ITEM_RADIUS = "14px";
const COLOR_ACTIVE = "#0891B2";
const COLOR_INACTIVE = "#334155";
const BG_ACTIVE = "rgba(8, 145, 178, 0.1)";
const BG_HOVER = "rgba(8, 145, 178, 0.06)";

const MENU_ITEMS = [
  {
    id: "home",
    label: "Trang chủ",
    to: "/home",
    Icon: HomeOutlinedIcon,
    disabled: false,
  },
  {
    id: "courses",
    label: "Khóa học",
    Icon: MenuBookOutlinedIcon,
    disabled: true,
  },
  {
    id: "paths",
    label: "Lộ trình",
    Icon: RouteOutlinedIcon,
    disabled: true,
  },
  {
    id: "news",
    label: "Tin tức",
    Icon: NewspaperOutlinedIcon,
    disabled: true,
  },
];

function itemSx(active, disabled) {
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 0.5,
    width: "100%",
    py: 1.25,
    px: 0.5,
    borderRadius: ITEM_RADIUS,
    color: active ? COLOR_ACTIVE : COLOR_INACTIVE,
    bgcolor: active ? BG_ACTIVE : "transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    textDecoration: "none",
    transition: "background-color 0.2s ease, color 0.2s ease",
    "& .MuiSvgIcon-root": {
      fontSize: 22,
      color: active ? COLOR_ACTIVE : COLOR_INACTIVE,
    },
    ...(!disabled && {
      "&:hover": {
        bgcolor: active ? BG_ACTIVE : BG_HOVER,
      },
    }),
  };
}

function SidebarItemContent({ label, Icon, active, disabled }) {
  return (
    <Box sx={itemSx(active, disabled)}>
      <Icon aria-hidden />
      <Typography
        component="span"
        sx={{
          fontSize: 11,
          fontWeight: 600,
          lineHeight: 1.2,
          textAlign: "center",
          color: "inherit",
          px: 0.25,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function SidebarItem({ item }) {
  const { label, to, Icon, disabled } = item;

  if (disabled) {
    return (
      <Tooltip title="Sắp ra mắt" placement="right" arrow>
        <Box component="span" sx={{ display: "block", width: "100%" }}>
          <SidebarItemContent label={label} Icon={Icon} active={false} disabled />
        </Box>
      </Tooltip>
    );
  }

  return (
    <NavLink to={to} end style={{ textDecoration: "none", width: "100%" }}>
      {({ isActive }) => (
        <SidebarItemContent label={label} Icon={Icon} active={isActive} disabled={false} />
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <Box
      component="aside"
      aria-label="Điều hướng chính"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 2,
        px: 1,
        boxSizing: "border-box",
        bgcolor: "background.default",
      }}
    >
      <Stack spacing={0.75} sx={{ width: "100%" }}>
        {MENU_ITEMS.map((item) => (
          <SidebarItem key={item.id} item={item} />
        ))}
      </Stack>
    </Box>
  );
}
