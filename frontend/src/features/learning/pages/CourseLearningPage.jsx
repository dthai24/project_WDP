/**
 * CourseLearningPage  —  Trang học bài trong khóa học (student)
 * Redesigned: Premium English Learning Experience
 *
 * Route: /my-courses/:courseId/learn
 *
 * ── Data source ───────────────────────────────────────────────────────
 *   GET /api/courses/:courseId/learning?userId=<id>
 *
 *   Response JSON:
 *   {
 *     success: true,
 *     courseTitle: string,
 *     instructor: string,
 *     data: [
 *       {
 *         PathId: number,
 *         PathName: string,
 *         Description: string,
 *         lessons: [
 *           {
 *             NodeId: number,
 *             NodeName: string,
 *             Description: string,
 *             MaterialType: "VIDEO" | "TEXT" | "DOC" | "TEST",
 *             MaterialUrl: string | null,
 *             Content: string | null,
 *             IsCompleted: boolean
 *           }
 *         ]
 *       }
 *     ]
 *   }
 */
import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  PlayCircle,
  FileText,
  ClipboardText,
  CheckCircle,
  Circle,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  Download,
  FilePdf,
  FileDoc,
  File,
  GraduationCap,
  ListChecks,
  Target,
  Sparkle,
  CaretDown,
  CaretUp,
  Exam,
} from "@phosphor-icons/react";
import AppButton from "@/shared/ui/AppButton";
import AppProgressBar, { getProgressColor } from "@/shared/ui/AppProgressBar";
import EmptyState from "@/shared/ui/EmptyState";
import { resolveVideoEmbed } from "@/shared/utils/videoEmbedUtils";
import {
  getChapterQuizConfig,
  getCourseQuizConfig,
} from "@/features/mentor/services/chapterQuizConfigService";

/* ─── Constants ─── */
const BRAND = "#10b981";
const BRAND_LIGHT = "rgba(16,185,129,0.08)";
const BRAND_MED = "rgba(16,185,129,0.15)";
const TEXT = "#0f172a";
const MUTED = "#64748b";
const SUCCESS = "#16a34a";
const DIVIDER = "#e2e8f0";

const TYPE_CONFIG = {
  video: { icon: PlayCircle, label: "Video", color: "#0ea5e9", bg: "rgba(14,165,233,0.08)" },
  reading: { icon: FileText, label: "Bài đọc", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  quiz: { icon: ClipboardText, label: "Bài tập", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  doc: { icon: FileText, label: "Tài liệu", color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
  text: { icon: FileText, label: "Văn bản", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
};

const MATERIAL_FILE_META = {
  pdf: { icon: FilePdf, color: "#dc2626" },
  doc: { icon: FileDoc, color: "#2563eb" },
  docx: { icon: FileDoc, color: "#2563eb" },
  default: { icon: File, color: "#64748b" },
};

function getFileMeta(title = "") {
  const lower = title.toLowerCase();
  for (const [ext, meta] of Object.entries(MATERIAL_FILE_META)) {
    if (lower.endsWith(`.${ext}`)) return meta;
  }
  return MATERIAL_FILE_META.default;
}

/* ─── Video Player ─── */
function LessonVideoPlayer({ url }) {
  if (!url) return null;
  const { previewType, embedUrl } = resolveVideoEmbed(url);

  if (previewType === "video") {
    return (
      <video
        src={embedUrl}
        controls
        className="w-full h-full bg-black object-contain rounded-xl"
      />
    );
  }

  return (
    <iframe
      src={embedUrl}
      allowFullScreen
      className="w-full h-full border-none bg-black rounded-xl"
    />
  );
}

/* ─── Helpers ─── */
function flatLessons(mods) {
  return mods.flatMap((m) => m.lessons);
}

function findLessonAndModule(mods, lessonId) {
  for (const mod of mods) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) return { lesson, mod };
  }
  return { lesson: null, mod: null };
}

function getInitialLessonId(mods) {
  const all = flatLessons(mods);
  return (all.find((l) => l.status === "current") ?? all[0])?.id ?? null;
}

function computeProgress(mods) {
  const all = flatLessons(mods);
  if (!all.length) return 0;
  return Math.round(
    (all.filter((l) => l.status === "completed").length / all.length) * 100
  );
}

function mapMaterialTypeToUi(materialType) {
  const map = { VIDEO: "video", TEXT: "reading", DOC: "doc", TEST: "quiz" };
  return map[materialType] ?? "video";
}

/* ─── Lesson Type Badge ─── */
function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.reading;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <Icon size={12} weight="fill" />
      {cfg.label}
    </span>
  );
}

