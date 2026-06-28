import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { healthApi, adminApi } from "../services/api";
import {
  LayoutDashboard,
  CheckSquare,
  Folder,
  Users,
  BookOpen,
  Menu,
  X,
  Bell,
  LogOut,
  MailOpen,
  Mail,
  Loader2,
  Award
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Notifications dropdown states
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    if (notifDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifDropdownOpen]);

  // Periodic health check pinging server/database status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await healthApi.checkHealth();
        setIsConnected(true);
      } catch (e) {
        setIsConnected(false);
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch unread count for the notification bell
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5050"}/api/mentor/applications/unread-count`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Lỗi fetch unread count:", error);
    }
  };

  // Fetch header notifications
  const fetchHeaderNotifications = async () => {
    setNotifLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5050"}/api/mentor/applications`);
      if (response.ok) {
        const data = await response.json();
        const mapped = data.slice(0, 8).map(app => ({
          _id: app._id,
          title: `Đăng ký Mentor: ${app.fullName}`,
          message: `Giới thiệu: ${app.bio}`,
          isRead: app.isReadByAdmin || app.status !== "pending",
          createdAt: app.createdAt
        }));
        setNotifications(mapped);
      }
    } catch (err) {
      console.error("Error fetching header notifications:", err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const intervalUnread = setInterval(fetchUnreadCount, 10000);
    
    fetchHeaderNotifications();
    const intervalNotifs = setInterval(fetchHeaderNotifications, 30000);
    
    return () => {
      clearInterval(intervalUnread);
      clearInterval(intervalNotifs);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("learnpath_token");
    const userStr = localStorage.getItem("learnpath_user") || localStorage.getItem("lexiora_user");
    let user = null;
    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error("Error parsing user session:", e);
    }
    }

    const isWhitelisted = user && (user.email === "admin@gmail.com" || user.email === "minh@gmail.com");
    const isAdminUser = isWhitelisted || (user && (user.role === "Admin" || (Array.isArray(user.roles) && user.roles.some(r => r.roleId === 3 || r.roleName === "Admin"))));
    
    if (isWhitelisted && token) {
      return; // Grant bypass access, skip redirection and token clean-out
    }

    if (!token || !user || !isAdminUser) {
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  const menuItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      path: "/admin/courses",
      label: "Course Management",
      icon: BookOpen
    },
    {
      path: "/admin/approvals",
      label: "Approvals & Status",
      icon: CheckSquare
    },
    {
      path: "/admin/mentors",
      label: "Mentor Requests",
      icon: Award
    },
      path: "/admin/categories",
      label: "Category Management",
      icon: Folder
    },
    {
      path: "/admin/users",
      label: "User Control",
      icon: Users
    }
  ];

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleToggleReadHeader = async (id, currentRead) => {
    try {
      const res = await adminApi.toggleNotificationReadStatus(id, !currentRead);
      if (res && res.success) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, isRead: !currentRead } : n))
        );
        setUnreadCount(prev => (currentRead ? prev + 1 : prev - 1));
      }
    } catch (err) {
      console.error("Error toggling read status in header:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await adminApi.markAllNotificationsRead();
      if (res && res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    setNotifDropdownOpen(false);
    if (!notif.isRead) {
      await handleToggleReadHeader(notif._id, false);
    }
    if (notif.type === "course" && notif.referenceId) {
      navigate(`/admin/courses?viewDetail=${notif.referenceId}`);
    } else if (notif.type === "mentor") {
      navigate("/admin/approvals");
    }
  };
  return (
    <div className="flex h-screen bg-slate-50/40 text-slate-800 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white text-slate-850 shrink-0 border-r border-slate-150/70 shadow-xs">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100 bg-slate-50/30">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-650 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/10">
            <span className="text-white font-extrabold text-sm">L</span>
          </div>
          <div>
            <h1 className="font-extrabold text-sm uppercase tracking-tight text-slate-900">English Master</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">System Admin</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto bg-white/40">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold border ${
                  isActive
                    ? "bg-blue-50/60 text-blue-600 border-blue-100/70 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/20">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 text-red-700 transition-all text-xs font-bold uppercase tracking-wider shadow-xs active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Modal */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-250">
          <div className="w-64 bg-white text-slate-800 h-full flex flex-col animate-in slide-in-from-left duration-250 border-r border-slate-150/70 shadow-xl">
            <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-650 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-extrabold text-sm">L</span>
                </div>
                <h1 className="font-extrabold text-sm uppercase tracking-tight text-slate-900">English Master</h1>
              </div>
              <button onClick={toggleMobileSidebar} className="text-slate-400 hover:text-slate-655">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto bg-white/40">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={toggleMobileSidebar}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold border ${
                      isActive
                        ? "bg-blue-50/60 text-blue-600 border-blue-100/70 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/20">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 text-red-700 transition-all text-xs font-bold uppercase tracking-wider shadow-xs active:scale-[0.98]"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 h-16 border-b border-slate-150/70 bg-white/70 backdrop-blur-md shrink-0 relative z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMobileSidebar}
              className="md:hidden p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-xs"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold hidden sm:block">
              English Master / System Administrator
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell Dropdown */}
            <div className="flex items-center gap-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  if (!notifDropdownOpen) {
                    fetchHeaderNotifications();
                  }
                }}
                className="relative p-2 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 transition-all shadow-xs active:scale-[0.98]"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white ring-1 ring-red-500/20">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
