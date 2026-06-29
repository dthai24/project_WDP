import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, Star, TrendingUp, Flame, Award, Play, ChevronRight, Search, Filter, GraduationCap, Video, FileText, HelpCircle, CheckCircle2, BarChart3, Calendar, Zap, Target, ArrowRight, Sparkles, Users, Globe, Layers, Brain, ChevronLeft, Trophy, Shield } from "lucide-react";
import { allCourses, categories, enrolledCourses, getStreakData, getWeekHistory, STREAK_MILESTONES } from "../../services/data";
import StreakTracker from "../../components/common/StreakTracker";

export default function StudentDashboard({ onNavigate }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showStreak, setShowStreak] = useState(false);
  const streakData = getStreakData();
  const weekHistory = getWeekHistory();

  const featuredCourses = allCourses.slice(0, 4);
  const recommendedCourses = allCourses.slice(4, 6);

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-purple-600 text-white">
        <div className="section-container py-12 space-y-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Học tiếng Anh thông minh hơn
            </h1>
            <p className="text-base text-white/80 max-w-xl font-medium">
              Khám phá khóa học, học qua video, đọc tài liệu và làm quiz để củng cố kiến thức
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate("course-list")}
                className="bg-white text-primary px-6 py-3 rounded-2xl font-bold text-sm hover:bg-rose-50 transition-all shadow-xl active:scale-[0.97] flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Khám phá khóa học</span>
              </button>
              <button
                onClick={() => onNavigate("my-learning")}
                className="bg-white/15 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-white/25 transition-all backdrop-blur-sm flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Khóa học của tôi</span>
              </button>
              <Link
                to="/become-mentor"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 active:scale-[0.97] flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Đăng ký làm Mentor</span>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: `${allCourses.length}+`, label: "Khóa học", icon: BookOpen },
              { value: "12.000+", label: "Học viên", icon: Users },
              { value: "4.8", label: "Đánh giá", icon: Star },
              { value: "95%", label: "Hài lòng", icon: TrendingUp },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center space-y-1 border border-white/10">
                  <Icon className="w-5 h-5 mx-auto text-white/70" />
                  <p className="text-xl font-black">{stat.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Streak Banner - Duolingo style */}
      <div className="section-container pt-6">
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
      </div>

      <div className="section-container py-6 space-y-10">
        {/* Categories */}

        <div className="space-y-4">
          <h2 className="text-lg font-black text-text-primary tracking-tight">Danh mục khóa học</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                activeCategory === "all"
                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/10"
                  : "bg-white text-text-secondary border-border/60 hover:border-primary/30 hover:text-primary"
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => {
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    activeCategory === cat.slug
                      ? "bg-primary text-white border-primary shadow-sm shadow-primary/10"
                      : "bg-white text-text-secondary border-border/60 hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[9px] opacity-60">({cat.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-text-primary tracking-tight">Khóa học nổi bật</h2>
            <button
              onClick={() => onNavigate("course-list")}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => onNavigate("course-detail", { course })}
                className="group bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div className="relative h-36 overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[9px] font-bold text-primary shadow-sm">
                      {course.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[10px] font-semibold">
                    <span className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg">
                      <Star className="w-3 h-3 text-amber-400" />
                      {course.rating}
                    </span>
                    <span className="bg-black/40 px-2 py-1 rounded-lg">{course.level}</span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-text-primary text-xs group-hover:text-primary transition-colors leading-snug">{course.title}</h3>
                  <p className="text-[10px] text-text-muted font-medium">{course.instructor}</p>
                  <div className="flex items-center gap-3 text-[9px] font-semibold text-text-muted">
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      {course.lessons} bài
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {course.students}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.hours} giờ
                    </span>
                  </div>
                  <button className="w-full mt-2 py-2 rounded-xl text-[10px] font-bold bg-primary/5 text-primary border border-primary/10 hover:bg-primary hover:text-white transition-all">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-text-primary tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Khoá học dành cho bạn</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => onNavigate("course-detail", { course })}
                className="group bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col sm:flex-row"
              >
                <div className="sm:w-48 h-36 sm:h-auto shrink-0 relative overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent sm:hidden" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[9px] font-bold text-primary shadow-sm">
                      {course.level}
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-text-primary text-sm group-hover:text-primary transition-colors">{course.title}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-bold text-text-primary">{course.rating}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-text-muted font-medium">{course.instructor}</p>
                  <div className="flex items-center gap-3 text-[9px] font-semibold text-text-muted">
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      {course.lessons} bài
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {course.students}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.hours} giờ
                    </span>
                  </div>
                  <div className="bg-primary/5 rounded-xl px-3 py-2 border border-primary/10">
                    <p className="text-[9px] font-semibold text-primary flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Phù hợp với trình độ của bạn
                    </p>
                  </div>
                  <button className="w-full mt-1 py-2.5 rounded-xl text-[10px] font-bold bg-primary text-white hover:bg-primary-dark transition-all flex items-center justify-center gap-1">
                    <Play className="w-3 h-3" />
                    <span>Bắt đầu học</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Learning CTA */}
        <div className="bg-gradient-to-br from-primary via-primary-dark to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-black/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-2xl font-black tracking-tight">Tiếp tục học tập</h3>
              <p className="text-sm text-white/70 max-w-md">
                Xem lại tiến độ học tập, tiếp tục bài học dang dở và khám phá thêm nhiều kiến thức mới.
              </p>
            </div>
            <button
              onClick={() => onNavigate("my-learning")}
              className="bg-white text-primary px-8 py-4 rounded-2xl font-bold text-sm hover:bg-rose-50 transition-all shadow-xl active:scale-[0.97] flex items-center gap-2 shrink-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>Xem khóa học của tôi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Streak Tracker Popup */}
      {showStreak && (
        <StreakTracker
          onClose={() => setShowStreak(false)}
          onStudy={(result) => {
            // Refresh streak data after study session
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}


