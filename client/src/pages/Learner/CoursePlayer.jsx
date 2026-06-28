import React, { useState, useEffect } from "react";
import { ArrowLeft, Play, FileText, HelpCircle, CheckCircle2, Lock, ChevronRight, ChevronLeft, BookOpen, Download, Eye, Menu, X, Clock, Award, Sparkles, Star } from "lucide-react";
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

  // Load progress from localStorage
  useEffect(() => {
    const progress = getLearningProgress();
    setCompletedLessons(new Set(progress.completedLessons));
  }, []);

  // Set first lesson as active on mount
  useEffect(() => {
    if (!activeLesson && curriculum.length > 0 && curriculum[0].lessons.length > 0) {
      setActiveLesson(curriculum[0].lessons[0]);
    }
  }, [curriculum]);

  // Reset quiz result when switching lessons
  useEffect(() => {
    setQuizResult(null);
  }, [activeLesson]);

  const allLessons = curriculum.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === activeLesson?.id);

  const handleLessonClick = (lesson) => {
    setActiveLesson(lesson);
    setActiveTab(lesson.type === "quiz" ? "quiz" : "video");
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
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary transition-colors shrink-0">
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
            {[
              { id: "video", label: "Video", icon: Play },
              { id: "documents", label: "Tai lieu", icon: FileText },
              { id: "quiz", label: "Bai tap", icon: HelpCircle },
            ].map((tab) => {
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
        </div>
      </div>
    </div>
  );
}