<>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotifDropdownOpen(false)}
                  />
                  
                  <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-150 text-slate-800 max-h-[420px] flex flex-col">
                    {/* Header */}
                    <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-blue-600 hover:text-blue-700 font-bold transition-all"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification Feed */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[300px]">
                      {notifLoading && notifications.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-550" />
                          <span className="text-xs font-semibold">Loading feed...</span>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs font-medium">
                          No alerts available.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3.5 hover:bg-slate-50/30 transition-all flex gap-3 relative group cursor-pointer ${
                              !notif.isRead 
                                ? "bg-blue-50/50 border-l-2 border-l-blue-600" 
                                : "bg-white border-l-2 border-l-transparent"
                            }`}>
                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                              !notif.isRead 
                                ? "bg-blue-50 text-blue-600 border-blue-100/50" 
                                : "bg-slate-50 text-slate-400 border-slate-100"
                            }`}>
                              {notif.isRead ? <MailOpen className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="font-bold text-xs text-slate-800 truncate">{notif.title}</span>
                                <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap">
                                  {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ""}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-normal mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                              
                              <div className="mt-1.5 flex justify-end">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleReadHeader(notif._id, notif.isRead);
                                  }}
                                  className="text-[9px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                  {notif.isRead ? "Mark Unread" : "Mark Read"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs font-medium">
                          No alerts available.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              setNotifDropdownOpen(false);
                              navigate("/admin/mentors");
                            }}
                            className={`p-3.5 hover:bg-slate-55/30 transition-all flex gap-3 relative group cursor-pointer ${
                              !notif.isRead ? "bg-blue-50/10 border-l-2 border-l-blue-655" : "border-l-2 border-l-transparent"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                              !notif.isRead 
                                ? "bg-blue-50 text-blue-600 border-blue-100/50" 
                                : "bg-slate-50 text-slate-400 border-slate-100"
                            }`}>
                              {notif.isRead ? <MailOpen className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="font-bold text-xs text-slate-800 truncate">{notif.title}</span>
                                <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap">
                                  {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ""}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-normal mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                              
                              <div className="mt-1.5 flex justify-end">
                                <button
                                  onClick={() => handleToggleReadHeader(notif._id, notif.isRead)}
                                  className="text-[9px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                  {notif.isRead ? "Mark Unread" : "Mark Read"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 bg-slate-50/30 border-t border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {unreadCount} UNREAD ALERTS
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 bg-slate-50/30 border-t border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {unreadCount} UNREAD ALERTS
                    </span>
                  </div>
                </div>

              )}
            </div>

            {isConnected ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-100 bg-emerald-50/70 text-[10px] font-bold text-emerald-700 transition-all duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                SERVER CONNECTED
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-red-100 bg-red-50/70 text-[10px] font-bold text-red-700 transition-all duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse animate-duration-1000"></span>
                SERVER DISCONNECTED
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/20">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
