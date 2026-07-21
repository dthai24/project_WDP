import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MagnifyingGlass,
  Funnel,
  X,
  BookOpen,
  GraduationCap,
  Sliders,
  CaretDown,
  ArrowRight,
} from "@phosphor-icons/react";
import CourseCard from "@/features/courses/components/CourseCard";

const LEVELS = [
  { value: "", label: "All Levels" },
  { value: "1", label: "Beginner" },
  { value: "2", label: "Intermediate" },
  { value: "3", label: "Advanced" },
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
];

export default function CourseListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [levelsList, setLevelsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get("level") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popular");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories & levels
  useEffect(() => {
    async function fetchLookups() {
      try {
        const [catRes, levelRes] = await Promise.all([
          fetch("http://localhost:5050/api/categories"),
          fetch("http://localhost:5050/api/levels")
        ]);

        const catResult = await catRes.json();
        if (catResult.success && Array.isArray(catResult.data)) {
          setCategories(catResult.data);
        }

        const levelResult = await levelRes.json();
        if (levelResult.success && Array.isArray(levelResult.data)) {
          setLevelsList(levelResult.data);
        }
      } catch (err) {
        console.error("Failed to fetch lookups:", err);
      }
    }
    fetchLookups();
  }, []);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const headers = user.userId ? { "x-user-id": user.userId } : {};

      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedLevel) params.set("level", selectedLevel);
      if (searchTerm) params.set("search", searchTerm);
      if (sortBy) params.set("sort", sortBy);

      const res = await fetch(`http://localhost:5050/api/courses/student?${params.toString()}`, { headers });
      const result = await res.json();

      if (result.success && Array.isArray(result.data)) {
        setCourses(result.data);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedLevel, searchTerm, sortBy]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedLevel) params.set("level", selectedLevel);
    if (searchTerm) params.set("search", searchTerm);
    if (sortBy && sortBy !== "popular") params.set("sort", sortBy);
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedLevel, searchTerm, sortBy, setSearchParams]);

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedLevel("");
    setSearchTerm("");
    setSortBy("popular");
  };

  const hasActiveFilters = selectedCategory || selectedLevel || searchTerm;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">
          Course Library
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
          Explore Courses
        </h1>
        <p className="text-base sm:text-lg text-slate-500 max-w-xl leading-relaxed">
          Discover the perfect course for your English learning journey. Filter by category, level, or search for specific topics.
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            size={16}
            weight="bold"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </div>

        {/* Filter Toggle (Mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Sliders size={16} />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-brand-500" />
          )}
        </button>

        {/* Desktop Filters */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Category */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all cursor-pointer hover:border-slate-300"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={String(cat.categoryId)}>
                  {cat.displayName}
                </option>
              ))}
            </select>
            <CaretDown
              size={12}
              weight="bold"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Level */}
          <div className="relative">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all cursor-pointer hover:border-slate-300"
            >
              <option value="">All Levels</option>
              {levelsList.map((level) => (
                <option key={level.levelId} value={level.levelId}>
                  {level.displayName}
                </option>
              ))}
            </select>
            <CaretDown
              size={12}
              weight="bold"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all cursor-pointer hover:border-slate-300"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <CaretDown
              size={12}
              weight="bold"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X size={14} weight="bold" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Panel */}
      {showFilters && (
        <div className="sm:hidden mb-6 p-5 bg-white border border-slate-100 rounded-2xl space-y-4 shadow-sm">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={String(cat.categoryId)}>
                  {cat.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <option value="">All Levels</option>
              {levelsList.map((level) => (
                <option key={level.levelId} value={level.levelId}>
                  {level.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">
          {loading ? (
            <span className="text-slate-400">Searching...</span>
          ) : (
            <>
              <strong className="text-slate-900">{courses.length}</strong> course{courses.length !== 1 ? "s" : ""} found
            </>
          )}
        </p>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const cid = course._id || course.CourseId || course.courseId;
            return (
              <CourseCard
                key={cid}
                course={course}
                onContinueLearning={() => navigate(`/my-courses/${cid}/learn`)}
              />
            );
          })}

        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 mb-4">
            <BookOpen size={32} weight="light" className="text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No courses found</h3>
          <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
            Try adjusting your filters or search term to find what you are looking for.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors"
            >
              Clear all filters
              <ArrowRight size={14} weight="bold" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
