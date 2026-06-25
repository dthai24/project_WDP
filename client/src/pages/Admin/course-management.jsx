import React, { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import { BookOpen, RefreshCw, Search, AlertCircle, Loader2 } from "lucide-react";
import DataTable from "../../components/common/DataTable";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [categoriesOptions, setCategoriesOptions] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await adminApi.getCategories({ limit: 100 });
        if (res && res.success) {
          const opts = (res.data || []).map(cat => ({
            value: cat.code || cat.categoryName,
            label: `${cat.code || cat.categoryName} - ${cat.name || cat.displayName}`
          }));
          setCategoriesOptions(opts);
        }
      } catch (err) {
        console.error("Error loading categories for course management filter:", err);
      }
    };
    loadCategories();
  }, []);

  const fetchCourses = async (pageNum = 1, searchVal = "", statusVal = "", categoryVal = "") => {
    setLoading(true);
    setError(false);
    try {
      const res = await adminApi.getCourses({
        page: pageNum,
        limit: 10,
        search: searchVal,
        status: statusVal,
        category: categoryVal
      });
      if (res && res.success) {
        setCourses(res.data || []);
        setPagination(res.pagination || { total: 0, page: pageNum, limit: 10, pages: 0 });
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(1, search, statusFilter, categoryFilter);
  }, []);

  const handleToggleStatus = async (courseId, currentStatus) => {
    // If pending, allow Activating or Suspending
    const targetStatus = currentStatus === "Active" ? "Inactive" : "Active";
    setSubmittingId(courseId);
    try {
      const res = await adminApi.toggleCourseStatus(courseId, targetStatus);
      if (res && res.success) {
        fetchCourses(pagination.page, search, statusFilter, categoryFilter);
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while changing course status.");
    } finally {
      setSubmittingId(null);
    }
  };

  const ToggleSwitch = ({ checked, onChange, disabled }) => {
    return (
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-205 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 ${
          checked ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-205 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    );
  };

  const columns = [
    {
      key: "title",
      label: "Course Title",
      render: (c) => (
        <div>
          <div className="font-extrabold text-slate-800 text-sm">{c.title}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c._id}</div>
        </div>
      )
    },
    {
      key: "mentor",
      label: "Instructor",
      render: (c) => (
        <div>
          <div className="font-semibold text-slate-700">{c.mentorName}</div>
          <div className="text-xs text-slate-400">{c.mentorEmail}</div>
        </div>
      )
    },
    {
      key: "category",
      label: "Level Tag",
      render: (c) => (
        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-bold font-mono">
          {c.category}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (c) => {
        let styleClass = "bg-amber-50 text-amber-700 border-amber-100";
        if (c.status === "Active") styleClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
        if (c.status === "Inactive") styleClass = "bg-slate-100 text-slate-600 border-slate-200";
        return (
          <span className={`px-2.5 py-0.5 border rounded-lg text-xs font-bold ${styleClass}`}>
            {c.status.toUpperCase()}
          </span>
        );
      }
    },
    {
      key: "actions",
      label: "Status Control",
      className: "text-right",
      render: (c) => (
        <div className="flex justify-end items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold select-none">
            {c.status === "Active" ? "Active" : "Inactive"}
          </span>
          <ToggleSwitch
            checked={c.status === "Active"}
            onChange={() => handleToggleStatus(c._id, c.status)}
            disabled={submittingId !== null}
          />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 text-slate-855 font-sans animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>Course Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and search courses, filter by tag categories, and toggle active/inactive status.
          </p>
        </div>
        <button
          onClick={() => fetchCourses(pagination.page, search, statusFilter, categoryFilter)}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Courses</span>
        </button>
      </div>

      {/* Main Content */}
      {error ? (
        <div className="p-6 border border-red-100 rounded-2xl bg-red-50/50 flex items-center gap-3 text-red-700 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm font-semibold">API connection error. Please verify the backend service or database status.</div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={courses}
          pagination={pagination}
          onPageChange={(page) => fetchCourses(page, search, statusFilter, categoryFilter)}
          searchPlaceholder="Search by title or instructor..."
          onSearch={(val) => {
            setSearch(val);
            fetchCourses(1, val, statusFilter, categoryFilter);
          }}
          filters={[
            {
              key: "category",
              label: "All tag levels",
              value: categoryFilter,
              options: categoriesOptions
            },
            {
              key: "status",
              label: "All statuses",
              value: statusFilter,
              options: [
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Pending", label: "Pending" }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === "category") {
              setCategoryFilter(val);
              fetchCourses(1, search, statusFilter, val);
            } else if (key === "status") {
              setStatusFilter(val);
              fetchCourses(1, search, val, categoryFilter);
            }
          }}
          loading={loading}
        />
      )}
    </div>
  );
};

export default CourseManagement;
