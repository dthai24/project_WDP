import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkle,
  ArrowRight,
  GraduationCap,
  Trophy,
  CheckCircle,
  Clock,
  BookOpen
} from '@phosphor-icons/react';
import studentFeatureService from '../../../services/studentFeatureService';
import AppButton from '../../../shared/ui/AppButton';
import CourseCard from '../../courses/components/CourseCard';

const QUESTIONS = [
  {
    id: 1,
    question: "Complete the sentence: She ___ to school every day.",
    options: [
      { text: "go", isCorrect: false },
      { text: "goes", isCorrect: true },
      { text: "going", isCorrect: false },
      { text: "went", isCorrect: false }
    ]
  },
  {
    id: 2,
    question: "Which of the following is a synonym of 'lucrative'?",
    options: [
      { text: "Profitable", isCorrect: true },
      { text: "Boring", isCorrect: false },
      { text: "Difficult", isCorrect: false },
      { text: "Cheap", isCorrect: false }
    ]
  },
  {
    id: 3,
    question: "Identify the correct sentence:",
    options: [
      { text: "If I was you, I will go.", isCorrect: false },
      { text: "If I were you, I would go.", isCorrect: true },
      { text: "If I am you, I would go.", isCorrect: false },
      { text: "If I had been you, I will go.", isCorrect: false }
    ]
  },
  {
    id: 4,
    question: "What is the meaning of the idiom 'spill the beans'?",
    options: [
      { text: "To waste food", isCorrect: false },
      { text: "To work hard", isCorrect: false },
      { text: "To reveal a secret accidentally", isCorrect: true },
      { text: "To cook a meal", isCorrect: false }
    ]
  },
  {
    id: 5,
    question: "Choose the word closest in meaning to 'tenacious'?",
    options: [
      { text: "Weak", isCorrect: false },
      { text: "Persistent", isCorrect: true },
      { text: "Flexible", isCorrect: false },
      { text: "Temporary", isCorrect: false }
    ]
  },
  {
    id: 6,
    question: "Complete the sentence: The report ___ by the manager yesterday.",
    options: [
      { text: "write", isCorrect: false },
      { text: "writes", isCorrect: false },
      { text: "was written", isCorrect: true },
      { text: "has write", isCorrect: false }
    ]
  },
  {
    id: 7,
    question: "Which of the following is a synonym of 'abundant'?",
    options: [
      { text: "Plentiful", isCorrect: true },
      { text: "Scarce", isCorrect: false },
      { text: "Rare", isCorrect: false },
      { text: "Small", isCorrect: false }
    ]
  },
  {
    id: 8,
    question: "Complete the sentence: If she ___ harder, she would have passed the exam.",
    options: [
      { text: "studies", isCorrect: false },
      { text: "studied", isCorrect: false },
      { text: "had studied", isCorrect: true },
      { text: "study", isCorrect: false }
    ]
  },
  {
    id: 9,
    question: "What is the meaning of the idiom 'break the ice'?",
    options: [
      { text: "To destroy something", isCorrect: false },
      { text: "To start a conversation in a social setting", isCorrect: true },
      { text: "To cause an argument", isCorrect: false },
      { text: "To end a friendship", isCorrect: false }
    ]
  },
  {
    id: 10,
    question: "Choose the word closest in meaning to 'meticulous'?",
    options: [
      { text: "Careless", isCorrect: false },
      { text: "Careful and precise", isCorrect: true },
      { text: "Fast", isCorrect: false },
      { text: "Lazy", isCorrect: false }
    ]
  }
];

function renderInlineText(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function RoadmapTextRenderer({ text }) {
  if (!text) return null;
  const lines = text.split("\n");

  return (
    <div className="space-y-4 text-slate-700 leading-relaxed text-left max-w-3xl mx-auto">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={index} className="h-2" />;
        }

        // Heading 2
        if (trimmed.startsWith("##")) {
          return (
            <h2 key={index} className="text-xl font-extrabold text-slate-900 mt-8 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              {renderInlineText(trimmed.replace(/^##\s*/, ""))}
            </h2>
          );
        }

        // Heading 3
        if (trimmed.startsWith("###")) {
          return (
            <h3 key={index} className="text-lg font-bold text-slate-800 mt-6 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-emerald-500 rounded-full inline-block" />
              {renderInlineText(trimmed.replace(/^###\s*/, ""))}
            </h3>
          );
        }

        // Bullets
        if (/^[-*•]\s+/.test(trimmed)) {
          return (
            <div key={index} className="flex items-start gap-2.5 pl-4">
              <span className="text-emerald-500 mt-1.5 select-none text-xs">●</span>
              <div className="flex-1 text-slate-600">{renderInlineText(trimmed.replace(/^[-*•]\s*/, ""))}</div>
            </div>
          );
        }

        return <p key={index} className="pl-1 text-slate-600">{renderInlineText(line)}</p>;
      })}
    </div>
  );
}

