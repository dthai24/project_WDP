import React, { useState, useMemo } from "react";
import { Search, Star, Clock, BookOpen, Users, Filter, ChevronDown, GraduationCap, TrendingUp, Sparkles, Video, HelpCircle, ShoppingCart, Award } from "lucide-react";
import { allCourses, categories, formatPrice, getMentorCourses } from "../../services/data";

const levels = ["Tat ca", "Co ban", "Trung cap", "Nang cao"];

export default function CourseList({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tat ca");
  const [activeLevel, setActiveLevel] = useState("Tat ca");

  const allDisplayCourses = useMemo(() => {
    const mentorCourses = getMentorCourses();
    return [...allCourses, ...mentorCourses];
  }, []);

  const filtered = allDisplayCourses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = activeCategory === "Tat ca" || c.category === activeCategory;
    const matchLevel = activeLevel === "Tat ca" || c.level.includes(activeLevel);
    return matchSearch && matchCategory && matchLevel;
  });

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="bg-white border-b border-border/30">
        <div className="section-container py-8 space-y-6">
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">Kham pha khoa hoc</h1>
            <p className="text-sm text-text-secondary mt-1">Tim kiem khoa hoc phu hop voi muc tieu cua ban</p>
          </div>
          <div className="flex items-center gap-3 bg-surface-muted rounded-2xl border border-border/60 px-5 py-3 max-w-xl hover:border-primary/30 transition-colors">
            <Search className="w-5 h-5 text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Tim kiem khoa hoc, giang vien..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted font-medium"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  activeCategory === cat.name
                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/10"
                    : "bg-white text-text-secondary border-border/60 hover:border-primary/30 hover:text-primary"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Search className="w-12 h-12 text-text-muted/50 mx-auto" />
            <p className="text-text-secondary font-medium">Khong tim thay khoa hoc phu hop</p>
            <button onClick={() => { setSearchQuery(""); setActiveCategory("Tat ca"); }} className="text-primary text-sm font-bold hover:underline">Xoa bo loc</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(course => {
              const isFree = course.price === null || course.price === undefined;
              const discountPercent = course.originalPrice ? Math.round((1 - course.price / course.originalPrice) * 100) : 0;
              return (
                <div
                  key={course.id}
                  onClick={() => onNavigate("course-detail", { course })}
                  className="group cursor-pointer bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 text-[10px] font-bold text-text-primary shadow-sm">
                        {course.badge}
                      </span>
                      {!isFree && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/90 text-[10px] font-bold text-white shadow-sm">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[10px] font-semibold">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.hours} gio</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessons} bai</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2.5">
                    <h3 className="font-bold text-text-primary text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                    <p className="text-[11px] text-text-secondary font-medium">{course.instructor}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-text-primary">{course.rating}</span>
                        </div>
                        <span className="text-[10px] text-text-muted">({(course.students / 1000).toFixed(1)}k)</span>
                      </div>
                      <span className="text-[10px] font-semibold text-text-muted bg-surface-muted px-2 py-0.5 rounded-md">{course.level}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/20">
                      {isFree ? (
                        <span className="text-xs font-bold text-success">Mien phi</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-text-primary">{formatPrice(course.price)}</span>
                          {course.originalPrice && (
                            <span className="text-[10px] font-bold text-text-muted line-through">{formatPrice(course.originalPrice)}</span>
                          )}
                        </div>
                      )}
                      <button className="text-[10px] font-bold text-primary hover:underline">Xem chi tiet</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
