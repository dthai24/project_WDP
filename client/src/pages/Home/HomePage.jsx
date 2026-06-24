import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowRight, CheckCircle2, ChevronDown, Brain, Sparkles, 
  Gamepad2, Layers, BarChart2, Flame, Award, BookOpen, Globe, Heart,
  Play, Plus, Gamepad, Calendar, Compass
} from "lucide-react";
import { Profile } from "./Profile";

export default function HomePage({ currentUser, onLoginClick, onLogout }) {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");

  useEffect(() => {
    if (!currentUser) {
      setCurrentView("dashboard");
    }
  }, [currentUser]);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const stats = [
    { value: "120.000+", label: "Người học tin dùng", icon: "👥" },
    { value: "60+", label: "Lộ trình TOEIC & IELTS", icon: "📚" },
    { value: "10 Triệu+", label: "Từ vựng đã thuộc", icon: "🔥" },
    { value: "98.5%", label: "Tỷ lệ nhớ từ dài hạn", icon: "🧠" }
  ];

  const roadmaps = [
    {
      title: "Lộ trình ôn thi TOEIC",
      badge: "ETS 2026",
      desc: "Từ vựng phân chia theo level 450+, 650+, 850+. Giáo trình Hackers TOEIC, ETS mới nhất giúp bám sát đề thi thật.",
      icon: "🎯",
      color: "from-rose-500/8 to-pink-500/8 border-rose-200/40 text-rose-600"
    },
    {
      title: "Lộ trình ôn thi IELTS",
      badge: "IELTS 7.5+",
      desc: "Kho từ vựng IELTS Academic và General theo chủ đề thông dụng, giúp tối ưu kỹ năng Writing và Speaking vượt trội.",
      icon: "🏆",
      color: "from-purple-500/8 to-indigo-500/8 border-purple-200/40 text-purple-600"
    },
    {
      title: "Từ vựng THPT Quốc Gia",
      badge: "Lớp 10-12",
      desc: "Đầy đủ từ vựng theo sách giáo khoa Global Success lớp 10, 11, 12, hỗ trợ đắc lực cho kỳ thi tốt nghiệp THPT.",
      icon: "🏫",
      color: "from-pink-500/8 to-purple-500/8 border-pink-200/40 text-pink-600"
    },
    {
      title: "Từ vựng Giao tiếp & Phổ thông",
      badge: "Oxford 3000",
      desc: "Lộ trình chuẩn từ A1, A2 đến B2, C1 theo khung tham chiếu châu Âu, bộ từ vựng Oxford 3000/5000 từ cốt lõi.",
      icon: "💬",
      color: "from-rose-500/8 to-orange-500/8 border-rose-200/40 text-rose-500"
    }
  ];

  const features = [
    {
      title: "Flashcard Thông Minh",
      desc: "Học từ vựng qua thẻ ghi nhớ thông minh với đầy đủ phát âm chuẩn, nghĩa tiếng Việt, ví dụ thực tế và hình ảnh minh họa sinh động.",
      icon: Layers,
      color: "text-pink-600 bg-pink-50/80 border-pink-100"
    },
    {
      title: "Lặp Lại Ngắt Quãng (SRS)",
      desc: "Thuật toán SRS tự động đo lường độ quên của bạn để nhắc nhở ôn tập vào đúng thời điểm vàng, giúp nhớ lâu hơn gấp 3 lần.",
      icon: Brain,
      color: "text-purple-600 bg-purple-50/80 border-purple-100"
    },
    {
      title: "6 Chế Độ Game Tương Tác",
      desc: "Tránh nhàm chán bằng cách vừa chơi vừa học: Ghép cặp, Trắc nghiệm phản xạ, Word Scramble, Listening Challenge, Viết chính tả.",
      icon: Gamepad2,
      color: "text-rose-600 bg-rose-50/80 border-rose-100"
    },
    {
      title: "Cá Nhân Hóa Bằng AI",
      desc: "Tạo bộ từ vựng riêng của bạn từ Excel hoặc để AI gợi ý định nghĩa, câu ví dụ bám sát chuyên ngành học tập của bạn.",
      icon: Sparkles,
      color: "text-violet-600 bg-violet-50/80 border-violet-100"
    }
  ];

  const faqs = [
    {
      q: "English Master hoạt động theo phương pháp nào?",
      a: "English Master áp dụng phương pháp Lặp Lại Ngắt Quãng (Spaced Repetition System - SRS) lấy cảm hứng từ thuật toán Anki nổi tiếng. Hệ thống sẽ tự động phân tích lịch sử học của bạn và đưa các từ khó lặp lại nhiều lần, trong khi giãn cách thời gian ôn tập của các từ dễ, giúp bạn nhớ sâu và lưu giữ vào trí nhớ dài hạn."
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
      a: "Chúng tôi luôn chào đón các chuyên gia ngôn ngữ. Bạn chỉ cần click vào nút 'Become a Mentor' dưới chân trang hoặc trên thanh công cụ, điền thông tin và tải lên chứng chỉ (IELTS, TOEIC...). Ban quản trị sẽ duyệt và nâng cấp tài khoản của bạn trong 24 giờ."
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
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* Dashboard Header - Greeting & Summary Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-md border border-rose-100/40 p-6 rounded-[2rem] shadow-sm">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Chào bạn quay trở lại, <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600">{currentUser.name}</span>! 👋
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Phương pháp học ngắt quãng SRS của English Master giúp bạn ghi nhớ từ vựng vĩnh viễn.
            </p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-2 bg-rose-50 px-4 py-2.5 rounded-2xl border border-rose-100/50 shrink-0">
              <span className="text-lg">🔥</span>
              <div className="text-left">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none">Streak</p>
                <p className="text-sm font-black text-rose-600 leading-none mt-1">15 ngày</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2.5 rounded-2xl border border-purple-100/50 shrink-0">
              <span className="text-lg">⚡</span>
              <div className="text-left">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none">Học lực</p>
                <p className="text-sm font-black text-purple-600 leading-none mt-1">2,450 XP</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2.5 rounded-2xl border border-amber-100/50 shrink-0">
              <span className="text-lg">🎯</span>
              <div className="text-left">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none">Mục tiêu</p>
                <p className="text-sm font-black text-amber-600 leading-none mt-1">20 từ/ngày</p>
              </div>
            </div>
          </div>
        </div>

        {/* Major split layout: Left = SRS card & My Decks, Right = Weekly progress & Quick games */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: SRS & My Decks */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* SRS Review Card (Central Focus) */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2.2rem] text-white p-8 relative overflow-hidden shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 transition-all duration-300">
              {/* background design */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/15 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider">
                    <Brain className="w-3.5 h-3.5" />
                    <span>Thuật toán lặp lại ngắt quãng SRS</span>
                  </div>
                  <h3 className="text-3xl font-black tracking-tight leading-tight">
                    Hôm nay bạn có 18 từ cần ôn tập!
                  </h3>
                  <p className="text-sm text-pink-50 max-w-md font-medium">
                    Hãy duy trì nhịp học hàng ngày để ngăn chặn đường cong lãng quên tự nhiên của não bộ.
                  </p>
                </div>
                <button
                  onClick={() => alert("Chức năng đang phát triển: Bắt đầu ôn tập SRS!")}
                  className="bg-white text-rose-600 hover:bg-rose-50 px-6 py-4 rounded-2xl font-black text-sm shadow-xl active:scale-[0.97] transition-all flex items-center gap-2 shrink-0 animate-pulse-soft"
                >
                  <Play className="w-4 h-4 fill-rose-600" />
                  <span>Ôn tập ngay</span>
                </button>
              </div>
            </div>

            {/* My Decks / Vocabularies Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Bộ từ vựng của tôi</h3>
                <button 
                  onClick={() => alert("Chức năng đang phát triển: Thêm bộ từ vựng mới!")}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100/40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo bộ mới</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myDecks.map((deck) => {
                  const percentage = Math.round((deck.learned / deck.count) * 100);
                  return (
                    <div 
                      key={deck.id}
                      className="bg-white border border-rose-100/40 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xl">📚</span>
                          {deck.review > 0 ? (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 border border-rose-200">
                              Cần ôn: {deck.review}
                            </span>
                          ) : (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
                              Đã hoàn thành
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">{deck.title}</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-450 font-bold">
                            <span>Tiến trình</span>
                            <span>{deck.learned}/{deck.count} từ ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                          onClick={() => alert(`Bắt đầu học bộ: ${deck.title}`)}
                          className="py-2 rounded-xl text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100/40 transition-colors text-center"
                        >
                          Học từ mới
                        </button>
                        <button
                          onClick={() => alert(`Luyện tập bộ: ${deck.title}`)}
                          className="py-2 rounded-xl text-[11px] font-bold bg-slate-900 hover:bg-slate-850 text-white transition-colors text-center"
                        >
                          Luyện tập
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Weekly Streak & Quick Games */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Weekly Streak Matrix */}
            <div className="bg-white border border-rose-100/40 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span>Tiến trình tuần này</span>
                </h4>
                <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                  Streak: 15 ngày
                </span>
              </div>
              <div className="grid grid-cols-7 gap-2.5 text-center">
                {weeklyActivity.map((activity, index) => (
                  <div key={index} className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{activity.day}</p>
                    <div 
                      className={`h-11 rounded-xl flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                        activity.active 
                          ? "bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-500/10 hover:scale-105" 
                          : "bg-slate-50 text-slate-350 border-slate-100"
                      }`}
                      title={activity.active ? `Học ${activity.count} từ` : "Chưa học"}
                    >
                      {activity.active ? "✓" : ""}
                    </div>
                    {activity.active && (
                      <p className="text-[9px] font-bold text-rose-500 leading-none">+{activity.count}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Games List */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
                <Gamepad className="w-4 h-4 text-rose-500" />
                <span>Trò chơi luyện phản xạ</span>
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {quickGames.map((game, index) => {
                  const Icon = game.icon;
                  return (
                    <div 
                      key={index}
                      onClick={() => alert(`Chức năng đang phát triển: Mở game ${game.title}`)}
                      className="flex items-center gap-4 bg-white border border-rose-100/40 p-4 rounded-2xl hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-300"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${game.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 truncate">{game.title}</h5>
                        <p className="text-[10px] text-slate-450 truncate mt-0.5">{game.desc}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Official Roadmaps section (explore area) */}
        <div className="border-t border-rose-100/30 pt-10 space-y-6">
          <div className="text-left max-w-xl space-y-1">
            <h3 className="text-lg font-black text-slate-850 tracking-tight flex items-center gap-1.5">
              <Compass className="w-4.5 h-4.5 text-rose-500" />
              <span>Khám phá thêm lộ trình chuẩn</span>
            </h3>
            <p className="text-xs text-slate-450">Các khóa học được xây dựng theo chuẩn ETS TOEIC và IELTS Academic.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {roadmaps.map((item, index) => (
              <div 
                key={index}
                className="bg-white border border-rose-100/40 rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed truncate">{item.desc}</p>
                </div>
                <button 
                  onClick={() => alert(`Tham gia lộ trình: ${item.title}`)}
                  className="mt-4 w-full py-2 bg-rose-50/50 hover:bg-rose-600 hover:text-white rounded-xl text-[10px] font-bold text-rose-600 border border-rose-100/40 transition-all duration-200 text-center flex items-center justify-center gap-1"
                >
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-rose-100 antialiased overflow-x-hidden">
      
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-rose-100/40 px-6 lg:px-16 py-4 flex justify-between items-center shadow-sm">
        <div 
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => {
            if (currentUser) {
              setCurrentView("dashboard");
            } else {
              navigate("/");
            }
          }}
        >
          <img src="/images/logo.png" alt="English Master Logo" className="w-10 h-10 object-contain hover:scale-110 transition-transform duration-300" />
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-rose-600 to-pink-600 tracking-tight">
            English Master
          </span>
        </div>

        <div className="hidden md:flex space-x-8 font-bold text-sm text-slate-500">
          <a href="#features" className="hover:text-rose-600 transition-colors duration-200">Tính năng</a>
          <a href="#methods" className="hover:text-rose-600 transition-colors duration-200">Phương pháp SRS</a>
          <a href="#roadmaps" className="hover:text-rose-600 transition-colors duration-200">Lộ trình học</a>
          <a href="#faq" className="hover:text-rose-600 transition-colors duration-200">Hỏi đáp</a>
        </div>

        <div className="flex items-center gap-4">
          {(!currentUser || currentUser.role !== "Mentor") && (
            <Link 
              to="/become-mentor" 
              className="hidden sm:inline-block text-sm font-bold text-slate-600 hover:text-rose-600 transition-colors duration-200"
            >
              Trở thành Mentor
            </Link>
          )}
          
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-xs font-semibold text-rose-500">
                  {currentUser.role === "Admin" ? "Quản trị viên" : currentUser.role === "Mentor" ? "Mentor Giảng viên" : "Học viên"}
                </p>
              </div>
              {currentUser.role === "Learner" ? (
                <button
                  onClick={() => setCurrentView(currentView === "profile" ? "dashboard" : "profile")}
                  className="bg-rose-50/80 text-rose-600 border border-rose-100 px-4 py-2 rounded-xl font-bold text-xs hover:bg-rose-100 transition-all duration-200"
                >
                  {currentView === "profile" ? "Dashboard" : "profile"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (currentUser.role === "Admin") navigate("/admin");
                    else if (currentUser.role === "Mentor") navigate("/create-roadmap");
                    else navigate("/");
                  }}
                  className="bg-rose-50/80 text-rose-600 border border-rose-100 px-4 py-2 rounded-xl font-bold text-xs hover:bg-rose-100 transition-all duration-200"
                >
                  Vào Dashboard
                </button>
              )}
              <button
                onClick={onLogout}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all duration-200"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-[0.98] transition-all duration-200"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </nav>

      {currentUser ? (
        currentView === "profile" ? (
          <div 
            className="px-6 py-10 min-h-screen"
            style={{
              background: "linear-gradient(135deg, #fff5f5 0%, #fff0f3 30%, #fdf2f8 60%, #faf5ff 100%)"
            }}
          >
            <Profile 
              onLogout={onLogout} 
              setCurrentPage={(page) => setCurrentView(page === "dashboard" ? "dashboard" : "profile")} 
              currentUser={currentUser}
            />
          </div>
        ) : (
          renderDashboard()
        )
      ) : (
        <>
          {/* 2. HERO SECTION */}
      <section 
        className="relative px-6 lg:px-16 pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #fff5f5 0%, #fff0f3 30%, #fdf2f8 60%, #faf5ff 100%)"
        }}
      >
        {/* Soft glowing mesh background spots */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-200/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[0%] right-[-5%] w-[45%] h-[45%] bg-purple-200/25 rounded-full blur-[130px] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 font-bold text-xs tracking-wide uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" />
              <span>Giải pháp học tiếng Anh số 1</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Học từ vựng thông minh <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-rose-500 to-violet-600">
                Hiệu quả gấp 3 lần
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
              English Master kết hợp phương pháp <strong className="text-rose-600 font-extrabold">Lặp lại ngắt quãng (SRS)</strong> cùng hệ thống Flashcard thông minh và trò chơi tương tác. Giúp bạn nhớ từ vựng vĩnh viễn, bứt phá band điểm TOEIC, IELTS dễ dàng!
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={currentUser ? () => {
                  if (currentUser.role === "Admin") navigate("/admin");
                  else if (currentUser.role === "Mentor") navigate("/create-roadmap");
                  else navigate("/");
                } : onLoginClick}
                className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>Học miễn phí ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {(!currentUser || currentUser.role !== "Mentor") && (
                <button 
                  onClick={() => navigate("/become-mentor")}
                  className="bg-white/80 hover:bg-white border border-rose-100/80 text-slate-700 hover:text-rose-600 font-bold px-8 py-4 rounded-2xl shadow-sm active:scale-[0.98] transition-all text-sm text-center"
                >
                  Đăng ký giảng dạy (Mentor)
                </button>
              )}
            </div>
          </div>

          {/* Interactive Card Mockup representing Flashcard on the right */}
          <div className="lg:col-span-5 w-full flex justify-center relative">
            <div className="w-full max-w-sm bg-white/80 backdrop-blur-md rounded-[2.2rem] border border-rose-100/70 shadow-[0_20px_50px_rgba(244,63,94,0.12)] p-6 relative overflow-hidden transition-all duration-300 hover:shadow-rose-500/25 hover:border-rose-200/80 hover:-translate-y-1 animate-float">
              <div className="flex items-center justify-between border-b border-rose-50/50 pb-4 mb-6">
                <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">Từ vựng TOEIC</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="space-y-4 text-center py-6">
                <span className="text-xs font-bold text-rose-400/90">Từ vựng hôm nay</span>
                <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">accomplish</h3>
                <p className="text-xs text-slate-400 font-mono">/əˈkʌm.plɪʃ/ (verb)</p>
                <div className="py-2.5 px-5 bg-rose-50 text-rose-600 font-bold rounded-2xl text-sm inline-block border border-rose-100/30">
                  Đạt được, hoàn thành xuất sắc
                </div>
                <p className="text-xs text-slate-500 italic text-center max-w-xs mx-auto">
                  "We managed to accomplish the task before the deadline."
                </p>
              </div>
              <div className="border-t border-rose-50/50 pt-4 flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Trí nhớ dài hạn</span>
                <span>Ôn lại sau 3 ngày</span>
              </div>
            </div>
            
            {/* Small floating badge */}
            <div className="absolute -top-4 -right-4 bg-slate-900 text-white rounded-2xl py-2.5 px-4 shadow-lg border border-slate-800 text-xs font-black flex items-center gap-1.5 animate-float-delayed">
              <span>🔥 Streak: 15 ngày</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATISTICS SECTION */}
      <section className="bg-white border-y border-rose-100/30 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-rose-50/30 border border-rose-100/30 rounded-2xl p-6 text-center space-y-2 hover:-translate-y-1 hover:shadow-md hover:shadow-rose-500/5 transition-all duration-300"
            >
              <div className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight flex items-center justify-center gap-2">
                <span>{stat.icon}</span>
                <span>{stat.value}</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. METHODOLOGY (SRS) SECTION */}
      <section id="methods" className="px-6 py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 font-bold text-xs uppercase shadow-sm">
              🔬 Khoa học trí nhớ
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.2]">
              Lặp Lại Ngắt Quãng <br />
              <span className="text-rose-600 bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Spaced Repetition</span> là gì?
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Theo nghiên cứu về <strong className="text-slate-800 font-bold">Đường cong lãng quên (Forgetting Curve)</strong> của Hermann Ebbinghaus, bộ não con người có xu hướng quên 80% kiến thức mới sau vài ngày. 
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Hệ thống của <strong className="text-rose-500 font-semibold">English Master</strong> sẽ tính toán thời gian và tự động đưa ra các từ vựng ôn tập <strong className="text-slate-800 font-bold">ngay trước thời điểm bạn chuẩn bị quên</strong>. Phương pháp này giúp chuyển thông tin từ trí nhớ ngắn hạn sang trí nhớ dài hạn hiệu quả nhất mà không tốn nhiều công sức học nhồi nhét.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-rose-100/40 p-6 rounded-3xl shadow-[0_10px_30px_rgba(244,63,94,0.02)] hover:shadow-rose-500/5 hover:-translate-y-1 transition-all duration-300 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-lg mx-auto">1</div>
              <h4 className="font-bold text-slate-800 text-sm">Học qua Flashcard</h4>
              <p className="text-xs text-slate-400">Xem từ mới đầy đủ phát âm, ví dụ, hình ảnh minh họa sinh động.</p>
            </div>
            <div className="bg-white border border-rose-100/40 p-6 rounded-3xl shadow-[0_10px_30px_rgba(244,63,94,0.02)] hover:shadow-rose-500/5 hover:-translate-y-1 transition-all duration-300 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg mx-auto">2</div>
              <h4 className="font-bold text-slate-800 text-sm">Thuật toán Phân Tích</h4>
              <p className="text-xs text-slate-400">Hệ thống đánh giá độ khó của từ và theo dõi tần suất tương tác của bạn.</p>
            </div>
            <div className="bg-white border border-rose-100/40 p-6 rounded-3xl shadow-[0_10px_30px_rgba(244,63,94,0.02)] hover:shadow-rose-500/5 hover:-translate-y-1 transition-all duration-300 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg mx-auto">3</div>
              <h4 className="font-bold text-slate-800 text-sm">Nhắc Nhở Đúng Lúc</h4>
              <p className="text-xs text-slate-400">Từ vựng xuất hiện lại đúng lúc bạn chuẩn bị quên để ghi nhớ vĩnh viễn.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ROADMAPS & COURSES */}
      <section id="roadmaps" className="bg-rose-50/20 border-y border-rose-100/30 px-6 py-24">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Thư viện lộ trình học phong phú</h2>
            <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">Lựa chọn lộ trình phù hợp với mục tiêu của bạn</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmaps.map((item, index) => (
              <div 
                key={index}
                className="bg-white border border-rose-100/40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{item.title}</h3>
                  <p className="text-xs text-slate-450 leading-relaxed">{item.desc}</p>
                </div>
                <button 
                  onClick={currentUser ? () => {
                    if (currentUser.role === "Admin") navigate("/admin");
                    else if (currentUser.role === "Mentor") navigate("/create-roadmap");
                    else navigate("/");
                  } : onLoginClick}
                  className="mt-6 w-full py-2.5 bg-rose-50/50 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold text-rose-600 border border-rose-100/40 transition-all duration-255 text-center flex items-center justify-center gap-1.5"
                >
                  <span>Học lộ trình này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FEATURES & GAMES DETAIL */}
      <section id="features" className="px-6 py-24 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tính năng hỗ trợ học vượt trội</h2>
          <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">Vừa chơi vừa học giúp giảm 80% áp lực học từ mới</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className="bg-white border border-rose-100/40 p-6 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-4"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section id="faq" className="bg-rose-50/20 border-t border-rose-100/30 px-6 py-24">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Giải đáp thắc mắc</h2>
            <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">Câu hỏi thường gặp về hệ thống English Master</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className="bg-white border border-rose-100/40 rounded-2xl shadow-sm overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left font-bold text-slate-800 text-sm sm:text-base flex items-center justify-between hover:bg-rose-50/50 focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-rose-600' : ''}`} />
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-48 border-t border-rose-100/40' : 'max-h-0'}`}>
                    <p className="px-6 py-4 text-xs sm:text-sm text-slate-500 leading-relaxed bg-rose-50/10">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
        </>
      )}

      {/* 8. FOOTER */}
      <footer className="bg-white border-t border-rose-100/30 py-12 text-center antialiased">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/images/logo.png" alt="English Master Logo" className="w-8 h-8 object-contain" />
            <span className="text-lg font-black text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-rose-600 to-pink-600">English Master</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © {new Date().getFullYear()} English Master Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}