import { PlayCircle, Clock, BookOpen, ArrowRight } from "@phosphor-icons/react";

export default function MyCourseContinueSection({ course, onContinue }) {
  if (!course) return null;

  const progress = Math.min(Math.max(course.progressPercentage ?? 0, 0), 100);
  const currentLesson = course.currentLessonDetail;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-emerald-900/10 mb-8 border border-emerald-800/30">
      {/* Subtle background glow decorative elements */}
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 -bottom-12 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
            <PlayCircle size={15} weight="fill" className="text-emerald-400 animate-pulse" />
            <span>Tiếp tục bài học gần nhất</span>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-snug mb-3 line-clamp-2">
            {course.courseName}
          </h2>

          {/* Details & Info */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-100/80 mb-5">
            {course.currentStage != null && course.currentLesson != null && (
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                <BookOpen size={14} className="text-emerald-300" />
                <span>Chương {course.currentStage} · Bài {course.currentLesson}</span>
              </span>
            )}
            {course.lastActivity && (
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                <Clock size={14} className="text-emerald-300" />
                <span>Vừa học: {course.lastActivity}</span>
              </span>
            )}
          </div>

          {/* Current Lesson snippet */}
          {currentLesson && (
            <div className="text-xs text-emerald-100 mb-5 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm max-w-xl">
              <span className="text-emerald-300 font-semibold">Đang học dở: </span>
              <span className="font-bold text-white">{currentLesson.lesson}</span> — {currentLesson.title}
            </div>
          )}

          {/* Progress & CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 max-w-lg">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-200 mb-1.5">
                <span>Tiến độ học tập</span>
                <span className="text-white text-sm">{progress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => onContinue?.(course)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/40 hover:-translate-y-0.5 active:translate-y-0 shrink-0 cursor-pointer"
            >
              <span>Vào học tiếp</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>

        {/* Thumbnail Preview */}
        {course.thumbnail && (
          <div className="hidden lg:block w-56 h-36 shrink-0 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl relative group">
            <img
              src={course.thumbnail}
              alt={course.courseName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
