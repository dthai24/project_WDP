import React, { useState } from "react";
import { ArrowLeft, LayoutDashboard, Map, Plus, Trash2, Sparkles, Clock, HelpCircle, FileText, CheckCircle2, Video, BookOpen, ListTodo, Award, Users, Star, TrendingUp, DollarSign, Upload, Link, Edit3 } from "lucide-react";
import { saveMentorCourse, saveMentorCurriculum, getMentorCourses, getMentorStats, updateMentorStats } from "../../services/data";

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

  // States quản lý Form
  const [roadmapForm, setRoadmapForm] = useState({
    title: "",
    category: "",
    objectives: "",
    level: "Intermediate",
    duration: "",
    steps: [{
      title: "",
      videoUrl: "",
      document: { title: "", content: "" },
      quiz: { title: "", questions: [] },
    }],
    completionConditions: "",
    price: "",
    originalPrice: "",
    tag: "Moi nhat",
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

  const handleDocChange = (index, field, value) => {
    const updatedSteps = [...roadmapForm.steps];
    updatedSteps[index].document[field] = value;
    setRoadmapForm((prev) => ({ ...prev, steps: updatedSteps }));
  };

  const handleQuizChange = (index, field, value) => {
    const updatedSteps = [...roadmapForm.steps];
    updatedSteps[index].quiz[field] = value;
    setRoadmapForm((prev) => ({ ...prev, steps: updatedSteps }));
  };

  const handleQuestionChange = (stepIndex, qIndex, field, value) => {
    const updatedSteps = [...roadmapForm.steps];
    updatedSteps[stepIndex].quiz.questions[qIndex][field] = value;
    setRoadmapForm((prev) => ({ ...prev, steps: updatedSteps }));
  };

  const handleOptionChange = (stepIndex, qIndex, oIndex, value) => {
    const updatedSteps = [...roadmapForm.steps];
    updatedSteps[stepIndex].quiz.questions[qIndex].options[oIndex] = value;
    setRoadmapForm((prev) => ({ ...prev, steps: updatedSteps }));
  };

  const addQuestion = (stepIndex) => {
    const updatedSteps = [...roadmapForm.steps];
    updatedSteps[stepIndex].quiz.questions.push({
      text: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: ""
    });
    setRoadmapForm((prev) => ({ ...prev, steps: updatedSteps }));
  };

  const removeQuestion = (stepIndex, qIndex) => {
    const updatedSteps = [...roadmapForm.steps];
    if (updatedSteps[stepIndex].quiz.questions.length <= 1) return;
    updatedSteps[stepIndex].quiz.questions = updatedSteps[stepIndex].quiz.questions.filter((_, i) => i !== qIndex);
    setRoadmapForm((prev) => ({ ...prev, steps: updatedSteps }));
  };

  const addStep = () => {
    setRoadmapForm((prev) => ({
      ...prev,
      steps: [...prev.steps, {
        title: "",
        videoUrl: "",
        document: { title: "", content: "" },
        quiz: { title: "", questions: [] },
      }],
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
    const hasEmptyStep = roadmapForm.steps.some(step => !step.title.trim());
    if (hasEmptyStep) {
      alert("Vui lòng điền đầy đủ tiêu đề cho tất cả các bước.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const courseId = Date.now();

      // Build curriculum data from steps
      const curriculum = roadmapForm.steps.map((step, idx) => ({
        id: `m${idx + 1}`,
        title: step.title,
        lessons: [
          { id: `l${idx * 3 + 1}`, title: `${step.title} - Video`, type: "video", duration: "10:00", free: idx === 0, videoUrl: step.videoUrl },
          { id: `l${idx * 3 + 2}`, title: `${step.title} - Tai lieu`, type: "document", duration: "1 bai", free: idx === 0, document: step.document },
          ...(step.quiz.questions.length > 0 ? [{
            id: `l${idx * 3 + 3}`,
            title: `${step.quiz.title || `${step.title} - Kiem tra`}`,
            type: "quiz",
            duration: `${step.quiz.questions.length} cau`,
            free: idx === 0,
            questions: step.quiz.questions,
          }] : []),
        ],
      }));

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

      // Map level to student format
      const levelMap = {
        "Beginner": "Co ban",
        "Intermediate": "Trung cap",
        "Advanced": "Nang cao"
      };

      // Calculate hours from duration string
      const hoursMatch = roadmapForm.duration.match(/(\d+)/);
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 10;

      // Calculate lessons count
      const totalLessons = curriculum.reduce((sum, m) => sum + m.lessons.length, 0);

      // Parse price
      const price = roadmapForm.price ? parseInt(roadmapForm.price) : null;
      const originalPrice = roadmapForm.originalPrice ? parseInt(roadmapForm.originalPrice) : null;

      // Save course to localStorage
      const mentorCourse = {
        id: courseId,
        title: roadmapForm.title,
        instructor: currentUser.name,
        rating: 5.0,
        students: 0,
        level: levelMap[roadmapForm.level] || "Trung cap",
        lessons: totalLessons,
        hours: hours,
        badge: roadmapForm.category,
        category: roadmapForm.category,
        image: `https://picsum.photos/seed/${courseId}/400/225`,
        desc: roadmapForm.objectives,
        tag: roadmapForm.tag,
        price: price,
        originalPrice: originalPrice,
        mentorCourse: true,
        mentorId: currentUser.id,
      };
      saveMentorCourse(mentorCourse);

      // Save curriculum data
      saveMentorCurriculum(courseId, curriculum);

      // Update stats
      const stats = getMentorStats();
      stats.courses = getMentorCourses().length;
      updateMentorStats(stats);

      setIsSubmitting(false);
      setSuccessMessage(`Đăng tải khóa học "${roadmapForm.title}" thành công! Khóa học gồm ${totalLessons} bài học (video, tài liệu, trắc nghiệm) đã được hiển thị cho học viên.`);
      // Reset form
      setRoadmapForm({
        title: "",
        category: "",
        objectives: "",
        level: "Intermediate",
        duration: "",
        steps: [{
          title: "",
          videoUrl: "",
          document: { title: "", content: "" },
          quiz: { title: "", questions: [] },
        }],
        completionConditions: "",
        price: "",
        originalPrice: "",
        tag: "Moi nhat",
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
              Nơi tạo khóa học với đầy đủ video, tài liệu và trắc nghiệm cho học viên.
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
              Tạo Khóa học
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
                    <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest leading-none">Khóa học đã tạo</p>
                    <p className="text-lg font-black text-text-primary mt-1.5">{publishedRoadmaps.length}</p>
                  </div>
                </div>

                <div className="bg-amber-50/40 border border-amber-100/50 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/60 text-amber-600 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Bài học Video</p>
                    <p className="text-lg font-black text-text-primary mt-1.5">{publishedRoadmaps.length * 2}</p>
                  </div>
                </div>

                <div className="bg-emerald-50/40 border border-emerald-100/50 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center shrink-0">
                    <ListTodo className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Bài trắc nghiệm</p>
                    <p className="text-lg font-black text-text-primary mt-1.5">{publishedRoadmaps.length * 2}</p>
                  </div>
                </div>
              </div>

              {/* Lists of Content */}
              <div className="space-y-6 pt-2">
                <div className="flex justify-between items-center border-b border-rose-100/40 pb-2">
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Map className="w-4 h-4 text-primary" />
                    Khóa học đã tạo ({publishedRoadmaps.length})
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
          )}

          {/* TAB 2: BIỂU MẪU TẠO KHÓA HỌC (ROADMAP FORM) */}
          {activeTab === "roadmap" && (
            <form onSubmit={handleRoadmapSubmit} className="p-6 sm:p-10 space-y-6 animate-fade-in">
              <div className="border-b border-rose-100/30 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-text-primary">Tạo Khóa học mới</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Mỗi bước học gồm 3 phần: Video, Tài liệu và Trắc nghiệm.</p>
                </div>
              </div>

              {/* Thông tin chung */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-rose-100/10 pb-1.5">01. Thông tin tổng quan</h3>
                
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Tiêu đề Khóa học *</label>
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
                  <span className="block text-xs font-bold text-text-primary sm:col-span-3">Đánh giá độ khó *</span>
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

                {/* Pricing & Tag */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5">Giá khóa học (VNĐ)</label>
                    <input
                      type="number"
                      name="price"
                      value={roadmapForm.price}
                      onChange={handleRoadmapInputChange}
                      placeholder="Để trống nếu miễn phí"
                      className="w-full px-4 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary placeholder-text-muted"
                    />
                    <p className="text-[9px] text-text-muted mt-1">Để trống = Miễn phí</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5">Giá gốc (VNĐ)</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={roadmapForm.originalPrice}
                      onChange={handleRoadmapInputChange}
                      placeholder="Giá trước khi giảm"
                      className="w-full px-4 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary placeholder-text-muted"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5">Nhãn (Tag)</label>
                    <select
                      name="tag"
                      value={roadmapForm.tag}
                      onChange={handleRoadmapInputChange}
                      className="w-full px-3 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary"
                    >
                      <option value="Moi nhat">Mới nhất</option>
                      <option value="Pho bien">Phổ biến</option>
                      <option value="Ban chay">Bán chạy</option>
                      <option value="Mentor">Mentor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Các bước học chi tiết */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center border-b border-rose-100/10 pb-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary">02. Danh sách các bước học</h3>
                  <button
                    type="button"
                    onClick={addStep}
                    className="bg-rose-50 hover:bg-rose-100 border border-rose-100/40 text-primary text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all"
                  >
                    + Thêm bước học mới
                  </button>
                </div>

                <div className="space-y-6">
                  {roadmapForm.steps.map((step, index) => (
                    <div 
                      key={index} 
                      className="p-5 bg-white/40 border border-rose-100/20 rounded-xl relative group hover:border-rose-100 hover:bg-white/60 transition-all space-y-4"
                    >
                      {/* Step Header */}
                      <div className="flex items-center justify-between border-b border-rose-100/10 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary text-white text-xs font-black flex items-center justify-center shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-xs font-bold text-text-primary">Bước học {index + 1}</span>
                        </div>
                        <button
                          type="button"
                          disabled={roadmapForm.steps.length === 1}
                          onClick={() => removeStep(index)}
                          className="p-1.5 text-text-muted hover:text-red-600 disabled:opacity-30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Step Title */}
                      <div>
                        <label className="block text-[10px] font-bold text-text-primary mb-1">Tiêu đề bước học *</label>
                        <input
                          type="text"
                          required
                          value={step.title}
                          onChange={(e) => handleStepChange(index, "title", e.target.value)}
                          placeholder="Ví dụ: Học 20 từ vựng chủ đề Environment"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-rose-100/50 bg-white text-sm focus:outline-none focus:border-primary transition-all"
                        />
                      </div>

                      {/* 3 sections: Video, Document, Quiz */}
                      <div className="grid grid-cols-1 gap-4 pt-1">
                        {/* Video URL */}
                        <div className="bg-blue-50/30 border border-blue-100/30 rounded-xl p-4 space-y-2">
                          <div className="flex items-center gap-2 text-blue-700">
                            <Video className="w-4 h-4" />
                            <span className="text-xs font-bold">Video bài giảng</span>
                          </div>
                          <input
                            type="url"
                            value={step.videoUrl}
                            onChange={(e) => handleStepChange(index, "videoUrl", e.target.value)}
                            placeholder="Dán link video YouTube hoặc Vimeo..."
                            className="w-full px-3.5 py-2 rounded-lg border border-blue-100/50 bg-white text-xs focus:outline-none focus:border-blue-400 transition-all"
                          />
                          {step.videoUrl && (
                            <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                              <Video className="w-8 h-8 text-white/50" />
                              <span className="text-white/40 text-[10px] ml-2">Video embedded</span>
                            </div>
                          )}
                        </div>

                        {/* Document */}
                        <div className="bg-amber-50/30 border border-amber-100/30 rounded-xl p-4 space-y-2">
                          <div className="flex items-center gap-2 text-amber-700">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs font-bold">Tài liệu bài học</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={step.document.title}
                              onChange={(e) => handleDocChange(index, "title", e.target.value)}
                              placeholder="Tiêu đề tài liệu (VD: Vocabulary List)"
                              className="w-full px-3.5 py-2 rounded-lg border border-amber-100/50 bg-white text-xs focus:outline-none focus:border-amber-400 transition-all"
                            />
                            <textarea
                              value={step.document.content}
                              onChange={(e) => handleDocChange(index, "content", e.target.value)}
                              placeholder="Nội dung tài liệu (VD: abandon - tu bo, benevolent - tot bung...)"
                              rows="2"
                              className="w-full px-3.5 py-2 rounded-lg border border-amber-100/50 bg-white text-xs focus:outline-none focus:border-amber-400 transition-all resize-none"
                            />
                          </div>
                        </div>

                        {/* Quiz */}
                        <div className="bg-purple-50/30 border border-purple-100/30 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between gap-2 text-purple-700">
                            <div className="flex items-center gap-2">
                              <HelpCircle className="w-4 h-4" />
                              <span className="text-xs font-bold">Trắc nghiệm</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => addQuestion(index)}
                              className="text-[9px] font-bold text-purple-600 hover:text-purple-800 bg-purple-100/50 px-2 py-1 rounded-lg transition-all"
                            >
                              + Thêm câu hỏi
                            </button>
                          </div>
                          <input
                            type="text"
                            value={step.quiz.title}
                            onChange={(e) => handleQuizChange(index, "title", e.target.value)}
                            placeholder="Tiêu đề bài trắc nghiệm (VD: Kiểm tra từ vựng chủ đề Environment)"
                            className="w-full px-3.5 py-2 rounded-lg border border-purple-100/50 bg-white text-xs focus:outline-none focus:border-purple-400 transition-all"
                          />
                          
                          {/* Questions */}
                          <div className="space-y-3 pt-1">
                            {step.quiz.questions.map((q, qIdx) => (
                              <div key={qIdx} className="bg-white/60 border border-purple-100/30 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-purple-600">Câu {qIdx + 1}</span>
                                  <button
                                    type="button"
                                    disabled={step.quiz.questions.length <= 1}
                                    onClick={() => removeQuestion(index, qIdx)}
                                    className="p-1 text-text-muted hover:text-red-600 disabled:opacity-30 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={q.text}
                                  onChange={(e) => handleQuestionChange(index, qIdx, "text", e.target.value)}
                                  placeholder="Nội dung câu hỏi..."
                                  className="w-full px-3 py-1.5 rounded-lg border border-purple-100/30 bg-white text-xs focus:outline-none focus:border-purple-400 transition-all"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {q.options.map((opt, oIdx) => (
                                    <label key={oIdx} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-xs ${
                                      q.correctIndex === oIdx
                                        ? "border-emerald-300 bg-emerald-50/50"
                                        : "border-purple-100/30 bg-white hover:border-purple-200"
                                    }`}>
                                      <input
                                        type="radio"
                                        name={`correct-${index}-${qIdx}`}
                                        checked={q.correctIndex === oIdx}
                                        onChange={() => handleQuestionChange(index, qIdx, "correctIndex", oIdx)}
                                        className="w-3 h-3 text-emerald-500"
                                      />
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handleOptionChange(index, qIdx, oIdx, e.target.value)}
                                        placeholder={`Đáp án ${oIdx + 1}`}
                                        className="w-full bg-transparent outline-none text-xs"
                                      />
                                    </label>
                                  ))}
                                </div>
                                <input
                                  type="text"
                                  value={q.explanation}
                                  onChange={(e) => handleQuestionChange(index, qIdx, "explanation", e.target.value)}
                                  placeholder="Giải thích (tùy chọn)..."
                                  className="w-full px-3 py-1.5 rounded-lg border border-purple-100/30 bg-white text-[10px] focus:outline-none focus:border-purple-400 transition-all"
                                />
                              </div>
                            ))}
                            {step.quiz.questions.length === 0 && (
                              <p className="text-[10px] text-text-muted italic">Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để tạo.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completion Conditions */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-rose-100/10 pb-1.5">03. Điều kiện hoàn thành</h3>
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Điều kiện hoàn thành khóa học *</label>
                  <textarea
                    name="completionConditions"
                    rows="2"
                    required
                    value={roadmapForm.completionConditions}
                    onChange={handleRoadmapInputChange}
                    placeholder="Ví dụ: Đạt trên 80% điểm bài kiểm tra từ vựng cuối khóa và thử thách Phát âm AI."
                    className="w-full px-4 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary placeholder-text-muted resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-rose-100/20">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary-dark active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      <span>Đang đăng tải...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Đăng tải khóa học</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


