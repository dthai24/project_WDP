import React, { useState, useEffect } from "react";
import { ArrowLeft, Play, FileText, HelpCircle, CheckCircle2, Lock, ChevronRight, ChevronLeft, BookOpen, Download, Eye, Menu, X, Clock, Award, Sparkles, Star, Edit } from "lucide-react";
import { curriculumData, lessonDocuments, lessonQuizQuestions, getLearningProgress, markLessonComplete, saveQuizScore, getMentorCurriculum } from "../../services/data";
import QuizEngine from "../../components/common/QuizEngine";

export default function CoursePlayer({ course, curriculum: propCurriculum, onNavigate, onBack }) {
  // Check if this is a mentor course with custom curriculum
  const mentorCurriculum = course?.mentorCourse ? getMentorCurriculum(course.id) : null;
  const curriculum = propCurriculum && propCurriculum.length > 0 ? propCurriculum : (mentorCurriculum || curriculumData);
  const [activeTab, setActiveTab] = useState("video");
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  
  // Custom progress and leave blocking state variables
  const [currentUser, setCurrentUser] = useState(null);
  const [essayText, setEssayText] = useState("");

  // Load user session
  useEffect(() => {
    const userStr = localStorage.getItem("lexiora_user") || localStorage.getItem("learnpath_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Error parsing user session:", e);
      }
    }
  }, []);

  // Load progress from localStorage
  useEffect(() => {
    const progress = getLearningProgress();
    setCompletedLessons(new Set(progress.completedLessons));
  }, []);

  // Set first lesson as active on mount
  useEffect(() => {
    if (!activeLesson && curriculum.length > 0 && curriculum[0].lessons.length > 0) {
      const firstLesson = curriculum[0].lessons[0];
      setActiveLesson(firstLesson);
      setActiveTab(firstLesson.type === "quiz" ? "quiz" : firstLesson.type === "essay" ? "essay" : "video");
    }
  }, [curriculum]);

  // Load essay draft for active lesson
  useEffect(() => {
    if (!currentUser || !activeLesson || activeLesson.type !== "essay") {
      setEssayText("");
      return;
    }
    const backupKey = `lexiora_course_essay_backup_${currentUser.email}_${activeLesson.id}`;
    const backup = localStorage.getItem(backupKey);
    if (backup) {
      setEssayText(backup);
    } else {
      setEssayText("");
    }
  }, [activeLesson, currentUser]);

  // Auto-save essay draft to localStorage
  useEffect(() => {
    if (!currentUser || !activeLesson || activeLesson.type !== "essay") return;
    const backupKey = `lexiora_course_essay_backup_${currentUser.email}_${activeLesson.id}`;
    if (essayText && essayText.trim().length > 0) {
      localStorage.setItem(backupKey, essayText);
    } else {
      localStorage.removeItem(backupKey);
    }
  }, [essayText, activeLesson, currentUser]);

  // Reset quiz result when switching lessons
  useEffect(() => {
    setQuizResult(null);
  }, [activeLesson]);

  const allLessons = curriculum.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === activeLesson?.id);

  // Check if there is active unsaved work
  const getUnsavedWorkType = () => {
    if (activeTab === "essay" && essayText.trim().length > 0) {
      return "essay";
    }
    if (currentUser?.email) {
      const quizBackup = localStorage.getItem(`lexiora_quiz_backup_${currentUser.email}`);
      if (quizBackup) {
        try {
          const parsed = JSON.parse(quizBackup);
          if (parsed.quizStarted && !parsed.quizCompleted && Object.keys(parsed.answers || {}).length > 0) {
            return "quiz";
          }
        } catch (e) {}
      }
    }
    return null;
  };

  // Browser tab/window close warning (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (getUnsavedWorkType()) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [activeTab, essayText, currentUser]);

  // Expose active unsaved work status to window for global header navigation checks
  useEffect(() => {
    window.lexioraActiveUnsavedWork = getUnsavedWorkType();
    return () => {
      window.lexioraActiveUnsavedWork = null;
    };
  }, [essayText, activeLesson, activeTab, currentUser]);

  const handleLessonClick = (lesson) => {
    const unsaved = getUnsavedWorkType();
    if (unsaved) {
      const confirm = window.confirm(
        unsaved === "essay"
          ? "Bạn đang viết bài luận dở dang. Bạn có chắc chắn muốn chuyển sang bài học khác không?"
          : "Bạn đang làm bài trắc nghiệm dở dang. Bạn có chắc chắn muốn chuyển sang bài học khác không?"
      );
      if (!confirm) return;
    }
    setActiveLesson(lesson);
    setActiveTab(lesson.type === "quiz" ? "quiz" : lesson.type === "essay" ? "essay" : "video");
    setSidebarOpen(false);
  };

  const handleCompleteLesson = () => {
    if (activeLesson) {
      const progress = markLessonComplete(activeLesson.id);
      setCompletedLessons(new Set(progress.completedLessons));
    }
  };

  const handleNextLesson = () => {
    if (currentIndex < allLessons.length - 1) {
      const next = allLessons[currentIndex + 1];
      handleLessonClick(next);
    }
  };

  const handlePrevLesson = () => {
    if (currentIndex > 0) {
      const prev = allLessons[currentIndex - 1];
      handleLessonClick(prev);
    }
  };

  const handleQuizComplete = (result) => {
    setQuizResult(result);
    if (activeLesson) {
      saveQuizScore(activeLesson.id, result.correctCount, result.total);
    }
    handleCompleteLesson();
  };

  const getModuleForLesson = (lessonId) => {
    return curriculum.find(m => m.lessons.some(l => l.id === lessonId));
  };

  const renderVideoTab = () => (
    <div className="space-y-6">
      <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center relative group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        <Play className="w-16 h-16 text-white/80 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
        <span className="absolute bottom-4 right-4 text-white/60 text-xs font-semibold bg-black/40 px-3 py-1.5 rounded-lg">
          {activeLesson?.duration || "10:00"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-text-primary text-lg">{activeLesson?.title || "Noi dung bai hoc"}</h3>
          <p className="text-xs text-text-muted mt-0.5">{getModuleForLesson(activeLesson?.id)?.title}</p>
        </div>
        <button
          onClick={handleCompleteLesson}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            completedLessons.has(activeLesson?.id)
              ? "bg-success/10 text-success border border-success/20"
              : "bg-primary text-white hover:bg-primary-dark shadow-sm shadow-primary/20"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{completedLessons.has(activeLesson?.id) ? "Da hoan thanh" : "Hoan thanh"}</span>
        </button>
      </div>

      {/* Lesson navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrevLesson}
          disabled={currentIndex <= 0}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            currentIndex <= 0 ? "text-text-muted/40 cursor-not-allowed" : "text-text-secondary hover:text-primary border border-border/60 hover:border-primary/30"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Bai truoc</span>
        </button>
        <span className="text-[10px] font-semibold text-text-muted">
          {currentIndex + 1} / {allLessons.length}
        </span>
        <button
          onClick={handleNextLesson}
          disabled={currentIndex >= allLessons.length - 1}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            currentIndex >= allLessons.length - 1 ? "text-text-muted/40 cursor-not-allowed" : "text-text-secondary hover:text-primary border border-border/60 hover:border-primary/30"
          }`}
        >
          <span>Bai tiep</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderDocumentsTab = () => {
    // Check if current lesson has mentor document data
    const mentorDoc = activeLesson?.document;
    const hasMentorDoc = mentorDoc && (mentorDoc.title || mentorDoc.content);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-text-primary text-lg">Tai lieu bai hoc</h3>
            <p className="text-xs text-text-muted mt-0.5">Xem va tai tai lieu lien quan</p>
          </div>
        </div>

        {hasMentorDoc ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-border/60 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-surface-muted text-text-secondary hover:text-primary">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-bold text-text-primary text-sm mb-1">{mentorDoc.title || "Tai lieu bai hoc"}</h4>
                <div className="flex items-center gap-3 text-[10px] font-semibold text-text-muted">
                  <span className="uppercase">doc</span>
                  <span>1 trang</span>
                </div>
              </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white rounded-2xl border border-border/60 p-6 space-y-4">
              <div className="flex items-center gap-2 text-text-primary font-bold text-sm">
                <Eye className="w-4 h-4 text-primary" />
                <span>Xem truoc tai lieu</span>
              </div>
              <div className="bg-surface-muted rounded-xl p-6">
                <div className="border-b border-border/40 pb-3 mb-3">
                  <p className="text-xs font-bold text-text-primary">{mentorDoc.title || "Tai lieu bai hoc"}</p>
                </div>
                <p className="text-xs text-text-secondary whitespace-pre-wrap">{mentorDoc.content || "Chua co noi dung tai lieu."}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lessonDocuments.map((doc) => (
                <div key={doc.id} className="bg-white rounded-2xl border border-border/60 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      doc.type === "pdf" ? "bg-red-50 text-red-500" :
                      doc.type === "doc" ? "bg-blue-50 text-blue-500" :
                      "bg-purple-50 text-purple-500"
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-surface-muted text-text-secondary hover:text-primary">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-text-primary text-sm mb-1">{doc.title}</h4>
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-text-muted">
                    <span className="uppercase">{doc.type}</span>
                    <span>{doc.pages} trang</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Document Preview */}
            <div className="bg-white rounded-2xl border border-border/60 p-6 space-y-4">
              <div className="flex items-center gap-2 text-text-primary font-bold text-sm">
                <Eye className="w-4 h-4 text-primary" />
                <span>Xem truoc tai lieu</span>
              </div>
              <div className="bg-surface-muted rounded-xl p-6 space-y-4">
                <div className="border-b border-border/40 pb-3">
                  <p className="text-xs font-bold text-text-primary">Vocabulary List - Module 1</p>
                  <p className="text-[10px] text-text-muted">Trang 1/12</p>
                </div>
                <div className="space-y-3">
                  {[
                    { word: "Abandon", meaning: "Tu bo, roi bo", example: "They had to abandon the project." },
                    { word: "Benevolent", meaning: "Tot bung, nhan tu", example: "She is a benevolent person." },
                    { word: "Meticulous", meaning: "Ti mi, can than", example: "He is meticulous in his work." },
                    { word: "Pragmatic", meaning: "Thuc dung", example: "We need a pragmatic approach." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white transition-colors">
                      <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-primary">{item.word}</p>
                        <p className="text-[10px] text-text-muted">{item.meaning}</p>
                        <p className="text-[9px] text-text-muted/60 italic mt-0.5">"{item.example}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderQuizTab = () => {
    // Check if current lesson has mentor quiz questions
    const mentorQuestions = activeLesson?.questions;
    const quizQuestions = mentorQuestions && mentorQuestions.length > 0 ? mentorQuestions : lessonQuizQuestions;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-text-primary text-lg">Bai tap kiem tra</h3>
            <p className="text-xs text-text-muted mt-0.5">Tra loi {quizQuestions.length} cau hoi de cung co kien thuc</p>
          </div>
        </div>

        {quizResult ? (
          <div className="bg-white rounded-2xl border border-border/60 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${quizResult.passed ? "bg-success/10" : "bg-red-50"}`}>
                {quizResult.passed ? <Award className="w-6 h-6 text-success" /> : <HelpCircle className="w-6 h-6 text-red-500" />}
              </div>
              <div>
                <p className="font-bold text-text-primary">{quizResult.passed ? "Chuc mung!" : "Hay thu lai!"}</p>
                <p className="text-xs text-text-muted">{quizResult.correctCount}/{quizResult.total} cau dung</p>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${quizResult.passed ? "bg-success" : "bg-red-500"}`} style={{ width: `${quizResult.score}%` }} />
            </div>
            <button
              onClick={() => setQuizResult(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-all"
            >
              Lam lai
            </button>
          </div>
        ) : (
          <QuizEngine
            questions={quizQuestions}
            showInPage={true}
            passingScore={70}
            onComplete={handleQuizComplete}
          />
        )}
      </div>
    );
  };

  const handleBack = () => {
    const unsaved = getUnsavedWorkType();
    if (unsaved) {
      const confirm = window.confirm(
        unsaved === "essay"
          ? "Bạn đang viết bài luận dở dang. Nếu rời đi, bài luận sẽ được lưu nháp nhưng chưa được nộp. Bạn có chắc chắn muốn rời đi không?"
          : "Bạn đang làm bài thi trắc nghiệm dở dang. Nếu rời đi, tiến trình làm bài sẽ được lưu tạm thời nhưng chưa nộp. Bạn có chắc chắn muốn rời đi không?"
      );
      if (!confirm) return;
    }
    onBack();
  };

  const renderEssayTab = () => {
    const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;
    const promptText = activeLesson?.essayPrompt || "Some people think that online learning is more effective than traditional classroom learning. To what extent do you agree or disagree with this opinion?";
    
    const handleResetEssay = () => {
      if (window.confirm("Bạn có chắc chắn muốn xóa bản nháp hiện tại không? Hành động này không thể hoàn tác.")) {
        setEssayText("");
        if (currentUser?.email && activeLesson?.id) {
          localStorage.removeItem(`lexiora_course_essay_backup_${currentUser.email}_${activeLesson.id}`);
        }
      }
    };

    const handleSubmitEssay = () => {
      if (wordCount < 100) {
        alert("Bài viết của bạn quá ngắn (tối thiểu 100 từ). Vui lòng viết thêm trước khi nộp.");
        return;
      }
      alert("Chúc mừng! Bài luận của bạn đã được nộp thành công và đang chờ Mentor chấm điểm.");
      setEssayText("");
      if (currentUser?.email && activeLesson?.id) {
        localStorage.removeItem(`lexiora_course_essay_backup_${currentUser.email}_${activeLesson.id}`);
      }
      handleCompleteLesson();
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-text-primary text-lg">Bài tập viết luận (Essay)</h3>
          <p className="text-xs text-text-muted mt-0.5">Viết bài luận theo chủ đề bên dưới và nộp bài để được Mentor chấm điểm.</p>
        </div>

        <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl">
          <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Đề bài Essay (IELTS Writing Task)
          </h4>
          <p className="text-text-primary text-sm font-semibold leading-relaxed">
            "{promptText}"
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold text-text-muted tracking-wider">
            <span>BÀI VIẾT CỦA BẠN (Hệ thống tự động lưu nháp)</span>
            <span className="text-primary font-mono">{wordCount} từ</span>
          </div>
          <textarea
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            placeholder="Nhập nội dung bài luận của bạn tại đây (tối thiểu 100 từ)..."
            className="w-full p-5 rounded-2xl border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-text-primary text-sm resize-none leading-relaxed transition-all bg-white"
            style={{ height: "300px", minHeight: "200px" }}
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="text-text-muted text-[10px] flex items-center gap-1.5 font-bold">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Đã lưu tự động
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleResetEssay}
              disabled={essayText.trim().length === 0}
              className="px-5 py-2.5 border border-border hover:bg-slate-50 text-text-secondary text-xs font-bold rounded-xl transition-all disabled:opacity-30"
            >
              Xóa nháp
            </button>
            <button
              onClick={handleSubmitEssay}
              disabled={essayText.trim().length === 0}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-primary/20 disabled:opacity-50"
            >
              Nộp bài luận
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col lg:flex-row">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:bg-primary-dark transition-all active:scale-95"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Curriculum */}
      <div className={`${
        sidebarOpen ? "fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] shadow-2xl" : "hidden"
      } lg:block lg:w-80 xl:w-96 bg-white border-l border-border/40 overflow-y-auto shrink-0`}>
        <div className="sticky top-0 bg-white border-b border-border/30 p-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-text-primary text-sm">Noi dung khoa hoc</h3>
              <p className="text-[10px] text-text-muted font-semibold">{allLessons.length} bai hoc</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-surface-muted text-text-secondary">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-3 space-y-2">
          {curriculum.map((module) => (
            <div key={module.id} className="space-y-0.5">
              <div className="px-3 py-2.5">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{module.title}</p>
                <p className="text-[9px] text-text-muted/60 mt-0.5">{module.lessons.length} bai</p>
              </div>
              {module.lessons.map((lesson) => {
                const isActive = activeLesson?.id === lesson.id;
                const isCompleted = completedLessons.has(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 ${
                      isActive
                        ? "bg-primary/5 border border-primary/10"
                        : "hover:bg-surface-muted border border-transparent"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isCompleted ? "bg-success/10 text-success" :
                      isActive ? "bg-primary text-white" :
                      "bg-surface-muted text-text-muted"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : lesson.type === "video" ? (
                        <Play className="w-3.5 h-3.5" />
                      ) : lesson.type === "quiz" ? (
                        <HelpCircle className="w-3.5 h-3.5" />
                      ) : lesson.type === "essay" ? (
                        <Edit className="w-3.5 h-3.5" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold truncate ${isActive ? "text-primary" : "text-text-primary"}`}>
                        {lesson.title}
                      </p>
                      <p className="text-[9px] text-text-muted">{lesson.duration}</p>
                    </div>
                    {lesson.free && (
                      <span className="text-[8px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded shrink-0">Free</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-border/30 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={handleBack} className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quay lai</span>
            </button>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-primary truncate">{course?.title}</p>
              <p className="text-[9px] text-text-muted truncate">{activeLesson?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-text-muted bg-surface-muted px-2.5 py-1.5 rounded-lg">
              <Clock className="w-3 h-3" />
              {activeLesson?.duration || "10:00"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-border/30 px-6">
          <div className="flex gap-1">
            {(activeLesson?.type === "quiz"
              ? [{ id: "quiz", label: "Bai tap", icon: HelpCircle }]
              : activeLesson?.type === "essay"
              ? [
                  { id: "essay", label: "Viet bai luan", icon: FileText },
                  { id: "documents", label: "Tai lieu", icon: FileText }
                ]
              : [
                  { id: "video", label: "Video", icon: Play },
                  { id: "documents", label: "Tai lieu", icon: FileText },
                  { id: "quiz", label: "Bai tap", icon: HelpCircle }
                ]
            ).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 max-w-4xl">
          {activeTab === "video" && renderVideoTab()}
          {activeTab === "documents" && renderDocumentsTab()}
          {activeTab === "quiz" && renderQuizTab()}
          {activeTab === "essay" && renderEssayTab()}
        </div>
      </div>
    </div>
  );
}
