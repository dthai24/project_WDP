import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  CheckCircle,
  PlayCircle,
  Clock,
  User,
  CaretDown,
  ArrowRight,
  GraduationCap,
  Sparkle,
} from "@phosphor-icons/react";
import MyCourseProgressSummary from "./MyCourseProgressSummary";
import { buildCourseDetailPath } from "@/features/courses/utils/courseListParams";

function normalizeCourse(course = {}) {
  const progress = course.progressPercentage ?? course.progress ?? 0;
  return {
    courseId: course.courseId ?? course.id,
    courseName: course.courseName ?? course.title ?? "Khóa học",
    thumbnail: course.Thumbnail ?? course.thumbnail ?? null,
    category: course.category ?? "",
    level: course.level ?? "",
    instructor: course.instructor ?? "",
    totalLessons: course.totalLessons ?? 0,
    totalNodes: course.totalNodes ?? 0,
    totalMaterials: course.totalMaterials ?? 0,
    progressPercentage: progress,
    enrollmentStatus: course.enrollmentStatus ?? "none",
    currentStage: course.currentStage ?? null,
    currentLesson: course.currentLesson ?? null,
    lastActivity: course.lastActivity ?? null,
    modules: course.modules ?? [],
    currentLessonDetail: course.currentLessonDetail ?? null,
    recentLessons: course.recentLessons ?? [],
  };
}

function getStatusBadge(variant) {
  switch (variant) {
    case "completed":
      return {
        label: "Đã hoàn thành",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        icon: CheckCircle,
      };
    case "learning":
      return {
        label: "Đang học",
        bg: "bg-brand-50 text-brand-700 border-brand-200/60",
        icon: PlayCircle,
      };
    case "not_started":
      return {
        label: "Chưa bắt đầu",
        bg: "bg-amber-50 text-amber-700 border-amber-200/60",
        icon: Clock,
      };
    default:
      return {
        label: "Chưa tham gia",
        bg: "bg-slate-100 text-slate-600 border-slate-200/60",
        icon: BookOpen,
      };
  }
}

export default function MyCourseRow({ course, variant = "learning", onAction }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  const data = normalizeCourse(course);
  const canExpand = data.modules.length > 0 || Boolean(data.currentLessonDetail);
  const progressValue = Math.min(Math.max(data.progressPercentage, 0), 100);
  const detailPath = buildCourseDetailPath(data.courseId, searchParams, "/my-courses");
  const learningPath = `/my-courses/${data.courseId}/learn`;

  const badge = getStatusBadge(variant);

  let actionLabel = "Vào học ngay";
  if (variant === "completed") {
    actionLabel = "Ôn tập lại";
  } else if (variant === "learning") {
    actionLabel = "Tiếp tục học";
  } else if (variant === "not_joined" || variant === "not_started") {
    actionLabel = "Đăng ký học";
  }

  const handleAction = () => {
    if (variant === "not_joined") {
      navigate(detailPath);
    } else {
      navigate(learningPath);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-card-hover hover:border-slate-200 transition-all duration-300 overflow-hidden">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-44 aspect-[16/9] sm:aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 shrink-0">
          {data.thumbnail ? (
            <img
              src={data.thumbnail}
              alt={data.courseName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100">
              <GraduationCap size={32} className="text-slate-300" />
            </div>
          )}

          {/* Status Badge overlay on Thumbnail mobile */}
          <span
            className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border shadow-xs backdrop-blur-md ${badge.bg}`}
          >
            <badge.icon size={12} weight="bold" />
            {badge.label}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2.5 w-full">
          <div>
            <Link
              to={detailPath}
              className="text-base sm:text-lg font-bold text-slate-900 leading-snug hover:text-brand-600 transition-colors line-clamp-1"
            >
              {data.courseName}
            </Link>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {data.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/50">
                  {data.category}
                </span>
              )}
              {data.level && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                  {data.level}
                </span>
              )}
              {data.instructor && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <User size={13} className="text-slate-400" />
                  {data.instructor}
                </span>
              )}
            </div>
          </div>

          {/* Meta & Location */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1">
              <BookOpen size={14} className="text-slate-400" />
              {data.totalLessons} bài học · {data.totalNodes} chương
            </span>
            {data.lastActivity && (
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Clock size={14} />
                Hoạt động: {data.lastActivity}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Tiến độ khóa học</span>
              <span className="font-bold text-brand-600">{progressValue}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressValue >= 100
                    ? "bg-emerald-500"
                    : progressValue > 0
                    ? "bg-gradient-to-r from-brand-500 to-teal-400"
                    : "bg-slate-300"
                }`}
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Action Button & Expand Toggle */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button
            onClick={handleAction}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow-brand-500/25 cursor-pointer w-full sm:w-auto"
          >
            <span>{actionLabel}</span>
            <ArrowRight size={14} weight="bold" />
          </button>

          {canExpand && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-1"
            >
              <span>{expanded ? "Thu gọn" : "Chi tiết lộ trình"}</span>
              <CaretDown
                size={14}
                weight="bold"
                className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Module Breakdown */}
      {canExpand && expanded && (
        <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/40">
          <MyCourseProgressSummary course={course} />
        </div>
      )}
    </div>
  );
}
