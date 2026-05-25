import React from "react";
export default function HomePage() {
  const features = [
    {
      title: "Personalized Learning",
      desc: "AI recommendation engine suggests suitable learning paths tailored just for you.",
      icon: "🎯",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Roadmap Builder",
      desc: "Mentors can create structured learning roadmaps with videos, docs, and quizzes.",
      icon: "🛠️",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Gamification",
      desc: "Earn XP, maintain streaks, and compete on the global leaderboard.",
      icon: "🔥",
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Mentor Upgrade",
      desc: "Users can apply to become mentors with portfolio and certificate reviews.",
      icon: "📄",
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  const technologies = [
    { category: "Frontend & Backend", tools: "ReactJS, NodeJS", icon: "💻" },
    { category: "Database", tools: "MongoDB", icon: "🗄️" },
    { category: "Development", tools: "Visual Studio Code", icon: "⚙️" },
    { category: "Diagramming", tools: "DrawIO, PlantUML", icon: "📊" },
    { category: "Documentation", tools: "Google Workspace, MS Office", icon: "📝" },
    { category: "Management", tools: "GitHub, Agile Boards", icon: "🚀" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      {/* Navbar - Glassmorphism */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex justify-between items-center transition-all">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
            LearnPath
          </h1>
        </div>

        <div className="hidden md:flex space-x-8 font-medium text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#tech" className="hover:text-blue-600 transition-colors">Technologies</a>
          <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition-all duration-300">
          Get Started
        </button>
      </nav>

      {/* Hero Section - Clean & Modern Light Theme */}
      <section className="relative px-6 py-32 overflow-hidden flex flex-col items-center text-center bg-white">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-100/50 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-semibold text-sm">
            ✨ Welcome to the future of education
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-slate-900">
            Master your skills with a <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Smart Learning Platform
            </span>
          </h2>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
            A personalized roadmap system featuring mentor guidance, interactive gamification, quizzes, and an AI-driven recommendation engine.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-slate-900 text-white font-semibold px-8 py-4 rounded-full shadow-xl hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              Explore Courses
            </button>
            <button className="bg-white text-slate-700 border border-slate-200 font-semibold px-8 py-4 rounded-full shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-1 transition-all duration-300">
              Become a Mentor
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Core Features</h3>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Everything you need to accelerate your learning journey and stay motivated along the way.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-800">{item.title}</h4>
              <p className="text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technologies - Bento Box Layout */}
      <section id="tech" className="bg-slate-900 text-white py-24 px-6 rounded-[3rem] mx-4 md:mx-10 my-10 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Technologies & Tools</h3>
            <p className="text-slate-400 text-lg">
              Powered by modern frameworks and robust infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm p-6 rounded-3xl hover:bg-slate-800 transition-colors">
                <div className="text-3xl mb-4">{tech.icon}</div>
                <h4 className="text-lg font-semibold text-slate-200 mb-1">{tech.category}</h4>
                <p className="text-slate-400 font-medium">{tech.tools}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center bg-white border border-slate-100 rounded-[3rem] p-10 md:p-16 shadow-xl shadow-slate-200/50">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">About The Project</h3>
          <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
            This project is a smart learning management platform developed for university coursework. The system focuses on personalized learning, mentor-created roadmaps, sequential unlocking mechanisms, gamification systems, and role-based administration.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-center">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <span className="text-xl font-bold text-white">LearnPath</span>
          </div>
          <p>
            © {new Date().getFullYear()} Smart Learning Platform. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}