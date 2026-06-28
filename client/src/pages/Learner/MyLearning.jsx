import React, { useState } from "react";
import { BookOpen, Clock, Flame, Search, ChevronRight, Play, Star, TrendingUp, Award, Video, FileText, HelpCircle, CheckCircle2, BarChart3, Calendar, Zap, Target, ArrowRight, Sparkles, GraduationCap, Filter } from "lucide-react";
import { enrolledCourses, curriculumData, getLearningProgress } from "../../services/data";

export default function MyLearning({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const progress = getLearningProgress();
  const completedLessons = new Set(progress.completedLessons);

  const filteredCourses = enrolledCourses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterStatus === "all" ||
      (filterStatus === "active" && c.progress > 0 && c.progress < 100) ||
      (filterStatus === "completed" && c.progress === 100) ||
      (filterStatus === "new" && c.progress === 0);
    return matchSearch && matchFilter;
  });

  const totalCompleted = enrolledCourses.reduce((sum, c) => sum + c.completedLessons, 0);
  const totalLessons = enrolledCourses.reduce((sum, c) => sum + c.totalLessons, 0);
  const totalQuizzesDone = enrolledCourses.reduce((sum, c) => sum + c.completedQuizzes, 0);
  const totalQuizzes = enrolledCourses.reduce((sum, c) => sum + c.quizzes, 0);

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-purple-600 text-white">
        <div className="section-container py-10 space-y-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl font-black tracking-tight">Khoa hoc cua toi</h1>
            <p className="text-sm text-white/70">Tiep tuc hoc tap va theo doi tien do cua ban</p>
          </div>

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: enrolledCourses.length, label: "Khoa hoc", icon: BookOpen },
              { value: `${totalCompleted}/${totalLessons}`, label: "Bai hoc", icon: Video },
              { value: `${totalQuizzesDone}/${totalQuizzes}`, label: "Bai kiem tra", icon: HelpCircle },
              { value: `${Math.round((totalCompleted / totalLessons) * 100) || 0}%`, label: "Tong tien do", icon: TrendingUp },
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

      <div className="section-container py-8 space-y-8">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl border border-border/60 px-5 py-3 hover:border-primary/30 transition-colors shadow-sm">
            <Search className="w-5 h-5 text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Tim kiem khoa hoc cua ban..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted font-medium"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: "all", label: "Tat ca" },
              { id: "active", label: "Dang hoc" },
              { id: "completed", label: "Da hoan thanh" },
              { id: "new", label: "Chua bat dau" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  filterStatus === f.id
                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/10"
                    : "bg-white text-text-secondary border-border/60 hover:border-primary/30 hover:text-primary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course List */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/5 mx-auto flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-primary/40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-text-primary">Chua co khoa hoc nao</h3>
              <p className="text-sm text-text-secondary">Hay kham pha va dang ky khoa hoc de bat dau hoc tap</p>
            </div>
            <button
              onClick={() => onNavigate("course-list")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-primary text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Kham pha khoa hoc</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => onNavigate("course-player", { course, curriculum: curriculumData })}
                className="group bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div className="relative h-36 overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[9px] font-bold text-primary shadow-sm">
                      {course.progress}%
                    </span>
                    {course.streak >= 7 && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-400/90 backdrop-blur-sm text-[9px] font-bold text-white shadow-sm flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {course.streak}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0">
                    <div className="h-1 bg-white/30">
                      <div className="h-full bg-primary transition-all duration-500" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-text-primary text-sm group-hover:text-primary transition-colors leading-snug">{course.title}</h3>
                    <p className="text-[10px] text-text-muted font-medium mt-0.5">{course.instructor}</p>
                  </div>

                  <div className="flex items-center gap-3 text-[9px] font-semibold text-text-muted">
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      {course.completedLessons}/{course.totalLessons}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {course.documents}
                    </span>
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      {course.completedQuizzes}/{course.quizzes}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-[9px] text-text-muted">
                      <Clock className="w-3 h-3" />
                      <span>{course.lastActivity}</span>
                    </div>
                    <button className="flex items-center gap-1 text-[10px] font-bold text-primary group-hover:underline">
                      <span>Tiep tuc</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
