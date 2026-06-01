import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
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
      
      {/* 1. NAVBAR - Glassmorphism */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50 px-6 lg:px-16 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <span className="text-white font-black text-xl tracking-tighter">L</span>
          </div>
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 tracking-tight">
            Lexiora
          </span>
        </div>

        <div className="hidden md:flex space-x-10 font-bold text-sm text-slate-500">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#tech" className="hover:text-blue-600 transition-colors">Tech</a>
          <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          <a href="#community" className="hover:text-blue-600 transition-colors">Community</a>
        </div>

        <div className="flex items-center gap-4">
          
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all">
            Join Now
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION - Chỉ sử dụng duy nhất ảnh background phủ rộng */}
      <section 
        className="relative px-6 lg:px-16 pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/images/background.png')" }}
      >
        {/* Lớp phủ (Overlay) để chữ không bị chìm vào ảnh nền */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Chuyển sang bố cục thoáng đạt, tập trung hoàn toàn vào nội dung chữ */}
          <div className="max-w-2xl space-y-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Transform Your Skills <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500">
                with Lexiora
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-700 font-semibold leading-relaxed max-w-xl">
              Your path to personalized roadmaps, mentor guidance, structural interactive learning, and dynamic gamification.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button className="bg-slate-950 hover:bg-slate-900 text-white font-bold px-8 py-4 rounded-xl shadow-xl active:scale-[0.98] transition-all text-sm">
                Explore Roadmaps
              </button>
              <Link 
                to="/become-mentor" 
                className="bg-white/80 backdrop-blur-md border border-slate-200 hover:border-slate-300 text-slate-700 font-bold px-8 py-4 rounded-xl shadow-sm hover:bg-white active:scale-[0.98] transition-all text-sm text-center"
              >
                Become a Mentor
              </Link>
            </div>
          </div>
        </div>

        
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-3xl font-black text-slate-900 tracking-tight">Why Choose <span className="text-blue-600">Lexiora</span>?</p>
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

      {/* 4. TECHNOLOGIES */}
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

      {/* 5. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white font-black text-xs">L</div>
            <span className="text-xl font-black text-slate-900">Lexiora</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© {new Date().getFullYear()} Lexiora Platform. Built for excellence.</p>
        </div>
      </footer>
    </div>
  );
}