export default function PlacementTestPage() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assignedLevel, setAssignedLevel] = useState(null);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [roadmap, setRoadmap] = useState('');
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const currentQuestion = QUESTIONS[currentIdx];

  useEffect(() => {
    if (!assignedLevel?._id) return;
    
    const rawUser = localStorage.getItem("user");
    let userId = "";
    if (rawUser) {
      try {
        const userObj = JSON.parse(rawUser);
        userId = userObj.userId || userObj.id || "";
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
    }

    if (!userId) return;

    setLoadingRecommendations(true);
    fetch(`http://localhost:5050/api/student/placement-test/recommendations?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (Array.isArray(data.courses)) {
            setRecommendedCourses(data.courses);
          }
          if (data.roadmap) {
            setRoadmap(data.roadmap);
          }
        }
      })
      .catch((err) => console.error('Failed to load recommended courses and roadmap:', err))
      .finally(() => setLoadingRecommendations(false));
  }, [assignedLevel]);

  const handleNext = async () => {
    if (selectedOpt === null) return;

    const isCorrect = currentQuestion.options[selectedOpt].isCorrect;
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    setCorrectCount(nextCorrectCount);

    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOpt(null);
    } else {
      // End of questions, submit to backend
      setSubmitting(true);
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        try {
          const user = JSON.parse(rawUser);
          const userId = user.userId || user.id;
          
          const res = await studentFeatureService.submitPlacementTest(userId, nextCorrectCount);
          if (res.success) {
            setAssignedLevel(res.level);
            // Update local storage user level
            if (res.user) {
              localStorage.setItem("user", JSON.stringify(res.user));
            }
          }
        } catch (err) {
          console.error("Failed to submit placement test:", err);
        }
      }
      setSubmitting(false);
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const levelName = assignedLevel?.displayName || assignedLevel?.levelName || "Intermediate";
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center font-sans">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 shadow-md animate-bounce">
          <Trophy size={40} className="text-emerald-600 animate-pulse" weight="fill" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-2">
          Kết quả xếp lớp học lực
        </h1>
        <p className="text-slate-500 mb-8">
          Hệ thống AI đã đánh giá và xếp bạn vào cấp độ phù hợp:
        </p>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl mb-10 transform hover:scale-[1.02] transition-transform max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wide uppercase mb-3">
            <Sparkle size={12} weight="fill" />
            Cấp độ đề xuất
          </div>
          <h2 className="text-4xl font-black mb-3">{levelName}</h2>
          <p className="text-sm text-emerald-50/90 leading-relaxed">
            Bạn đã trả lời đúng {correctCount}/{QUESTIONS.length} câu hỏi. Lộ trình của bạn đã được tối ưu hóa để hiển thị các khóa học cấp độ {levelName} và tự động mở khóa các chương học cơ bản!
          </p>
        </div>

        {/* Lộ trình học tập đề xuất */}
        {roadmap && (
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm text-left mb-10 max-w-3xl mx-auto">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Sparkle size={20} weight="fill" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Lộ trình học tập cá nhân hóa</h3>
                <p className="text-xs text-slate-400">Được tối ưu riêng dựa trên học lực và mục tiêu học tập của bạn</p>
              </div>
            </div>
            <RoadmapTextRenderer text={roadmap} />
          </div>
        )}

        <div className="flex justify-center gap-4 mb-12">
          <AppButton variant="outlined" onClick={() => navigate('/my-courses')}>
            Xem Khóa Học
          </AppButton>
          <AppButton variant="filled" onClick={() => navigate('/courses')}>
            Khám phá Lộ Trình
          </AppButton>
        </div>

        {/* Course recommendations based on assigned level */}
        <div className="text-left">
          <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-emerald-600" />
            Khóa học gợi ý cho cấp độ {levelName}
          </h3>

          {loadingRecommendations && (
            <p className="text-sm text-slate-400">Đang tải gợi ý khóa học...</p>
          )}

          {!loadingRecommendations && recommendedCourses.length === 0 && (
            <p className="text-sm text-slate-400">Chưa có khóa học phù hợp với cấp độ này, hãy khám phá thêm ở trang Lộ Trình.</p>
          )}

          {!loadingRecommendations && recommendedCourses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const progressPercent = Math.round((currentIdx / QUESTIONS.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase flex items-center gap-1.5">
            <Sparkle size={14} weight="fill" />
            Placement Test
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Đánh giá cấp độ đầu vào</h1>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-slate-800">
            Câu {currentIdx + 1}/{QUESTIONS.length}
          </span>
          <p className="text-[11px] text-slate-400">Độ khó thích ứng</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-10">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6 leading-relaxed">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((opt, index) => {
            const isSelected = selectedOpt === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedOpt(index)}
                className={`
                  w-full flex items-center justify-between p-4 rounded-2xl border text-left
                  transition-all duration-150 font-medium
                  ${isSelected
                    ? "border-emerald-500 bg-emerald-50/40 text-emerald-900 shadow-sm"
                    : "border-slate-100 hover:bg-slate-50 text-slate-700"
                  }
                `}
              >
                <span>{opt.text}</span>
                {isSelected && <CheckCircle size={18} className="text-emerald-500" weight="fill" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          disabled={selectedOpt === null || submitting}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold
            hover:bg-slate-800 active:bg-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Đang chấm điểm...' : currentIdx === QUESTIONS.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo'}
          <ArrowRight size={14} weight="bold" />
        </button>
      </div>
    </div>
  );
}
