import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  PlayCircle,
  FileText,
  Lock,
  CheckCircle,
  CalendarBlank,
  Star,
  Users,
  User,
  ClipboardText,
  CaretDown,
  ArrowsOut,
  ArrowsIn,
  GraduationCap,
  Clock,
  ArrowLeft,
} from "@phosphor-icons/react";
import { toast } from "@/shared/ui/Toast";
import { enrollCourseApi } from "@/features/auth/services/authService";
import CourseCard from "@/features/courses/components/CourseCard";
import CourseCommentsSection from "@/features/courses/components/CourseCommentsSection";
import { buildCourseDetailPath, buildCourseListPath } from "@/features/courses/utils/courseListParams";

const ACCENT = "#059669";
const ACCENT_DARK = "#047857";
const TEXT = "#0F172A";
const MUTED = "#64748B";

function getStatusBadge(isEnrolled, progress) {
  if (!isEnrolled) return { label: "Not Enrolled", className: "bg-slate-100 text-slate-600 border-slate-200" };
  if (progress >= 100) return { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (progress > 0) return { label: "In Progress", className: "bg-brand-50 text-brand-700 border-brand-200" };
  return { label: "Enrolled", className: "bg-green-50 text-green-700 border-green-200" };
}

function getLevelBadge(level = "") {
  const l = level.toLowerCase();
  if (l.includes("co ban") || l.includes("beginner")) return "bg-sky-50 text-sky-700 border-sky-200";
  if (l.includes("trung cap") || l.includes("intermediate")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (l.includes("nang cao") || l.includes("advanced")) return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-slate-100 text-slate-600";
}

function getCategoryBadge(category = "") {
  const map = {
    "Giao tiep": "bg-blue-50 text-blue-700 border-blue-200",
    "Communication": "bg-blue-50 text-blue-700 border-blue-200",
    IELTS: "bg-purple-50 text-purple-700 border-purple-200",
    TOEIC: "bg-sky-50 text-sky-700 border-sky-200",
    "Ngu phap": "bg-slate-100 text-slate-700 border-slate-200",
    "Grammar": "bg-slate-100 text-slate-700 border-slate-200",
    "Phat am": "bg-pink-50 text-pink-700 border-pink-200",
    "Pronunciation": "bg-pink-50 text-pink-700 border-pink-200",
  };
  return map[category] ?? "bg-slate-100 text-slate-600";
}

function formatStudentCount(count) {
  if (count >= 1000) return count.toLocaleString("vi-VN");
  return String(count);
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
      {children}
    </h2>
  );
}

function CourseMetaRow({ course }) {
  const items = [
    { icon: BookOpen, label: "Chapters", value: `${course.stageCount} chapters` },
    { icon: PlayCircle, label: "Lessons", value: `${course.lessonCount} lessons` },
    { icon: FileText, label: "Materials", value: `${course.materialCount} materials` },
    { icon: CalendarBlank, label: "Updated", value: course.updatedAt || "-" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="pb-1.5 border-b border-brand-100/60 transition-colors hover:border-brand-300/60 group">
          <div className="flex items-center gap-1 mb-0.5">
            <Icon size={14} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
            <span className="text-xs text-slate-500 font-medium">{label}</span>
          </div>
          <p className="text-sm text-slate-900 font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}

function CourseProgressBlock({ progress }) {
  const value = Math.min(Math.max(progress, 0), 100);
  const completed = value >= 100;
  const color = completed ? "bg-emerald-500" : value > 0 ? "bg-brand-500" : "bg-slate-200";

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-slate-500 font-semibold">Progress</span>
        <div className="flex items-center gap-1">
          {completed && <CheckCircle size={14} weight="fill" className="text-emerald-500" />}
          <span className={`text-xs font-bold ${completed ? "text-emerald-600" : "text-brand-600"}`}>
            {value}%
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function CourseIntro({ course, isEnrolled }) {
  const [searchParams] = useSearchParams();
  const coursesListPath = buildCourseListPath(searchParams);
  const statusBadge = getStatusBadge(isEnrolled, course.progress);

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm mb-4">
        <Link to="/home" className="text-slate-500 hover:text-slate-700 transition-colors">
          Home
        </Link>
        <span className="text-slate-300">/</span>
        <Link to={coursesListPath} className="text-slate-500 hover:text-slate-700 transition-colors">
          Courses
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-semibold truncate max-w-[200px]">
          {course.title}
        </span>
      </nav>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight mb-3">
        {course.title}
      </h1>

      {/* Description */}
      <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-4 max-w-2xl">
        {course.shortDescription}
      </p>

      {/* Rating & Students */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <Star size={18} weight="fill" className="text-amber-400" />
          <span className="text-sm font-bold text-slate-900">{course.rating}</span>
          <span className="text-xs text-slate-500">
            ({course.reviewCount.toLocaleString("vi-VN")} reviews)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={16} className="text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">
            {formatStudentCount(course.studentCount)} students
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
        {course.level && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getLevelBadge(course.level)}`}>
            {course.level}
          </span>
        )}
        {course.category && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadge(course.category)}`}>
            {course.category}
          </span>
        )}
      </div>

      <CourseMetaRow course={course} />
    </div>
  );
}

function CTAInfoRow({ icon: Icon, label, children, showDivider }) {
  return (
    <div className={`flex items-start gap-2.5 py-2.5 ${showDivider ? "border-t border-brand-100/60" : ""}`}>
      <Icon size={18} className="text-slate-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium leading-tight mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );
}

function formatPriceLabel(course) {
  if (!course.isPaid || !course.price) {
    return { label: "Free", originalPrice: null };
  }

  const finalPrice = course.finalPrice ?? course.price;
  const hasDiscount = course.discountPercentage > 0 && finalPrice < course.price;

  return {
    label: `${finalPrice.toLocaleString("vi-VN")} ₫`,
    originalPrice: hasDiscount ? `${course.price.toLocaleString("vi-VN")} ₫` : null,
  };
}

function CourseStickyCTA({ course, isEnrolled, onEnroll, onBuy, onContinue, sticky = true }) {
  const [searchParams] = useSearchParams();
  const prerequisites = course.prerequisites ?? [];
  const pricing = formatPriceLabel(course);
  const isPaidCourse = Boolean(course.isPaid && course.price > 0);

  const getButtonProps = () => {
    if (course.progress >= 100) return { label: "Review Again", variant: "primary", onClick: onContinue };
    if (isEnrolled) return { label: "Continue Learning", variant: "primary", onClick: onContinue };
    if (isPaidCourse) return { label: "Mua ngay", variant: "accent", onClick: onBuy };
    return { label: "Enroll Now", variant: "accent", onClick: onEnroll };
  };

  const btn = getButtonProps();

  const variantStyles = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950",
    accent: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800",
  };

  return (
    <div className={`${sticky ? "lg:sticky lg:top-20" : ""} w-full shrink-0`}>
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_32px_rgba(5,150,105,0.08)] overflow-hidden">
        {/* Thumbnail */}
        <div className="aspect-[16/9] bg-slate-50 relative overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <GraduationCap size={40} weight="light" className="text-slate-300" />
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="mb-3">
            {pricing.originalPrice ? (
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{pricing.label}</p>
                <p className="text-sm text-slate-400 line-through">{pricing.originalPrice}</p>
              </div>
            ) : (
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{pricing.label}</p>
            )}
            {isPaidCourse && course.discountPercentage > 0 && (
              <p className="text-xs font-semibold text-emerald-600 mt-1">
                Giảm {course.discountPercentage}%
              </p>
            )}
          </div>

          <button
            onClick={btn.onClick}
            className={`w-full py-3 px-4 rounded-xl text-sm font-extrabold tracking-wider transition-all duration-200 active:scale-[0.98] ${variantStyles[btn.variant]}`}
          >
            {btn.label}
          </button>

          {isEnrolled && (
            <div className="mt-4 mb-2">
              <CourseProgressBlock progress={course.progress} />
            </div>
          )}

          <div className="flex flex-col pt-3 mt-3 border-t border-brand-100/60">
            <CTAInfoRow icon={User} label="Instructor">
              <p className="text-sm text-slate-900 font-semibold leading-snug">
                {course.instructor || "English Master Mentor Team"}
              </p>
            </CTAInfoRow>

            {prerequisites.length > 0 && (
              <CTAInfoRow icon={ClipboardText} label="Prerequisites" showDivider>
                <div className="flex flex-col gap-1">
                  {prerequisites.map((prereq) => (
                    <Link
                      key={prereq.id}
                      to={buildCourseDetailPath(prereq.id, searchParams)}
                      className="text-sm text-brand-600 font-semibold leading-snug hover:text-brand-800 transition-colors"
                    >
                      {prereq.title}
                    </Link>
                  ))}
                </div>
              </CTAInfoRow>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonIcon({ type }) {
  const Icon = type === "video" ? PlayCircle : FileText;
  return <Icon size={15} className="text-slate-400 shrink-0" />;
}

function CurriculumSection({ modules, isEnrolled, course }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set(isEnrolled && modules[0]?.id ? [modules[0].id] : []));
  if (!modules?.length) return null;

  const allExpanded = isEnrolled && modules.every((m) => expandedIds.has(m.id));

  const toggleModule = (id) => {
    if (!isEnrolled) return;
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!isEnrolled) return;
    if (allExpanded) setExpandedIds(new Set());
    else setExpandedIds(new Set(modules.map((m) => m.id)));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 mb-1 border-b border-slate-100">
        <div>
          <SectionTitle>Course Content</SectionTitle>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {course.stageCount} chapters &middot; {course.lessonCount} lessons
          </p>
        </div>
        {isEnrolled && (
          <button
            onClick={toggleAll}
            className="shrink-0 mt-0.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
          >
            {allExpanded ? <ArrowsIn size={18} /> : <ArrowsOut size={18} />}
          </button>
        )}
      </div>

      <div className={!isEnrolled ? "opacity-75 pointer-events-none select-none" : ""}>
        {modules.map((mod, index) => {
          const isOpen = isEnrolled && expandedIds.has(mod.id);
          return (
            <div
              key={mod.id}
              className="border-b border-slate-100 last:border-b-0"
            >
              {/* Module Header */}
              <button
                onClick={() => toggleModule(mod.id)}
                disabled={!isEnrolled}
                className={`w-full flex items-center gap-3 py-3 px-0 text-left transition-colors rounded-lg -mx-1 px-1 ${
                  isEnrolled ? "hover:bg-brand-50/30 cursor-pointer" : "cursor-default"
                }`}
              >
                <span className="text-xs font-bold text-slate-400 min-w-[20px] shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 leading-snug">{mod.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{mod.lessonCount} lessons</p>
                </div>
                {isEnrolled ? (
                  <CaretDown
                    size={16}
                    weight="bold"
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                ) : (
                  <Lock size={15} className="text-slate-400 shrink-0" />
                )}
              </button>

              {/* Module Content */}
              {isOpen && (
                <div className="pb-3 pl-9">
                  {mod.description && (
                    <div className="pb-3 mb-1 border-b border-slate-50">
                      <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
                        {mod.description}
                      </p>
                    </div>
                  )}
                  {mod.lessons.map((lesson, lessonIndex) => {
                    const isLocked = !isEnrolled && !lesson.isPreview;
                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center gap-2 py-2.5 ${
                          lessonIndex > 0 ? "border-t border-slate-50" : ""
                        } ${isLocked ? "opacity-50" : ""} transition-colors ${
                          isLocked ? "" : "hover:bg-brand-50/30 rounded-lg -mx-1 px-1"
                        }`}
                      >
                        {isLocked ? (
                          <Lock size={15} className="text-slate-400 shrink-0" />
                        ) : (
                          <LessonIcon type={lesson.type} />
                        )}
                        <span
                          className={`flex-1 text-xs leading-snug ${
                            isLocked ? "text-slate-500" : lesson.isCompleted ? "text-slate-900 font-semibold" : "text-slate-700"
                          }`}
                        >
                          {lesson.title}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {lesson.isPreview && !isEnrolled && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200">
                              Preview
                            </span>
                          )}
                          {lesson.isCompleted && (
                            <CheckCircle size={14} weight="fill" className="text-emerald-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isEnrolled && (
        <div className="mt-5 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-3">
          <Lock size={18} className="text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-800">Nội dung chi tiết khóa học đã được khóa</p>
            <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">
              Bạn cần tham gia hoặc đăng ký mua khóa học này để có thể mở khóa xem chi tiết lộ trình bài học, xem các video bài giảng chất lượng cao, tải về tài liệu và tham gia làm bài tập trắc nghiệm.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function RelatedCoursesSection({ course }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [relatedCourses, setRelatedCourses] = useState([]);

  useEffect(() => {
    if (!course?.categoryId || !course?.levelId) return;

    const fetchRelated = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const headers = user.userId ? { "x-user-id": user.userId } : {};

        const res = await fetch("http://localhost:5050/api/courses/student", { headers });
        const data = await res.json();

        if (data.success) {
          const allCourses = (data.data || []).filter(
            (c) => String(c._id || c.courseId || c.CourseId) !== String(course.id)
          );

          let exactMatch = allCourses.filter(
            (c) =>
              String(c.categoryId || c.CategoryId) === String(course.categoryId) &&
              String(c.levelId || c.LevelId) === String(course.levelId)
          );

          let partialMatch = allCourses.filter(
            (c) =>
              (String(c.categoryId || c.CategoryId) === String(course.categoryId) ||
                String(c.levelId || c.LevelId) === String(course.levelId)) &&
              !exactMatch.some((e) => String(e._id || e.courseId || e.CourseId) === String(c._id || c.courseId || c.CourseId))
          );

          let finalRelated = [...exactMatch, ...partialMatch].slice(0, 5);
          setRelatedCourses(finalRelated);
        }
      } catch (error) {
        console.error("Failed to fetch related courses:", error);
      }
    };

    fetchRelated();
  }, [course]);

  if (relatedCourses.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>Related Courses</SectionTitle>
        <button
          onClick={() =>
            navigate(`/courses?category=${course.categoryId}&level=${course.levelId}`)
          }
          className="text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors"
        >
          View all
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {relatedCourses.map((c) => {
          const cid = c._id || c.courseId || c.CourseId;
          return (
            <CourseCard
              key={cid}
              course={c}
              onContinueLearning={() => navigate(`/my-courses/${cid}/learn`)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const headers = user.userId ? { "x-user-id": user.userId } : {};

        // Fetch course info
        const [courseRes, contentRes] = await Promise.all([
          fetch(`http://localhost:5050/api/courses/my-courses/${id}?tab=course`, { headers }),
          fetch(`http://localhost:5050/api/courses/my-courses/${id}?tab=content`, { headers }),
        ]);

        const courseResult = await courseRes.json();
        const contentResult = await contentRes.json();

        if (courseResult.success && courseResult.data) {
          const dbData = Array.isArray(courseResult.data) ? courseResult.data[0] : courseResult.data;
          if (!dbData) {
            setCourse(null);
            return;
          }

          // Process thumbnail
          let courseImage = dbData.thumbnail || dbData.Thumbnail;
          if (courseImage === "CHUA FIX LOI ANH" || !courseImage) {
            const seed = dbData._id || dbData.courseId || dbData.CourseId || "course";
            courseImage = `https://picsum.photos/seed/${seed}/640/360`;
          } else {
            let val = String(courseImage).trim();
            if (
              val.startsWith("http://") ||
              val.startsWith("https://") ||
              val.startsWith("data:image") ||
              val.startsWith("blob:")
            ) {
              courseImage = val;
            } else {
              courseImage = `http://localhost:5050${val.startsWith("/") ? val : "/" + val}`;
            }
          }

          // Process content data (paths/nodes)
          let paths = dbData.paths || dbData.Paths || [];
          let totalLessons = dbData.totalLessons || dbData.TotalLessons || 0;

          // If content endpoint returned data, use it for richer path/node info
          if (contentResult.success && contentResult.data?.Paths) {
            paths = contentResult.data.Paths;
            totalLessons = contentResult.data.TotalLessons || totalLessons;
          }

          const mappedCourse = {
            id: dbData._id || dbData.courseId || dbData.CourseId,
            title: dbData.courseName || dbData.CourseName,
            description: dbData.description || dbData.Description,
            shortDescription: dbData.description || dbData.Description,
            thumbnail: courseImage,
            category: dbData.categoryDisplayName || dbData.CategoryDisplayName || dbData.categoryName || dbData.CategoryName,
            categoryId: dbData.categoryId || dbData.CategoryId,
            level: dbData.levelDisplayName || dbData.LevelDisplayName || dbData.levelName || dbData.LevelName,
            levelId: dbData.levelId || dbData.LevelId,
            instructor: dbData.instructorName || dbData.InstructorName || dbData.InStructorName,
            isEnrolled: Boolean(dbData.isEnrolled),
            progress: dbData.progress || 0,
            lessonCount: totalLessons,
            stageCount: paths.length,
            materialCount: dbData.totalMaterials || dbData.TotalMaterials || 0,
            updatedAt: (dbData.updatedAt || dbData.UpdatedAt)
              ? new Date(dbData.updatedAt || dbData.UpdatedAt).toLocaleDateString("vi-VN")
              : "-",
            rating: 4.8,
            reviewCount: 154,
            studentCount: dbData.studentCount || dbData.StudentCount || 2000,
            isPaid: Boolean(dbData.isPaid),
            price: Number(dbData.price || 0),
            discountPercentage: Number(dbData.discountPercentage || 0),
            finalPrice: dbData.discountPercentage
              ? Math.round(Number(dbData.price || 0) * (1 - Number(dbData.discountPercentage) / 100))
              : Number(dbData.price || 0),
            isFree: !dbData.isPaid || !dbData.price,
            prerequisites: [],
            modules: paths.map((path) => {
              const nodes = path.Nodes || path.nodes || [];
              return {
                id: path._id || path.pathId || path.PathId,
                title: path.pathName || path.PathName,
                description: (path.description || path.Description) ?? "",
                lessonCount: nodes.length,
                lessons: nodes.map((node) => ({
                  id: node._id || node.nodeId || node.NodeId,
                  title: node.nodeName || node.NodeName,
                  type: "video",
                  isPreview: Boolean(node.isFree ?? node.IsFree),
                  isCompleted: node.IsCompleted || false,
                })),
              };
            }),
          };
          setCourse(mappedCourse);
        } else {
          setCourse(null);
        }
      } catch (err) {
        console.error("Failed to load course data:", err);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleEnroll = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.userId) {
      toast.error("Please log in to enroll in this course.");
      return;
    }

    if (course.isPaid && course.price > 0) {
      navigate(`/payment/${course.id}`);
      return;
    }

    try {
      const res = await enrollCourseApi({
        courseId: String(course.id),
      });

      if (res && (res.success === true || res.ok === true)) {
        toast.success(`Enrolled in "${course.title}" successfully!`);
        setCourse((prev) => ({ ...prev, isEnrolled: true }));
      } else {
        toast.error(res?.message || "Enrollment failed. Please try again.");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("System error while processing enrollment.");
    }
  };

  const handleBuy = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.userId) {
      toast.error("Please log in to purchase this course.");
      return;
    }
    navigate(`/payment/${course.id}`);
  };

  const handleContinue = () => {
    navigate(`/my-courses/${id}/learn`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-slate-100 rounded w-48" />
          <div className="h-8 bg-slate-100 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 mb-4">
          <BookOpen size={32} weight="light" className="text-slate-300" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Course not found</h2>
        <p className="text-sm text-slate-500 mb-4">
          This course may have been removed or the link is invalid.
        </p>
        <button
          onClick={() => navigate("/courses")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to courses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
        {/* Main Content */}
        <div className="flex-1 min-w-0 w-full">
          <CourseIntro course={course} isEnrolled={course.isEnrolled} />

          {/* Mobile CTA */}
          <div className="block lg:hidden mt-5 mb-3">
            <CourseStickyCTA
              course={course}
              isEnrolled={course.isEnrolled}
              onEnroll={handleEnroll}
              onBuy={handleBuy}
              onContinue={handleContinue}
              sticky={false}
            />
          </div>

          {/* Curriculum */}
          <div className="mt-8">
            <CurriculumSection
              modules={course.modules}
              isEnrolled={course.isEnrolled}
              course={course}
            />
          </div>

          {/* Comments */}
          <div className="mt-8">
            <CourseCommentsSection courseId={course.id} isEnrolled={course.isEnrolled} />
          </div>
        </div>

        {/* Desktop Sidebar CTA */}
        <div className="hidden lg:block w-[360px] shrink-0">
          <CourseStickyCTA
            course={course}
            isEnrolled={course.isEnrolled}
            onEnroll={handleEnroll}
            onBuy={handleBuy}
            onContinue={handleContinue}
            sticky
          />
        </div>
      </div>

      {/* Related Courses */}
      <div className="mt-10 sm:mt-12">
        <RelatedCoursesSection course={course} />
      </div>
    </div>
  );
}
