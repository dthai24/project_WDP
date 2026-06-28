import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../services/api";
import { Users, BookOpen, Folder, Award, RefreshCw, Loader2, TrendingUp, Activity, ClipboardList } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    userCount: 0,
    courseCount: 0,
    categoryCount: 0,
    pathCount: 0,
    pendingCourseCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [salesData, setSalesData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [workloadData, setWorkloadData] = useState([]);

  const fetchStats = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await adminApi.getDashboardStats();
      if (res && res.success) {
        setStats({
          userCount: res.userCount || 0,
          courseCount: res.courseCount || 0,
          categoryCount: res.categoryCount || 0,
          pathCount: res.pathCount || 0,
          pendingCourseCount: res.pendingCourseCount || 0
        });
        setSalesData(res.salesData || []);
        setEngagementData(res.engagementData || []);
        setWorkloadData(res.workloadData || []);
      }
    } catch (err) {
      console.error("Error fetching dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: stats.userCount,
      icon: Users,
      color: "from-blue-500 to-indigo-500",
      desc: "Registered accounts",
      link: "/admin/users"
    },
    {
      label: "Active Courses",
      value: stats.courseCount,
      icon: BookOpen,
      color: "from-emerald-500 to-teal-500",
      desc: "Available for teaching",
      link: "/admin/courses"
    },
    {
      label: "Pending Courses",
      value: stats.pendingCourseCount,
      icon: ClipboardList,
      color: "from-rose-500 to-red-500",
      desc: "Awaiting review",
      link: "/admin/courses"
    },
    {
      label: "Total Categories",
      value: stats.categoryCount,
      icon: Folder,
      color: "from-amber-500 to-orange-500",
      desc: "English level tracks",
      link: "/admin/categories"
    },
      label: "Mentor Applications",
      value: stats.pathCount,
      icon: Award,
      color: "from-purple-500 to-pink-500",
      desc: "Pending approvals queue",
      link: "/admin/approvals?tab=mentors"
    }
  ];

  // Custom glassmorphic tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl border border-slate-800 text-xs font-semibold space-y-2">
          <p className="text-slate-400 font-bold border-b border-slate-800 pb-1">Date: {label}</p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.color }} className="flex justify-between gap-6">
              <span className="capitalize">{item.name}:</span>
              <span className="font-extrabold">{item.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 text-slate-850 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-6 gap-4 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Statistics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time aggregate data indicators and advanced interactive activity visualizations.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all shadow-xs disabled:opacity-50 hover:scale-102"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Database</span>
        </button>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(card.link)}
              className="group p-6 bg-white border border-slate-100/85 rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              {/* Highlight gradient on card hover */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-500 transition-colors">{card.label}</span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md shadow-blue-500/5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              
              <div className="mt-5">
                <span className="text-4xl font-black text-slate-900 tracking-tight group-hover:text-blue-650 transition-colors">{card.value}</span>
                <span className="text-xs text-slate-400 font-bold block mt-1.5 uppercase tracking-wide">{card.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart 1: Revenue & Course Sales Trend (Spans 3 columns on large screens) */}
        <div className="lg:col-span-3 border border-slate-100 bg-white rounded-3xl p-6 shadow-xs relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Revenue & Course Sales Trend (Past 7 Days)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Dual-axis analysis showing course sales count (Bar) against USD revenue (Line)</p>
              </div>
            </div>
          </div>

          <div className="h-80 w-full bg-slate-50/40 rounded-2xl p-4 border border-slate-100/80">
            {error ? (
              <div className="h-full flex items-center justify-center text-sm text-red-500 font-bold uppercase">
                Unable to load chart metrics. Please verify server connection.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis yAxisId="left" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} dx={-5} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} dx={5} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area yAxisId="left" type="monotone" name="course sales" dataKey="sales" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#salesGradient)" />
                  <Line yAxisId="right" type="monotone" name="revenue ($)" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ stroke: "#10B981", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Platform Engagement (Line Chart, spans 2 columns) */}
        <div className="lg:col-span-2 border border-slate-100 bg-white rounded-3xl p-6 shadow-xs relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Platform Engagement & Gamification
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Active daily streaks compared with student AI learning assistant chat queries</p>
            </div>
          </div>

          <div className="h-80 w-full bg-slate-50/40 rounded-2xl p-4 border border-slate-100/80">
            {error ? (
              <div className="h-full flex items-center justify-center text-sm text-red-500 font-bold uppercase">
                Unable to load chart metrics. Please verify server connection.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} dx={-5} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" name="active streaks" dataKey="streaks" stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="AI assistant chats" dataKey="aiChats" stroke="#EC4899" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Admin Operation Workload Pipeline (Stacked Bar Chart, spans 1 column) */}
        <div className="lg:col-span-1 border border-slate-100 bg-white rounded-3xl p-6 shadow-xs relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Pending Workload
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Admin approval queue items pipeline</p>
            </div>
          </div>

          <div className="h-80 w-full bg-slate-50/40 rounded-2xl p-4 border border-slate-100/80">
            {error ? (
              <div className="h-full flex items-center justify-center text-sm text-red-500 font-bold uppercase">
                Unable to load chart metrics. Please verify server connection.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} dx={-5} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="pendingMentors" name="Pending Mentors" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pendingCourses" name="Pending Courses" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