/* ─── Sidebar Lesson Item ─── */
function LessonItem({ lesson, isActive, onSelect }) {
  const cfg = TYPE_CONFIG[lesson.type] ?? TYPE_CONFIG.reading;
  const Icon = cfg.icon;
  const isCompleted = lesson.status === "completed";

  return (
    <button
      type="button"
      onClick={() => onSelect(lesson.id)}
      className={`
        w-full flex items-start gap-2.5 py-2.5 px-3 rounded-xl text-left
        transition-all duration-150 font-sans
        ${isActive
          ? "bg-emerald-50 shadow-sm border border-emerald-200/60"
          : "hover:bg-slate-50 border border-transparent"
        }
      `}
    >
      {/* Status icon */}
      <span className="pt-0.5 flex-shrink-0">
        {isCompleted ? (
          <CheckCircle size={18} className="text-emerald-500" weight="fill" />
        ) : isActive ? (
          <PlayCircle size={18} className="text-emerald-500" weight="fill" />
        ) : (
          <Circle size={18} className="text-slate-300" />
        )}
      </span>

      {/* Content */}
      <span className="flex-1 min-w-0">
        <span
          className={`block text-[13px] leading-snug ${
            isActive ? "font-semibold text-emerald-700" : "font-medium text-slate-800"
          }`}
        >
          Bài {lesson.index}: {lesson.title}
        </span>
        <span className="flex items-center gap-1 mt-1">
          <Icon size={11} className={cfg.color} />
          <span className="text-[11px] text-slate-400">{lesson.duration}</span>
        </span>
      </span>
    </button>
  );
}

