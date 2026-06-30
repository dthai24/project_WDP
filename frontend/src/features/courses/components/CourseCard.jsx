import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Star,
  Users,
  Clock,
  PlayCircle,
  GraduationCap,
  ArrowRight,
} from "@phosphor-icons/react";
import { buildCourseDetailPath } from "@/features/courses/utils/courseListParams";

function getLevelBadge(level = "") {
  const l = level.toLowerCase();
  if (l.includes("co ban") || l.includes("beginner")) return "bg-sky-50 text-sky-700 border-sky-200";
  if (l.includes("trung cap") || l.includes("intermediate")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (l.includes("nang cao") || l.includes("advanced")) return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function getCategoryBadge(category = "") {
  const map = {
    "Giao tiep": "bg-blue-50 text-blue-700 border-blue-200",
    Communication: "bg-blue-50 text-blue-700 border-blue-200",
    IELTS: "bg-purple-50 text-purple-700 border-purple-200",
    TOEIC: "bg-sky-50 text-sky-700 border-sky-200",
    "Ngu phap": "bg-slate-100 text-slate-700 border-slate-200",
    Grammar: "bg-slate-100 text-slate-700 border-slate-200",
    "Phat am": "bg-pink-50 text-pink-700 border-pink-200",
    Pronunciation: "bg-pink-50 text-pink-700 border-pink-200",
  };
  return map[category] ?? "bg-slate-100 text-slate-600 border-slate-200";
}

function getStatusBadge(isEnrolled, progress) {
  if (!isEnrolled) return null;
  if (progress >= 100) return { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (progress > 0) return { label: "In Progress", className: "bg-brand-50 text-brand-700 border-brand-200" };
  return { label: "Enrolled", className: "bg-green-50 text-green-700 border-green-200" };
}

export default function CourseCard({ course, onContinueLearning }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const courseId = course._id || course.CourseId || course.courseId || course.id;

  const title = course.CourseName || course.title || course.courseName || "Untitled Course";
  const description = course.Description || course.shortDescription || "";
  const category = course.CategoryDisplayName || course.category || "";
  const level = course.LevelDisplayName || course.level || "";
  const instructor = course.InStructorName || course.instructor || "";
  const isEnrolled = Boolean(course.isEnrolled);
  const progress = course.progress || 0;
  const rating = course.rating || 4.5;
  const studentCount = course.studentCount || 0;
  const lessonCount = course.TotalLessons || course.lessonCount || 0;
  const stageCount = course.stageCount || 0;

  let thumbnail = course.thumbnail || course.Thumbnail;
  if (thumbnail === "CHUA FIX LOI ANH" || !thumbnail) {
    // Use Picsum for placeholder images - deterministic seed based on course ID
    const seed = courseId || title.replace(/\s+/g, "-").toLowerCase();
    thumbnail = `https://picsum.photos/seed/${seed}/640/360`;
  } else if (!thumbnail.startsWith("http://") && !thumbnail.startsWith("https://") && !thumbnail.startsWith("data:")) {
    thumbnail = `http://localhost:5050${thumbnail.startsWith("/") ? thumbnail : "/" + thumbnail}`;
  }

  const statusBadge = getStatusBadge(isEnrolled, progress);

  const handleClick = () => {
    if (isEnrolled && onContinueLearning) {
      onContinueLearning(course);
    } else {
      navigate(buildCourseDetailPath(courseId, searchParams));
    }
  };

  return (
    <article
      onClick={handleClick}
      className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 active:translate-y-0"
    >
      {/* Thumbnail */}
      <div className="aspect-[16/9] bg-gradient-to-br from-slate-50 to-brand-50/30 relative overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <GraduationCap size={36} weight="light" className="text-slate-300" />
          </div>
        )}

        {/* Status Badge Overlay */}
        {statusBadge && (
          <span
            className={`absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm backdrop-blur-sm ${statusBadge.className}`}
          >
            {statusBadge.label}
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1.5 line-clamp-2 group-hover:text-brand-700 transition-colors">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed mb-2.5 line-clamp-2">
            {description}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {category && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadge(category)}`}>
              {category}
            </span>
          )}
          {level && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getLevelBadge(level)}`}>
              {level}
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-50">
          <div className="flex items-center gap-3">
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={12} weight="fill" className="text-amber-400" />
                <span className="text-[11px] font-bold text-slate-700">{rating}</span>
              </div>
            )}
            {lessonCount > 0 && (
              <div className="flex items-center gap-1">
                <PlayCircle size={12} className="text-slate-400" />
                <span className="text-[11px] text-slate-500">{lessonCount} lessons</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-[11px] font-bold">
              {isEnrolled ? "Continue" : "Details"}
            </span>
            <ArrowRight size={12} weight="bold" />
          </div>
        </div>
      </div>
    </article>
  );
}
