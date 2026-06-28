import React, { useState } from "react";
import { ArrowLeft, Star, Clock, BookOpen, Users, Play, CheckCircle2, Lock, ChevronDown, ChevronRight, Award, FileText, GraduationCap, ShieldCheck, BarChart3, Target, Video, HelpCircle, Sparkles, ShoppingCart } from "lucide-react";
import { curriculumData, getLearningProgress, formatPrice, isCourseEnrolled, enrollCourse } from "../../services/data";

export default function CourseDetail({ course, onNavigate, onBack }) {
  const [expandedModules, setExpandedModules] = useState(["m1"]);
  const enrolled = isCourseEnrolled(course.id);

  const progress = getLearningProgress();
  const completedLessons = new Set(progress.completedLessons);

  const toggleModule = (id) => {
    setExpandedModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleEnroll = () => {
    if (course.price === null || course.price === undefined) {
      // Free course - enroll directly
      enrollCourse(course.id);
      onNavigate("course-player", { course, curriculum: curriculumData });
    } else {
      // Paid course - go to payment
      onNavigate("payment", { course });
    }
  };

  const handleStartLearning = () => {
    onNavigate("course-player", { course, curriculum: curriculumData });
  };

  const handleLessonClick = (lesson) => {
    if (enrolled || lesson.free) {
      onNavigate("course-player", { course, curriculum: curriculumData });
    }
  };

  const totalLessons = curriculumData.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalVideos = curriculumData.reduce((sum, m) => sum + m.lessons.filter(l => l.type === "video").length, 0);
  const totalQuizzes = curriculumData.reduce((sum, m) => sum + m.lessons.filter(l => l.type === "quiz").length, 0);
  const totalHours = totalVideos * 12;
  const isFree = course.price === null || course.price === undefined;
  const discountPercent = course.originalPrice ? Math.round((1 - course.price / course.originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="bg-white border-b border-border/30">
        <div className="section-container py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lai</span>
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-surface-alt via-white to-purple-50/30 border-b border-border/30">
        <div className="section-container py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/10 text-[11px] font-bold uppercase tracking-[0.18em]">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{course.category}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight leading-tight">{course.title}</h1>
              <p className="text-sm text-text-secondary leading-relaxed">{course.desc}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{course.rating} ({course.students.toLocaleString()} hoc vien)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-text-muted" />
                  <span>{Math.round(totalHours)} gio</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-text-muted" />
                  <span>{totalLessons} bai hoc</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-text-muted" />
                  <span>{course.level}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <img src="https://picsum.photos/seed/instructor/40/40" alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold text-text-primary">Giang vien: {course.instructor}</p>
                  <p className="text-[10px] text-text-muted font-semibold">Chuyen gia ngon ngu</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                <div className="relative h-48 bg-slate-100">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play className="w-7 h-7 text-primary ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {/* Pricing */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-text-primary">{formatPrice(course.price)}</span>
                      {course.originalPrice && (
                        <span className="ml-2 text-sm font-bold text-text-muted line-through">{formatPrice(course.originalPrice)}</span>
                      )}
                    </div>
                    {isFree ? (
                      <span className="px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold">Mien phi</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold">-{discountPercent}%</span>
                    )}
                  </div>

                  {enrolled ? (
                    <button onClick={handleStartLearning} className="w-full py-3.5 rounded-2xl font-bold text-sm bg-primary text-white hover:bg-primary-dark active:scale-[0.97] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" />
                      <span>Vao hoc ngay</span>
                    </button>
                  ) : (
                    <button onClick={handleEnroll} className="w-full py-3.5 rounded-2xl font-bold text-sm bg-primary text-white hover:bg-primary-dark active:scale-[0.97] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                      {isFree ? (
                        <><GraduationCap className="w-4 h-4" /><span>Dang ky hoc mien phi</span></>
                      ) : (
                        <><ShoppingCart className="w-4 h-4" /><span>Dang ky ngay - {formatPrice(course.price)}</span></>
                      )}
                    </button>
                  )}

                  <div className="space-y-2 text-xs text-text-secondary">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      <span>Hoc moi luc, moi noi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      <span>{totalVideos} bai hoc video</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      <span>{totalQuizzes} bai kiem tra</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      <span>Tai lieu di kem moi bai</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-black text-text-primary tracking-tight">Noi dung khoa hoc</h2>
            <div className="space-y-3">
              {curriculumData.map((module) => {
                const isOpen = expandedModules.includes(module.id);
                const completedInModule = module.lessons.filter(l => completedLessons.has(l.id)).length;
                return (
                  <div key={module.id} className="bg-white rounded-2xl border border-border/60 overflow-hidden">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-surface-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? "rotate-90" : ""}`} />
                        <div className="text-left">
                          <h3 className="font-bold text-text-primary text-sm">{module.title}</h3>
                          <p className="text-[10px] text-text-muted font-semibold mt-0.5">{module.lessons.length} bai hoc</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {completedInModule > 0 && (
                          <span className="text-[10px] font-bold text-success">{completedInModule}/{module.lessons.length}</span>
                        )}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="border-t border-border/40">
                        {module.lessons.map((lesson) => {
                          const isCompleted = completedLessons.has(lesson.id);
                          return (
                            <div
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson)}
                              className={`flex items-center justify-between px-5 py-3.5 transition-colors border-b border-border/20 last:border-b-0 ${
                                enrolled || lesson.free ? "cursor-pointer hover:bg-surface-muted" : "cursor-default"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                                ) : lesson.type === "video" ? (
                                  lesson.free || enrolled ? (
                                    <Play className="w-4 h-4 text-primary shrink-0" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-text-muted shrink-0" />
                                  )
                                ) : (
                                  lesson.free || enrolled ? (
                                    <HelpCircle className="w-4 h-4 text-purple-500 shrink-0" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-text-muted shrink-0" />
                                  )
                                )}
                                <div className="min-w-0">
                                  <p className={`text-xs font-semibold truncate ${isCompleted ? "text-success" : "text-text-primary"}`}>
                                    {lesson.title}
                                    {isCompleted && " ✓"}
                                  </p>
                                  <p className="text-[10px] text-text-muted">{lesson.duration}</p>
                                </div>
                              </div>
                              {(lesson.free || enrolled) && (
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                                  isCompleted ? "bg-success/10 text-success" : "bg-primary/5 text-primary"
                                }`}>
                                  {isCompleted ? "Da hoc" : lesson.free ? "Mien phi" : "Hoc ngay"}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-border/60 p-6 space-y-5">
              <h3 className="font-bold text-text-primary text-sm">Khoa hoc nay bao gom</h3>
              <div className="space-y-3">
                {[
                  { icon: Video, text: `${totalVideos} bai hoc video` },
                  { icon: HelpCircle, text: `${totalQuizzes} bai kiem tra` },
                  { icon: FileText, text: "Tai lieu di kem moi bai" },
                  { icon: Award, text: "Chung chi hoan thanh khoa hoc" },
                  { icon: GraduationCap, text: "Lo trinh tu A den Z" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs text-text-secondary">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-purple-50 rounded-2xl border border-primary/10 p-6 space-y-3">
              <Target className="w-6 h-6 text-primary" />
              <h3 className="font-bold text-text-primary text-sm">Ban se dat duoc gi?</h3>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span>Nam vung tu vung theo chu de</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span>Phat am chuan va tu tin giao tiep</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span>Dat diem cao trong ky thi</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
