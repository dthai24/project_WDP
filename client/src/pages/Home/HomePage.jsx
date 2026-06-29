import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Menu, X, Flame, Zap, Target, BookOpen, Play, Plus, Gamepad, Calendar, Compass, ArrowRight, Brain, Sparkles, Gamepad2, Layers, ChevronRight, Star, Award, Globe, Search, Bell, ChevronDown, GraduationCap, Trophy, Shield } from "lucide-react";
import { Profile } from "./Profile";
import ProfilePopup from "../../components/common/ProfilePopup";
import StreakTracker from "../../components/common/StreakTracker";
import { getStreakData, getWeekHistory } from "../../services/data";

import {
  HeroSection, CategoriesSection, FeaturedCoursesSection, StatsBanner, SRSMethodSection, FeaturesSection,
  PlatformFeaturesSection, RoadmapsSection, FAQSection, CTASection, Footer
} from "./LandingSections";
import CourseList from "../Learner/CourseList";
import CourseDetail from "../Learner/CourseDetail";
import CoursePlayer from "../Learner/CoursePlayer";
import QuizPage from "../Learner/QuizPage";
import CompletionPage from "../Learner/CompletionPage";
import MyLearning from "../Learner/MyLearning";
import StudentDashboard from "../Learner/StudentDashboard";
import PaymentPage from "../Learner/PaymentPage";


