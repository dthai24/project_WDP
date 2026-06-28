import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Award, ChevronRight, AlertCircle, HelpCircle } from "lucide-react";

export default function QuizEngine({
  questions: rawQuestions,
  title = "Kiem tra kien thuc",
  subtitle = "Tra loi cac cau hoi de cung co bai hoc",
  timeLimit = null, // seconds, null = no limit
  passingScore = 70, // percentage
  onComplete, // (result) => void
  onBack,
  showInPage = false, // false = full screen, true = inline
}) {
  // Normalize questions to support both formats:
  // Format 1: { question, options, correct } (existing)
  // Format 2: { text, options, correctIndex } (mentor course)
  const questions = (rawQuestions || []).map(q => ({
    question: q.question || q.text || "",
    options: q.options || [],
    correct: q.correct !== undefined ? q.correct : (q.correctIndex !== undefined ? q.correctIndex : 0),
  }));

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  // Recovery & Blocker States
  const [currentUser, setCurrentUser] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null);

  // Load current user email for unique backup key
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

  const backupKey = currentUser?.email ? `lexiora_quiz_backup_${currentUser.email}` : null;

  // 1. Auto-save progress
  useEffect(() => {
    if (!backupKey || submitted || showResult) return;
    const stateToSave = {
      currentQuestion,
      answers,
      timeLeft,
      title,
      quizStarted: true,
      quizCompleted: false
    };
    localStorage.setItem(backupKey, JSON.stringify(stateToSave));
  }, [currentQuestion, answers, timeLeft, backupKey, submitted, showResult, title]);

  // 2. Check for saved progress on mount
  useEffect(() => {
    if (!backupKey) return;
    const backup = localStorage.getItem(backupKey);
    if (backup) {
      try {
        const parsed = JSON.parse(backup);
        if (parsed.quizStarted && !parsed.quizCompleted) {
          setSavedProgress(parsed);
          setShowRestoreModal(true);
        }
      } catch (e) {
        console.error("Error reading backup:", e);
      }
    }
  }, [backupKey]);

  // 3. Browser tab close warning (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submitted && !showResult) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [submitted, showResult]);

  // Timer useEffect
  useEffect(() => {
    if (submitted || !timeLimit) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [submitted, timeLimit, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (optionIndex) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [currentQuestion]: optionIndex }));
  };

  const handleExitAttempt = () => {
    if (submitted || showResult) {
      if (onBack) onBack();
    } else {
      setShowExitModal(true);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResult(true);
    if (backupKey) {
      localStorage.removeItem(backupKey);
    }
    const correctCount = questions.filter((q, i) => answers[i] === q.correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    if (onComplete) onComplete({ correctCount, total: questions.length, score, passed: score >= passingScore });
  };

  const handleRetry = () => {
    setShowResult(false);
    setSubmitted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(timeLimit);
  };

  const totalQuestions = questions.length;
  const correctCount = questions.filter((q, i) => answers[i] === q.correct).length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const passed = score >= passingScore;

  // Result screen
  if (showResult) {
    const resultContent = (
      <div className={`space-y-6 ${showInPage ? "" : "text-center"}`}>
        <div className={`${showInPage ? "flex items-center gap-4" : "space-y-4 text-center"}`}>
          <div className={`${showInPage ? "" : "mx-auto"} w-16 h-16 rounded-full flex items-center justify-center ${passed ? "bg-success/10" : "bg-red-50"}`}>
            {passed ? <Award className="w-8 h-8 text-success" /> : <AlertCircle className="w-8 h-8 text-red-500" />}
          </div>
          <div className="space-y-1">
            <h3 className={`font-black text-text-primary ${showInPage ? "text-lg" : "text-2xl"}`}>
              {passed ? "🎉 Xuat sac!" : "💪 Hay co gang them!"}
            </h3>
            <p className="text-xs text-text-secondary">
              {passed
                ? `Ban da tra loi dung ${correctCount}/${totalQuestions} cau.`
                : `Ban tra loi dung ${correctCount}/${totalQuestions} cau. Hay xem lai bai hoc va thu lai!`}
            </p>
          </div>
        </div>

        <div className={`bg-white rounded-2xl border border-border/60 p-6 ${showInPage ? "" : "max-w-sm mx-auto"} space-y-4`}>
          <div className="text-center">
            <span className="text-4xl font-black text-primary">{score}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${passed ? "bg-success" : "bg-red-500"}`} style={{ width: `${score}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-success/5 rounded-xl p-3 text-center">
              <p className="text-xl font-black text-success">{correctCount}</p>
              <p className="text-[9px] font-bold text-text-muted uppercase">Dung</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-xl font-black text-red-500">{totalQuestions - correctCount}</p>
              <p className="text-[9px] font-bold text-text-muted uppercase">Sai</p>
            </div>
          </div>
        </div>

        <div className={`flex gap-3 ${showInPage ? "" : "justify-center"}`}>
          {!passed && (
            <button onClick={handleRetry} className="px-6 py-3 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-all">
              Lam lai
            </button>
          )}
          {onBack && (
            <button onClick={onBack} className="px-6 py-3 rounded-xl text-xs font-bold border border-border/60 text-text-secondary hover:text-primary transition-all">
              {passed ? "Quay lai" : "Quay lai"}
            </button>
          )}
        </div>
      </div>
    );

    if (showInPage) return resultContent;

    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center px-6">
        <div className="max-w-lg w-full">{resultContent}</div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  const quizContent = (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {questions.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
            i === currentQuestion ? "bg-primary" : answers[i] !== undefined ? "bg-success" : "bg-slate-200"
          }`} />
        ))}
      </div>

      {/* Timer */}
      {timeLimit && (
        <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
          <Clock className="w-4 h-4 text-primary" />
          <span className={timeLeft < 60 ? "text-red-500" : ""}>{formatTime(timeLeft)}</span>
        </div>
      )}

      {/* Question */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
          Cau hoi {currentQuestion + 1}/{totalQuestions}
        </p>
        <h2 className="text-lg font-black text-text-primary tracking-tight">{q.question}</h2>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {q.options.map((option, i) => {
          const isSelected = answers[currentQuestion] === i;
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border/60 bg-white hover:border-primary/30 hover:bg-primary/5 text-text-primary"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold border-2 shrink-0 ${
                  isSelected ? "border-primary bg-primary text-white" : "border-border text-text-muted"
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="font-semibold text-sm">{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            currentQuestion === 0 ? "text-text-muted/40 cursor-not-allowed" : "text-text-secondary hover:text-primary border border-border/60 hover:border-primary/30"
          }`}
        >
          Cau truoc
        </button>
        {currentQuestion === totalQuestions - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < totalQuestions}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              Object.keys(answers).length < totalQuestions
                ? "bg-slate-100 text-text-muted cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary-dark shadow-sm shadow-primary/20"
            }`}
          >
            <span>Gui bai</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(prev => Math.min(totalQuestions - 1, prev + 1))}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-all flex items-center gap-2"
          >
            <span>Cau tiep theo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  if (showInPage) return quizContent;

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="bg-white border-b border-border/30 px-6 py-3 flex items-center justify-between">
        {onBack && (
          <button onClick={handleExitAttempt} className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Thoat</span>
          </button>
        )}
        <div className="flex items-center gap-3 ml-auto">
          {timeLimit && (
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <Clock className="w-4 h-4 text-primary" />
              <span className={timeLeft < 60 ? "text-red-500" : ""}>{formatTime(timeLeft)}</span>
            </div>
          )}
          <span className="text-xs font-semibold text-text-muted">{currentQuestion + 1}/{totalQuestions}</span>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-10">{quizContent}</div>

      {/* Exit Blocker Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-rose-100 shadow-2xl flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
              <AlertCircle size={32} className="animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Rời khỏi phòng thi?</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Bạn đang làm dở bài kiểm tra. Bạn có chắc chắn muốn rời đi? Tiến trình làm bài sẽ được tự động lưu lại.
              </p>
            </div>
            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl active:scale-95 transition-all"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  if (onBack) onBack();
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold rounded-2xl active:scale-95 transition-all shadow-md shadow-rose-500/10"
              >
                Rời đi & Lưu bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Progress Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-rose-100 shadow-2xl flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center shadow-inner">
              <HelpCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Tiếp tục bài làm?</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Hệ thống phát hiện bài làm trắc nghiệm trước đó của bạn chưa hoàn thành. Bạn có muốn tiếp tục làm tiếp không?
              </p>
            </div>
            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => {
                  if (backupKey) {
                    localStorage.removeItem(backupKey);
                  }
                  setShowRestoreModal(false);
                }}
                className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-2xl active:scale-95 transition-all"
              >
                Làm bài mới
              </button>
              <button
                onClick={() => {
                  if (savedProgress) {
                    setCurrentQuestion(savedProgress.currentQuestion || 0);
                    setAnswers(savedProgress.answers || {});
                    if (savedProgress.timeLeft !== undefined) {
                      setTimeLeft(savedProgress.timeLeft);
                    }
                  }
                  setShowRestoreModal(false);
                }}
                className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-2xl active:scale-95 transition-all shadow-md shadow-primary/10"
              >
                Tiếp tục làm bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
