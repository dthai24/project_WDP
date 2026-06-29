import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Brain, Sparkles, Layers, Flame, Award, BookOpen, Globe,
  Play, Star, Target, Users, ShieldCheck, BarChart3, GraduationCap,
  Gamepad2, ChevronRight, CheckCircle2, Search, Clock, ChevronLeft,
  Bookmark, TrendingUp, Zap, Menu, X, Filter
} from "lucide-react";

const categories = [
  { name: "TOEIC", count: 24, color: "bg-rose-50 text-rose-600 border-rose-100" },
  { name: "IELTS", count: 18, color: "bg-purple-50 text-purple-600 border-purple-100" },
  { name: "Giao tiếp", count: 32, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { name: "Ngữ pháp", count: 15, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { name: "Phát âm", count: 12, color: "bg-amber-50 text-amber-600 border-amber-100" },
  { name: "Từ vựng", count: 41, color: "bg-violet-50 text-violet-600 border-violet-100" },
];

const featuredCourses = [
  {
    title: "Ôn thi TOEIC 2026",
    instructor: "Ms. Nguyễn Thùy Anh",
    rating: 4.8,
    students: 12450,
    level: "Cơ bản - Nâng cao",
    lessons: 48,
    hours: 36,
    badge: "ETS 2026",
    gradient: "from-rose-500 to-pink-600",
    image: "https://picsum.photos/seed/toeic-course/400/225"
  },
  {
    title: "IELTS Academic Vocabulary",
    instructor: "Mr. David Tran",
    rating: 4.9,
    students: 8720,
    level: "Trung cấp - Nâng cao",
    lessons: 62,
    hours: 48,
    badge: "IELTS 7.5+",
    gradient: "from-purple-500 to-indigo-600",
    image: "https://picsum.photos/seed/ielts-course/400/225"
  },
  {
    title: "English for Communication B2",
    instructor: "Ms. Lê Hoàng Yến",
    rating: 4.7,
    students: 15300,
    level: "Trung cấp",
    lessons: 36,
    hours: 24,
    badge: "Oxford 3000",
    gradient: "from-blue-500 to-cyan-600",
    image: "https://picsum.photos/seed/communication-course/400/225"
  },
  {
    title: "Ngữ pháp Tiếng Anh Cơ bản",
    instructor: "Mr. Phạm Minh Đức",
    rating: 4.6,
    students: 21000,
    level: "Cơ bản",
    lessons: 28,
    hours: 18,
    badge: "Phổ thông",
    gradient: "from-emerald-500 to-teal-600",
    image: "https://picsum.photos/seed/grammar-course/400/225"
  },
];

const popularCourses = [
  {
    title: "Luyện thi THPT Quốc Gia",
    instructor: "Ms. Trần Thu Hà",
    rating: 4.8,
    students: 28400,
    level: "Lớp 10-12",
    lessons: 72,
    hours: 54,
    badge: "Global Success",
    gradient: "from-rose-500 to-orange-600",
    image: "https://picsum.photos/seed/thpt-course/400/225"
  },
  {
    title: "Pronunciation Mastery",
    instructor: "Mr. John Smith",
    rating: 4.9,
    students: 9800,
    level: "Tất cả cấp độ",
    lessons: 24,
    hours: 16,
    badge: "Phát âm",
    gradient: "from-amber-500 to-orange-600",
    image: "https://picsum.photos/seed/pronunciation-course/400/225"
  },
  {
    title: "Business English Essentials",
    instructor: "Ms. Phạm Quỳnh Trang",
    rating: 4.7,
    students: 6200,
    level: "Trung cấp",
    lessons: 40,
    hours: 30,
    badge: "Business",
    gradient: "from-slate-600 to-slate-800",
    image: "https://picsum.photos/seed/business-course/400/225"
  },
  {
    title: "Từ vựng theo chủ đề (Thematic)",
    instructor: "Ms. Nguyễn Kim Ngân",
    rating: 4.8,
    students: 19500,
    level: "Cơ bản - Trung cấp",
    lessons: 56,
    hours: 42,
    badge: "Oxford 3000",
    gradient: "from-violet-500 to-purple-600",
    image: "https://picsum.photos/seed/thematic-course/400/225"
  },
];

const stats = [
  { value: "120.000+", label: "Người học" },
  { value: "60+", label: "Lộ trình" },
  { value: "10 Triệu+", label: "Từ vựng đã thuộc" },
  { value: "98.5%", label: "Tỷ lệ nhớ từ dài hạn" }
];

const roadmaps = [
  { title: "Ôn thi TOEIC", badge: "ETS 2026", desc: "Từ vựng phân chia theo level 450+, 650+, 850+. Giáo trình Hackers TOEIC, ETS mới nhất.", icon: "target", color: "from-rose-500 to-pink-600" },
  { title: "Ôn thi IELTS", badge: "IELTS 7.5+", desc: "Kho từ vựng IELTS Academic và General theo chủ đề thông dụng.", icon: "award", color: "from-purple-500 to-indigo-600" },
  { title: "THPT Quốc Gia", badge: "Lớp 10-12", desc: "Đầy đủ từ vựng theo sách giáo khoa Global Success lớp 10, 11, 12.", icon: "book", color: "from-pink-500 to-purple-600" },
  { title: "Giao tiếp & Phổ thông", badge: "Oxford 3000", desc: "Lộ trình chuẩn từ A1, A2 đến B2, C1 theo khung tham chiếu châu Âu.", icon: "globe", color: "from-rose-500 to-orange-600" }
];

const features = [
  { title: "Flashcard Thông Minh", desc: "Học từ vựng qua thẻ ghi nhớ thông minh với đầy đủ phát âm chuẩn, nghĩa tiếng Việt, ví dụ thực tế.", icon: Layers, color: "text-primary bg-primary/5 border-primary/10" },
  { title: "Lặp Lại Ngắt Quãng (SRS)", desc: "Thuật toán SRS tự đo lường độ quên của bạn để nhắc nhở ôn tập vào đúng thời điểm vàng.", icon: Brain, color: "text-purple-600 bg-purple-50 border-purple-100" },
  { title: "6 Chế Độ Game Tương Tác", desc: "Tránh nhàm chán bằng cách vừa chơi vừa học: Ghép cặp, Trắc nghiệm phản xạ, Word Scramble.", icon: Gamepad2, color: "text-rose-600 bg-rose-50 border-rose-100" },
  { title: "Cá Nhân Hóa Bằng AI", desc: "Tạo bộ từ vựng riêng của bạn từ Excel hoặc để AI gợi ý định nghĩa, câu ví dụ.", icon: Sparkles, color: "text-violet-600 bg-violet-50 border-violet-100" }
];

const platformFeatures = [
  { title: "Đa giảng viên cùng lúc", desc: "Đăng ký nhiều khóa học từ nhiều Mentor khác nhau. Cùng một cấp độ có thể có nhiều lớp của nhiều giáo viên.", icon: Users },
  { title: "Chuyên môn hóa theo lĩnh vực", desc: "Giáo viên bị khóa chuyên môn nghiêm ngặt. Có chứng chỉ IELTS cao chỉ được dạy mảng Test Prep.", icon: ShieldCheck },
  { title: "Nội dung hoàn chỉnh trước khi duyệt", desc: "Mentor phải upload 100% nội dung (video, bài đọc, quiz) của toàn bộ khóa học trong 1 lần duy nhất.", icon: BarChart3 },
  { title: "Xác minh năng lực bằng Test-out", desc: "Học viên không bị bắt buộc học theo lộ trình tuyến tính. Nếu thấy module quá dễ, được làm Test-out Quiz.", icon: GraduationCap }
];

const faqs = [
  { q: "English Master hoạt động theo phương pháp nào?", a: "English Master áp dụng phương pháp Lặp Lại Ngắt Quãng (Spaced Repetition System - SRS) lấy cảm hứng từ thuật toán Anki. Hệ thống tự động phân tích lịch sử học của bạn và đưa các từ khó lặp lại nhiều lần, trong khi giãn cách thời gian ôn tập của các từ dễ, giúp bạn nhớ sâu và lưu giữ vào trí nhớ dài hạn." },
  { q: "Nền tảng này có hoàn toàn miễn phí không?", a: "Có! Bạn hoàn toàn có thể tự học từ vựng, tự tạo flashcard và luyện tập toàn bộ 6 chế độ game hoàn toàn miễn phí." },
  { q: "Tôi có thể tự tạo học liệu (bộ từ vựng) riêng không?", a: "Hoàn toàn được. Bạn có thể tự tạo các deck từ vựng bằng cách nhập thủ công, nhập từ file Excel hoặc sử dụng trợ lý AI của English Master để dịch nghĩa và tự sinh câu ví dụ cực kỳ nhanh chóng." },
  { q: "Làm thế nào để trở thành Mentor của English Master?", a: "Chúng tôi luôn chào đón các chuyên gia ngôn ngữ. Bạn chỉ cần click vào nút 'Trở thành Mentor' dưới chân trang hoặc trên thanh công cụ, điền thông tin và tải lên chứng chỉ (IELTS, TOEIC...). Ban quản trị sẽ duyệt và nâng cấp tài khoản của bạn trong 24 giờ." }
];

function CourseCard({ course, featured }) {
  return (
    <div className="group cursor-pointer w-[300px] shrink-0">
      <div className="relative overflow-hidden rounded-2xl bg-white border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-40 overflow-hidden bg-slate-100">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 text-[10px] font-bold text-text-primary shadow-sm">
              <Bookmark className="w-3 h-3" />
              {course.badge}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[10px] font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.hours} giờ
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {course.lessons} bài
            </span>
          </div>
        </div>
        <div className="p-4 space-y-2.5">
          <h3 className="font-bold text-text-primary text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-[11px] text-text-secondary font-medium">{course.instructor}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-text-primary">{course.rating}</span>
              </div>
              <span className="text-[10px] text-text-muted">({(course.students / 1000).toFixed(1)}k)</span>
            </div>
            <span className="text-[10px] font-semibold text-text-muted bg-surface-muted px-2 py-0.5 rounded-md">
              {course.level}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseRow({ title, courses, viewAll }) {
  const scrollRef = React.useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = 340;
      scrollRef.current.scrollBy({ left: direction * amount, behavior: "smooth" });
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-text-primary tracking-tight">{title}</h2>
        <div className="flex items-center gap-3">
          {viewAll && (
            <button className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
              Xem tất cả
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll(-1)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                canScrollLeft
                  ? "border-border hover:border-primary/30 hover:bg-primary/5 text-text-primary"
                  : "border-border/40 text-text-muted/40 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                canScrollRight
                  ? "border-border hover:border-primary/30 hover:bg-primary/5 text-text-primary"
                  : "border-border/40 text-text-muted/40 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-6 px-6"
      >
        {courses.map((course, i) => (
          <CourseCard key={i} course={course} />
        ))}
      </div>
    </div>
  );
}

export function HeroSection({ onLoginClick }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="relative px-6 lg:px-16 pt-12 pb-16 md:pt-16 md:pb-20 overflow-hidden bg-gradient-to-br from-surface-alt via-surface-muted to-purple-50/30">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[0%] right-[-5%] w-[45%] h-[45%] bg-purple-200/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="relative z-10 section-container">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-[11px] font-bold uppercase tracking-[0.18em]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Giải pháp học tiếng Anh số 1 Việt Nam</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-text-primary tracking-tight leading-[1.1] text-balance">
            Học từ vựng thông minh
            <br />
            <span className="text-primary">hiệu quả gấp 3 lần</span>
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto font-medium">
            English Master kết hợp phương pháp <strong className="text-primary font-extrabold">Lặp lại ngắt quãng (SRS)</strong> cùng hệ thống Flashcard thông minh và trò chơi tương tác. Giúp bạn nhớ từ vựng vĩnh viễn, bứt phá band điểm TOEIC, IELTS dễ dàng!
          </p>
          <div className="max-w-xl mx-auto relative">
            <div className="flex items-center gap-0 bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden">
              <div className="flex-1 flex items-center gap-3 px-5 py-3.5">
                <Search className="w-5 h-5 text-text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khoá học, từ vựng, lộ trình..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted font-medium"
                />
              </div>
              <button onClick={onLoginClick} className="bg-primary text-white px-6 py-3.5 font-bold text-sm hover:bg-primary-dark transition-colors shrink-0 flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Tìm kiếm</span>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <span className="text-[11px] font-semibold text-text-muted">Phổ biến:</span>
            {["TOEIC 2026", "IELTS 7.5+", "Giao tiếp B2", "Ngữ pháp cơ bản"].map((tag, i) => (
              <button
                key={i}
                className="px-3 py-1.5 rounded-lg bg-white border border-border/60 text-[11px] font-semibold text-text-secondary hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  return (
    <section className="bg-white border-b border-border/30">
      <div className="section-container py-8">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/5 text-primary border border-primary/10 text-xs font-bold shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Tất cả</span>
          </div>
          {categories.map((cat, i) => (
            <button
              key={i}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold shrink-0 transition-all hover:shadow-sm ${cat.color}`}
            >
              <span>{cat.name}</span>
              <span className="opacity-60">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedCoursesSection() {
  return (
    <section className="section-container py-10 space-y-10">
      <CourseRow
        title="Khoá học nổi bật"
        courses={featuredCourses}
        viewAll={true}
      />
      <CourseRow
        title="Khoá học phổ biến"
        courses={popularCourses}
        viewAll={true}
      />
    </section>
  );
}

export function StatsBanner() {
  return (
    <section className="bg-white border-y border-border/30 py-12">
      <div className="section-container grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="text-center space-y-1.5">
            <p className="text-3xl sm:text-4xl font-black text-primary tracking-tight">{stat.value}</p>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SRSMethodSection() {
  return (
    <section id="methods" className="section-container section-padding">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight leading-[1.2]">
            Lặp Lại Ngắt Quãng
            <br />
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
            <p className="text-xs text-text-secondary leading-relaxed">Xem từ vựng, phát âm, nghĩa và ví dụ. Đánh dấu mức độ nhớ của bạn.</p>
          </div>
          <div className="card-hover p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg mx-auto">2</div>
            <h4 className="font-bold text-text-primary text-sm">Hệ thống SRS tự động</h4>
            <p className="text-xs text-text-secondary leading-relaxed">Thuật toán tính toán thời điểm bạn sắp quên và tự động nhắc ôn tập.</p>
          </div>
          <div className="card-hover p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg mx-auto">3</div>
            <h4 className="font-bold text-text-primary text-sm">Ghi nhớ vĩnh viễn</h4>
            <p className="text-xs text-text-secondary leading-relaxed">Lặp lại đúng thời điểm vàng giúp chuyển kiến thức vào trí nhớ dài hạn.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white border-y border-border/30">
      <div className="section-container section-padding space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
            Công cụ học tập <span className="text-primary">toàn diện</span>
          </h2>
          <p className="text-sm text-text-secondary">English Master cung cấp đầy đủ công cụ giúp bạn chinh phục tiếng Anh từ cơ bản đến nâng cao.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="card-hover p-8 flex items-start gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${feature.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-text-primary text-lg">{feature.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PlatformFeaturesSection() {
  return (
    <section className="section-container section-padding">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
          English Master <span className="text-primary">Platform</span>
        </h2>
        <p className="text-sm text-text-secondary">Hệ sinh thái học tiếng Anh không đồng bộ, cá nhân hóa và có khả năng mở rộng toàn cầu.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platformFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="card-hover p-6 flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10">
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
    </section>
  );
}

export function RoadmapsSection() {
  return (
    <section id="roadmaps" className="bg-white border-y border-border/30">
      <div className="section-container section-padding space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
            Lộ trình học <span className="text-primary">chuẩn ETS</span>
          </h2>
          <p className="text-sm text-text-secondary">Các khóa học được xây dựng theo chuẩn ETS TOEIC và IELTS Academic.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </section>
  );
}

export function FAQSection() {
  const [activeFaq, setActiveFaq] = useState(null);
  const toggleFaq = (index) => setActiveFaq(activeFaq === index ? null : index);

  return (
    <section id="faq" className="section-container section-padding">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
          Câu hỏi <span className="text-primary">thường gặp</span>
        </h2>
      </div>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="card overflow-hidden">
            <button
              onClick={() => toggleFaq(index)}
              className="w-full flex items-center justify-between p-5 text-left font-bold text-text-primary text-sm hover:bg-surface-muted transition-colors"
            >
              <span>{faq.q}</span>
              <ChevronRight className={`w-4 h-4 text-text-muted transition-transform duration-300 ${activeFaq === index ? "rotate-90" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${activeFaq === index ? "max-h-96" : "max-h-0"}`}>
              <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CTASection({ onLoginClick }) {
  return (
    <section className="bg-gradient-to-br from-primary to-primary-dark">
      <div className="section-container py-20 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Bắt đầu hành trình chinh phục
          <br />
          tiếng Anh của bạn ngay hôm nay
        </h2>
        <p className="text-white/70 max-w-lg mx-auto text-sm">
          Học miễn phí, không giới hạn. English Master đồng hành cùng bạn trên mọi nẻo đường chinh phục ngôn ngữ.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onLoginClick} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm bg-white text-primary hover:bg-rose-50 shadow-xl active:scale-[0.97] transition-all duration-200">
            <Play className="w-4 h-4 fill-primary" />
            <span>Học miễn phí ngay</span>
          </button>
          <button onClick={() => window.location.href = "#features"} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm bg-white/10 text-white border border-white/20 hover:bg-white/20 active:scale-[0.97] transition-all duration-200">
            Khám phá tính năng
          </button>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-text-primary text-white/60">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img src="/images/logo.png" alt="English Master" className="w-9 h-9 object-contain brightness-0 invert" />
              <span className="text-xl font-black text-white tracking-tight">English Master</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              English Master là hệ sinh thái học tiếng Anh không đồng bộ, dựa trên phương pháp Lặp Lại Ngắt Quãng (SRS) giúp bạn ghi nhớ từ vựng vĩnh viễn.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Sản phẩm</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Tính năng</a></li>
              <li><a href="#methods" className="hover:text-white transition-colors">Phương pháp SRS</a></li>
              <li><a href="#roadmaps" className="hover:text-white transition-colors">Lộ trình học</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Hỏi đáp</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Hỗ trợ</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; 2026 English Master. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Made with dedication for English learners</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
