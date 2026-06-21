import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { healthApi } from "../services/api";
import {
  LayoutDashboard,
  CheckSquare,
  Folder,
  Users,
  BookOpen,
  Menu,
  Home,
  X
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

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

  useEffect(() => {
    const token = localStorage.getItem("learnpath_token");
    const userStr = localStorage.getItem("learnpath_user");
    let user = null;
    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error("Error parsing user session:", e);
    }

    const isAdminUser = user && (user.email === "minh@gmail.com" || (Array.isArray(user.roles) && user.roles.some(r => r.roleId === 3 || r.roleName === "Admin")));
    if (!token || !user || !isAdminUser) {
      localStorage.removeItem("learnpath_token");
      localStorage.removeItem("learnpath_user");
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

  const handleExit = () => {
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-200 shrink-0 border-r border-slate-800">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-white font-extrabold text-sm">L</span>
          </div>
          <div>
            <h1 className="font-extrabold text-sm uppercase tracking-tight text-white">English Master</h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">System Admin</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleExit}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-800 hover:bg-blue-600/10 hover:text-blue-400 hover:border-blue-600/30 transition-all text-xs font-bold uppercase tracking-wider text-slate-400"
          >
            <Home className="w-4 h-4" />
            <span>View Homepage</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Modal */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-64 bg-slate-900 text-slate-200 h-full flex flex-col animate-in slide-in-from-left duration-200 border-r border-slate-800">
            <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <span className="text-white font-extrabold text-sm">L</span>
                </div>
                <h1 className="font-extrabold text-sm uppercase tracking-tight text-white">English Master</h1>
              </div>
              <button onClick={toggleMobileSidebar} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={toggleMobileSidebar}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleExit}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-800 hover:bg-blue-600/10 hover:text-blue-400 hover:border-blue-600/30 transition-all text-xs font-bold uppercase tracking-wider text-slate-400"
              >
                <Home className="w-4 h-4" />
                <span>View Homepage</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMobileSidebar}
              className="md:hidden p-2 rounded-xl border border-slate-250 hover:bg-slate-50 text-slate-600 transition-all"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold hidden sm:block">
              English Master / System Administrator
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-100 bg-emerald-50 text-[10px] font-bold text-emerald-700 transition-all duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                SERVER CONNECTED
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-100 bg-red-50 text-[10px] font-bold text-red-700 transition-all duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse animate-duration-1000"></span>
                SERVER DISCONNECTED
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
