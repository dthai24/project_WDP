import React from "react";
import { Users, BookOpen, FolderTree, Award, ArrowUpRight, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      label: "Total Users",
      value: "1,248",
      change: "+12.5%",
      icon: Users,
      color: "bg-indigo-500",
      textColor: "text-indigo-600"
    },
    {
      label: "Active Courses",
      value: "42",
      change: "+4.2%",
      icon: BookOpen,
      color: "bg-emerald-500",
      textColor: "text-emerald-600"
    },
    {
      label: "Categories",
      value: "15",
      change: "+0.0%",
      icon: FolderTree,
      color: "bg-amber-500",
      textColor: "text-amber-600"
    },
    {
      label: "Completed Paths",
      value: "186",
      change: "+28.4%",
      icon: Award,
      color: "bg-rose-500",
      textColor: "text-rose-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Dashboard Thống kê</h2>
        <p className="text-sm text-slate-500 mt-1">
          Tổng quan số liệu thống kê và tình trạng hoạt động của hệ thống Learning Path.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-400">{stat.label}</span>
                <div className={`p-2.5 rounded-xl ${stat.color} text-white shadow-md shadow-slate-100`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
                <span className={`flex items-center text-xs font-semibold ${stat.textColor}`}>
                  {stat.change}
                  <TrendingUp className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mock Section for Visual Completeness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Hoạt động Gần đây</h3>
            <button className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600">
                  U{item}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">Học viên mới đăng ký hệ thống</p>
                  <p className="text-xs text-slate-400">user_{item}@example.com • 2 giờ trước</p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                  Hoạt động
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Trạng thái Cơ sở Dữ liệu</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Dung lượng MongoDB</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "45%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Bộ nhớ RAM Hệ thống</span>
                <span>72%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "72%" }}></div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Phiên bản MongoDB:</span>
              <span className="font-mono font-semibold">8.0.0 (Community)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
