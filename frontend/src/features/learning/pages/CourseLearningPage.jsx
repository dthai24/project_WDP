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
  Trophy,
  Certificate,
  Star,
  ThumbsUp,
  Chats,
} from "@phosphor-icons/react";
import AppButton from "@/shared/ui/AppButton";
import AppProgressBar, { getProgressColor } from "@/shared/ui/AppProgressBar";
import EmptyState from "@/shared/ui/EmptyState";
import { resolveVideoEmbed } from "@/shared/utils/videoEmbedUtils";
import {
  getChapterQuizConfig,
  getCourseQuizConfig,
} from "@/features/mentor/services/chapterQuizConfigService";
import studentFeatureService from "@/services/studentFeatureService";

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
function LessonVideoPlayer({ url, currentLessonId, onTakeNote }) {
  if (!url) return null;
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [videoQuizOpen, setVideoQuizOpen] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizOption, setQuizOption] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    setQuizAnswered(false);
    setVideoQuizOpen(false);
    setQuizOption("");
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.playbackRate = 1;
      setSpeed(1);
      setPlaying(false);
    }
  }, [currentLessonId]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const handleSpeedChange = (e) => {
    const val = parseFloat(e.target.value);
    setSpeed(val);
    if (videoRef.current) {
      videoRef.current.playbackRate = val;
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Trigger quiz at exactly 15 seconds (if not answered yet)
    if (Math.floor(time) === 15 && !quizAnswered && !videoQuizOpen) {
      videoRef.current.pause();
      setPlaying(false);
      setVideoQuizOpen(true);
    }
  };

  const handleQuizSubmit = () => {
    if (!quizOption) return;
    setQuizAnswered(true);
    setVideoQuizOpen(false);
    if (videoRef.current) {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden flex flex-col justify-between" style={{ minHeight: '320px' }}>
      {/* Video element */}
      <video
        ref={videoRef}
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        onTimeUpdate={handleTimeUpdate}
        className="w-full flex-1 object-contain bg-black cursor-pointer"
        onClick={handlePlayPause}
      />

      {/* Video controls */}
      <div className="bg-slate-900/95 px-4 py-2.5 flex items-center justify-between gap-4 text-white text-xs z-10 font-sans border-t border-slate-800">
        <button
          type="button"
          onClick={handlePlayPause}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-bold transition-all"
        >
          {playing ? "Tạm dừng" : "Phát video"}
        </button>

        <div className="flex-1 flex items-center gap-2">
          <span className="font-medium">{formatTime(currentTime)}</span>
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden relative cursor-pointer">
            <div
              className="absolute left-0 top-0 bottom-0 bg-emerald-500 transition-all duration-100"
              style={{ width: `${(currentTime / 60) * 100}%` }}
            />
          </div>
          <span className="text-slate-400">1:00</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Tốc độ:</span>
          <select
            value={speed}
            onChange={handleSpeedChange}
            className="bg-slate-800 text-white rounded px-2 py-1 border border-slate-700 focus:outline-none"
          >
            <option value={1}>1.0x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => onTakeNote(formatTime(currentTime))}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold transition-all"
        >
          Ghi chú
        </button>
      </div>

      {/* In-video Quiz overlay */}
      {videoQuizOpen && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-4 z-20 animate-fadeIn">
          <div className="bg-white text-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 font-sans">
            <h5 className="font-extrabold text-[14px] text-slate-800 mb-2 flex items-center gap-1.5">
              ⚡ Bài tập tương tác nhanh
            </h5>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Bạn hãy hoàn thành câu hỏi trắc nghiệm dưới đây để tiếp tục học tập:
              <br />
              <strong>Đâu là từ đồng nghĩa của "abundant"?</strong>
            </p>
            <div className="space-y-2 mb-4">
              {[
                { label: "A. Plentiful (Dồi dào)", val: "A" },
                { label: "B. Scarce (Khan hiếm)", val: "B" },
                { label: "C. Rare (Hiếm gặp)", val: "C" },
                { label: "D. Small (Nhỏ bé)", val: "D" },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    quizOption === opt.val
                      ? "border-emerald-500 bg-emerald-50/50 font-bold text-emerald-700"
                      : "border-slate-100 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="inVideoQuiz"
                    value={opt.val}
                    checked={quizOption === opt.val}
                    onChange={() => setQuizOption(opt.val)}
                    className="accent-emerald-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={handleQuizSubmit}
              disabled={!quizOption}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Xác nhận & Xem tiếp
            </button>
          </div>
        </div>
      )}
    </div>
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

const MOCK_LESSON_QUIZZES = {
  // APA vs MLA Citation Quiz
  "APA vs MLA Citation Quiz": [
    {
      question: "Which of the following in-text citations correctly follows the APA (7th edition) style for a single author?",
      options: [
        "A. (Smith, 2020)",
        "B. (Smith, p. 45)",
        "C. Smith (2020, p. 45)",
        "D. Both A and C are correct"
      ],
      answer: 3,
      explanation: "APA style uses the author-date system for in-text citations. Both parenthetical (A) and narrative (C) formats are correct depending on the context."
    },
    {
      question: "In which of the following academic fields is the MLA citation style most commonly used?",
      options: [
        "A. Social Sciences & Psychology",
        "B. Humanities, Literature & Languages",
        "C. Medicine & Biological Sciences",
        "D. Engineering & Computer Science"
      ],
      answer: 1,
      explanation: "MLA (Modern Language Association) style is widely used in humanities disciplines, especially literature, art, and modern languages."
    },
    {
      question: "What is a major difference between the reference lists of APA and MLA styles?",
      options: [
        "A. APA titles the list 'References', while MLA titles it 'Works Cited'.",
        "B. APA places the publication year immediately after the author name, while MLA places it at the end.",
        "C. MLA requires authors' full first names, while APA uses initials only.",
        "D. All of the above are correct."
      ],
      answer: 3,
      explanation: "All these points represent core structural differences between APA and MLA reference lists."
    }
  ],
  // Using Evidence Quiz
  "Using Evidence Quiz": [
    {
      question: "When is it most appropriate to use a direct quotation instead of paraphrasing?",
      options: [
        "A. When you want to increase the word count of your paper.",
        "B. When the author's original phrasing is exceptionally unique, powerful, or concise.",
        "C. When you do not fully understand the source material.",
        "D. When the citation format does not require page numbers."
      ],
      answer: 1,
      explanation: "Direct quotes should be used sparingly, primarily when the original language is distinctive or has unique rhetorical value."
    },
    {
      question: "Which of the following describes accidental plagiarism?",
      options: [
        "A. Paraphrasing a source's ideas without providing an in-text citation.",
        "B. Copying a sentence word-for-word without quotation marks, even if the source is cited.",
        "C. Reusing your own previous coursework without permission or proper citation.",
        "D. All of the above are correct."
      ],
      answer: 3,
      explanation: "All of these scenarios constitute plagiarism, even if they occur due to careless writing or lack of citation knowledge."
    }
  ],
  // Lexical Resource & Vocabulary Quiz
  "Lexical Resource & Vocabulary Quiz": [
    {
      question: "Which of the following is the best academic synonym for the informal phrase 'look at'?",
      options: [
        "A. watch",
        "B. examine",
        "C. check out",
        "D. glimpse"
      ],
      answer: 1,
      explanation: "The verb 'examine' is formal and precise, making it highly suitable for academic writing."
    },
    {
      question: "Which collocation is most natural and common in formal academic writing?",
      options: [
        "A. conduct a study",
        "B. make a study",
        "C. do a research",
        "D. perform a research"
      ],
      answer: 0,
      explanation: "'Conduct a study' or 'conduct research' is a standard academic collocation. Note that 'research' is uncountable, so 'do a research' is grammatically incorrect."
    }
  ],
  // IELTS Essay Structure Quiz
  "IELTS Essay Structure Quiz": [
    {
      question: "What is the recommended number of paragraphs for a standard IELTS Writing Task 2 essay?",
      options: [
        "A. 3 paragraphs (Introduction, Body, Conclusion)",
        "B. 4 to 5 paragraphs (Introduction, 2-3 Body paragraphs, Conclusion)",
        "C. 6 or more paragraphs",
        "D. It does not matter as long as the word count is reached"
      ],
      answer: 1,
      explanation: "A 4 or 5-paragraph structure is optimal for coherence and cohesion, allowing you to develop two or three main ideas thoroughly."
    },
    {
      question: "What is the primary function of the Conclusion paragraph in IELTS Writing Task 2?",
      options: [
        "A. To introduce a new argument to convince the reader.",
        "B. To summarize the main body arguments and restate your final thesis position.",
        "C. To tell a personal story illustrating your point.",
        "D. Both A and B are correct."
      ],
      answer: 1,
      explanation: "The conclusion should never introduce new ideas. Its purpose is to summarize and reinforce your overall stance on the prompt."
    }
  ],
  // Default Quiz / Generic Quiz Questions fallback
  "default": [
    {
      question: "Fill in the blank with the most appropriate word: 'Academic writing generally requires a/an _____ tone.'",
      options: [
        "A. informal",
        "B. conversational",
        "C. objective",
        "D. subjective"
      ],
      answer: 2,
      explanation: "An objective tone is required in academic writing to maintain neutrality and focus on evidence."
    },
    {
      question: "Which of the following best describes a strong Thesis Statement?",
      options: [
        "A. A broad announcement of the essay's topic.",
        "B. A clear sentence stating your main argument and the direction of the essay.",
        "C. A rhetorical question inviting the reader to think.",
        "D. A direct quotation from an academic journal."
      ],
      answer: 1,
      explanation: "A strong thesis statement must take a clear position and outline the main points that will be argued in the essay."
    },
    {
      question: "Which pronoun should generally be avoided in formal academic writing to maintain objectivity?",
      options: [
        "A. It",
        "B. They",
        "C. I",
        "D. One"
      ],
      answer: 2,
      explanation: "Using 'I' or 'my' can make the writing sound too subjective. Passive voice or third-person pronouns are preferred."
    }
  ]
};

function LessonQuizPlayer({ lesson, isCompleted, onComplete }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  // Load questions based on lesson title or default
  const questions = MOCK_LESSON_QUIZZES[lesson.title] || MOCK_LESSON_QUIZZES["default"];

  // Reset state when lesson changes
  useEffect(() => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    setPassed(false);
  }, [lesson.id]);

  const handleSelect = (questionIndex, optionIndex) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    setScore(percent);
    setSubmitted(true);
    
    const isPass = percent >= 80;
    setPassed(isPass);

    if (isPass && !isCompleted) {
      // Auto complete the lesson
      onComplete();
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    setPassed(false);
  };

  return (
    <div className="mt-4 p-5 bg-slate-50/70 border border-slate-100 rounded-3xl font-sans mb-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
          ?
        </div>
        <div>
          <h4 className="text-[14.5px] font-extrabold text-slate-800">
            Trắc nghiệm đánh giá nhanh (Quick Quiz)
          </h4>
          <p className="text-[11px] text-slate-400">
            Trả lời đúng tối thiểu 80% số câu hỏi để hoàn thành bài học này.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, qIdx) => {
          const isCorrect = selectedAnswers[qIdx] === q.answer;
          const isWrong = submitted && selectedAnswers[qIdx] !== q.answer;
          
          return (
            <div key={qIdx} className="bg-white border border-slate-100/80 p-4 rounded-2xl shadow-sm">
              <h5 className="text-[13.5px] font-bold text-slate-800 mb-3 flex items-start gap-2">
                <span className="text-emerald-600 font-extrabold">Q{qIdx + 1}.</span>
                <span>{q.question}</span>
              </h5>

              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[qIdx] === oIdx;
                  let optionClass = "border-slate-100 bg-slate-50/30 hover:bg-slate-50";

                  if (isSelected) {
                    optionClass = "border-emerald-500 bg-emerald-50/30 text-emerald-800 font-semibold";
                  }

                  if (submitted) {
                    if (oIdx === q.answer) {
                      optionClass = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                    } else if (isSelected && isWrong) {
                      optionClass = "border-red-400 bg-red-50/60 text-red-800";
                    } else {
                      optionClass = "border-slate-100 bg-white text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelect(qIdx, oIdx)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl border text-[13px] transition-all cursor-pointer flex items-center justify-between ${optionClass}`}
                    >
                      <span>{opt}</span>
                      {submitted && oIdx === q.answer && (
                        <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {submitted && isSelected && isWrong && (
                        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
                  <span className="font-bold text-slate-700 block mb-0.5">Giải thích:</span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between flex-wrap gap-3 border-t border-slate-100 pt-4">
        {submitted ? (
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              passed ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"
            }`}>
              {passed ? `Đạt: ${score}%` : `Chưa đạt: ${score}%`}
            </span>
            {!passed && (
              <button
                type="button"
                onClick={handleRetry}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold underline cursor-pointer"
              >
                Làm lại
              </button>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 font-medium">
            Đã chọn {Object.keys(selectedAnswers).length}/{questions.length} câu trả lời
          </div>
        )}

        {!submitted && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < questions.length}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Nộp bài & Kiểm tra
          </button>
        )}
      </div>
    </div>
  );
}

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
  const [showCongrats, setShowCongrats] = useState(false);
  const [courseInfo, setCourseInfo] = useState({ courseTitle: "Đang tải...", instructor: "" });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [essayText, setEssayText] = useState("");
  const [gradingEssay, setGradingEssay] = useState(false);
  const [essayResult, setEssayResult] = useState(null);
  const [essayHistory, setEssayHistory] = useState([]);

  // --- Extended Student Workspace States ---
  const [enrollmentType, setEnrollmentType] = useState(() => {
    return localStorage.getItem(`enrollmentType_${courseId}`) || null;
  });
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [activeTab, setActiveTab] = useState("lessons"); // "lessons" | "quizzes" | "peerReview" | "forum"

  // Notes state
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [noteTime, setNoteTime] = useState("");

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({ q1: "", q2: "", q3: "", q4: "", q5: "" });
  const [quizGrade, setQuizGrade] = useState(null);
  const [quizAttemptStatus, setQuizAttemptStatus] = useState(null); // "Passed" | "Failed" | null
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Peer review state
  const [peerSubmitted, setPeerSubmitted] = useState(false);
  const [peerAssignmentText, setPeerAssignmentText] = useState("");
  const [peerReviewsCount, setPeerReviewsCount] = useState(0);
  const [peerRubric, setPeerRubric] = useState({ criteria1: 5, criteria2: 5, feedback: "" });
  const [peerFinished, setPeerFinished] = useState(false);

  // Forum state
  const [discussionPosts, setDiscussionPosts] = useState([
    {
      id: 1,
      title: "Làm thế nào để học IELTS đạt band 7.5 nhanh nhất?",
      content: "Mình đang học lộ trình IELTS nhưng thấy phần Viết (Writing) và Nói (Speaking) tự ôn rất khó khăn. Mọi người có kinh nghiệm gì tự học tại nhà chia sẻ mình với ạ!",
      author: "Nguyễn Văn Chiến",
      upvotes: 8,
      upvoted: false,
      comments: [
        { author: "Trần Văn Mentor", content: "Hãy kết hợp viết luận ở mục AI Essay Sandbox trên hệ thống này nhé, AI chấm rất sát đấy." }
      ]
    },
    {
      id: 2,
      title: "Mẹo làm bài trắc nghiệm phần Listening trong TOEIC",
      content: "Có ai có mẹo nghe từ khóa tránh bẫy đồng âm ở Part 1 và Part 2 không ạ? Nghe bẫy nhiều quá sai liên tục.",
      author: "Lê Văn Tèo",
      upvotes: 4,
      upvoted: false,
      comments: []
    }
  ]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newCommentTexts, setNewCommentTexts] = useState({});

  // Rating and Certificate state
  const [showCertModal, setShowCertModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [courseCompleted, setCourseCompleted] = useState(false);

  useEffect(() => {
    if (!enrollmentType) {
      setShowEnrollModal(true);
    }
  }, [enrollmentType, courseId]);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const handleTakeNote = (time) => {
    setNoteTime(time);
    setNewNoteText(`[Ghi chú mốc ${time}]: `);
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    setNotes(prev => [...prev, { time: noteTime || "0:00", text: newNoteText }]);
    setNewNoteText("");
    setNoteTime("");
  };

  const handleEnrollSelect = (type) => {
    localStorage.setItem(`enrollmentType_${courseId}`, type);
    setEnrollmentType(type);
    setShowEnrollModal(false);
  };


  // Fetch essay history when currentLesson changes
  useEffect(() => {
    async function loadEssayHistory() {
      if (!currentUserId || !currentLessonId) return;
      const res = await studentFeatureService.getEssayHistory(currentUserId);
      if (res.success && Array.isArray(res.data)) {
        const filtered = res.data.filter(sub => String(sub.nodeId?._id || sub.nodeId) === String(currentLessonId));
        setEssayHistory(filtered);
      }
    }
    loadEssayHistory();
    setEssayText("");
    setEssayResult(null);
  }, [currentLessonId, currentUserId]);

      // Fetch learning data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5050/api/courses/${courseId}/learning`, {
          headers: {
            "x-user-id": currentUserId,
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        const result = await res.json();

        if (!result.success) {
          if (res.status === 403) {
            navigate(`/courses/${courseId}`);
          }
          return;
        }

        setCourseInfo({ courseTitle: result.courseTitle, instructor: result.instructor });
        const mapped = result.data.map((mod, ci) => ({
            id: mod._id || mod.PathId,
            index: ci + 1,
            title: mod.pathName || mod.PathName,
            description: String(mod.description ?? mod.Description ?? "").trim(),

            lessons: (mod.Nodes || mod.lessons || []).map((lesson, li) => {
              // Determine lesson type from materials & title
              const materials = lesson.Materials || [];
              const firstMaterial = materials[0];
              const materialType = firstMaterial?.materialType || lesson.MaterialType || "TEXT";
              const materialUrl = firstMaterial?.materialUrl || lesson.MaterialUrl || null;
              const embedUrl = firstMaterial?.embedUrl || null;
              const contentBody = lesson.content || lesson.Content || firstMaterial?.content || null;

              const titleLower = (lesson.nodeName || lesson.NodeName || "").toLowerCase();
              let lessonUiType = mapMaterialTypeToUi(materialType);
              if (titleLower.includes("quiz") || titleLower.includes("test") || titleLower.includes("assessment")) {
                lessonUiType = "quiz";
              }

              return {
                id: lesson._id || lesson.NodeId,
                index: li + 1,
                title: lesson.nodeName || lesson.NodeName,
                description: String(lesson.description ?? lesson.Description ?? "").trim(),

                type: lessonUiType,
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
      } catch (err) {
        console.error("Fetch learning error:", err);
      }
    };
    fetchData();
  }, [courseId, currentUserId, navigate]);

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
    })();
    return () => { cancelled = true; };
  }, [courseId, modules, courseInfo.courseTitle]);

  const allLessons = useMemo(() => flatLessons(modules), [modules]);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const { lesson: currentLesson, mod: currentMod } = findLessonAndModule(modules, currentLessonId);
  const progress = useMemo(() => computeProgress(modules), [modules]);

  // Kiểm tra hoàn thành khoá học — đặt SAU khai báo progress
  useEffect(() => {
    if (modules.length > 0 && progress === 100 && !courseCompleted) {
      setCourseCompleted(true);
      setShowCongrats(true);
    }
  }, [progress, modules, courseCompleted]);

  const handleToggleComplete = async () => {
    if (!currentLesson) return;
    try {
      const res = await fetch(`http://localhost:5050/api/courses/${courseId}/progress`, {
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

  // Xác nhận hoàn thành toàn bộ khoá học — set progressPercentage = 100
  const handleConfirmCourseComplete = async () => {
    try {
      const res = await fetch(`http://localhost:5050/api/courses/${courseId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": currentUserId },
      });
      const result = await res.json();
      if (result.success) {
        // Đánh dấu tất cả bài = completed trên UI
        setModules((prev) =>
          prev.map((mod) => ({
            ...mod,
            lessons: mod.lessons.map((l) => ({ ...l, status: "completed" })),
          }))
        );
        // Hiện overlay chúc mừng ngay lập tức
        setShowCongrats(true);
      }
    } catch (err) {
      console.error("Complete course error:", err);
    }
  };

  const handleGradeEssay = async () => {
    if (!essayText.trim() || !currentUserId || !currentLesson) return;
    setGradingEssay(true);
    const res = await studentFeatureService.submitEssay(
      currentUserId,
      courseId,
      currentLesson.id,
      essayText
    );
    setGradingEssay(false);
    if (res.success) {
      setEssayResult(res.data);
      setEssayHistory(prev => [res.data, ...prev]);
      setEssayText("");
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

  // Bài cuối của chương hiện tại
  const isLastInChapter = currentMod && currentLesson
    ? currentMod.lessons[currentMod.lessons.length - 1]?.id === currentLessonId
    : false;

  // Bài cuối của toàn khoá học
  const isLastInCourse = allLessons.length > 0
    ? allLessons[allLessons.length - 1]?.id === currentLessonId
    : false;

  // Tất cả bài trong chương đã hoàn thành
  const isChapterAllDone = currentMod
    ? currentMod.lessons.every(l => l.status === "completed")
    : false;


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

      {/* ══════════════════════════════════════════════════════
          CONGRATULATIONS OVERLAY — Full screen
      ══════════════════════════════════════════════════════ */}
      {showCongrats && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        >
          {/* Card */}
          <div
            className="relative mx-4 w-full max-w-md rounded-3xl p-8 flex flex-col items-center gap-5 text-center shadow-2xl"
            style={{
              background: "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              animation: "congratsIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
            }}
          >
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-3xl" style={{
              background: "radial-gradient(ellipse at top, rgba(250,204,21,0.15) 0%, transparent 60%)",
              pointerEvents: "none",
            }} />

            {/* Trophy icon with glow */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-xl opacity-60" style={{ background: "#fbbf24", transform: "scale(1.4)" }} />
              <div className="relative w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
                <Trophy size={52} weight="fill" color="#fff" />
              </div>
            </div>

            {/* Stars decoration */}
            <div className="flex gap-2">
              {[0,1,2,3,4].map(i => (
                <Star key={i} size={i === 2 ? 22 : 16} weight="fill" color={i === 2 ? "#fbbf24" : "#fde68a"} />
              ))}
            </div>

            {/* Text */}
            <div className="space-y-2">
              <p className="text-2xl font-black text-white tracking-tight">
                🎉 Chúc mừng!
              </p>
              <p className="text-base font-bold text-amber-300">
                Bạn đã hoàn thành khoá học
              </p>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                <span className="text-white font-semibold">{courseInfo.courseTitle}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full mt-1">
              <button
                onClick={() => {
                  setShowCongrats(false);
                  if (enrollmentType === "certificate") {
                    setShowCertModal(true);
                  } else {
                    setShowRatingModal(true);
                  }
                }}
                className="w-full py-3.5 rounded-2xl text-[14px] font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444)", boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}
              >
                🎓 Nhận chứng chỉ & Đánh giá
              </button>
              <button
                onClick={() => setShowCongrats(false)}
                className="w-full py-3 rounded-2xl text-[13px] font-semibold text-slate-400 transition-all hover:text-white hover:bg-white/5"
              >
                Ở lại trang học
              </button>
            </div>
          </div>

          {/* CSS animation */}
          <style>{`
            @keyframes congratsIn {
              from { opacity: 0; transform: scale(0.7) translateY(40px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      )}

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

      {/* ── Coursera Tabs Navigation ── */}
      <div className="flex border-b border-slate-200 mb-6 gap-6 text-[14px] font-bold text-slate-500 font-sans">
        <button
          type="button"
          onClick={() => setActiveTab("lessons")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "lessons" ? "text-emerald-600 border-emerald-600" : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          📚 Bài học & Giáo trình
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("quizzes")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "quizzes" ? "text-emerald-600 border-emerald-600" : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          📝 Bài kiểm tra
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("peerReview")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "peerReview" ? "text-emerald-600 border-emerald-600" : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          👥 Đánh giá đồng đẳng
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("forum")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "forum" ? "text-emerald-600 border-emerald-600" : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          💬 Diễn đàn thảo luận
        </button>
      </div>

      {/* ── Main Layout Panels ── */}
      {activeTab === "lessons" && (
        <div className="flex flex-col-reverse lg:flex-row gap-5 items-start">
          {/* ═══ MAIN CONTENT (LESSONS) ═══ */}
          <div className="flex-1 min-w-0 w-full space-y-4 font-sans">
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
                  <LessonVideoPlayer
                    url={currentLesson.videoUrl}
                    currentLessonId={currentLesson.id}
                    onTakeNote={handleTakeNote}
                  />
                </div>
              )}

              {/* Quiz Player */}
              {currentLesson?.type === "quiz" && (
                <LessonQuizPlayer
                  lesson={currentLesson}
                  isCompleted={isCompleted}
                  onComplete={handleToggleComplete}
                />
              )}

              {/* Note Taking Section */}
              {currentLesson?.type === "video" && (
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100/60">
                  <h5 className="text-[13px] font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    📝 Ghi chú của bạn ({notes.length})
                  </h5>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder={
                        noteTime
                          ? `Đang viết note tại phút ${noteTime}...`
                          : "Bấm nút 'Ghi chú' trên thanh phát video để gán mốc thời gian tự động..."
                      }
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500 text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={!newNoteText.trim()}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Lưu note
                    </button>
                  </div>
                  {notes.length > 0 && (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {notes.map((n, i) => (
                        <div key={i} className="flex gap-2 text-xs bg-white p-2 rounded-lg border border-slate-100">
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex-shrink-0">
                            {n.time}
                          </span>
                          <span className="text-slate-600 font-medium">{n.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
                  {currentLesson.type === "reading" && (
                    <div className="mt-6 flex justify-end">
                      <AppButton
                        size="small"
                        variant={isCompleted ? "outlined" : "contained"}
                        onClick={handleToggleComplete}
                        startIcon={<CheckCircle size={16} />}
                        style={isCompleted ? { color: SUCCESS, borderColor: SUCCESS } : { backgroundColor: SUCCESS, color: '#fff' }}
                      >
                        {isCompleted ? "Đã đọc xong" : "Đánh dấu hoàn thành bài đọc"}
                      </AppButton>
                    </div>
                  )}
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

              {/* AI Essay Sandbox Practice Workspace */}
              {currentLesson?.title?.includes("(Writing Practice)") && (
                <div className="mt-8 pt-6 border-t border-slate-100 font-sans">
                  <h4 className="flex items-center gap-1.5 text-[15px] font-extrabold text-slate-800 mb-3">
                    <Sparkle size={18} className="text-emerald-500 animate-pulse" weight="fill" />
                    Luyện viết luận & Chấm điểm tự động bằng AI (Hybrid Evaluation)
                  </h4>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Thực hành viết một đoạn văn ngắn hoặc bài luận liên quan đến nội dung bài học này. Trợ lý AI sẽ chấm điểm chi tiết theo 3 tiêu chí: Ngữ pháp, Từ vựng, và Độ mạch lạc của bài viết.
                  </p>

                  <textarea
                    value={essayText}
                    onChange={(e) => setEssayText(e.target.value)}
                    placeholder="Nhập bài viết bằng tiếng Anh của bạn tại đây (tối thiểu 30 từ)..."
                    disabled={gradingEssay}
                    rows={5}
                    className="w-full border border-slate-200/80 rounded-2xl p-4 text-[13.5px] outline-none resize-y transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 mb-4"
                  />

                  <div className="flex justify-end mb-6">
                    <AppButton
                      size="small"
                      variant="contained"
                      onClick={handleGradeEssay}
                      disabled={gradingEssay || essayText.trim().length < 15}
                      style={{ backgroundColor: '#10b981', color: '#fff' }}
                    >
                      {gradingEssay ? 'Đang chấm điểm bằng AI...' : 'Nộp bài & Chấm điểm AI'}
                    </AppButton>
                  </div>

                  {/* Grading Result */}
                  {essayResult && (
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-8 animate-fadeIn">
                      <h5 className="text-[14px] font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                        <Trophy size={16} className="text-amber-500" weight="fill" />
                        Kết quả chấm điểm AI:
                      </h5>
                      
                      {/* Scores grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center shadow-sm">
                          <p className="text-2xl font-black text-emerald-600">{essayResult.score}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Tổng điểm</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center shadow-sm">
                          <p className="text-2xl font-black text-indigo-500">{essayResult.grammarScore}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Ngữ pháp</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center shadow-sm">
                          <p className="text-2xl font-black text-purple-500">{essayResult.vocabularyScore}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Từ vựng</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center shadow-sm">
                          <p className="text-2xl font-black text-pink-500">{essayResult.coherenceScore}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Mạch lạc</p>
                        </div>
                      </div>

                      {/* Feedback */}
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                        <p className="text-xs font-bold text-slate-700 mb-2">Nhận xét chi tiết:</p>
                        <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{essayResult.feedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Submissions History */}
                  {essayHistory.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-[13px] font-bold text-slate-700 mb-3">Lịch sử làm bài ({essayHistory.length} lượt):</h5>
                      <div className="space-y-2.5">
                        {essayHistory.map((sub, idx) => (
                          <div key={sub._id || idx} className="border border-slate-100 rounded-2xl p-4 hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[11px] text-slate-400">
                                Nộp ngày: {new Date(sub.createdAt || sub.submittedAt).toLocaleDateString('vi-VN')} {new Date(sub.createdAt || sub.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                Điểm: {sub.score}/100
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 italic line-clamp-2 mb-2 font-medium">"{sub.essayText}"</p>
                            <p className="text-[11px] text-slate-400 bg-white border border-slate-50 p-2 rounded-xl mt-1 leading-relaxed"><strong className="text-slate-500">AI:</strong> {sub.feedback}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

                {/* Nút Đánh dấu hoàn thành hoặc Hoàn tất khoá học */}
                {isLastInCourse ? (
                  <AppButton
                    size="small"
                    variant={progress === 100 ? "outlined" : "contained"}
                    onClick={handleConfirmCourseComplete}
                    startIcon={<Trophy size={16} />}
                    className="min-w-[190px] font-semibold animate-pulse"
                    style={
                      progress === 100
                        ? { borderColor: "rgba(245,158,11,0.5)", color: "#d97706", backgroundColor: "rgba(245,158,11,0.08)" }
                        : { backgroundColor: "#f59e0b", color: "#fff", boxShadow: "0 2px 8px rgba(245,158,11,0.28)" }
                    }
                  >
                    {progress === 100 ? "Đã hoàn thành khóa học" : "Hoàn tất khoá học"}
                  </AppButton>
                ) : (
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
                )}


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

              {/* ── Banner: Hoàn thành chương (bài cuối chương, chưa phải bài cuối khoá) ── */}
              {isLastInChapter && !isLastInCourse && isChapterAllDone && (
                <div
                  className="mt-5 rounded-2xl p-5 border flex flex-col items-center gap-3 text-center"
                  style={{
                    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                    borderColor: "rgba(22,163,74,0.25)",
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                    <CheckCircle size={26} weight="fill" color="#fff" />
                  </div>
                  <div>
                    <p className="text-[15px] font-extrabold text-emerald-800">
                      🎉 Bạn đã hoàn thành chương này!
                    </p>
                    <p className="text-[12px] text-emerald-600 mt-1">
                      Chương <strong>{currentMod?.title}</strong> đã xong. Tiếp tục chương tiếp theo nhé!
                    </p>
                  </div>
                  <button
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-md transition-all hover:scale-[1.03] active:scale-95"
                    style={{ background: "linear-gradient(90deg,#16a34a,#10b981)" }}
                  >
                    Chuyển sang chương tiếp theo →
                  </button>
                </div>
              )}



            </div>
          </div>


          {/* ═══ SIDEBAR ═══ */}
          <div className="w-full lg:w-[360px] flex-shrink-0 font-sans">
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

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Quizzes (Bài kiểm tra) */}
      {activeTab === "quizzes" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 max-w-3xl mx-auto font-sans">
          <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">📝 Bài kiểm tra đánh giá kiến thức</h3>
              <p className="text-xs text-slate-400 mt-1">Trả lời đúng từ 4/5 câu hỏi (&gt;= 80%) để hoàn thành bài test.</p>
            </div>
            {quizAttemptStatus && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                quizAttemptStatus === "Passed" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {quizAttemptStatus === "Passed" ? "Passed (Đã Đạt)" : "Failed (Không Đạt)"}
              </span>
            )}
          </div>

          <div className="space-y-6">
            {/* Question 1 */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Câu 1: Choose the correct spelling for the blank: "They found a luxury ___ in London."</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: "A. Accommodation", val: "A" },
                  { label: "B. Acomodation", val: "B" },
                  { label: "C. Accomodation", val: "C" },
                  { label: "D. Acommodation", val: "D" }
                ].map((opt) => (
                  <label
                    key={opt.val}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      quizAnswers.q1 === opt.val ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="q1"
                      value={opt.val}
                      checked={quizAnswers.q1 === opt.val}
                      onChange={() => setQuizAnswers(prev => ({ ...prev, q1: opt.val }))}
                      disabled={cooldownRemaining > 0}
                      className="accent-emerald-600"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Câu 2: Choose the word closest in meaning to 'abundant':</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: "A. Plentiful", val: "A" },
                  { label: "B. Scarce", val: "B" },
                  { label: "C. Rare", val: "C" },
                  { label: "D. Small", val: "D" }
                ].map((opt) => (
                  <label
                    key={opt.val}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      quizAnswers.q2 === opt.val ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="q2"
                      value={opt.val}
                      checked={quizAnswers.q2 === opt.val}
                      onChange={() => setQuizAnswers(prev => ({ ...prev, q2: opt.val }))}
                      disabled={cooldownRemaining > 0}
                      className="accent-emerald-600"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Question 3 */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Câu 3: Complete: "If it rains tomorrow, we ___ the picnic."</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: "A. will cancel", val: "A" },
                  { label: "B. would cancel", val: "B" },
                  { label: "C. cancel", val: "C" },
                  { label: "D. canceled", val: "D" }
                ].map((opt) => (
                  <label
                    key={opt.val}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      quizAnswers.q3 === opt.val ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="q3"
                      value={opt.val}
                      checked={quizAnswers.q3 === opt.val}
                      onChange={() => setQuizAnswers(prev => ({ ...prev, q3: opt.val }))}
                      disabled={cooldownRemaining > 0}
                      className="accent-emerald-600"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Question 4 */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Câu 4: What is the past participle of 'write'?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: "A. Written", val: "A" },
                  { label: "B. Wrote", val: "B" },
                  { label: "C. Writing", val: "C" },
                  { label: "D. Writed", val: "D" }
                ].map((opt) => (
                  <label
                    key={opt.val}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      quizAnswers.q4 === opt.val ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="q4"
                      value={opt.val}
                      checked={quizAnswers.q4 === opt.val}
                      onChange={() => setQuizAnswers(prev => ({ ...prev, q4: opt.val }))}
                      disabled={cooldownRemaining > 0}
                      className="accent-emerald-600"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Question 5 */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Câu 5: Which of the following is a synonym of 'implement'?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: "A. Execute", val: "A" },
                  { label: "B. Delay", val: "B" },
                  { label: "C. Ignore", val: "C" },
                  { label: "D. Destroy", val: "D" }
                ].map((opt) => (
                  <label
                    key={opt.val}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      quizAnswers.q5 === opt.val ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="q5"
                      value={opt.val}
                      checked={quizAnswers.q5 === opt.val}
                      onChange={() => setQuizAnswers(prev => ({ ...prev, q5: opt.val }))}
                      disabled={cooldownRemaining > 0}
                      className="accent-emerald-600"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            {cooldownRemaining > 0 ? (
              <span className="text-xs text-red-500 font-extrabold flex items-center gap-1">
                ⚠️ Bị khóa bài (Cool-down hình phạt)! Hãy thử lại sau {cooldownRemaining} giây nữa...
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">
                Vui lòng điền đủ 5 đáp án trước khi bấm Nộp bài.
              </span>
            )}

            <button
              type="button"
              disabled={cooldownRemaining > 0 || !quizAnswers.q1 || !quizAnswers.q2 || !quizAnswers.q3 || !quizAnswers.q4 || !quizAnswers.q5}
              onClick={() => {
                let score = 0;
                if (quizAnswers.q1 === "A") score += 20;
                if (quizAnswers.q2 === "A") score += 20;
                if (quizAnswers.q3 === "A") score += 20;
                if (quizAnswers.q4 === "A") score += 20;
                if (quizAnswers.q5 === "A") score += 20;

                setQuizGrade(score);
                if (score >= 80) {
                  setQuizAttemptStatus("Passed");
                  // Update modules state to show completed
                  setModules(prev =>
                    prev.map(mod => ({
                      ...mod,
                      lessons: mod.lessons.map(l =>
                        l.type === "quiz" ? { ...l, status: "completed" } : l
                      )
                    }))
                  );
                } else {
                  setQuizAttemptStatus("Failed");
                  setCooldownRemaining(10); // 10s cooldown penalty for testing
                }
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Nộp bài đánh giá
            </button>
          </div>

          {quizGrade !== null && (
            <div className={`mt-6 p-4 rounded-2xl border ${
              quizGrade >= 80 ? "bg-emerald-50/50 border-emerald-100 text-emerald-800" : "bg-red-50/50 border-red-100 text-red-800"
            } text-xs font-bold`}>
              {quizGrade >= 80 ? (
                <span>🎉 Chúc mừng! Bạn đạt {quizGrade}% điểm. Bạn đã hoàn thành xuất sắc bài kiểm tra này.</span>
              ) : (
                <span>❌ Rất tiếc, bạn chỉ đạt {quizGrade}% điểm (yêu cầu &gt;= 80%). Hệ thống đã kích hoạt khóa cool-down tạm thời.</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Peer Review (Đánh giá đồng đẳng) */}
      {activeTab === "peerReview" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 max-w-3xl mx-auto font-sans">
          <h3 className="text-base font-extrabold text-slate-800 mb-2">👥 Bài tập đồng đẳng (Peer-graded Assignment)</h3>
          <p className="text-xs text-slate-400 mb-6 border-b border-slate-100 pb-4">
            Bước 1: Bạn nộp bài làm của mình. Bước 2: Chấm điểm bài làm của 3 bạn học khác để hoàn thành nhiệm vụ.
          </p>

          {!peerSubmitted ? (
            <div className="space-y-4">
              <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 text-xs text-emerald-800">
                <strong>Đề bài luận:</strong> "Write an essay (100-150 words) describing a major technology advancement that changed the education system."
              </div>
              <textarea
                value={peerAssignmentText}
                onChange={(e) => setPeerAssignmentText(e.target.value)}
                placeholder="Nhập bài viết dự án của bạn tại đây để nộp..."
                rows={6}
                className="w-full border border-slate-200 rounded-2xl p-4 text-[13.5px] outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={peerAssignmentText.trim().length < 20}
                  onClick={() => setPeerSubmitted(true)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Nộp dự án của tôi
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-bold">
                ✓ Dự án của bạn đã được nộp thành công! Hãy tiến hành chấm bài của các bạn học khác.
              </div>

              {peerReviewsCount < 3 ? (
                <div className="space-y-4 border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-700">
                      Bài làm của bạn học ngẫu nhiên #{peerReviewsCount + 1}:
                    </span>
                    <span className="text-[11px] font-bold text-cyan-600">
                      Tiến độ: {peerReviewsCount}/3 bài đã chấm
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 leading-relaxed italic">
                    {peerReviewsCount === 0 && `"Technology has transformed schools. Online classes and interactive dashboards like Coursera allow students around the world to access lessons anytime, making education globally available."`}
                    {peerReviewsCount === 1 && `"Using AI is very helpful. Students write essays and get immediate grading from AI assistants, which helps improve grammar and writing skills step by step."`}
                    {peerReviewsCount === 2 && `"Peer review is a unique system. We learn not only by receiving grades from professors, but also by reading and scoring projects of our classmate peers."`}
                  </p>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <h5 className="text-xs font-bold text-slate-700">Biểu mẫu Rubric đánh giá:</h5>
                    
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Tiêu chí 1: Độ chuẩn xác ngữ pháp (Grammar):</span>
                      <select
                        value={peerRubric.criteria1}
                        onChange={(e) => setPeerRubric(prev => ({ ...prev, criteria1: parseInt(e.target.value) }))}
                        className="bg-white border rounded px-2 py-1"
                      >
                        {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v} sao</option>)}
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Tiêu chí 2: Mạch lạc & Bố cục (Coherence):</span>
                      <select
                        value={peerRubric.criteria2}
                        onChange={(e) => setPeerRubric(prev => ({ ...prev, criteria2: parseInt(e.target.value) }))}
                        className="bg-white border rounded px-2 py-1"
                      >
                        {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v} sao</option>)}
                      </select>
                    </div>

                    <textarea
                      value={peerRubric.feedback}
                      onChange={(e) => setPeerRubric(prev => ({ ...prev, feedback: e.target.value }))}
                      placeholder="Ý kiến góp ý bằng tiếng Anh cho bạn học..."
                      rows={3}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none"
                    />

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setPeerReviewsCount(prev => prev + 1);
                          setPeerRubric({ criteria1: 5, criteria2: 5, feedback: "" });
                          if (peerReviewsCount + 1 >= 3) {
                            setPeerFinished(true);
                            // Mark lessons of peer types completed
                            setModules(prev =>
                              prev.map(mod => ({
                                ...mod,
                                lessons: mod.lessons.map(l =>
                                  l.type === "doc" || l.type === "text" ? { ...l, status: "completed" } : l
                                )
                              }))
                            );
                          }
                        }}
                        className="px-5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                      >
                        Gửi chấm điểm
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                  <Trophy size={48} className="text-amber-500 mx-auto mb-2" weight="fill" />
                  <h4 className="text-[14px] font-bold text-slate-800">Đã hoàn thành đánh giá đồng đẳng!</h4>
                  <p className="text-xs text-slate-500 mt-1">Cảm ơn bạn đã đóng góp đánh giá bài làm cho 3 bạn học khác.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Forum (Diễn đàn thảo luận) */}
      {activeTab === "forum" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 max-w-3xl mx-auto font-sans">
          <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">💬 Diễn đàn học viên Coursera</h3>
              <p className="text-xs text-slate-400 mt-1">Trao đổi thắc mắc, bình luận đóng góp ý kiến bài học cùng cộng đồng.</p>
            </div>
          </div>

          {/* Create New Post form */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-6">
            <h5 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              🖊 Tạo bài đăng thảo luận mới
            </h5>
            <input
              type="text"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="Nhập tiêu đề câu hỏi/bài viết thảo luận..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500 mb-2 text-slate-700 font-medium"
            />
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Nhập chi tiết nội dung thảo luận..."
              rows={3}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-emerald-500 mb-3 text-slate-700"
            />
            <div className="flex justify-end">
              <button
                type="button"
                disabled={!newPostTitle.trim() || !newPostContent.trim()}
                onClick={() => {
                  const newPost = {
                    id: Date.now(),
                    title: newPostTitle,
                    content: newPostContent,
                    author: user.fullName || "Student",
                    upvotes: 0,
                    upvoted: false,
                    comments: []
                  };
                  setDiscussionPosts([newPost, ...discussionPosts]);
                  setNewPostTitle("");
                  setNewPostContent("");
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Đăng bài viết
              </button>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {discussionPosts.map((post) => (
              <div key={post.id} className="border border-slate-100 rounded-2xl p-4 hover:border-slate-200 transition-all bg-white shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{post.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">Đăng bởi: <b>{post.author}</b></p>
                    <p className="text-xs text-slate-600 mt-3 whitespace-pre-wrap">{post.content}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDiscussionPosts(prev =>
                        prev.map(p => {
                          if (p.id === post.id) {
                            return {
                              ...p,
                              upvotes: p.upvoted ? p.upvotes - 1 : p.upvotes + 1,
                              upvoted: !p.upvoted
                            };
                          }
                          return p;
                        })
                      );
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all ${
                      post.upvoted ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <ThumbsUp size={12} weight={post.upvoted ? "fill" : "regular"} />
                    {post.upvotes}
                  </button>
                </div>

                {/* Post comments */}
                <div className="mt-4 border-t border-slate-50 pt-3 pl-4 space-y-2">
                  {post.comments.map((c, ci) => (
                    <div key={ci} className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-50 text-[11px] leading-relaxed">
                      <span className="font-bold text-slate-700 block mb-0.5">{c.author}:</span>
                      <span className="text-slate-600">{c.content}</span>
                    </div>
                  ))}

                  {/* Add comment */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newCommentTexts[post.id] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewCommentTexts(prev => ({ ...prev, [post.id]: val }));
                      }}
                      placeholder="Viết câu trả lời hoặc góp ý của bạn..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500 text-slate-700"
                    />
                    <button
                      type="button"
                      disabled={!(newCommentTexts[post.id] || "").trim()}
                      onClick={() => {
                        const cText = newCommentTexts[post.id];
                        setDiscussionPosts(prev =>
                          prev.map(p => {
                            if (p.id === post.id) {
                              return {
                                ...p,
                                comments: [...p.comments, { author: user.fullName || "Student", content: cText }]
                              };
                            }
                            return p;
                          })
                        );
                        setNewCommentTexts(prev => ({ ...prev, [post.id]: "" }));
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Bình luận
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── MODAL 1: CHỌN ĐĂNG KÝ HỌC (Enroll Mode Selector) ─── */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl font-sans text-center relative border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-1">Chào mừng bạn đến với khóa học 🚀</h3>
            <p className="text-xs text-slate-400 mb-6">Hãy lựa chọn hình thức đăng ký học tập phù hợp nhất với bạn:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Audit Card */}
              <div
                onClick={() => handleEnrollSelect("audit")}
                className="border border-slate-100 p-5 rounded-2xl text-center cursor-pointer transition-all hover:border-emerald-200 hover:bg-emerald-50/10 group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-50">
                  <BookOpen size={20} className="text-slate-500 group-hover:text-emerald-600" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-800">Audit Course</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">Học thử đầy đủ bài học miễn phí. Không nhận chứng chỉ.</p>
                <span className="inline-block mt-3 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Miễn phí</span>
              </div>

              {/* Certificate Card */}
              <div
                onClick={() => handleEnrollSelect("certificate")}
                className="border border-slate-100 p-5 rounded-2xl text-center cursor-pointer transition-all hover:border-emerald-300 hover:bg-emerald-50/20 group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <Certificate size={20} className="text-emerald-600" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-800">Certificate Mode</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">Mở khóa chứng chỉ số khi hoàn thành 100% giáo trình khóa học.</p>
                <span className="inline-block mt-3 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Có chứng chỉ</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              * Bạn có thể chọn Audit để học thử trước rồi nâng cấp lên Certificate bất cứ lúc nào.
            </p>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: CHỨNG CHỈ SỐ HOÀN THÀNH KHÓA HỌC (Certificate Modal) ─── */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl font-sans relative border-4 border-emerald-600/30">
            
            <div className="border border-slate-150 p-6 rounded-2xl bg-slate-50 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/30 rounded-full blur-2xl" />
              
              <Certificate size={48} className="text-emerald-600 mx-auto mb-3" />
              <h4 className="text-sm font-black text-emerald-700 tracking-wider uppercase mb-1">CHỨNG CHỈ HOÀN THÀNH</h4>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase mb-6">ĐƯỢC CẤP BỞI ENGLISH MASTER & COURSERA</p>

              <p className="text-xs text-slate-500 italic mb-1">Chứng nhận học viên:</p>
              <h3 className="text-lg font-black text-slate-800 mb-2 border-b border-slate-200 pb-2 max-w-xs mx-auto">
                {user.fullName || "Lê Văn Student"}
              </h3>

              <p className="text-xs text-slate-500 mb-2">Đã hoàn thành xuất sắc khóa học trực tuyến:</p>
              <h4 className="text-sm font-extrabold text-slate-800 mb-6">
                {courseInfo.courseTitle}
              </h4>

              <div className="flex justify-between items-center text-[10px] text-slate-400 px-6">
                <div>
                  <p className="font-bold text-slate-500">{courseInfo.instructor || "Trần Văn Mentor"}</p>
                  <p className="border-t border-slate-200 pt-0.5 mt-0.5">Giảng viên hướng dẫn</p>
                </div>
                <div>
                  <p className="font-bold text-slate-500">{new Date().toLocaleDateString('vi-VN')}</p>
                  <p className="border-t border-slate-200 pt-0.5 mt-0.5">Ngày cấp chứng chỉ</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  alert("Chúc mừng! Đã chia sẻ chứng chỉ thành công lên LinkedIn.");
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Chia sẻ lên LinkedIn
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCertModal(false);
                  setShowRatingModal(true); // Open feedback modal next
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: ĐÁNH GIÁ KHÓA HỌC (Rating & Review Popup) ─── */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl font-sans text-center relative border border-slate-100">
            <h3 className="text-base font-extrabold text-slate-800 mb-2">⭐ Đánh giá khóa học của bạn</h3>
            <p className="text-xs text-slate-400 mb-4">Hãy chia sẻ trải nghiệm học tập của bạn để giúp chúng mình cải thiện nhé!</p>

            <div className="flex justify-center gap-1.5 mb-5 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingStars(star)}
                  className="bg-transparent border-0 outline-none cursor-pointer transform hover:scale-125 transition-transform"
                >
                  <Star size={24} weight={star <= ratingStars ? "fill" : "regular"} />
                </button>
              ))}
            </div>

            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Nhập cảm nghĩ, nhận xét ngắn của bạn về bài học và giảng viên..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-emerald-500 mb-4 text-slate-700"
            />

            <button
              type="button"
              onClick={() => {
                alert("Cảm ơn bạn đã đánh giá khóa học!");
                setShowRatingModal(false);
                navigate("/my-courses");
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Gửi nhận xét
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
