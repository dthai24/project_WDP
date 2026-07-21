import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  Lightning,
  Globe,
  ArrowRight,
  Star,
  Users,
  PlayCircle,
  ChartLine,
  Sparkle,
  Fire,
  Trophy,
  CaretRight,
  Quotes,
  RocketLaunch,
  Translate,
  Headphones,
} from "@phosphor-icons/react";
import CourseCard from "@/features/courses/components/CourseCard";

/* ─── Design Read ───
   Reading this as: Premium English-learning landing for students & professionals,
   with a confident, warm-educational aesthetic leaning toward emerald + sky accent,
   Outfit typography, asymmetric layouts, restrained motion.
   DESIGN_VARIANCE: 7 | MOTION_INTENSITY: 5 | VISUAL_DENSITY: 3
*/

function StatPill({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/80 border border-slate-200/60 shadow-sm">
      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
        <Icon size={16} weight="fill" className="text-brand-600" />
      </div>
      <div>
        <p className="text-sm font-extrabold text-slate-900 leading-none">{value}</p>
        <p className="text-[11px] text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 flex items-center justify-center mb-4 ring-1 ring-brand-100/50">
        <Icon size={20} weight="fill" className="text-brand-600" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, name, role, avatar }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 transition-all duration-300 hover:shadow-card-hover">
      <Quotes size={20} weight="fill" className="text-brand-200 mb-3" />
      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        {quote}
      </p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center text-xs font-bold text-brand-700 ring-2 ring-white">
          {avatar}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [popularCourses, setPopularCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchPopularCourses() {
      try {
        const userRaw = localStorage.getItem("user");
        const currentUser = userRaw ? JSON.parse(userRaw) : null;
        const headers = currentUser?.userId ? { "x-user-id": currentUser.userId } : {};

        const res = await fetch("http://localhost:5050/api/courses/student?sort=popular&limit=6", { headers });
        const result = await res.json();

        if (result.success && Array.isArray(result.data)) {
          setPopularCourses(result.data.slice(0, 6));
        }
      } catch (err) {
        console.error("Failed to fetch popular courses:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPopularCourses();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[100dvh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/60 via-white to-accent-50/40" />
        <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-gradient-to-bl from-brand-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-tr from-accent-200/20 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16 sm:pt-28 sm:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Text */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-brand-200/60 mb-6 shadow-sm">
                <Sparkle size={14} weight="fill" className="text-brand-500" />
                <span className="text-xs font-bold text-brand-700 tracking-wide">
                  Your English Journey Starts Here
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tighter text-slate-900 leading-[1.05] mb-5">
                Master English with{" "}
                <span className="gradient-text">
                  English Master
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg mb-8">
                Personalized learning paths, interactive lessons, and real progress tracking. Start speaking with confidence today.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 active:bg-slate-950 transition-all duration-200 active:scale-[0.98] shadow-md"
                >
                  Explore Courses
                  <ArrowRight size={16} weight="bold" />
                </Link>
                {!user && (
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-700 rounded-xl text-sm font-bold border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-all duration-200 active:scale-[0.98] shadow-sm"
                  >
                    <RocketLaunch size={16} weight="fill" className="text-brand-500" />
                    Start Free
                  </Link>
                )}
              </div>

              {/* Stats pills */}
              <div className="flex flex-wrap items-center gap-3 mt-10">
                <StatPill icon={Users} value="2,000+" label="Students" />
                <StatPill icon={BookOpen} value="50+" label="Courses" />
                <StatPill icon={Star} value="4.8" label="Rating" />
              </div>
            </div>

            {/* Right: Visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-[520px] aspect-square">
                {/* Decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-100/30 to-accent-100/30 rounded-[40px] blur-2xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-brand-200/20 to-accent-200/20 rounded-full blur-xl" />

                {/* Central icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-36 h-36 bg-white rounded-[32px] shadow-elevated flex items-center justify-center border border-white/60">
                    <GraduationCap size={64} weight="fill" className="text-brand-500" />
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute top-[8%] right-[8%] bg-white rounded-2xl px-5 py-3.5 shadow-card-hover border border-slate-100 animate-float">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Lightning size={18} weight="fill" className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Interactive</p>
                      <p className="text-[10px] text-slate-500">Lessons</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-[12%] left-[3%] bg-white rounded-2xl px-5 py-3.5 shadow-card-hover border border-slate-100 animate-float" style={{ animationDelay: "-2s" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
                      <ChartLine size={18} weight="fill" className="text-brand-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Track</p>
                      <p className="text-[10px] text-slate-500">Progress</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-[28%] right-[12%] bg-white rounded-2xl px-5 py-3.5 shadow-card-hover border border-slate-100 animate-float" style={{ animationDelay: "-4s" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-accent-50 flex items-center justify-center">
                      <Globe size={18} weight="fill" className="text-accent-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Real World</p>
                      <p className="text-[10px] text-slate-500">Practice</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUSTED BY / LOGO WALL ===== */}
      <section className="py-12 sm:py-16 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-8">
            Trusted by students from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {["RMIT University", "UEH", "HUTECH", "FPT", "VNU-HCM", "British Council"].map((name) => (
              <div key={name} className="flex items-center gap-2 text-slate-400">
                <GraduationCap size={18} weight="fill" className="text-slate-300" />
                <span className="text-sm font-bold text-slate-400">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">
              Why English Master
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
              Learning English,{" "}
              <span className="gradient-text">reimagined</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
              We combine proven methodology with modern technology to make English learning effective and enjoyable.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={Lightning}
              title="Personalized Paths"
              description="AI-driven learning paths adapt to your level, goals, and pace. No two learners have the same journey."
            />
            <FeatureCard
              icon={PlayCircle}
              title="Interactive Lessons"
              description="Engage with video lessons, quizzes, and real-time feedback. Learning by doing, not just reading."
            />
            <FeatureCard
              icon={ChartLine}
              title="Track Your Growth"
              description="Monitor your progress with detailed analytics. See exactly how your skills improve over time."
            />
            <FeatureCard
              icon={Translate}
              title="Real-World Practice"
              description="Practice with scenarios you will actually use: travel, work, exams, and daily conversation."
            />
            <FeatureCard
              icon={Fire}
              title="Daily Streaks"
              description="Stay motivated with streak tracking and achievement badges. Consistency builds fluency."
            />
            <FeatureCard
              icon={Headphones}
              title="Listening & Speaking"
              description="Improve pronunciation and comprehension with native audio and speech recognition."
            />
          </div>
        </div>
      </section>

      {/* ===== STREAK / DAILY LEARNING ===== */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-slate-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Visual */}
            <div className="relative">
              <div className="relative w-full max-w-[480px] mx-auto aspect-[4/3]">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 to-orange-100/30 rounded-[32px] blur-2xl" />

                {/* Streak calendar mockup */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-2xl shadow-elevated border border-slate-100 p-5 w-full max-w-[360px]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Fire size={20} weight="fill" className="text-orange-500" />
                        <span className="text-sm font-bold text-slate-900">Your Streak</span>
                      </div>
                      <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full">
                        <Trophy size={14} weight="fill" className="text-orange-500" />
                        <span className="text-xs font-extrabold text-orange-700">12 days</span>
                      </div>
                    </div>

                    {/* Mini calendar grid */}
                    <div className="grid grid-cols-7 gap-1.5 mb-3">
                      {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
                        <span key={d} className="text-[10px] font-bold text-slate-400 text-center">{d}</span>
                      ))}
                      {Array.from({ length: 28 }, (_, i) => {
                        const filled = i < 12;
                        const today = i === 11;
                        return (
                          <div
                            key={i}
                            className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-bold transition-colors ${
                              today
                                ? "bg-orange-500 text-white ring-2 ring-orange-200"
                                : filled
                                ? "bg-orange-100 text-orange-700"
                                : "bg-slate-50 text-slate-300"
                            }`}
                          >
                            {i + 1}
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-xs text-slate-500 text-center">
                      Keep your streak alive! Practice daily.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="max-w-lg">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-3">
                Daily Practice
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                Build your{" "}
                <span className="gradient-text">daily habit</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-6">
                Consistency is the key to language mastery. Our streak system keeps you motivated with daily goals, achievement badges, and progress milestones.
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Fire size={16} weight="fill" className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Daily Goals</p>
                    <p className="text-xs text-slate-500">Complete one lesson each day to maintain your streak</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Trophy size={16} weight="fill" className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Achievement Badges</p>
                    <p className="text-xs text-slate-500">Unlock badges at 7, 30, 60, and 100-day milestones</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                    <ChartLine size={16} weight="fill" className="text-brand-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Progress Analytics</p>
                    <p className="text-xs text-slate-500">Track your weekly activity and see your improvement over time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== POPULAR COURSES ===== */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50/60 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="max-w-xl">
              <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">
                Start Learning
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
                Popular Courses
              </h2>
              <p className="text-base text-slate-500 leading-relaxed">
                Start with our most enrolled courses and join thousands of successful learners.
              </p>
            </div>
            <Link
              to="/courses"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors shrink-0"
            >
              View all courses
              <CaretRight size={14} weight="bold" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="aspect-[16/9] bg-slate-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                    <div className="h-3 bg-slate-100 rounded-full w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : popularCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {popularCourses.map((course) => (
                <CourseCard
                  key={course.CourseId}
                  course={course}
                  onContinueLearning={() => navigate(`/my-courses/${course.CourseId}/learn`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen size={48} weight="light" className="text-slate-300 mx-auto mb-4" />
              <p className="text-base text-slate-500">No courses available yet.</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors"
            >
              View all courses
              <CaretRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              What our students say
            </h2>
            <p className="text-base text-slate-500 leading-relaxed max-w-lg">
              Real stories from real learners who transformed their English skills with English Master.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <TestimonialCard
              quote="The personalized learning path helped me improve my speaking skills in just 3 months. The interactive lessons are incredibly engaging."
              name="Minh Anh Nguyen"
              role="University Student"
              avatar="MA"
            />
            <TestimonialCard
              quote="I prepared for IELTS with English Master and achieved my target score. The mock tests and feedback from mentors were invaluable."
              name="Quoc Huy Tran"
              role="Working Professional"
              avatar="QH"
            />
            <TestimonialCard
              quote="The daily streak feature kept me motivated. I have been learning consistently for 60 days and my confidence has grown so much."
              name="Thao Vy Le"
              role="Freelancer"
              avatar="TV"
            />
          </div>
        </div>
      </section>

      {/* ===== BECOME A MENTOR ===== */}
      <section className="relative overflow-hidden my-16 sm:my-24 rounded-[2rem] max-w-7xl mx-auto px-6 sm:px-12 py-12 sm:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1470&auto=format&fit=crop')` }} />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-brand-500/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
              <Sparkle size={14} className="text-brand-300 animate-pulse" />
              <span className="text-xs font-bold text-brand-200 uppercase tracking-wider">
                Teach & Inspire
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Become an Instructor at <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-accent-300">English Master</span>
            </h2>
            
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              Share your expertise, design unique learning paths, and inspire thousands of dynamic English learners. We walk alongside you on every step of your teaching journey.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-400/40 flex items-center justify-center shrink-0 mt-0.5 text-brand-300 font-bold">
                  ✓
                </div>
                <p className="text-sm sm:text-base text-slate-300 font-medium">Freedom to design your curriculum & flexible course pricing</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-400/40 flex items-center justify-center shrink-0 mt-0.5 text-brand-300 font-bold">
                  ✓
                </div>
                <p className="text-sm sm:text-base text-slate-300 font-medium">Smart assignment management & question bank tools</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-400/40 flex items-center justify-center shrink-0 mt-0.5 text-brand-300 font-bold">
                  ✓
                </div>
                <p className="text-sm sm:text-base text-slate-300 font-medium">Attractive income & opportunities to expand your reach</p>
              </div>
            </div>

            <Link
              to="/become-mentor"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl text-base font-bold hover:bg-brand-50 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-black/20"
            >
              Apply Now
              <ArrowRight size={18} weight="bold" className="text-slate-900" />
            </Link>
          </div>
          
          <div className="hidden lg:block relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
            <img 
              src="https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=800&auto=format&fit=crop" 
              alt="Become a Mentor"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-lg font-bold text-white mb-1">“Teaching is not just about imparting knowledge; it is about shaping the future.”</p>
              <p className="text-xs text-brand-300 font-bold uppercase tracking-wider">Le Minh Tuan — English Master Mentor</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 sm:px-16 py-14 sm:py-20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-brand-500/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-accent-500/10 to-transparent rounded-full blur-3xl" />

            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                Ready to start learning?
              </h2>
              <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8 max-w-lg mx-auto">
                Join thousands of students who are already mastering English with English Master. Your journey starts with one click.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-100 active:bg-slate-200 transition-all duration-200 active:scale-[0.98] shadow-lg"
                >
                  Get Started Free
                  <ArrowRight size={16} weight="bold" />
                </Link>
                {!user && (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 text-white rounded-xl text-sm font-bold border border-white/20 hover:bg-white/20 transition-all duration-200 active:scale-[0.98]"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
