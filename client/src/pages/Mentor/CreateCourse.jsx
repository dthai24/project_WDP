import React, { useState } from "react";
import { ArrowLeft, LayoutDashboard, Map, BookOpen, Brain, ListTodo, Plus, Trash2, Sparkles, Award, Clock, HelpCircle, FileText, CheckCircle2, ChevronRight, Check } from "lucide-react";

export default function CreateCourse({ currentUser, onBackDashboard }) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Danh mục môn học chuyên biệt cho nền tảng Tiếng Anh
  const categories = [
    "General English",
    "IELTS Preparation",
    "TOEIC Master",
    "English for Business",
    "English for IT & Tech",
    "Academic English",
    "English for Beginners"
  ];

  // State quản lý danh sách nội dung (khởi tạo với dữ liệu mẫu)
  const [publishedRoadmaps, setPublishedRoadmaps] = useState([
    {
      id: 1,
      title: "Chinh phục 500 từ vựng IELTS Speaking & Writing",
      category: "IELTS Preparation",
      level: "Intermediate",
      duration: "24 giờ / 4 tuần",
      stepsCount: 3,
      objectives: "Giúp học viên làm chủ các chủ đề Speaking Part 1 phổ biến, viết Writing học thuật tự nhiên hơn.",
      completionConditions: "Đạt trên 80% điểm bài kiểm tra từ vựng cuối khóa và thử thách Phát âm AI."
    },
    {
      id: 2,
      title: "Tiếng Anh Giao Tiếp B2 Cho Người Đi Làm",
      category: "English for Business",
      level: "Advanced",
      duration: "12 giờ / 2 tuần",
      stepsCount: 4,
      objectives: "Nắm vững thuật từ thương mại, viết email chuyên nghiệp, trao đổi trực tuyến tự tin.",
      completionConditions: "Hoàn thành tất cả các bài nói luyện phản xạ với AI đạt điểm trung bình từ 75% trở lên."
    }
  ]);

  const [publishedDecks, setPublishedDecks] = useState([
    {
      id: 1,
      title: "Từ vựng IELTS Academic - Chủ đề Môi trường",
      category: "IELTS Preparation",
      wordCount: 50,
      description: "Tập hợp các từ vựng học thuật cấp độ C1/C2 về Biến đổi khí hậu, Năng lượng tái tạo."
    },
    {
      id: 2,
      title: "ETS TOEIC Vocab 2026 - Chủ đề Hợp đồng & Pháp lý",
      category: "TOEIC Master",
      wordCount: 40,
      description: "Các thuật ngữ cốt lõi xuất hiện nhiều trong đề thi TOEIC Reading Part 5 & 6 mới nhất."
    }
  ]);

  const [publishedQuizzes, setPublishedQuizzes] = useState([
    {
      id: 1,
      title: "Trắc nghiệm phản xạ từ vựng Business English",
      category: "English for Business",
      difficulty: "Intermediate",
      questionsCount: 10
    },
    {
      id: 2,
      title: "Kiểm tra phát âm nhanh IELTS Vocab",
      category: "IELTS Preparation",
      difficulty: "Advanced",
      questionsCount: 15
    }
  ]);

  // States quản lý Form
  const [roadmapForm, setRoadmapForm] = useState({
    title: "",
    category: "",
    objectives: "",
    level: "Intermediate",
    duration: "",
    steps: [{ title: "", type: "Vocabulary", duration: "" }],
    completionConditions: "",
  });

  const [deckForm, setDeckForm] = useState({
    title: "",
    category: "",
    description: "",
    words: [{ word: "", ipa: "", type: "Noun", meaning: "", example: "" }]
  });

  const [quizForm, setQuizForm] = useState({
    title: "",
    category: "",
    difficulty: "Intermediate",
    questions: [{ text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" }]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Giả lập Exception 403: Kiểm tra quyền Mentor
  if (!currentUser || currentUser.role !== "Mentor") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-4 border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto">🚫</div>
          <h2 className="text-xl font-black text-slate-900">403 - Forbidden</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Tài khoản của bạn là <b>{currentUser?.role || "Learner"}</b>. Bạn cần có quyền <b>Mentor</b> đã được phê duyệt để truy cập tính năng này.
          </p>
          <button onClick={onBackDashboard} className="mt-2 text-sm font-bold text-blue-600 hover:underline">
            ← Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- HÀM XỬ LÝ CHO FORM LỘ TRÌNH (ROADMAP) ---
  const handleRoadmapInputChange = (e) => {
    const { name, value } = e.target;
    setRoadmapForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...roadmapForm.steps];
    updatedSteps[index][field] = value;
    setRoadmapForm((prev) => ({ ...prev, steps: updatedSteps }));
  };

  const addStep = () => {
    setRoadmapForm((prev) => ({
      ...prev,
      steps: [...prev.steps, { title: "", type: "Vocabulary", duration: "" }],
    }));
  };

  const removeStep = (index) => {
    if (roadmapForm.steps.length === 1) return;
    const updatedSteps = roadmapForm.steps.filter((_, i) => i !== index);
    setRoadmapForm((prev) => ({ ...prev, steps: updatedSteps }));
  };

  const handleRoadmapSubmit = (e) => {
    e.preventDefault();
    if (!roadmapForm.title.trim() || !roadmapForm.category || !roadmapForm.objectives.trim() || !roadmapForm.duration.trim() || !roadmapForm.completionConditions.trim()) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }
    const hasEmptyStep = roadmapForm.steps.some(step => !step.title.trim() || !step.duration.trim());
    if (hasEmptyStep) {
      alert("Vui lòng điền đầy đủ tiêu đề và thời lượng cho tất cả các bước.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newRoadmap = {
        id: publishedRoadmaps.length + 1,
        title: roadmapForm.title,
        category: roadmapForm.category,
        level: roadmapForm.level,
        duration: roadmapForm.duration,
        stepsCount: roadmapForm.steps.length,
        objectives: roadmapForm.objectives,
        completionConditions: roadmapForm.completionConditions
      };
      setPublishedRoadmaps([newRoadmap, ...publishedRoadmaps]);
      setIsSubmitting(false);
      setSuccessMessage(`Đăng tải lộ trình học tập "${roadmapForm.title}" thành công!`);
      // Reset form
      setRoadmapForm({
        title: "",
        category: "",
        objectives: "",
        level: "Intermediate",
        duration: "",
        steps: [{ title: "", type: "Vocabulary", duration: "" }],
        completionConditions: "",
      });
      setActiveTab("overview");
    }, 800);
  };

  // --- HÀM XỬ LÝ GIAO DIỆN BỘ TỪ VỰNG (VOCABULARY DECK) ---
  const handleDeckInputChange = (e) => {
    const { name, value } = e.target;
    setDeckForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleWordChange = (index, field, value) => {
    const updatedWords = [...deckForm.words];
    updatedWords[index][field] = value;
    setDeckForm((prev) => ({ ...prev, words: updatedWords }));
  };

  const addWordRow = () => {
    setDeckForm((prev) => ({
      ...prev,
      words: [...prev.words, { word: "", ipa: "", type: "Noun", meaning: "", example: "" }]
    }));
  };

  const removeWordRow = (index) => {
    if (deckForm.words.length === 1) return;
    const updatedWords = deckForm.words.filter((_, i) => i !== index);
    setDeckForm((prev) => ({ ...prev, words: updatedWords }));
  };

  const handleDeckSubmit = (e) => {
    e.preventDefault();
    if (!deckForm.title.trim() || !deckForm.category || !deckForm.description.trim()) {
      alert("Vui lòng điền đầy đủ thông tin bộ từ vựng.");
      return;
    }
    const hasEmptyWord = deckForm.words.some(w => !w.word.trim() || !w.meaning.trim());
    if (hasEmptyWord) {
      alert("Vui lòng điền đầy đủ thông tin từ vựng và nghĩa tiếng Việt.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newDeck = {
        id: publishedDecks.length + 1,
        title: deckForm.title,
        category: deckForm.category,
        wordCount: deckForm.words.length,
        description: deckForm.description
      };
      setPublishedDecks([newDeck, ...publishedDecks]);
      setIsSubmitting(false);
      setSuccessMessage(`Đăng tải bộ từ vựng "${deckForm.title}" (${deckForm.words.length} từ) thành công!`);
      setDeckForm({
        title: "",
        category: "",
        description: "",
        words: [{ word: "", ipa: "", type: "Noun", meaning: "", example: "" }]
      });
      setActiveTab("overview");
    }, 800);
  };

  // --- HÀM XỬ LÝ CHO FORM TRẮC NGHIỆM (QUIZ) ---
  const handleQuizInputChange = (e) => {
    const { name, value } = e.target;
    setQuizForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionTextChange = (index, value) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[index].text = value;
    setQuizForm((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuizForm((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleCorrectIndexChange = (qIndex, value) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[qIndex].correctIndex = parseInt(value, 10);
    setQuizForm((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleExplanationChange = (qIndex, value) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[qIndex].explanation = value;
    setQuizForm((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestionRow = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [...prev.questions, { text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" }]
    }));
  };

  const removeQuestionRow = (index) => {
    if (quizForm.questions.length === 1) return;
    const updatedQuestions = quizForm.questions.filter((_, i) => i !== index);
    setQuizForm((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    if (!quizForm.title.trim() || !quizForm.category) {
      alert("Vui lòng điền đầy đủ tiêu đề và danh mục bài tập.");
      return;
    }
    const hasEmptyQuestion = quizForm.questions.some(q => !q.text.trim() || q.options.some(opt => !opt.trim()));
    if (hasEmptyQuestion) {
      alert("Vui lòng điền đầy đủ câu hỏi và các phương án lựa chọn.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newQuiz = {
        id: publishedQuizzes.length + 1,
        title: quizForm.title,
        category: quizForm.category,
        difficulty: quizForm.difficulty,
        questionsCount: quizForm.questions.length
      };
      setPublishedQuizzes([newQuiz, ...publishedQuizzes]);
      setIsSubmitting(false);
      setSuccessMessage(`Đăng tải bài trắc nghiệm "${quizForm.title}" (${quizForm.questions.length} câu) thành công!`);
      setQuizForm({
        title: "",
        category: "",
        difficulty: "Intermediate",
        questions: [{ text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" }]
      });
      setActiveTab("overview");
    }, 800);
  };

  return (
    <div 
      className="min-h-screen text-text-primary font-sans antialiased py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #fff5f5 0%, #fff0f3 30%, #fdf2f8 60%, #faf5ff 100%)"
      }}
    >
      {/* Decorative background spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button 
            onClick={onBackDashboard}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/40 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Về Trang chủ
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-muted">Bảng giảng dạy:</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-rose-50 border border-rose-100/50 px-2.5 py-1 rounded-full">
              Mentor Dashboard
            </span>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200/80 text-emerald-800 p-4 sm:p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-bold">{successMessage}</p>
            </div>
            <button 
              onClick={() => setSuccessMessage("")}
              className="text-xs font-extrabold text-emerald-700 hover:text-emerald-950 hover:underline shrink-0"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Unified Dashboard Card wrapper */}
        <div className="bg-white/70 backdrop-blur-md border border-rose-100/40 rounded-[2rem] shadow-xl shadow-rose-500/5 overflow-hidden">
          
          {/* Header Panel */}
          <div className="bg-slate-950 p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(225,29,72,0.2),transparent_50%)]" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-1.5">Hệ quản lý giảng dạy</p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              Chào giảng viên, {currentUser.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Nơi biên soạn bài học, tải lên kho từ vựng và câu hỏi trắc nghiệm phản xạ giúp học viên ghi nhớ lâu hơn.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="border-b border-rose-100/30 px-6 sm:px-8 py-4 bg-white/40 flex flex-wrap gap-2.5">
            <button
              onClick={() => { setActiveTab("overview"); setSuccessMessage(""); }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === "overview"
                  ? "bg-primary text-white shadow-sm shadow-primary/20 scale-[1.02]"
                  : "bg-white hover:bg-rose-50/50 text-text-secondary border border-border/40"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Tổng quan
            </button>
            
            <button
              onClick={() => { setActiveTab("roadmap"); setSuccessMessage(""); }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === "roadmap"
                  ? "bg-primary text-white shadow-sm shadow-primary/20 scale-[1.02]"
                  : "bg-white hover:bg-rose-50/50 text-text-secondary border border-border/40"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              Tạo Lộ trình học
            </button>

            <button
              onClick={() => { setActiveTab("deck"); setSuccessMessage(""); }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === "deck"
                  ? "bg-primary text-white shadow-sm shadow-primary/20 scale-[1.02]"
                  : "bg-white hover:bg-rose-50/50 text-text-secondary border border-border/40"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Tạo Bộ từ vựng
            </button>

            <button
              onClick={() => { setActiveTab("quiz"); setSuccessMessage(""); }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === "quiz"
                  ? "bg-primary text-white shadow-sm shadow-primary/20 scale-[1.02]"
                  : "bg-white hover:bg-rose-50/50 text-text-secondary border border-border/40"
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              Tạo Trắc nghiệm
            </button>
          </div>

          {/* TAB 1: TỔNG QUAN HỌC LIỆU MENTOR */}
          {activeTab === "overview" && (
            <div className="p-6 sm:p-8 space-y-8 animate-fade-in">
              {/* Stats Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-rose-50/40 border border-rose-100/50 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest leading-none">Học viên theo học</p>
                    <p className="text-lg font-black text-text-primary mt-1.5">1,240</p>
                  </div>
                </div>

                <div className="bg-purple-50/40 border border-purple-100/50 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100/60 text-purple-600 flex items-center justify-center shrink-0">
                    <Map className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest leading-none">Lộ trình học đã tạo</p>
                    <p className="text-lg font-black text-text-primary mt-1.5">{publishedRoadmaps.length}</p>
                  </div>
                </div>

                <div className="bg-amber-50/40 border border-amber-100/50 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/60 text-amber-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Bộ từ vựng tải lên</p>
                    <p className="text-lg font-black text-text-primary mt-1.5">{publishedDecks.length}</p>
                  </div>
                </div>

                <div className="bg-emerald-50/40 border border-emerald-100/50 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center shrink-0">
                    <ListTodo className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Bài trắc nghiệm đã tạo</p>
                    <p className="text-lg font-black text-text-primary mt-1.5">{publishedQuizzes.length}</p>
                  </div>
                </div>
              </div>

              {/* Lists of Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
                
                {/* Lộ trình học (Roadmaps) */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-rose-100/40 pb-2">
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Map className="w-4 h-4 text-primary" />
                      Lộ trình học đã tạo ({publishedRoadmaps.length})
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {publishedRoadmaps.map((roadmap) => (
                      <div key={roadmap.id} className="bg-white/50 border border-rose-100/30 p-5 rounded-2xl hover:shadow-md hover:border-rose-100 transition-all flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase bg-rose-50 text-primary border border-rose-100/30 px-2 py-0.5 rounded-full">{roadmap.category}</span>
                            <span className="text-[9px] font-bold text-text-muted flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {roadmap.duration}
                            </span>
                          </div>
                          <h4 className="font-bold text-text-primary text-sm leading-snug">{roadmap.title}</h4>
                          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{roadmap.objectives}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-rose-100/10 flex items-center justify-between text-[10px] text-text-muted font-semibold">
                          <span>Mức độ: <b className="text-text-primary">{roadmap.level}</b></span>
                          <span>Số bước học: <b className="text-primary">{roadmap.stepsCount} bước</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phải: Bộ từ vựng & Trắc nghiệm */}
                <div className="lg:col-span-6 space-y-8">
                  
                  {/* Bộ từ vựng (Decks) */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-rose-100/40 pb-2">
                      <h3 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-primary" />
                        Bộ từ vựng tải lên ({publishedDecks.length})
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {publishedDecks.map((deck) => (
                        <div key={deck.id} className="bg-white/50 border border-rose-100/30 p-4.5 rounded-2xl hover:shadow-md hover:border-rose-100 transition-all flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-primary">{deck.category}</span>
                              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/50 px-2 py-0.5 rounded-full">{deck.wordCount} từ</span>
                            </div>
                            <h4 className="font-bold text-text-primary text-xs leading-snug">{deck.title}</h4>
                            <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">{deck.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trắc nghiệm (Quizzes) */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-rose-100/40 pb-2">
                      <h3 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <ListTodo className="w-4 h-4 text-primary" />
                        Bài trắc nghiệm đã tạo ({publishedQuizzes.length})
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {publishedQuizzes.map((quiz) => (
                        <div key={quiz.id} className="bg-white/50 border border-rose-100/30 p-4.5 rounded-2xl hover:shadow-md hover:border-rose-100 transition-all flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-primary">{quiz.category}</span>
                              <span className="text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-100/50 px-2 py-0.5 rounded-full">{quiz.questionsCount} câu hỏi</span>
                            </div>
                            <h4 className="font-bold text-text-primary text-xs leading-snug">{quiz.title}</h4>
                            <p className="text-[10px] text-text-muted mt-1.5 font-semibold">Độ khó: <span className="text-text-primary">{quiz.difficulty}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 2: BIỂU MẪU TẠO LỘ TRÌNH (ROADMAP FORM) */}
          {activeTab === "roadmap" && (
            <form onSubmit={handleRoadmapSubmit} className="p-6 sm:p-10 space-y-6 animate-fade-in">
              <div className="border-b border-rose-100/30 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-text-primary">Thiết kế Lộ trình học chính thức</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Xây dựng quy trình gồm nhiều bước học nhỏ theo chủ đề từ vựng, phát âm, bài nghe.</p>
                </div>
              </div>

              {/* Thông tin chung */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-rose-100/10 pb-1.5">01. Thông tin tổng quan</h3>
                
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Tiêu đề Lộ trình học *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={roadmapForm.title}
                    onChange={handleRoadmapInputChange}
                    placeholder="Ví dụ: Chinh phục 500 từ vựng IELTS Speaking & Writing"
                    className="w-full px-4 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary placeholder-text-muted"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5">Danh mục học tập *</label>
                    <select
                      name="category"
                      required
                      value={roadmapForm.category}
                      onChange={handleRoadmapInputChange}
                      className="w-full px-3 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5">Thời lượng ước tính *</label>
                    <input
                      type="text"
                      name="duration"
                      required
                      value={roadmapForm.duration}
                      onChange={handleRoadmapInputChange}
                      placeholder="Ví dụ: 24 giờ / 4 tuần"
                      className="w-full px-4 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary placeholder-text-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <span className="block text-xs font-bold text-text-primary sm:col-span-3">Đánh giá độ khó lộ trình *</span>
                  {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                    <label 
                      key={lvl}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        roadmapForm.level === lvl 
                          ? "border-primary bg-rose-50/30 text-primary font-bold shadow-sm" 
                          : "border-rose-100/50 bg-white/30 hover:border-rose-200 hover:bg-white/70 text-text-secondary"
                      }`}
                    >
                      <span className="text-xs">{lvl === "Beginner" ? "Sơ cấp (Beginner)" : lvl === "Intermediate" ? "Trung cấp (Intermediate)" : "Cao cấp (Advanced)"}</span>
                      <input
                        type="radio"
                        name="level"
                        value={lvl}
                        checked={roadmapForm.level === lvl}
                        onChange={handleRoadmapInputChange}
                        className="w-4 h-4 text-primary focus:ring-primary border-rose-200"
                      />
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Mục tiêu đầu ra của học viên *</label>
                  <textarea
                    name="objectives"
                    rows="2"
                    required
                    value={roadmapForm.objectives}
                    onChange={handleRoadmapInputChange}
                    placeholder="Học viên sẽ đạt được kỹ năng gì? (Ví dụ: Tự tin trả lời bài thi viết, tích lũy vốn từ học thuật...)"
                    className="w-full px-4 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary placeholder-text-muted resize-none"
                  />
                </div>
              </div>

              {/* Các bước học chi tiết */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center border-b border-rose-100/10 pb-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary">02. Danh sách các bước học (Steps)</h3>
                  <button
                    type="button"
                    onClick={addStep}
                    className="bg-rose-50 hover:bg-rose-100 border border-rose-100/40 text-primary text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all"
                  >
                    + Thêm bước học mới
                  </button>
                </div>

                <div className="space-y-3">
                  {roadmapForm.steps.map((step, index) => (
                    <div 
                      key={index} 
                      className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 bg-white/30 border border-rose-100/20 rounded-xl relative group hover:border-rose-100 hover:bg-white/50 transition-all"
                    >
                      <div className="w-6 h-6 rounded-lg bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>

                      <div className="w-full md:flex-1">
                        <label className="block text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Chủ đề/Tiêu đề bước học</label>
                        <input
                          type="text"
                          required
                          value={step.title}
                          onChange={(e) => handleStepChange(index, "title", e.target.value)}
                          placeholder="Ví dụ: Học 20 từ vựng chủ đề Environment"
                          className="w-full px-3.5 py-2 rounded-lg border border-rose-100/50 bg-white text-xs focus:outline-none focus:border-primary transition-all"
                        />
                      </div>

                      <div className="w-full md:w-44">
                        <label className="block text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Hoạt động luyện tập</label>
                        <select
                          value={step.type}
                          onChange={(e) => handleStepChange(index, "type", e.target.value)}
                          className="w-full px-2 py-2 rounded-lg border border-rose-100/50 bg-white text-xs font-semibold text-text-secondary focus:outline-none focus:border-primary"
                        >
                          <option value="Vocabulary">📚 Từ vựng (Vocabulary)</option>
                          <option value="Grammar">✍️ Ngữ pháp (Grammar)</option>
                          <option value="Listening">🎧 Luyện nghe (Listening)</option>
                          <option value="Reading">📖 Luyện đọc (Reading)</option>
                          <option value="Speaking">🗣️ Phát âm AI (Speaking)</option>
                          <option value="Quiz">📝 Bài trắc nghiệm (Quiz)</option>
                        </select>
                      </div>

                      <div className="w-full md:w-32">
                        <label className="block text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Thời lượng</label>
                        <input
                          type="text"
                          required
                          value={step.duration}
                          onChange={(e) => handleStepChange(index, "duration", e.target.value)}
                          placeholder="Ví dụ: 20 phút"
                          className="w-full px-3.5 py-2 rounded-lg border border-rose-100/50 bg-white text-xs focus:outline-none focus:border-primary transition-all"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={roadmapForm.steps.length === 1}
                        onClick={() => removeStep(index)}
                        className="self-end md:self-center mt-2 md:mt-4 p-2 text-text-muted hover:text-red-600 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Điều kiện hoàn thành */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-rose-100/10 pb-1.5">03. Điều kiện hoàn thành</h3>
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Yêu cầu hoàn thành lộ trình *</label>
                  <textarea
                    name="completionConditions"
                    rows="2"
                    required
                    value={roadmapForm.completionConditions}
                    onChange={handleRoadmapInputChange}
                    placeholder="Ví dụ: Học viên cần làm bài quiz cuối khóa đạt ít nhất 80% điểm số để được cấp chứng nhận mở khóa tiếp theo."
                    className="w-full px-4 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary placeholder-text-muted resize-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-rose-100/20">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Đang xử lý..." : "Xuất bản Lộ trình"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BIỂU MẪU TẠO BỘ TỪ VỰNG (VOCABULARY DECK FORM) */}
          {activeTab === "deck" && (
            <form onSubmit={handleDeckSubmit} className="p-6 sm:p-10 space-y-6 animate-fade-in">
              <div className="border-b border-rose-100/30 pb-3">
                <h2 className="text-lg font-black text-text-primary">Tải lên Bộ từ vựng mới (Vocabulary Deck)</h2>
                <p className="text-xs text-text-secondary mt-0.5">Tạo các bộ thẻ từ vựng thông minh hỗ trợ thuật toán lặp lại ngắt quãng SRS.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-rose-100/10 pb-1.5">01. Thông tin bộ từ vựng</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-text-primary mb-1.5">Tên Bộ từ vựng *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={deckForm.title}
                      onChange={handleDeckInputChange}
                      placeholder="Ví dụ: Từ vựng IELTS chủ đề Environment"
                      className="w-full px-4 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary placeholder-text-muted"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5">Danh mục/Chủ đề *</label>
                    <select
                      name="category"
                      required
                      value={deckForm.category}
                      onChange={handleDeckInputChange}
                      className="w-full px-3 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Mô tả ngắn về bộ từ vựng *</label>
                  <textarea
                    name="description"
                    rows="2"
                    required
                    value={deckForm.description}
                    onChange={handleDeckInputChange}
                    placeholder="Mô tả mục đích học tập của bộ từ vựng này..."
                    className="w-full px-4 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary placeholder-text-muted resize-none"
                  />
                </div>
              </div>

              {/* Danh sách từ vựng */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center border-b border-rose-100/10 pb-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary">02. Danh sách các Từ vựng (Flashcards)</h3>
                  <button
                    type="button"
                    onClick={addWordRow}
                    className="bg-rose-50 hover:bg-rose-100 border border-rose-100/40 text-primary text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all"
                  >
                    + Thêm từ vựng mới
                  </button>
                </div>

                <div className="space-y-4">
                  {deckForm.words.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-5 bg-white/30 border border-rose-100/20 rounded-xl relative group hover:border-rose-100 hover:bg-white/50 transition-all space-y-3"
                    >
                      <div className="flex justify-between items-center border-b border-rose-100/10 pb-2">
                        <span className="w-5 h-5 rounded bg-primary text-white text-[10px] font-black flex items-center justify-center">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          disabled={deckForm.words.length === 1}
                          onClick={() => removeWordRow(index)}
                          className="text-text-muted hover:text-red-600 disabled:opacity-30 flex items-center gap-1 text-[10px] font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xóa từ
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Từ vựng (Word) *</label>
                          <input
                            type="text"
                            required
                            value={item.word}
                            onChange={(e) => handleWordChange(index, "word", e.target.value)}
                            placeholder="Ví dụ: accomplish"
                            className="w-full px-3 py-2 rounded-lg border border-rose-100/50 bg-white text-xs focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Phiên âm (IPA)</label>
                          <input
                            type="text"
                            value={item.ipa}
                            onChange={(e) => handleWordChange(index, "ipa", e.target.value)}
                            placeholder="/ə'kʌm.plɪʃ/"
                            className="w-full px-3 py-2 rounded-lg border border-rose-100/50 bg-white text-xs focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Từ loại</label>
                          <select
                            value={item.type}
                            onChange={(e) => handleWordChange(index, "type", e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-rose-100/50 bg-white text-xs text-text-secondary focus:outline-none focus:border-primary"
                          >
                            <option value="Noun">Danh từ (Noun)</option>
                            <option value="Verb">Động từ (Verb)</option>
                            <option value="Adjective">Tính từ (Adjective)</option>
                            <option value="Adverb">Trạng từ (Adverb)</option>
                            <option value="Preposition">Giới từ (Preposition)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Nghĩa tiếng Việt *</label>
                          <input
                            type="text"
                            required
                            value={item.meaning}
                            onChange={(e) => handleWordChange(index, "meaning", e.target.value)}
                            placeholder="Ví dụ: Đạt được, hoàn thành"
                            className="w-full px-3 py-2 rounded-lg border border-rose-100/50 bg-white text-xs focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Câu ví dụ minh họa</label>
                        <input
                          type="text"
                          value={item.example}
                          onChange={(e) => handleWordChange(index, "example", e.target.value)}
                          placeholder="Ví dụ: We managed to accomplish the task before the deadline."
                          className="w-full px-3.5 py-2.5 rounded-lg border border-rose-100/50 bg-white text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-rose-100/20">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Đang tải lên..." : "Tải lên bộ từ vựng"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: BIỂU MẪU TẠO TRẮC NGHIỆM (QUIZ FORM) */}
          {activeTab === "quiz" && (
            <form onSubmit={handleQuizSubmit} className="p-6 sm:p-10 space-y-6 animate-fade-in">
              <div className="border-b border-rose-100/30 pb-3">
                <h2 className="text-lg font-black text-text-primary">Tạo Bài trắc nghiệm luyện tập (Quizzes)</h2>
                <p className="text-xs text-text-secondary mt-0.5">Xây dựng bài kiểm tra trắc nghiệm giúp học viên phản xạ nhanh từ vựng và ngữ pháp.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-rose-100/10 pb-1.5">01. Thông tin bài kiểm tra</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-text-primary mb-1.5">Tiêu đề bài kiểm tra *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={quizForm.title}
                      onChange={handleQuizInputChange}
                      placeholder="Ví dụ: Trắc nghiệm phản xạ từ vựng Business English"
                      className="w-full px-4 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary placeholder-text-muted"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5">Danh mục/Chủ đề *</label>
                    <select
                      name="category"
                      required
                      value={quizForm.category}
                      onChange={handleQuizInputChange}
                      className="w-full px-3 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <span className="block text-xs font-bold text-text-primary sm:col-span-3">Độ khó bài thi *</span>
                  {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                    <label 
                      key={lvl}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        quizForm.difficulty === lvl 
                          ? "border-primary bg-rose-50/30 text-primary font-bold shadow-sm" 
                          : "border-rose-100/50 bg-white/30 hover:border-rose-200 hover:bg-white/70 text-text-secondary"
                      }`}
                    >
                      <span className="text-xs">{lvl === "Beginner" ? "Sơ cấp (Beginner)" : lvl === "Intermediate" ? "Trung cấp (Intermediate)" : "Cao cấp (Advanced)"}</span>
                      <input
                        type="radio"
                        name="difficulty"
                        value={lvl}
                        checked={quizForm.difficulty === lvl}
                        onChange={handleQuizInputChange}
                        className="w-4 h-4 text-primary focus:ring-primary border-rose-200"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Danh sách câu hỏi */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center border-b border-rose-100/10 pb-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary">02. Thiết lập Câu hỏi & Đáp án</h3>
                  <button
                    type="button"
                    onClick={addQuestionRow}
                    className="bg-rose-50 hover:bg-rose-100 border border-rose-100/40 text-primary text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all"
                  >
                    + Thêm câu hỏi mới
                  </button>
                </div>

                <div className="space-y-4">
                  {quizForm.questions.map((q, qIndex) => (
                    <div 
                      key={qIndex} 
                      className="p-5 bg-white/30 border border-rose-100/20 rounded-xl relative group hover:border-rose-100 hover:bg-white/50 transition-all space-y-4"
                    >
                      <div className="flex justify-between items-center border-b border-rose-100/10 pb-2">
                        <span className="w-5 h-5 rounded bg-primary text-white text-[10px] font-black flex items-center justify-center">
                          {qIndex + 1}
                        </span>
                        <button
                          type="button"
                          disabled={quizForm.questions.length === 1}
                          onClick={() => removeQuestionRow(qIndex)}
                          className="text-text-muted hover:text-red-600 disabled:opacity-30 flex items-center gap-1 text-[10px] font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xóa câu hỏi
                        </button>
                      </div>

                      {/* Câu hỏi */}
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Nội dung câu hỏi *</label>
                        <input
                          type="text"
                          required
                          value={q.text}
                          onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                          placeholder="Ví dụ: What is the meaning of 'accomplish'?"
                          className="w-full px-3 py-2 rounded-lg border border-rose-100/50 bg-white text-xs focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* 4 phương án */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex}>
                            <label className="block text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Đáp án {String.fromCharCode(65 + oIndex)} *</label>
                            <input
                              type="text"
                              required
                              value={opt}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                              placeholder={`Phương án ${String.fromCharCode(65 + oIndex)}`}
                              className="w-full px-3 py-2 rounded-lg border border-rose-100/50 bg-white text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Đáp án đúng & Giải thích */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Đáp án đúng *</label>
                          <select
                            value={q.correctIndex}
                            onChange={(e) => handleCorrectIndexChange(qIndex, e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-rose-100/50 bg-white text-xs font-semibold text-text-secondary focus:outline-none focus:border-primary"
                          >
                            <option value={0}>Đáp án A</option>
                            <option value={1}>Đáp án B</option>
                            <option value={2}>Đáp án C</option>
                            <option value={3}>Đáp án D</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Giải thích chi tiết</label>
                          <input
                            type="text"
                            value={q.explanation}
                            onChange={(e) => handleExplanationChange(qIndex, e.target.value)}
                            placeholder="Ví dụ: 'accomplish' nghĩa là đạt được, hoàn thành xuất sắc..."
                            className="w-full px-3 py-2 rounded-lg border border-rose-100/50 bg-white text-xs focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-rose-100/20">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Đang xử lý..." : "Tải lên Bài trắc nghiệm"}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}