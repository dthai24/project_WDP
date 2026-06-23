import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
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
  ChevronDown
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;

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
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-lg shadow-lg shadow-indigo-600/30">
            L
          </div>
          <div>
            <h1 className="font-semibold text-white tracking-wide text-sm">Learning Path</h1>
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
              <p className="text-[10px] text-slate-500 truncate">admin@learnpath.com</p>
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
            <button className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>

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
