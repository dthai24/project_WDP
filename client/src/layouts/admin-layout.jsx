import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderTree,
  BookOpen,
  History,
  Bell,
  Search,
  User,
  Menu,
  ChevronDown,
  Award
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [adminEmail, setAdminEmail] = useState("admin@gmail.com");

  // Load admin email from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("lexiora_user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user && user.email) {
          setAdminEmail(user.email);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch unread count for the notification bell
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/mentor/applications/unread-count");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Lỗi fetch unread count:", error);
    }
  };

  // Fetch recent applications for the dropdown list
  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/mentor/applications");
      if (response.ok) {
        const data = await response.json();
        // Lấy 5 đơn mới nhất làm thông báo
        setNotifications(data.slice(0, 5));
      }
    } catch (error) {
      console.error("Lỗi fetch notifications:", error);
    }
  };

  // Poll for new requests every 10 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = async () => {
    const nextState = !isDropdownOpen;
    setIsDropdownOpen(nextState);
    if (nextState) {
      // Khi mở ra: load thông báo và đánh dấu đã xem để xóa chấm đỏ
      await fetchNotifications();
      try {
        await fetch("http://127.0.0.1:5000/api/mentor/applications/mark-read", {
          method: "POST"
        });
        setUnreadCount(0);
      } catch (err) {
        console.error("Lỗi đánh dấu đã xem:", err);
      }
    }
  };

  // Sidebar navigation items
  const menuItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      path: "/admin/users",
      label: "Manage Users",
      icon: Users
    },
    {
      path: "/admin/mentors",
      label: "Mentor Requests",
      icon: Award
    },
    {
      path: "/admin/categories",
      label: "Manage Categories",
      icon: FolderTree
    },
    {
      path: "/admin/courses",
      label: "Course Management",
      icon: BookOpen
    },
    {
      path: "/admin/history",
      label: "Update History",
      icon: History
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        {/* Sidebar Brand */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
          <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="font-semibold text-white tracking-wide text-sm">English Master</h1>
            <p className="text-xs text-indigo-400 font-medium">Admin Portal</p>
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Handle active state
            const isActive = currentPath === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "hover:bg-slate-800 hover:text-slate-100 text-slate-400"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors duration-200">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">Administrator</p>
              <p className="text-[10px] text-slate-500 truncate">{adminEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-slate-200 shrink-0 shadow-sm">
          {/* Left section: Search & Mobile menu trigger */}
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative max-w-md hidden sm:block w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search resources, users, paths..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right section: User Profile & Actions */}
          <div className="flex items-center gap-4">
            {/* Notification Button */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={handleBellClick}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-none"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-2 antialiased">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800">Thông báo mới</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-400">
                        Không có yêu cầu ứng tuyển nào gần đây.
                      </div>
                    ) : (
                      notifications.map((app) => (
                        <div 
                          key={app._id}
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate("/admin/mentors");
                          }}
                          className="px-4 py-3 hover:bg-slate-55/50 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 flex flex-col gap-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-slate-800 truncate max-w-[150px]">
                              {app.fullName}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {new Date(app.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            Đăng ký Mentor: {app.bio}
                          </p>
                          <span className={`self-start text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1 ${
                            app.status === "pending" 
                              ? "bg-amber-50 text-amber-600" 
                              : app.status === "approved" 
                              ? "bg-emerald-50 text-emerald-600" 
                              : "bg-rose-50 text-rose-600"
                          }`}>
                            {app.status === "pending" ? "Đang chờ duyệt" : app.status === "approved" ? "Đã duyệt" : "Từ chối"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div 
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/admin/mentors");
                    }}
                    className="px-4 py-2 border-t border-slate-100 text-center text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer hover:bg-slate-50"
                  >
                    Xem tất cả hồ sơ đăng ký
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200"></div>

            {/* Profile Dropdown */}
            <button className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/10">
                AD
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-slate-700">Nguyen Nhat Minh</p>
                <p className="text-[10px] text-slate-400 font-medium">Super Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </button>
          </div>
        </header>

        {/* Dashboard Dynamic View Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
