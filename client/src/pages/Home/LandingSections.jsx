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
  { name: "Giao tiep", count: 32, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { name: "Ngu phap", count: 15, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { name: "Phat am", count: 12, color: "bg-amber-50 text-amber-600 border-amber-100" },
  { name: "Tu vung", count: 41, color: "bg-violet-50 text-violet-600 border-violet-100" },
];

const featuredCourses = [
  {
    title: "On thi TOEIC 2026",
    instructor: "Ms. Nguyen Thuy Anh",
    rating: 4.8,
    students: 12450,
    level: "Co ban - Nang cao",
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
    level: "Trung cap - Nang cao",
    lessons: 62,
    hours: 48,
    badge: "IELTS 7.5+",
    gradient: "from-purple-500 to-indigo-600",
    image: "https://picsum.photos/seed/ielts-course/400/225"
  },
  {
    title: "English for Communication B2",
    instructor: "Ms. Le Hoang Yen",
    rating: 4.7,
    students: 15300,
    level: "Trung cap",
    lessons: 36,
    hours: 24,
    badge: "Oxford 3000",
    gradient: "from-blue-500 to-cyan-600",
    image: "https://picsum.photos/seed/communication-course/400/225"
  },
  {
    title: "Ngu phap Tieng Anh Co ban",
    instructor: "Mr. Pham Minh Duc",
    rating: 4.6,
    students: 21000,
    level: "Co ban",
    lessons: 28,
    hours: 18,
    badge: "Pho thong",
    gradient: "from-emerald-500 to-teal-600",
    image: "https://picsum.photos/seed/grammar-course/400/225"
  },
];

const popularCourses = [
  {
    title: "Luyen thi THPT Quoc Gia",
    instructor: "Ms. Tran Thu Ha",
    rating: 4.8,
    students: 28400,
    level: "Lop 10-12",
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
    level: "Tat ca cap do",
    lessons: 24,
    hours: 16,
    badge: "Phat am",
    gradient: "from-amber-500 to-orange-600",
    image: "https://picsum.photos/seed/pronunciation-course/400/225"
  },
  {
    title: "Business English Essentials",
    instructor: "Ms. Pham Quynh Trang",
    rating: 4.7,
    students: 6200,
    level: "Trung cap",
    lessons: 40,
    hours: 30,
    badge: "Business",
    gradient: "from-slate-600 to-slate-800",
    image: "https://picsum.photos/seed/business-course/400/225"
  },
  {
    title: "Tu vung theo chu de (Thematic)",
    instructor: "Ms. Nguyen Kim Ngan",
    rating: 4.8,
    students: 19500,
    level: "Co ban - Trung cap",
    lessons: 56,
    hours: 42,
    badge: "Oxford 3000",
    gradient: "from-violet-500 to-purple-600",
    image: "https://picsum.photos/seed/thematic-course/400/225"
  },
];

const stats = [
  { value: "120.000+", label: "Nguoi hoc" },
  { value: "60+", label: "Lo trinh" },
  { value: "10 Trieu+", label: "Tu vung da thuoc" },
  { value: "98.5%", label: "Ty le nho tu dai han" }
];

const roadmaps = [
  { title: "On thi TOEIC", badge: "ETS 2026", desc: "Tu vung phan chia theo level 450+, 650+, 850+. Giao trinh Hackers TOEIC, ETS moi nhat.", icon: "target", color: "from-rose-500 to-pink-600" },
  { title: "On thi IELTS", badge: "IELTS 7.5+", desc: "Kho tu vung IELTS Academic va General theo chu de thong dung.", icon: "award", color: "from-purple-500 to-indigo-600" },
  { title: "THPT Quoc Gia", badge: "Lop 10-12", desc: "Day du tu vung theo sach giao khoa Global Success lop 10, 11, 12.", icon: "book", color: "from-pink-500 to-purple-600" },
  { title: "Giao tiep & Pho thong", badge: "Oxford 3000", desc: "Lo trinh chuan tu A1, A2 den B2, C1 theo khung tham chieu chau Au.", icon: "globe", color: "from-rose-500 to-orange-600" }
];

const features = [
  { title: "Flashcard Thong Minh", desc: "Hoc tu vung qua the ghi nho thong minh voi day du phat am chuan, nghia tieng Viet, vi du thuc te.", icon: Layers, color: "text-primary bg-primary/5 border-primary/10" },
  { title: "Lap Lai Ngat Quang (SRS)", desc: "Thuat toan SRS tu do do luong do quen cua ban de nhac nh on tap vao dung thoi diem vang.", icon: Brain, color: "text-purple-600 bg-purple-50 border-purple-100" },
  { title: "6 Che Do Game Tuong Tac", desc: "Tranh nha cham bang cach vua choi vua hoc: Ghep cap, Trac nghiem phan xa, Word Scramble.", icon: Gamepad2, color: "text-rose-600 bg-rose-50 border-rose-100" },
  { title: "Ca Nhan Hoa Bang AI", desc: "Tao bo tu vung rieng cua ban tu Excel hoac de AI goi y dinh nghia, cau vi du.", icon: Sparkles, color: "text-violet-600 bg-violet-50 border-violet-100" }
];

const platformFeatures = [
  { title: "Da giang vien cung luc", desc: "Dang ky nhieu khoa hoc tu nhieu Mentor khac nhau. Cung mot cap do co the co nhieu lop cua nhieu giao vien.", icon: Users },
  { title: "Chuyen mon hoa theo linh vuc", desc: "Giao vien bi khoa chuyen mon nghiem ngat. Co chung chi IELTS cao chi duoc day mang Test Prep.", icon: ShieldCheck },
  { title: "Noi dung hoan chinh truoc khi duyet", desc: "Mentor phai upload 100% noi dung (video, bai doc, quiz) cua toan bo khoa hoc trong 1 lan duy nhat.", icon: BarChart3 },
  { title: "Xac minh nang luc bang Test-out", desc: "Hoc vien khong bi bat buoc hoc theo lo trinh tuyen tinh. Neu thay module qua de, duoc lam Test-out Quiz.", icon: GraduationCap }
];

const faqs = [
  { q: "English Master hoat dong theo phuong phap nao?", a: "English Master ap dung phuong phap Lap Lai Ngat Quang (Spaced Repetition System - SRS) lay cam hung tu thuat toan Anki. He thong tu dong phan tich lich su hoc cua ban va dua cac tu kho lap lai nhieu lan, trong khi gian cach thoi gian on tap cua cac tu de, giup ban nho sau va luu giu vao tri nho dai han." },
  { q: "Nen tang nay co hoan toan mien phi khong?", a: "Co! Ban hoan toan co the tu hoc tu vung, tu tao flashcard va luyen tap toan bo 6 che do game hoan toan mien phi." },
  { q: "Toi co the tu tao hoc lieu (bo tu vung) rieng khong?", a: "Hoan toan duoc. Ban co the tu tao cac deck tu vung bang cach nhap thu cong, nhap tu file Excel hoac su dung tro ly AI cua English Master de dich nghia va tu sinh cau vi du cuc ky nhanh chong." },
  { q: "Lam the nao de tro thanh Mentor cua English Master?", a: "Chung toi luon chao don cac chuyen gia ngon ngu. Ban chi can click vao nut 'Tro thanh Mentor' duoi chan trang hoac tren thanh cong cu, dien thong tin va tai len chung chi (IELTS, TOEIC...). Ban quan tri se duyet va nang cap tai khoan cua ban trong 24 gio." }
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
              {course.hours} gio
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {course.lessons} bai
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
              Xem tat ca
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
            <span>Giai phap hoc tieng Anh so 1 Viet Nam</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-text-primary tracking-tight leading-[1.1] text-balance">
            Hoc tu vung thong minh
            <br />
            <span className="text-primary">hieu qua gap 3 lan</span>
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto font-medium">
            English Master ket hop phuong phap <strong className="text-primary font-extrabold">Lap lai ngat quang (SRS)</strong> cung he thong Flashcard thong minh va tro choi tuong tac. Giup ban nho tu vung vinh vien, but pha band diem TOEIC, IELTS de dang!
          </p>
          <div className="max-w-xl mx-auto relative">
            <div className="flex items-center gap-0 bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden">
              <div className="flex-1 flex items-center gap-3 px-5 py-3.5">
                <Search className="w-5 h-5 text-text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Tim kiem khoa hoc, tu vung, lo trinh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted font-medium"
                />
              </div>
              <button onClick={onLoginClick} className="bg-primary text-white px-6 py-3.5 font-bold text-sm hover:bg-primary-dark transition-colors shrink-0 flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Tim kiem</span>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <span className="text-[11px] font-semibold text-text-muted">Pho bien:</span>
            {["TOEIC 2026", "IELTS 7.5+", "Giao tiep B2", "Ngu phap co ban"].map((tag, i) => (
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
            <span>Tat ca</span>
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
        title="Khoa hoc noi bat"
        courses={featuredCourses}
        viewAll={true}
      />
      <CourseRow
        title="Khoa hoc pho bien"
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
            Lap Lai Ngat Quang
            <br />
            <span className="text-primary">Spaced Repetition</span> la gi?
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Theo nghien cuu ve <strong className="text-text-primary font-bold">Duong cong lang quen (Forgetting Curve)</strong> cua Hermann Ebbinghaus, bo nao con nguoi co xu huong quen 80% kien thuc moi sau vai ngay.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            He thong cua <strong className="text-primary font-semibold">English Master</strong> se tinh toan thoi gian va tu dong dua ra cac tu vung on tap <strong className="text-text-primary font-bold">ngay truoc thoi diem ban chuan bi quen</strong>. Phuong phap nay giup chuyen thong tin tu tri nho ngan han sang tri nho dai han hieu qua nhat.
          </p>
        </div>
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="card-hover p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mx-auto">1</div>
            <h4 className="font-bold text-text-primary text-sm">Hoc qua Flashcard</h4>
            <p className="text-xs text-text-secondary leading-relaxed">Xem tu vung, phat am, nghia va vi du. Danh dau muc do nho cua ban.</p>
          </div>
          <div className="card-hover p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg mx-auto">2</div>
            <h4 className="font-bold text-text-primary text-sm">He thong SRS tu dong</h4>
            <p className="text-xs text-text-secondary leading-relaxed">Thuat toan tinh toan thoi diem ban sap quen va tu dong nhac on tap.</p>
          </div>
          <div className="card-hover p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg mx-auto">3</div>
            <h4 className="font-bold text-text-primary text-sm">Ghi nho vinh vien</h4>
            <p className="text-xs text-text-secondary leading-relaxed">Lap lai dung thoi diem vang giup chuyen kien thuc vao tri nho dai han.</p>
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
            Cong cu hoc tap <span className="text-primary">toan dien</span>
          </h2>
          <p className="text-sm text-text-secondary">English Master cung cap day du cong cu giup ban chinh phuc tieng Anh tu co ban den nang cao.</p>
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
        <p className="text-sm text-text-secondary">He sinh thai hoc tieng Anh khong dong bo, ca nhan hoa va co kha nang mo rong toan cau.</p>
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
            Lo trinh hoc <span className="text-primary">chuan ETS</span>
          </h2>
          <p className="text-sm text-text-secondary">Cac khoa hoc duoc xay dung theo chuan ETS TOEIC va IELTS Academic.</p>
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
                <span>Kham pha</span>
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
          Cau hoi <span className="text-primary">thuong gap</span>
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
          Bat dau hanh trinh chinh phuc
          <br />
          tieng Anh cua ban ngay hom nay
        </h2>
        <p className="text-white/70 max-w-lg mx-auto text-sm">
          Hoc mien phi, khong gioi han. English Master dong hanh cung ban tren moi neo duong chinh phuc ngon ngu.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onLoginClick} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm bg-white text-primary hover:bg-rose-50 shadow-xl active:scale-[0.97] transition-all duration-200">
            <Play className="w-4 h-4 fill-primary" />
            <span>Hoc mien phi ngay</span>
          </button>
          <button onClick={() => window.location.href = "#features"} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm bg-white/10 text-white border border-white/20 hover:bg-white/20 active:scale-[0.97] transition-all duration-200">
            Kham pha tinh nang
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
              English Master la he sinh thai hoc tieng Anh khong dong bo, dua tren phuong phap Lap Lai Ngat Quang (SRS) giup ban ghi nho tu vung vinh vien.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">San pham</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Tinh nang</a></li>
              <li><a href="#methods" className="hover:text-white transition-colors">Phuong phap SRS</a></li>
              <li><a href="#roadmaps" className="hover:text-white transition-colors">Lo trinh hoc</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Hoi dap</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Ho tro</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Trung tam tro giup</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Lien he</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Dieu khoan su dung</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chinh sach bao mat</a></li>
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
