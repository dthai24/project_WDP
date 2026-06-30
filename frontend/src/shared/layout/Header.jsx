import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  GraduationCap,
  House,
  BookOpen,
  User,
  Gear,
  SignOut,
  List,
  X,
  CaretDown,
  ChartLine,
  Question,
  Sparkle,
  Bell,
} from "@phosphor-icons/react";
import { isAdmin, isStudent } from "@/features/auth/utils/authUtils";

const NAV_ITEMS = [
  { label: "Home", path: "/home", icon: House },
  { label: "Courses", path: "/courses", icon: BookOpen },
  { label: "My Learning", path: "/my-courses", icon: ChartLine },
  { label: "Practice", path: "/practice", icon: Question },
];

export default function Header({ logoTo, profilePath }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);
  const notiRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notiRef.current && !notiRef.current.contains(e.target)) {
        setNotiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setProfileOpen(false);
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/home") return location.pathname === "/home";
    if (path === "/courses") return location.pathname.startsWith("/courses");
    if (path === "/my-courses") return location.pathname.startsWith("/my-courses");
    if (path === "/practice") return location.pathname.startsWith("/practice");
    return false;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px]">
          {/* Logo */}
          <Link
            to={logoTo || (user ? (isAdmin(user) ? "/admin/dashboard" : "/home") : "/")}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
              <GraduationCap size={20} weight="fill" className="text-white" />
            </div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight hidden sm:block">
              English Master
            </span>
          </Link>

          {/* Desktop Nav */}
          {!isAdmin(user) && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon size={16} weight={active ? "fill" : "regular"} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {user && (
              <div className="relative mr-1" ref={notiRef}>
                <button
                  type="button"
                  onClick={() => setNotiOpen(!notiOpen)}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-50 relative transition-colors text-slate-500 hover:text-slate-800"
                >
                  <Bell size={20} weight="regular" />
                  <span className="absolute top-[4px] right-[4px] min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center px-[3px]">
                    3
                  </span>
                </button>

                {notiOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-100 shadow-elevated py-2.5 z-50 font-sans">
                    <div className="px-4 py-1.5 border-b border-slate-50 mb-2 flex justify-between items-center">
                      <span className="text-[13px] font-extrabold text-slate-800">Thông báo mới</span>
                      <span className="text-[10px] text-cyan-600 font-bold cursor-pointer hover:underline">Đánh dấu đã đọc</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                      <div className="px-4 py-2.5 hover:bg-slate-50/50 transition-colors cursor-pointer">
                        <p className="text-[11.5px] font-bold text-slate-800 leading-snug">📝 AI đã chấm bài viết luận của bạn!</p>
                        <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">Bài viết Node 2 thuộc lộ trình "Ôn thi TOEIC 2026" đạt 85/100 điểm.</p>
                        <span className="text-[9px] text-slate-400 block mt-1">5 phút trước</span>
                      </div>
                      <div className="px-4 py-2.5 hover:bg-slate-50/50 transition-colors cursor-pointer">
                        <p className="text-[11.5px] font-bold text-slate-800 leading-snug">🔥 Đạt chuỗi học tập (Streak)!</p>
                        <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">Chúc mừng bạn đã duy trì học liên tiếp 5 ngày.</p>
                        <span className="text-[9px] text-slate-400 block mt-1">2 giờ trước</span>
                      </div>
                      <div className="px-4 py-2.5 hover:bg-slate-50/50 transition-colors cursor-pointer">
                        <p className="text-[11.5px] font-bold text-slate-800 leading-snug">📚 Khóa học có chương mới</p>
                        <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">Khóa học "TOEIC Nâng Cao" vừa cập nhật Chương 3.</p>
                        <span className="text-[9px] text-slate-400 block mt-1">1 ngày trước</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center text-xs font-bold text-brand-700 border-2 border-white shadow-sm">
                    {user.fullName
                      ? user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "U"}
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                    {user.fullName || "User"}
                  </span>
                  <CaretDown
                    size={12}
                    weight="bold"
                    className={`text-slate-400 transition-transform duration-200 ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-100 shadow-elevated py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user.fullName || "User"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email || ""}
                      </p>
                    </div>

                    <Link
                      to={profilePath || "/profile"}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User size={16} className="text-slate-400" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Gear size={16} className="text-slate-400" />
                      Settings
                    </Link>
                    {isStudent(user) && (
                      <>
                        <Link
                          to="/become-mentor"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                        >
                          <GraduationCap size={16} className="text-rose-500" />
                          Become a Mentor
                        </Link>
                        <Link
                          to="/placement-test"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors font-semibold"
                        >
                          <Sparkle size={16} className="text-emerald-500" />
                          Làm Placement Test
                        </Link>
                      </>
                    )}
                    <div className="border-t border-slate-50 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <SignOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-all duration-200 active:scale-[0.98] shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X size={20} weight="bold" className="text-slate-600" />
              ) : (
                <List size={20} weight="bold" className="text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && !isAdmin(user) && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <item.icon size={18} weight={active ? "fill" : "regular"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