/* ─── Module Accordion ─── */
function ModuleAccordion({ mod, isActiveModule, currentLessonId, onSelect, chapterQuizConfig, onGoToChapterTest }) {
  const [open, setOpen] = useState(isActiveModule);
  const doneCount = mod.lessons.filter((l) => l.status === "completed").length;
  const modPercent = mod.lessons.length > 0 ? Math.round((doneCount / mod.lessons.length) * 100) : 0;

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      {/* Module header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-3 text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex-1 min-w-0 pr-2">
          <span className={`block text-[13px] font-semibold ${isActiveModule ? "text-emerald-600" : "text-slate-800"}`}>
            Chương {mod.index}: {mod.title}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {doneCount}/{mod.lessons.length} bài
          </span>
        </div>
        {open ? (
          <CaretUp size={14} className="text-slate-400 flex-shrink-0" />
        ) : (
          <CaretDown size={14} className="text-slate-400 flex-shrink-0" />
        )}
      </button>

      {/* Module content */}
      {open && (
        <div className="px-2 pb-3">
          {/* Mini progress bar */}
          <div className="px-1 mb-2">
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${modPercent}%`, backgroundColor: getProgressColor(modPercent) }}
              />
            </div>
          </div>

          {/* Lessons */}
          <div className="space-y-0.5">
            {mod.lessons.map((lesson) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                isActive={lesson.id === currentLessonId}
                onSelect={onSelect}
              />
            ))}
          </div>

          {/* Chapter test button */}
          <button
            type="button"
            onClick={onGoToChapterTest}
            className="w-full flex items-start gap-2.5 py-2.5 px-3 mt-1 rounded-xl text-left
              border border-dashed border-amber-200/60 bg-amber-50/40
              hover:bg-amber-50 transition-colors"
          >
            <span className="pt-0.5 flex-shrink-0">
              <Exam size={16} className="text-amber-500" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[12px] font-semibold text-amber-700 leading-snug">
                Làm bài kiểm tra
              </span>
              <span className="text-[11px] text-amber-500/70 mt-0.5 block">
                {chapterQuizConfig?.title || "Kiểm tra cuối chương"}
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Rich Content Styles ─── */
const RICH_CONTENT_CLASSES = [
  "text-[15px] leading-relaxed text-slate-800",
  "[&_p]:mb-2",
  "[&_ul]:pl-6 [&_ol]:pl-6 [&_ul]:mb-2 [&_ol]:mb-2",
  "[&_li]:mb-1",
  "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg",
  "[&_i]:italic [&_em]:italic",
  "[&_b]:font-bold [&_strong]:font-bold",
  "[&_u]:underline",
].join(" ");

/* ═══════════════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function CourseLearningPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = String(user.userId || "1");

  const [modules, setModules] = useState([]);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [chapterQuizConfigs, setChapterQuizConfigs] = useState({});
  const [courseQuizConfig, setCourseQuizConfig] = useState(null);
  const [courseInfo, setCourseInfo] = useState({ courseTitle: "Đang tải...", instructor: "" });
  const [sidebarOpen, setSidebarOpen] = useState(true);

      // Fetch learning data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/courses/${courseId}/learning`, {
          headers: { "x-user-id": currentUserId },
        });
        const result = await res.json();

        if (result.success) {
          setCourseInfo({ courseTitle: result.courseTitle, instructor: result.instructor });
          const mapped = result.data.map((mod, ci) => ({
            id: mod._id || mod.PathId,
            index: ci + 1,
            title: mod.pathName || mod.PathName,
            description: String(mod.description ?? mod.Description ?? "").trim(),

            lessons: (mod.Nodes || mod.lessons || []).map((lesson, li) => {
              // Determine lesson type from materials
              const materials = lesson.Materials || [];
              const firstMaterial = materials[0];
              const materialType = firstMaterial?.materialType || lesson.MaterialType || "TEXT";
              const materialUrl = firstMaterial?.materialUrl || lesson.MaterialUrl || null;
              const embedUrl = firstMaterial?.embedUrl || null;
              const contentBody = lesson.content || lesson.Content || firstMaterial?.content || null;

              return {
                id: lesson._id || lesson.NodeId,
                index: li + 1,
                title: lesson.nodeName || lesson.NodeName,
                description: String(lesson.description ?? lesson.Description ?? "").trim(),

                type: mapMaterialTypeToUi(materialType),
                status: lesson.IsCompleted ? "completed" : "not_started",
                videoUrl: embedUrl || materialUrl,
                contentBody: contentBody,
                materials: materials.map((m) => ({
                  id: m._id,
                  title: m.title || m.fileName || "Tài liệu",
                  type: m.materialType,
                  url: m.materialUrl,
                  embedUrl: m.embedUrl,
                  fileName: m.fileName,
                  fileSize: m.fileSize,
                })),
                duration: "10 phút",
              };
            }),
          }));
          setModules(mapped);
          if (mapped.length > 0 && mapped[0].lessons.length > 0) {
            setCurrentLessonId(mapped[0].lessons[0].id);
          }
        }
      } catch (err) {
        console.error("Fetch learning error:", err);
      }
    };
    fetchData();
  }, [courseId]);

  // Fetch quiz configs
  useEffect(() => {
    if (!courseId || modules.length === 0) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        modules.map(async (mod) => {
          const res = await getChapterQuizConfig(courseId, mod.id, {
            chapterTitle: mod.title,
            chapterIndex: mod.index - 1,
          });
          return [mod.id, res.ok ? res.config : null];
        })
      );
      if (cancelled) return;
      setChapterQuizConfigs(Object.fromEntries(entries));
      const courseRes = await getCourseQuizConfig(courseId, {
        courseTitle: courseInfo.courseTitle,
      });
      if (!cancelled && courseRes.ok) setCourseQuizConfig(courseRes.config);
    })();
    return () => { cancelled = true; };
  }, [courseId, modules, courseInfo.courseTitle]);

  const allLessons = useMemo(() => flatLessons(modules), [modules]);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const { lesson: currentLesson, mod: currentMod } = findLessonAndModule(modules, currentLessonId);
  const progress = useMemo(() => computeProgress(modules), [modules]);

  const handleToggleComplete = async () => {
    if (!currentLesson) return;
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": currentUserId },
        body: JSON.stringify({ nodeId: currentLesson.id }),
      });
      const result = await res.json();
      if (result.success) {
        window.dispatchEvent(new CustomEvent("streakUpdate", { detail: { hasStudiedToday: true } }));
        setModules((prev) =>
          prev.map((mod) => ({
            ...mod,
            lessons: mod.lessons.map((l) =>
              l.id === currentLesson.id ? { ...l, status: "completed" } : l
            ),
          }))
        );
      }
    } catch (err) {
      console.error("Progress error:", err);
    }
  };

  const handleSelectLesson = (id) => setCurrentLessonId(id);
  const handlePrev = () => {
    if (currentIndex > 0) handleSelectLesson(allLessons[currentIndex - 1].id);
  };
  const handleNext = () => {
    if (currentIndex < allLessons.length - 1) handleSelectLesson(allLessons[currentIndex + 1].id);
  };

  const isCompleted = currentLesson?.status === "completed";
  const TypeIcon = TYPE_CONFIG[currentLesson?.type]?.icon ?? FileText;
  const typeCfg = TYPE_CONFIG[currentLesson?.type] ?? TYPE_CONFIG.reading;

  if (!courseInfo.courseTitle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          variant="error"
          icon={BookOpen}
          title="Không tìm thấy khóa học"
          description="Khóa học này chưa có nội dung học hoặc bạn chưa đăng ký."
          actionLabel="Về Khóa học của tôi"
          onAction={() => navigate("/my-courses")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-[13px] mb-5">
        <Link to="/my-courses" className="text-slate-400 hover:text-emerald-600 font-medium transition-colors">
          Khóa học của tôi
        </Link>
        <span className="text-slate-300">/</span>
        <Link to={`/courses/${courseId}`} className="text-slate-400 hover:text-emerald-600 font-medium transition-colors truncate max-w-[200px]">
          {courseInfo.courseTitle}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-semibold truncate max-w-[220px]">
          {currentLesson ? `Bài ${currentLesson.index}: ${currentLesson.title}` : "Bài học"}
        </span>
      </nav>

      {/* ── Course Header ── */}
      <div className="mb-5 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Module name */}
            {currentMod && (
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                Chương {currentMod.index}: {currentMod.title}
              </h2>
            )}

            {/* Lesson name */}
            {currentLesson && (
              <div className="mt-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  <span className="text-emerald-600">Bài {currentLesson.index}:</span>{" "}
                  {currentLesson.title}
                </h3>
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {courseInfo.instructor && (
                    <span className="inline-flex items-center gap-1 text-[12px] text-slate-400 font-medium">
                      <User size={13} className="text-blue-500" />
                      {courseInfo.instructor}
                    </span>
                  )}
                  {currentLesson.type && <TypeBadge type={currentLesson.type} />}
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="min-w-[180px] w-full sm:w-auto flex-shrink-0">
            <div className="flex justify-between mb-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Tiến độ
              </span>
              <span className="text-[12px] font-bold" style={{ color: getProgressColor(progress) }}>
                {progress}%
              </span>
            </div>
            <AppProgressBar value={progress} height={6} />
          </div>
        </div>
      </div>

      {/* ── Main 2-col Layout ── */}
      <div className="flex flex-col-reverse lg:flex-row gap-5 items-start">
        {/* ═══ MAIN CONTENT ═══ */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* Description card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-indigo-500" />
              <h4 className="text-[15px] font-bold text-slate-800">Mô tả</h4>
            </div>
            <p className="text-[14px] text-slate-500 leading-relaxed whitespace-pre-wrap">
              {currentLesson?.description || "Chưa có mô tả cho bài học này."}
            </p>
          </div>

          {/* Main lesson content */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6">
            {/* Video player */}
            {currentLesson?.type === "video" && currentLesson?.videoUrl && (
              <div className="w-full aspect-video rounded-xl mb-5 bg-black border border-slate-200 overflow-hidden">
                <LessonVideoPlayer url={currentLesson.videoUrl} />
              </div>
            )}

            {/* Duration chip */}
            {currentLesson?.duration && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/50">
                  <Clock size={12} />
                  {currentLesson.duration}
                </span>
              </div>
            )}

            {/* Objectives */}
            {currentLesson?.content?.objectives?.length > 0 && (
              <div className="mb-5">
                <h4 className="flex items-center gap-1.5 text-[15px] font-bold text-slate-800 mb-3">
                  <Target size={16} className="text-emerald-500" />
                  Mục tiêu bài học
                </h4>
                <div className="space-y-2">
                  {currentLesson.content.objectives.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" weight="fill" />
                      <span className="text-[14px] text-slate-500 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reading content (Rich HTML) */}
            {currentLesson?.contentBody && (
              <div className="mb-5 pt-4 border-t border-slate-100">
                <div
                  className={RICH_CONTENT_CLASSES}
                  dangerouslySetInnerHTML={{ __html: currentLesson.contentBody }}
                />
              </div>
            )}

            {/* Materials */}
            {currentLesson?.materials?.length > 0 && (
              <div className="mb-5">
                <h4 className="flex items-center gap-1.5 text-[15px] font-bold text-slate-800 mb-3">
                  <FileText size={16} className="text-indigo-500" />
                  Tài liệu kèm theo
                </h4>
                <div className="space-y-1.5">
                  {currentLesson.materials.map((file) => {
                    const { icon: FileIcon, color: fileColor } = getFileMeta(file.title);
                    return (
                      <div
                        key={file.id}
                        className="flex items-center gap-2.5 py-2 px-3 rounded-xl border border-slate-100
                          hover:border-emerald-200/60 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                      >
                        <FileIcon size={18} className="flex-shrink-0" style={{ color: fileColor }} />
                        <span className="text-[13px] text-slate-700 font-medium flex-1 min-w-0 truncate">
                          {file.title}
                        </span>
                        <Download
                          size={15}
                          className="flex-shrink-0 text-slate-300 group-hover:text-emerald-500 transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-2 border-t border-slate-100">
              <AppButton
                size="small"
                variant="outlined"
                disabled={currentIndex <= 0}
                onClick={handlePrev}
                startIcon={<ArrowLeft size={16} />}
                className="min-w-[120px]"
              >
                Bài trước
              </AppButton>

              <AppButton
                size="small"
                variant={isCompleted ? "outlined" : "contained"}
                onClick={handleToggleComplete}
                startIcon={<CheckCircle size={16} />}
                className="min-w-[190px] font-semibold"
                style={
                  isCompleted
                    ? { borderColor: "rgba(22,163,74,0.5)", color: SUCCESS, backgroundColor: "rgba(22,163,74,0.08)" }
                    : { backgroundColor: SUCCESS, color: "#fff", boxShadow: "0 2px 8px rgba(22,163,74,0.28)" }
                }
              >
                {isCompleted ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
              </AppButton>

              <AppButton
                size="small"
                variant="contained"
                disabled={currentIndex >= allLessons.length - 1}
                onClick={handleNext}
                endIcon={<ArrowRight size={16} />}
                className="min-w-[120px]"
              >
                Bài tiếp theo
              </AppButton>
            </div>
          </div>
        </div>

        {/* ═══ SIDEBAR ═══ */}
        <div className="w-full lg:w-[360px] flex-shrink-0">
          <div className="lg:sticky lg:top-24 space-y-3">
            {/* Module description */}
            {currentMod?.description && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <h4 className="text-[13px] font-bold text-slate-800 mb-1.5">Mô tả chương</h4>
                <p className="text-[12px] text-slate-500 leading-relaxed whitespace-pre-wrap">
                  {currentMod.description}
                </p>
              </div>
            )}

            {/* Lesson list */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h4 className="text-[13px] font-bold text-slate-800">Nội dung khóa học</h4>
                <span className="text-[11px] text-slate-400">
                  {allLessons.filter((l) => l.status === "completed").length}/{allLessons.length} bài
                </span>
              </div>

              {/* Module accordions */}
              <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
                {modules.map((mod) => {
                  const isActiveModule = mod.lessons.some((l) => l.id === currentLessonId);
                  return (
                    <ModuleAccordion
                      key={mod.id}
                      mod={mod}
                      isActiveModule={isActiveModule}
                      currentLessonId={currentLessonId}
                      onSelect={handleSelectLesson}
                      chapterQuizConfig={chapterQuizConfigs[mod.id]}
                      onGoToChapterTest={() => navigate(`/my-courses/${courseId}/test/chapter/${mod.id}`)}
                    />
                  );
                })}

                {/* Course test button */}
                <div className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/my-courses/${courseId}/test/final`)}
                    className="w-full flex items-start gap-2.5 py-2.5 px-3 rounded-xl text-left
                      border border-dashed border-emerald-200/60 bg-emerald-50/40
                      hover:bg-emerald-50 transition-colors"
                  >
                    <span className="pt-0.5 flex-shrink-0">
                      <GraduationCap size={16} className="text-emerald-600" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12px] font-semibold text-emerald-700 leading-snug">
                        Làm bài kiểm tra toàn khóa
                      </span>
                      <span className="text-[11px] text-emerald-500/70 mt-0.5 block">
                        {courseQuizConfig?.title || "Kiểm tra cuối khóa"}
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
