import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function HomePage({ currentUser, onLoginClick, onLogout }) {
  const navigate = useNavigate();

  const features = [
    {
      title: "Personalized Learning",
      desc: "AI recommendation engine suggests suitable learning paths tailored just for you.",
      icon: "🎯",
      color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-600",
    },
    {
      title: "Roadmap Builder",
      desc: "Mentors can create structured learning roadmaps with videos, docs, and quizzes.",
      icon: "🛠️",
      color: "from-teal-500/10 to-emerald-500/10 border-teal-500/20 text-teal-600",
    },
    {
      title: "Gamification",
      desc: "Earn XP, maintain streaks, and compete on the global leaderboard.",
      icon: "🔥",
      color: "from-orange-500/10 to-amber-500/10 border-orange-500/20 text-orange-600",
    },
    {
      title: "Mentor Upgrade",
      desc: "Users can apply to become mentors with portfolio and certificate reviews.",
      icon: "📄",
      color: "from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-600",
    },
  ];

  const technologies = [
    { category: "Frontend & Backend", tools: "ReactJS, NodeJS", icon: "💻" },
    { category: "Database", tools: "MongoDB", icon: "🗄️" },
    { category: "Development", tools: "Visual Studio Code", icon: "⚙️" },
    { category: "Diagramming", tools: "DrawIO, PlantUML", icon: "📊" },
    { category: "Documentation", tools: "Google Workspace", icon: "📝" },
    { category: "Management", tools: "GitHub, Agile Boards", icon: "🚀" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-blue-100 antialiased">
      
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50 px-6 lg:px-16 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <span className="text-white font-black text-xl tracking-tighter">E</span>
          </div>
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 tracking-tight">
            English Master
          </span>
        </div>

        <div className="hidden md:flex space-x-10 font-bold text-sm text-slate-500">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#tech" className="hover:text-blue-600 transition-colors">Tech</a>
          <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          <a href="#community" className="hover:text-blue-600 transition-colors">Community</a>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/become-mentor" 
            className="hidden sm:inline-block text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
          </Link>
          
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-xs font-medium text-slate-500">{currentUser.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              Login
            </button>
          )}
        </div>
      </nav>

 {/* [TÍNH NĂNG MỚI] 2. MENTOR WORKSPACE GATEWAY - ĐÃ SỬA MÀU PHẲNG VÀ RẢI NỘI DUNG FULL MÀN HÌNH */}
      {currentUser && currentUser.role === "Mentor" && (
        <div className="w-full bg-slate-950 border-b border-slate-800 animate-fade-in">
          {/* LƯU Ý: Thẻ bọc này không còn giới hạn chiều rộng (max-w) nữa */}
          <div className="px-6 lg:px-16 py-6 sm:py-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Hiệu ứng radar mờ phía nền - Làm mờ đi một chút để đảm bảo màu nền phẳng hơn */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_120%,rgba(37,99,235,0.10),transparent_40%)] pointer-events-none" />
            
            <div className="space-y-1.5 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Mentor Workspace</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Chào mừng trở lại, {currentUser.name}!
              </h2>
              {/* Tăng chiều rộng tối đa cho đoạn mô tả để text rải ra hơn */}
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Hệ thống đã sẵn sàng đón nhận lộ trình giảng dạy mới của bạn. Hãy bấm nút thiết lập để xây dựng bài học.
              </p>
            </div>

            <button
              onClick={() => navigate("/create-roadmap")}
              className="relative z-10 shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
            >
               Create Roadmap
            </button>
          </div>
        </div>
      )}

      {/* 3. HERO SECTION */}
      <section 
        className="relative px-6 lg:px-16 pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/images/background.png')" }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-2xl space-y-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Transform Your Skills <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500">
                with English Master
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-700 font-semibold leading-relaxed max-w-xl">
              Your path to personalized roadmaps, mentor guidance, structural interactive learning, and dynamic gamification.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={currentUser ? undefined : onLoginClick}
                className="bg-slate-950 hover:bg-slate-900 text-white font-bold px-8 py-4 rounded-xl shadow-xl active:scale-[0.98] transition-all text-sm"
              >
                {currentUser ? "Explore Roadmaps" : "Login to Explore"}
              </button>
              
              {/* Nếu là mentor thì nút dưới Hero dẫn thẳng vào không cần qua Navbar */}
              <button 
                onClick={() => currentUser?.role === "Mentor" ? navigate("/create-roadmap") : navigate("/become-mentor")}
                className="bg-white/80 backdrop-blur-md border border-slate-200 hover:border-slate-300 text-slate-700 font-bold px-8 py-4 rounded-xl shadow-sm hover:bg-white active:scale-[0.98] transition-all text-sm text-center"
              >
                {currentUser?.role === "Mentor" ? "Go to Mentor Dashboard" : "Become a Mentor"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-3xl font-black text-slate-900 tracking-tight">Why Choose <span className="text-blue-600">English Master</span>?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-gradient-to-br ${item.color}`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TECHNOLOGIES */}
      <section id="tech" className="px-6 py-20 bg-slate-50 rounded-[3rem] mx-4 md:mx-10 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-12 border-b border-slate-200 pb-4">Technologies & Infrastructure</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {technologies.map((tech, idx) => (
              <div key={idx} className="flex items-start gap-5">
                <div className="text-3xl p-3 bg-white rounded-2xl shadow-sm">{tech.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{tech.category}</h3>
                  <p className="text-sm text-slate-400 font-bold">{tech.tools}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white font-black text-xs">E</div>
            <span className="text-xl font-black text-slate-900">English Master</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© {new Date().getFullYear()} English Master Platform. Built for excellence.</p>
        </div>
      </footer>
    </div>
  );
}