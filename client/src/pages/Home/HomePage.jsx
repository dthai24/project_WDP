import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, ChevronDown, Brain, Sparkles,
  Gamepad2, Layers, Flame, Award, BookOpen, Globe, Heart,
  Play, Plus, Gamepad, Calendar, Compass, Menu, X, Zap,
  Target, ChevronRight
} from "lucide-react";
import { Profile } from "./Profile";

export default function HomePage({ currentUser, onLoginClick, onLogout }) {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const stats = [
    { value: "120.000+", label: "Người học tin dùng" },
    { value: "60+", label: "Lộ trình TOEIC & IELTS" },
    { value: "10 Triệu+", label: "Từ vựng đã thuộc" },
    { value: "98.5%", label: "Tỷ lệ nhớ từ dài hạn" }
  ];

  const roadmaps = [
    {
      title: "Ôn thi TOEIC",
      badge: "ETS 2026",
      desc: "Từ vựng phân chia theo level 450+, 650+, 850+. Giáo trình Hackers TOEIC, ETS mới nhất.",
      icon: "target",
      color: "from-rose-500 to-pink-600"
    },
    {
      title: "Ôn thi IELTS",
      badge: "IELTS 7.5+",
      desc: "Kho từ vựng IELTS Academic và General theo chủ đề thông dụng.",
      icon: "award",
      color: "from-purple-500 to-indigo-600"
    },
    {
      title: "THPT Quốc Gia",
      badge: "Lớp 10-12",
      desc: "Đầy đủ từ vựng theo sách giáo khoa Global Success lớp 10, 11, 12.",
      icon: "book",
      color: "from-pink-500 to-purple-600"
    },
    {
      title: "Giao tiếp & Phổ thông",
      badge: "Oxford 3000",
      desc: "Lộ trình chuẩn từ A1, A2 đến B2, C1 theo khung tham chiếu châu Âu.",
      icon: "globe",
      color: "from-rose-500 to-orange-600"
    }
  ];

  const features = [
    {
      title: "Flashcard Thông Minh",
      desc: "Học từ vựng qua thẻ ghi nhớ thông minh với đầy đủ phát âm chuẩn, nghĩa tiếng Việt, ví dụ thực tế.",
      icon: Layers,
      color: "text-primary bg-primary/5 border-primary/10"
    },
    {
      title: "Lặp Lại Ngắt Quãng (SRS)",
      desc: "Thuật toán SRS tự động đo lường độ quên của bạn để nhắc nhở ôn tập vào đúng thời điểm vàng.",
      icon: Brain,
      color: "text-purple-600 bg-purple-50 border-purple-100"
    },
    {
      title: "6 Chế Độ Game Tương Tác",
      desc: "Tránh nhàm chán bằng cách vừa chơi vừa học: Ghép cặp, Trắc nghiệm phản xạ, Word Scramble.",
      icon: Gamepad2,
      color: "text-rose-600 bg-rose-50 border-rose-100"
    },
    {
      title: "Cá Nhân Hóa Bằng AI",
      desc: "Tạo bộ từ vựng riêng của bạn từ Excel hoặc để AI gợi ý định nghĩa, câu ví dụ.",
      icon: Sparkles,
      color: "text-violet-600 bg-violet-50 border-violet-100"
    }
  ];

  const faqs = [
    {
      q: "English Master hoạt động theo phương pháp nào?",
      a: "English Master áp dụng phương pháp Lặp Lại Ngắt Quãng (Spaced Repetition System - SRS) lấy cảm hứng từ thuật toán Anki. Hệ thống tự động phân tích lịch sử học của bạn và đưa các từ khó lặp lại nhiều lần, trong khi giãn cách thời gian ôn tập của các từ dễ, giúp bạn nhớ sâu và lưu giữ vào trí nhớ dài hạn."
    },
    {
      q: "Nền tảng này có hoàn toàn miễn phí không?",
      a: "Có! Bạn hoàn toàn có thể tự học từ vựng, tự tạo flashcard và luyện tập toàn bộ 6 chế độ game hoàn toàn miễn phí."
    },
    {
      q: "Tôi có thể tự tạo học liệu (bộ từ vựng) riêng không?",
      a: "Hoàn toàn được. Bạn có thể tự tạo các deck từ vựng bằng cách nhập thủ công, nhập từ file Excel hoặc sử dụng trợ lý AI của English Master để dịch nghĩa và tự sinh câu ví dụ cực kỳ nhanh chóng."
    },
    {
      q: "Làm thế nào để trở thành Mentor của English Master?",
      a: "Chúng tôi luôn chào đón các chuyên gia ngôn ngữ. Bạn chỉ cần click vào nút 'Trở thành Mentor' dưới chân trang hoặc trên thanh công cụ, điền thông tin và tải lên chứng chỉ (IELTS, TOEIC...). Ban quản trị sẽ duyệt và nâng cấp tài khoản của bạn trong 24 giờ."
    }
  ];

  const renderDashboard = () => {
    const myDecks = [
      { id: 1, title: "Từ vựng IELTS Academic", count: 180, learned: 112, review: 12 },
      { id: 2, title: "ETS TOEIC Vocab 2026", count: 320, learned: 154, review: 6 },
      { id: 3, title: "English for Communication (B2)", count: 95, learned: 82, review: 0 }
    ];

    const weeklyActivity = [
      { day: "T2", active: true, count: 24 },
      { day: "T3", active: true, count: 18 },
      { day: "T4", active: true, count: 35 },
      { day: "T5", active: false, count: 0 },
      { day: "T6", active: true, count: 15 },
      { day: "T7", active: true, count: 42 },
      { day: "CN", active: false, count: 0 }
    ];

    const quickGames = [
      { title: "Nối từ (Memory Match)", desc: "Ghép đôi từ và nghĩa", icon: Gamepad2, color: "bg-pink-50 text-pink-600 border-pink-100" },
      { title: "Trắc nghiệm Phản xạ", desc: "Chọn nghĩa từ nhanh", icon: Sparkles, color: "bg-purple-50 text-purple-600 border-purple-100" },
      { title: "Word Scramble", desc: "Sắp xếp chữ cái thành từ", icon: Layers, color: "bg-rose-50 text-rose-600 border-rose-100" },
      { title: "Listening Challenge", desc: "Nghe phát âm điền từ", icon: Brain, color: "bg-violet-50 text-violet-600 border-violet-100" }
    ];

    return (
      <div className="section-container py-10 space-y-10">
        <div className="card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-text-primary tracking-tight">
              Chào bạn quay trở lại, <span className="text-primary">{currentUser.name}</span> 👋
            </h2>
            <p className="text-xs text-text-secondary font-medium">
              Phương pháp học ngắt quãng SRS giúp bạn ghi nhớ từ vựng vĩnh viễn.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            <div className="flex items-center gap-2 bg-primary/5 px-4 py-2.5 rounded-2xl border border-primary/10 shrink-0">
              <Flame className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest leading-none">Streak</p>
                <p className="text-sm font-black text-primary leading-none mt-1">15 ngày</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2.5 rounded-2xl border border-purple-100/50 shrink-0">
              <Zap className="w-4 h-4 text-purple-600" />
              <div className="text-left">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none">Học lực</p>
                <p className="text-sm font-black text-purple-600 leading-none mt-1">2,450 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2.5 rounded-2xl border border-amber-100/50 shrink-0">
              <Target className="w-4 h-4 text-amber-600" />
              <div className="text-left">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none">Mục tiêu</p>
                <p className="text-sm font-black text-amber-600 leading-none mt-1">20 từ/ngày</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-[2rem] text-white p-8 relative overflow-hidden shadow-lg shadow-primary/20">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider">
                    <Brain className="w-3.5 h-3.5" />
                    <span>Thuật toán SRS</span>
                  </div>
                  <h3 className="text-3xl font-black tracking-tight leading-tight">
                    Hôm nay bạn có 18 từ cần ôn tập!
                  </h3>
                  <p className="text-sm text-white/70 max-w-md font-medium">
                    Hãy duy trì nhịp học hàng ngày để ngăn chặn đường cong lãng quên tự nhiên của não bộ.
                  </p>
                </div>
                <button className="bg-white text-primary hover:bg-rose-50 px-6 py-4 rounded-2xl font-black text-sm shadow-xl active:scale-[0.97] transition-all flex items-center gap-2 shrink-0">
                  <Play className="w-4 h-4 fill-primary" />
                  <span>Ôn tập ngay</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-text-primary tracking-tight">Bộ từ vựng của tôi</h3>
                <button className="btn-ghost btn-sm flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo bộ mới</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myDecks.map((deck) => {
                  const percentage = Math.round((deck.learned / deck.count) * 100);
                  return (
                    <div key={deck.id} className="card-hover p-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <BookOpen className="w-5 h-5 text-primary" />
                          {deck.review > 0 ? (
                            <span className="badge-primary">Cần ôn: {deck.review}</span>
                          ) : (
                            <span className="badge-success">Đã hoàn thành</span>
                          )}
                        </div>
                        <h4 className="font-bold text-text-primary text-sm leading-snug">{deck.title}</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-text-secondary font-bold">
                            <span>Tiến trình</span>
                            <span>{deck.learned}/{deck.count} từ ({percentage}%)</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <button className="py-2 rounded-xl text-[11px] font-bold bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 transition-colors text-center">
                          Học từ mới
                        </button>
                        <button className="py-2 rounded-xl text-[11px] font-bold bg-text-primary hover:bg-text-primary/90 text-white transition-colors text-center">
                          Luyện tập
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="card p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-text-primary text-sm tracking-tight flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Tiến trình tuần này</span>
                </h4>
                <span className="badge-primary">Streak: 15 ngày</span>
              </div>
              <div className="grid grid-cols-7 gap-2.5 text-center">
                {weeklyActivity.map((activity, index) => (
                  <div key={index} className="space-y-1.5">
                    <p className="text-[10px] font-bold text-text-muted uppercase">{activity.day}</p>
                    <div className={`h-11 rounded-xl flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                      activity.active
                        ? "bg-primary text-white border-primary shadow-sm shadow-primary/10"
                        : "bg-surface-muted text-text-muted border-border"
                    }`}>
                      {activity.active ? "✓" : ""}
                    </div>
                    {activity.active && (
                      <p className="text-[9px] font-bold text-primary leading-none">+{activity.count}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-text-primary text-sm tracking-tight flex items-center gap-1.5">
                <Gamepad className="w-4 h-4 text-primary" />
                <span>Trò chơi luyện phản xạ</span>
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {quickGames.map((game, index) => {
                  const Icon = game.icon;
                  return (
                    <div key={index} className="card-hover flex items-center gap-4 p-4 cursor-pointer">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${game.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <h5 className="text-xs font-bold text-text-primary truncate">{game.title}</h5>
                        <p className="text-[10px] text-text-secondary truncate mt-0.5">{game.desc}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted ml-auto shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="divider pt-10 space-y-6">
          <div className="text-left max-w-xl space-y-1">
            <h3 className="text-lg font-black text-text-primary tracking-tight flex items-center gap-1.5">
              <Compass className="w-5 h-5 text-primary" />
              <span>Khám phá thêm lộ trình chuẩn</span>
            </h3>
            <p className="text-xs text-text-secondary">Các khóa học được xây dựng theo chuẩn ETS TOEIC và IELTS Academic.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {roadmaps.map((item, index) => (
              <div key={index} className="card-hover p-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white`}>
                      {item.icon === "target" && <Target className="w-5 h-5" />}
                      {item.icon === "award" && <Award className="w-5 h-5" />}
                      {item.icon === "book" && <BookOpen className="w-5 h-5" />}
                      {item.icon === "globe" && <Globe className="w-5 h-5" />}
                    </div>
                    <span className="badge-primary">{item.badge}</span>
                  </div>
                  <h4 className="font-bold text-text-primary text-sm">{item.title}</h4>
                  <p className="text-[10px] text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
                <button className="mt-4 w-full py-2 bg-primary/5 hover:bg-primary hover:text-white rounded-xl text-[10px] font-bold text-primary border border-primary/10 transition-all duration-200 text-center flex items-center justify-center gap-1">
                  <span>Khám phá</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface-muted text-text-primary font-sans selection:bg-primary/15 antialiased overflow-x-hidden">
      <nav className="sticky top-0 z-50 glass-strong border-b border-border/40 px-6 lg:px-16 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => {
          if (currentUser) setCurrentView("dashboard");
          else navigate("/");
        }}>
          <img src="/images/logo.png" alt="English Master" className="w-9 h-9 object-contain" />
          <span className="text-xl font-black text-text-primary tracking-tight">English Master</span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-text-secondary">
          <a href="#features" className="hover:text-primary transition-colors">Tính năng</a>
          <a href="#methods" className="hover:text-primary transition-colors">Phương pháp SRS</a>
          <a href="#roadmaps" className="hover:text-primary transition-colors">Lộ trình học</a>
          <a href="#faq" className="hover:text-primary transition-colors">Hỏi đáp</a>
        </div>

        <div className="flex items-center gap-3">
          {(!currentUser || currentUser.role !== "Mentor") && (
            <Link to="/become-mentor" className="hidden sm:inline-block text-sm font-semibold text-text-secondary hover:text-primary transition-colors">
              Trở thành Mentor
            </Link>
          )}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-surface-muted rounded-2xl px-3 py-1.5 border border-border/40">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">
                  {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-text-primary leading-tight">{currentUser.name}</p>
                  <p className="text-[9px] font-semibold text-primary leading-tight">
                    {currentUser.role === "Admin" ? "Quản trị viên" : currentUser.role === "Mentor" ? "Giảng viên" : "Học viên"}
                  </p>
                </div>
              </div>
              {currentUser.role === "Learner" && (
                <button
                  onClick={() => setCurrentView(currentView === "profile" ? "dashboard" : "profile")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    currentView === "profile"
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "bg-surface-muted text-text-secondary hover:text-primary border border-border/40"
                  }`}
                >
                  {currentView === "profile" ? "Trang chủ" : "Hồ sơ"}
                </button>
              )}
              {currentUser.role !== "Learner" && (
                <button
                  onClick={() => {
                    if (currentUser.role === "Admin") navigate("/admin");
                    else if (currentUser.role === "Mentor") navigate("/create-roadmap");
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-surface-muted text-text-secondary hover:text-primary border border-border/40 transition-all duration-200"
                >
                  {currentUser.role === "Mentor" ? "Dashboard" : "Trang chủ"}
                </button>
              )}
              <button
                onClick={onLogout}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-all duration-200 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-text-secondary hover:text-primary">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <button onClick={onLoginClick} className="btn-primary">Đăng nhập</button>
            </div>
          )}
        </div>
      </nav>

      {mobileMenuOpen && !currentUser && (
        <div className="md:hidden glass-strong border-b border-border/40 px-6 py-4 space-y-3">
          <a href="#features" className="block text-sm font-semibold text-text-secondary hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Tính năng</a>
          <a href="#methods" className="block text-sm font-semibold text-text-secondary hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Phương pháp SRS</a>
          <a href="#roadmaps" className="block text-sm font-semibold text-text-secondary hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Lộ trình học</a>
          <a href="#faq" className="block text-sm font-semibold text-text-secondary hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Hỏi đáp</a>
          <Link to="/become-mentor" className="block text-sm font-semibold text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Trở thành Mentor</Link>
        </div>
      )}

      {currentUser ? (
        currentView === "profile" ? (
          <div className="px-6 py-10 min-h-screen bg-gradient-to-br from-surface-alt via-surface-muted to-purple-50/30">
            <div className="section-container">
              <Profile onLogout={onLogout} setCurrentPage={(page) => setCurrentView(page === "dashboard" ? "dashboard" : "profile")} currentUser={currentUser} />
            </div>
          </div>
        ) : (
          renderDashboard()
        )
      ) : (
        <>
          <section className="relative px-6 lg:px-16 pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-gradient-to-br from-surface-alt via-surface-muted to-purple-50/30">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[0%] right-[-5%] w-[45%] h-[45%] bg-purple-200/15 rounded-full blur-[130px] pointer-events-none" />
            <div className="relative z-10 section-container grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-8 text-left">
                <div className="eyebrow">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Giải pháp học tiếng Anh số 1</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-text-primary tracking-tight leading-[1.12]">
                  Học từ vựng thông minh <br />
                  <span className="text-primary">Hiệu quả gấp 3 lần</span>
                </h1>
                <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl font-medium">
                  English Master kết hợp phương pháp <strong className="text-primary font-extrabold">Lặp lại ngắt quãng (SRS)</strong> cùng hệ thống Flashcard thông minh và trò chơi tương tác. Giúp bạn nhớ từ vựng vĩnh viễn, bứt phá band điểm TOEIC, IELTS dễ dàng!
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-4">
                  <button onClick={currentUser ? () => {
                    if (currentUser.role === "Admin") navigate("/admin");
                    else if (currentUser.role === "Mentor") navigate("/create-roadmap");
                    else navigate("/");
                  } : onLoginClick} className="btn-primary btn-lg">
                    <span>Học miễn phí ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {(!currentUser || currentUser.role !== "Mentor") && (
                    <button onClick={() => navigate("/become-mentor")} className="btn-secondary btn-lg">
                      Đăng ký giảng dạy (Mentor)
                    </button>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 w-full flex justify-center relative">
                <div className="w-full max-w-sm card-elevated p-6 relative overflow-hidden transition-all duration-300 hover:shadow-primary/25 hover:border-primary/20 hover:-translate-y-1">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Từ vựng TOEIC</span>
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                  </div>
                  <div className="space-y-4 text-center py-6">
                    <span className="text-xs font-bold text-primary/60">Từ vựng hôm nay</span>
                    <h3 className="text-4xl font-extrabold text-text-primary tracking-tight">accomplish</h3>
                    <p className="text-xs text-text-muted font-mono">/e'kAm.plIS/ (verb)</p>
                    <div className="py-2.5 px-5 bg-primary/5 text-primary font-bold rounded-2xl text-sm inline-block border border-primary/10">
                      Đạt được, hoàn thành xuất sắc
                    </div>
                    <p className="text-xs text-text-secondary italic text-center max-w-xs mx-auto">
                      "We managed to accomplish the task before the deadline."
                    </p>
                  </div>
                  <div className="border-t border-border/40 pt-4 flex items-center justify-between text-xs text-text-muted font-semibold">
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-primary fill-primary" /> Trí nhớ dài hạn</span>
                    <span>Ôn lại sau 3 ngày</span>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-text-primary text-white rounded-2xl py-2.5 px-4 shadow-lg text-xs font-black flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-accent" />
                  <span>Streak: 15 ngày</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white border-y border-border/30 py-12">
            <div className="section-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="card-hover p-6 text-center space-y-2">
                  <p className="text-3xl sm:text-4xl font-black text-primary tracking-tight">{stat.value}</p>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="methods" className="section-container section-padding">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-6">
                <div className="eyebrow">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Khoa học trí nhớ</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight leading-[1.2]">
                  Lặp Lại Ngắt Quãng <br />
                  <span className="text-primary">Spaced Repetition</span> là gì?
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Theo nghiên cứu về <strong className="text-text-primary font-bold">Đường cong lãng quên (Forgetting Curve)</strong> của Hermann Ebbinghaus, bộ não con người có xu hướng quên 80% kiến thức mới sau vài ngày.
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Hệ thống của <strong className="text-primary font-semibold">English Master</strong> sẽ tính toán thời gian và tự động đưa ra các từ vựng ôn tập <strong className="text-text-primary font-bold">ngay trước thời điểm bạn chuẩn bị quên</strong>. Phương pháp này giúp chuyển thông tin từ trí nhớ ngắn hạn sang trí nhớ dài hạn hiệu quả nhất.
                </p>
              </div>
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="card-hover p-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mx-auto">1</div>
                  <h4 className="font-bold text-text-primary text-sm">Học qua Flashcard</h4>
                  <p className="text-xs text-text-secondary">Xem từ mới đầy đủ phát âm, ví dụ, hình ảnh minh họa sinh động.</p>
                </div>
                <div className="card-hover p-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg mx-auto">2</div>
                  <h4 className="font-bold text-text-primary text-sm">Thuật toán Phân Tích</h4>
                  <p className="text-xs text-text-secondary">Hệ thống đánh giá độ khó của từ và theo dõi tần suất tương tác của bạn.</p>
                </div>
                <div className="card-hover p-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg mx-auto">3</div>
                  <h4 className="font-bold text-text-primary text-sm">Nhắc Nhở Đúng Lúc</h4>
                  <p className="text-xs text-text-secondary">Từ vựng xuất hiện lại đúng lúc bạn chuẩn bị quên để ghi nhớ vĩnh viễn.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="roadmaps" className="bg-primary/5 border-y border-border/30 section-padding">
            <div className="section-container space-y-12">
              <div className="text-center max-w-xl mx-auto space-y-3">
                <h2 className="text-3xl font-black text-text-primary tracking-tight">Thư viện lộ trình học phong phú</h2>
                <p className="text-xs text-primary font-bold uppercase tracking-wider">Lựa chọn lộ trình phù hợp với mục tiêu của bạn</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {roadmaps.map((item, index) => (
                  <div key={index} className="card-hover p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}>
                          {item.icon === "target" && <Target className="w-6 h-6" />}
                          {item.icon === "award" && <Award className="w-6 h-6" />}
                          {item.icon === "book" && <BookOpen className="w-6 h-6" />}
                          {item.icon === "globe" && <Globe className="w-6 h-6" />}
                        </div>
                        <span className="badge-primary">{item.badge}</span>
                      </div>
                      <h4 className="font-bold text-text-primary text-sm">{item.title}</h4>
                      <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                    </div>
                    <button className="mt-4 w-full py-2.5 bg-primary/5 hover:bg-primary hover:text-white rounded-xl text-xs font-bold text-primary border border-primary/10 transition-all duration-200 text-center flex items-center justify-center gap-1">
                      <span>Khám phá</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FEATURES */}
          <section id="features" className="section-container section-padding">
            <div className="space-y-12">
              <div className="text-center max-w-xl mx-auto space-y-3">
                <div className="eyebrow inline-flex mx-auto">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tính năng nổi bật</span>
                </div>
                <h2 className="text-3xl font-black text-text-primary tracking-tight">
                  Tại sao chọn English Master?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="card-hover p-6 flex items-start gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${feature.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-text-primary text-sm">{feature.title}</h3>
                        <p className="text-xs text-text-secondary leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="bg-white border-y border-border/30 section-padding">
            <div className="section-container max-w-3xl mx-auto space-y-10">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-black text-text-primary tracking-tight">
                  Câu hỏi thường gặp
                </h2>
                <p className="text-sm text-text-secondary">
                  Những thắc mắc phổ biến về English Master
                </p>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="card overflow-hidden">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-5 flex items-center justify-between text-left hover:bg-surface-muted/50 transition-colors"
                    >
                      <span className="font-bold text-text-primary text-sm pr-4">{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-300 ${
                        activeFaq === index ? "rotate-180" : ""
                      }`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${
                      activeFaq === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}>
                      <p className="px-5 pb-5 text-xs text-text-secondary leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="bg-text-primary text-white section-padding">
            <div className="section-container">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <img src="/images/logo.png" alt="English Master" className="w-9 h-9 object-contain brightness-0 invert" />
                    <span className="text-xl font-black tracking-tight">English Master</span>
                  </div>
                  <p className="text-sm text-white/60 max-w-md leading-relaxed">
                    English Master là hệ sinh thái học tiếng Anh không đồng bộ, dựa trên phương pháp Lặp Lại Ngắt Quãng (SRS) giúp bạn ghi nhớ từ vựng vĩnh viễn.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Sản phẩm</h4>
                  <ul className="space-y-2.5">
                    <li><a href="#features" className="text-sm text-white/70 hover:text-white transition-colors">Tính năng</a></li>
                    <li><a href="#roadmaps" className="text-sm text-white/70 hover:text-white transition-colors">Lộ trình học</a></li>
                    <li><a href="#methods" className="text-sm text-white/70 hover:text-white transition-colors">Phương pháp SRS</a></li>
                    <li><Link to="/become-mentor" className="text-sm text-white/70 hover:text-white transition-colors">Trở thành Mentor</Link></li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Hỗ trợ</h4>
                  <ul className="space-y-2.5">
                    <li><a href="#faq" className="text-sm text-white/70 hover:text-white transition-colors">Hỏi đáp</a></li>
                    <li><span className="text-sm text-white/40 cursor-not-allowed">Chính sách bảo mật</span></li>
                    <li><span className="text-sm text-white/40 cursor-not-allowed">Điều khoản sử dụng</span></li>
                  </ul>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-white/40">
                  &copy; 2026 English Master. Tất cả quyền được bảo lưu.
                </p>
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span>Được xây dựng bởi <strong className="text-white/60">English Master Team</strong></span>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