export default function HomePage({ currentUser, onLoginClick, onLogout }) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState(currentUser?.role === "Learner" ? "dashboard" : "my-learning");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navStack, setNavStack] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [quizConfig, setQuizConfig] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const streakData = getStreakData();
  const weekHistory = getWeekHistory();

  // Intercept browser back button to use navStack instead of navigating away

  useEffect(() => {
    const handlePopState = (e) => {
      if (navStack.length > 0) {
        e.preventDefault();
        handleBack();
        // Push state back to prevent leaving the app
        window.history.pushState(null, "", window.location.pathname);
      }
    };
    // Push initial state so popstate fires on back
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navStack.length]);

  const handleNavigate = (view, params = {}) => {

    setNavStack(prev => [...prev, { view: currentView, course: selectedCourse, curriculum: selectedCurriculum, quizConfig }]);
    setCurrentView(view);
    if (params.course) setSelectedCourse(params.course);
    if (params.curriculum) setSelectedCurriculum(params.curriculum);
    if (params.quizConfig) setQuizConfig(params.quizConfig);
  };

  const handleBack = () => {
    const prev = navStack[navStack.length - 1];
    if (prev) {
      setCurrentView(prev.view);
      setSelectedCourse(prev.course);
      setSelectedCurriculum(prev.curriculum);
      setQuizConfig(prev.quizConfig);
      setNavStack(prev => prev.slice(0, -1));
    }
  };

  const renderDashboard = () => {
    const myDecks = [
      { id: 1, title: "Từ vựng IELTS Academic", count: 180, learned: 112, review: 12 },
      { id: 2, title: "ETS TOEIC Vocab 2026", count: 320, learned: 154, review: 6 },
      { id: 3, title: "English for Communication (B2)", count: 95, learned: 82, review: 0 }
    ];

    const weeklyActivity = [
      { day: "T2", active: true, count: 24 },
      { day: "T3", active: true, count: 18 },
      { day: "T4", active: true, count: 35 },
      { day: "T5", active: false, count: 0 },
      { day: "T6", active: true, count: 15 },
      { day: "T7", active: true, count: 42 },
      { day: "CN", active: false, count: 0 }
    ];

    const quickGames = [
      { title: "Nối từ (Memory Match)", desc: "Ghép đôi từ và nghĩa", icon: Gamepad2, color: "bg-pink-50 text-pink-600 border-pink-100" },
      { title: "Trắc nghiệm Phản xạ", desc: "Chọn nghĩa từ nhanh", icon: Sparkles, color: "bg-purple-50 text-purple-600 border-purple-100" },
      { title: "Word Scramble", desc: "Sắp xếp chữ cái thành từ", icon: Layers, color: "bg-rose-50 text-rose-600 border-rose-100" },
      { title: "Listening Challenge", desc: "Nghe phát âm điền từ", icon: Brain, color: "bg-violet-50 text-violet-600 border-violet-100" }
    ];

    const roadmaps = [
      { title: "Ôn thi TOEIC", badge: "ETS 2026", desc: "Từ vựng phân chia theo level 450+, 650+, 850+.", icon: "target", color: "from-rose-500 to-pink-600" },
      { title: "Ôn thi IELTS", badge: "IELTS 7.5+", desc: "Kho từ vựng IELTS Academic và General.", icon: "award", color: "from-purple-500 to-indigo-600" },
      { title: "THPT Quốc Gia", badge: "Lớp 10-12", desc: "Đầy đủ từ vựng theo sách giáo khoa.", icon: "book", color: "from-pink-500 to-purple-600" },
      { title: "Giao tiếp", badge: "Oxford 3000", desc: "Lộ trình chuẩn từ A1 đến C1.", icon: "globe", color: "from-rose-500 to-orange-600" }
    ];

    return (
      <div className="section-container py-10 space-y-10">
        {/* Streak Banner */}
        <button
          onClick={() => setShowStreak(true)}
          className="w-full bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-gradient-to-br from-orange-400 to-red-500 text-white px-4 py-2.5 rounded-xl shadow-sm shadow-orange-200">
              <Flame className="w-5 h-5" />
              <span className="text-lg font-black">{streakData.currentStreak}</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-text-primary">Chuỗi học tập</p>
              <p className="text-[10px] text-text-muted">
                {streakData.currentStreak > 0
                  ? `Duy trì ${streakData.currentStreak} ngày liên tiếp`
                  : "Bắt đầu chuỗi học tập hôm nay"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              {weekHistory.map((day, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-bold transition-all ${
                    day.studied
                      ? "bg-gradient-to-br from-orange-400 to-red-500 text-white"
                      : "bg-surface-muted text-text-muted"
                  }`}
                >
                  {day.studied ? <Flame className="w-3 h-3" /> : day.day.slice(0, 1)}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary">
              <Trophy className="w-3.5 h-3.5" />
              <span>{streakData.totalXp.toLocaleString()} XP</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <div className="card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-text-primary tracking-tight">
              Chào bạn quay trở lại, <span className="text-primary">{currentUser.name}</span>
            </h2>
            <p className="text-xs text-text-secondary font-medium">
              Phương pháp học ngắt quãng SRS giúp bạn ghi nhớ từ vựng vĩnh viễn.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            <div className="flex items-center gap-2 bg-primary/5 px-4 py-2.5 rounded-2xl border border-primary/10 shrink-0">
              <Flame className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest leading-none">Streak</p>
                <p className="text-sm font-black text-primary leading-none mt-1">15 ngày</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2.5 rounded-2xl border border-purple-100/50 shrink-0">
              <Zap className="w-4 h-4 text-purple-600" />
              <div className="text-left">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none">Học lực</p>
                <p className="text-sm font-black text-purple-600 leading-none mt-1">2,450 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2.5 rounded-2xl border border-amber-100/50 shrink-0">
              <Target className="w-4 h-4 text-amber-600" />
              <div className="text-left">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none">Mục tiêu</p>
                <p className="text-sm font-black text-amber-600 leading-none mt-1">20 từ/ngày</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-[2rem] text-white p-8 relative overflow-hidden shadow-lg shadow-primary/20">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider">
                    <Brain className="w-3.5 h-3.5" />
                    <span>Thuật toán SRS</span>
                  </div>
                  <h3 className="text-3xl font-black tracking-tight leading-tight">
                    Hôm nay bạn có 18 từ cần ôn tập!
                  </h3>
                  <p className="text-sm text-white/70 max-w-md font-medium">
                    Hãy duy trì nhịp học hàng ngày để ngăn chặn đường cong lãng quên tự nhiên của não bộ.
                  </p>
                </div>
                <button className="bg-white text-primary hover:bg-rose-50 px-6 py-4 rounded-2xl font-black text-sm shadow-xl active:scale-[0.97] transition-all flex items-center gap-2 shrink-0">
                  <Play className="w-4 h-4 fill-primary" />
                  <span>Ôn tập ngay</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-text-primary tracking-tight">Bộ từ vựng của tôi</h3>
                <button className="btn-ghost btn-sm flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo bộ mới</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myDecks.map((deck) => {
                  const percentage = Math.round((deck.learned / deck.count) * 100);
                  return (
                    <div key={deck.id} className="card-hover p-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <BookOpen className="w-5 h-5 text-primary" />
                          {deck.review > 0 ? (
                            <span className="badge-primary">Cần ôn: {deck.review}</span>
                          ) : (
                            <span className="badge-success">Đã hoàn thành</span>
                          )}
                        </div>
                        <h4 className="font-bold text-text-primary text-sm leading-snug">{deck.title}</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-text-secondary font-bold">
                            <span>Tiến trình</span>
                            <span>{deck.learned}/{deck.count} từ ({percentage}%)</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <button className="py-2 rounded-xl text-[11px] font-bold bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 transition-colors text-center">
                          Học từ mới
                        </button>
                        <button className="py-2 rounded-xl text-[11px] font-bold bg-text-primary hover:bg-text-primary/90 text-white transition-colors text-center">
                          Luyện tập
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="card p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-text-primary text-sm tracking-tight flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Tiến trình tuần này</span>
                </h4>
                <span className="badge-primary">Streak: 15 ngày</span>
              </div>
              <div className="grid grid-cols-7 gap-2.5 text-center">
                {weeklyActivity.map((activity, index) => (
                  <div key={index} className="space-y-1.5">
                    <p className="text-[10px] font-bold text-text-muted uppercase">{activity.day}</p>
                    <div className={`h-11 rounded-xl flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                      activity.active
                        ? "bg-primary text-white border-primary shadow-sm shadow-primary/10"
                        : "bg-surface-muted text-text-muted border-border"
                    }`}>
                      {activity.active ? "V" : ""}
                    </div>
                    {activity.active && (
                      <p className="text-[9px] font-bold text-primary leading-none">+{activity.count}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-text-primary text-sm tracking-tight flex items-center gap-1.5">
                <Gamepad className="w-4 h-4 text-primary" />
                <span>Trò chơi luyện phản xạ</span>
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {quickGames.map((game, index) => {
                  const Icon = game.icon;
                  return (
                    <div key={index} className="card-hover flex items-center gap-4 p-4 cursor-pointer">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${game.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <h5 className="text-xs font-bold text-text-primary truncate">{game.title}</h5>
                        <p className="text-[10px] text-text-secondary truncate mt-0.5">{game.desc}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted ml-auto shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="divider pt-10 space-y-6">
          <div className="text-left max-w-xl space-y-1">
            <h3 className="text-lg font-black text-text-primary tracking-tight flex items-center gap-1.5">
              <Compass className="w-5 h-5 text-primary" />
              <span>Khám phá thêm lộ trình chuẩn</span>
            </h3>
            <p className="text-xs text-text-secondary">Các khoá học được xây dựng theo chuẩn ETS TOEIC và IELTS Academic.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {roadmaps.map((item, index) => (
              <div key={index} className="card-hover p-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white`}>
                      {item.icon === "target" && <Target className="w-5 h-5" />}
                      {item.icon === "award" && <Award className="w-5 h-5" />}
                      {item.icon === "book" && <BookOpen className="w-5 h-5" />}
                      {item.icon === "globe" && <Globe className="w-5 h-5" />}
                    </div>
                    <span className="badge-primary">{item.badge}</span>
                  </div>
                  <h4 className="font-bold text-text-primary text-sm">{item.title}</h4>
                  <p className="text-[10px] text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
                <button className="mt-4 w-full py-2 bg-primary/5 hover:bg-primary hover:text-white rounded-xl text-[10px] font-bold text-primary border border-primary/10 transition-all duration-200 text-center flex items-center justify-center gap-1">
                  <span>Khám phá</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface-muted text-text-primary font-sans selection:bg-primary/15 antialiased overflow-x-hidden">
      {/* NAVIGATION - Coursera-style */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Categories */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => {
                if (currentUser) setCurrentView(currentUser?.role === "Learner" ? "dashboard" : "my-learning");
                else navigate("/");
              }}>
                <img src="/images/logo.png" alt="English Master" className="w-8 h-8 object-contain" />
                <span className="text-lg font-black text-text-primary tracking-tight hidden sm:inline">English Master</span>
              </div>
              {!currentUser && (
                <div className="hidden lg:flex items-center gap-1">
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-text-secondary hover:text-primary hover:bg-surface-muted transition-all">
                    <span>Danh mục</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Center: Search bar (guest only) */}
            {!currentUser && (
              <div className="hidden md:flex flex-1 max-w-md mx-6">
                <div className="w-full flex items-center gap-2 bg-surface-muted rounded-xl border border-border/60 px-4 py-2 hover:border-primary/20 transition-colors">
                  <Search className="w-4 h-4 text-text-muted shrink-0" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm khoá học..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted font-medium"
                  />
                </div>
              </div>
            )}

            {/* Right: Nav links + Auth */}
            <div className="flex items-center gap-3">
              {!currentUser && (
                <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-text-secondary">
                  <a href="#features" className="hover:text-primary transition-colors">Tính năng</a>
                  <a href="#roadmaps" className="hover:text-primary transition-colors">Lộ trình</a>
                  <Link to="/become-mentor" className="hover:text-primary transition-colors">Dạy học</Link>
                </div>
              )}

              {currentUser ? (
                <div className="flex items-center gap-2">
                  {currentUser.role === "Learner" && (
                    <>
                      <button
                        onClick={() => setCurrentView("my-learning")}
                        className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          currentView === "my-learning"
                            ? "bg-primary text-white shadow-sm shadow-primary/20"
                            : "bg-surface-muted text-text-secondary hover:text-primary border border-border/40"
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Khoá học</span>
                      </button>

                      <button
                        onClick={() => setCurrentView("course-list")}
                        className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          currentView === "course-list"
                            ? "bg-primary text-white shadow-sm shadow-primary/20"
                            : "bg-surface-muted text-text-secondary hover:text-primary border border-border/40"
                        }`}
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Khám phá</span>
                      </button>
                    </>
                  )}
                  <button className="w-9 h-9 rounded-full bg-surface-muted border border-border/60 flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 transition-all">
                    <Bell className="w-4 h-4" />
                  </button>
                  <div
                    onClick={() => setShowProfilePopup(true)}
                    className="hidden sm:flex items-center gap-2 bg-surface-muted rounded-2xl px-3 py-1.5 border border-border/40 cursor-pointer hover:bg-surface-muted/80 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">
                      {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-text-primary leading-tight">{currentUser.name}</p>
                      <p className="text-[9px] font-semibold text-primary leading-tight">
                        {currentUser.role === "Admin" ? "Quản trị viên" : currentUser.role === "Mentor" ? "Giảng viên" : "Học viên"}
                      </p>
                    </div>
                  </div>
                  {currentUser.role !== "Learner" && (
                    <button
                      onClick={() => {
                        if (currentUser.role === "Admin") navigate("/admin");
                        else if (currentUser.role === "Mentor") navigate("/create-roadmap");
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-surface-muted text-text-secondary hover:text-primary border border-border/40 transition-all duration-200"
                    >
                      {currentUser.role === "Mentor" ? "Dashboard" : "Trang chủ"}
                    </button>
                  )}
                  <button
                    onClick={onLogout}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-all duration-200 flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    <span className="hidden sm:inline">Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-text-secondary hover:text-primary">
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                  <button onClick={onLoginClick} className="btn-primary">Đăng nhập</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && !currentUser && (
        <div className="md:hidden bg-white border-b border-border/40 px-6 py-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 bg-surface-muted rounded-xl border border-border/60 px-4 py-2.5 mb-3">
            <Search className="w-4 h-4 text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm khoá học..."
              className="w-full bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted font-medium"
            />
          </div>
          <a href="#features" className="block text-sm font-semibold text-text-secondary hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Tính năng</a>
          <a href="#methods" className="block text-sm font-semibold text-text-secondary hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Phương pháp SRS</a>
          <a href="#roadmaps" className="block text-sm font-semibold text-text-secondary hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Lộ trình học</a>
          <a href="#faq" className="block text-sm font-semibold text-text-secondary hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Hỏi đáp</a>
          <Link to="/become-mentor" className="block text-sm font-semibold text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Trở thành Mentor</Link>
        </div>
      )}

      {currentUser ? (
        currentView === "profile" ? (
          <div className="px-6 py-10 min-h-screen bg-gradient-to-br from-surface-alt via-surface-muted to-purple-50/30">
            <div className="section-container">
              <Profile onLogout={onLogout} setCurrentPage={(page) => setCurrentView(page === "dashboard" ? "dashboard" : "profile")} currentUser={currentUser} />
            </div>
          </div>
        ) : currentView === "dashboard" ? (
          <StudentDashboard onNavigate={handleNavigate} />
        ) : currentView === "my-learning" ? (
          <MyLearning onNavigate={handleNavigate} />
        ) : currentView === "course-list" ? (
          <CourseList onNavigate={handleNavigate} />
        ) : currentView === "course-detail" && selectedCourse ? (
          <CourseDetail course={selectedCourse} onNavigate={handleNavigate} onBack={handleBack} />
        ) : currentView === "course-player" && selectedCourse ? (
          <CoursePlayer course={selectedCourse} curriculum={selectedCurriculum || []} onNavigate={handleNavigate} onBack={handleBack} />
        ) : currentView === "quiz" ? (
          <QuizPage course={selectedCourse} moduleTitle={quizConfig?.moduleTitle} onNavigate={handleNavigate} onBack={handleBack} isFinal={quizConfig?.isFinal} />
        ) : currentView === "payment" && selectedCourse ? (
          <PaymentPage course={selectedCourse} currentUser={currentUser} onNavigate={handleNavigate} onBack={handleBack} />
        ) : currentView === "completion" && selectedCourse ? (
          <CompletionPage course={selectedCourse} onNavigate={handleNavigate} onBack={handleBack} />
        ) : (

          renderDashboard()
        )
      ) : (
        <>
          <HeroSection onLoginClick={onLoginClick} />
          <CategoriesSection />
          <FeaturedCoursesSection />
          <StatsBanner />
          <SRSMethodSection />
          <FeaturesSection />
          <PlatformFeaturesSection />
          <RoadmapsSection />
          <FAQSection />
          <CTASection onLoginClick={onLoginClick} />
          <Footer />
        </>
      )}

      {/* Profile Popup */}
      {showProfilePopup && (
        <ProfilePopup
          currentUser={currentUser}
          onLogout={onLogout}
          onClose={() => setShowProfilePopup(false)}
          onNavigate={(view) => {
            setCurrentView(view);
          }}
        />
      )}

      {/* Streak Tracker Popup */}
      {showStreak && (
        <StreakTracker
          onClose={() => setShowStreak(false)}
          onStudy={(result) => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}


