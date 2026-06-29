import { Link, NavLink, useLocation } from "react-router-dom";
import { getUser } from "@/features/auth/utils/authUtils";
import {
  getMentorMenuItems,
  getStudentMenuItems,
  getAdminMenuItems,
} from "./sidebarMenuConfig";
import { HEADER_HEIGHT } from "./MainLayout";

export const SIDEBAR_WIDTH = 76;

const COLOR_ACTIVE = "#0891B2";
const COLOR_INACTIVE = "#475569";
const BG_ACTIVE = "rgba(8, 145, 178, 0.1)";
const BG_HOVER = "rgba(8, 145, 178, 0.06)";

function SidebarItemContent({ label, Icon, active, disabled }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-[3px] w-full py-[10px] px-[4px] rounded-xl no-underline transition-all duration-200 ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
      style={{
        color: active ? COLOR_ACTIVE : COLOR_INACTIVE,
        backgroundColor: active ? BG_ACTIVE : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !active)
          e.currentTarget.style.backgroundColor = BG_HOVER;
      }}
      onMouseLeave={(e) => {
        if (!disabled && !active)
          e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <Icon aria-hidden className="text-[22px]" />
      <span
        className="text-[11px] font-semibold leading-[1.2] text-center px-[2px]"
        style={{ color: "inherit" }}
      >
        {label}
      </span>
    </div>
  );
}

function SidebarItem({ item }) {
  const location = useLocation();
  const { label, to, Icon, disabled, end = false, isActiveMatch } = item;

  if (disabled) {
    return (
      <div className="group relative w-full">
        <div className="block w-full">
          <SidebarItemContent
            label={label}
            Icon={Icon}
            active={false}
            disabled
          />
        </div>
        {/* Tooltip */}
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-800 text-white text-[11px] font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none shadow-lg">
          Sap ra mat
        </div>
      </div>
    );
  }

  if (isActiveMatch) {
    const active = isActiveMatch(location.pathname);
    return (
      <Link to={to} className="no-underline w-full block">
        <SidebarItemContent
          label={label}
          Icon={Icon}
          active={active}
          disabled={false}
        />
      </Link>
    );
  }

  return (
    <NavLink to={to} end={end} className="no-underline w-full block">
      {({ isActive }) => (
        <SidebarItemContent
          label={label}
          Icon={Icon}
          active={isActive}
          disabled={false}
        />
      )}
    </NavLink>
  );
}

export default function Sidebar({ variant = "student" }) {
  const user = getUser();
  const menuItems =
    variant === "mentor"
      ? getMentorMenuItems()
      : variant === "admin"
        ? getAdminMenuItems()
        : getStudentMenuItems(user);

  return (
    <aside
      aria-label={
        variant === "mentor"
          ? "Dieu huong mentor"
          : variant === "admin"
            ? "Dieu huong admin"
            : "Dieu huong chinh"
      }
      className="fixed left-0 flex flex-col items-center py-3 px-[5px] box-border overflow-y-auto overflow-x-hidden z-40"
      style={{
        top: HEADER_HEIGHT,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        backgroundColor: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        scrollbarWidth: "none",
      }}
    >
      <style>{`
        aside::-webkit-scrollbar { display: none; }
      `}</style>
      <div className="flex flex-col gap-[6px] w-full">
        {menuItems.map((item) => (
          <SidebarItem key={item.id} item={item} />
        ))}
      </div>
    </aside>
  );
}
