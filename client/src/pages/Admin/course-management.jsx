import React, { useState } from "react";
import { BookOpen, Check, AlertCircle, Search, ToggleLeft, ToggleRight } from "lucide-react";

const CourseManagement = () => {
  const [courses, setCourses] = useState([
    {
      id: "crs_101",
      title: "React JS Core Fundamentals",
      category: "Frontend Development",
      mentor: "Nguyen Thi B",
      status: "Active"
    },
    {
      id: "crs_102",
      title: "NodeJS & Express Essentials",
      category: "Backend Development",
      mentor: "Nguyen Thi B",
      status: "Active"
    },
    {
      id: "crs_103",
      title: "CI/CD Pipeline with GitHub Actions",
      category: "DevOps & Cloud",
      mentor: "Tran Van A",
      status: "Inactive"
    }
  ]);

  const toggleCourseStatus = (courseId) => {
    setCourses(
      courses.map((course) => {
        if (course.id === courseId) {
          const newStatus = course.status === "Active" ? "Inactive" : "Active";
          return { ...course, status: newStatus };
        }
        return course;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Quản lý Khóa học & Lộ trình</h2>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý trạng thái hoạt động (Active/Inactive) các khóa học/lộ trình (Learning Paths) trong hệ thống.
        </p>
      </div>

      {/* Mock Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative max-w-sm w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Courses List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  {course.category}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    course.status === "Active"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {course.status === "Active" ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {course.status}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-lg leading-snug">{course.title}</h3>
              <p className="text-xs text-slate-400 mt-2">Mentor: {course.mentor}</p>
              <p className="text-[10px] text-slate-300 font-mono mt-0.5">{course.id}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Trạng thái Khóa học</span>
              <button
                onClick={() => toggleCourseStatus(course.id)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                {course.status === "Active" ? (
                  <div className="flex items-center gap-1.5 text-indigo-600">
                    <span>Active</span>
                    <ToggleRight className="w-8 h-8 text-indigo-600" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span>Inactive</span>
                    <ToggleLeft className="w-8 h-8 text-slate-300" />
                  </div>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseManagement;
