import React, { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import { BookOpen, RefreshCw, AlertCircle, Loader2, ArrowLeft, Eye, Check, X, ChevronRight, ChevronDown, Play, FileText, HelpCircle } from "lucide-react";
import DataTable from "../../components/common/DataTable";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { useNavigate } from "react-router-dom";

const CourseManagement = () => {
  const navigate = useNavigate();
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

  // Curriculum State
  const [curriculum, setCurriculum] = useState([]);
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  // Sorting
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("");

  // Confirmation Modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({ courseId: null, targetStatus: "", rejectReason: "" });
  const [rejectInputOpen, setRejectInputOpen] = useState(false);
  const [rejectReasonText, setRejectReasonText] = useState("");

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

  const fetchCourses = async (pageNum = 1, searchVal = "", statusVal = "", categoryVal = "", sortByVal = "", sortDirVal = "") => {
    setLoading(true);
    setError(false);
    try {
      const res = await adminApi.getCourses({
        page: pageNum,
        limit: 10,
        search: searchVal,
        status: statusVal,
        category: categoryVal,
        sortBy: sortByVal || undefined,
        sortOrder: sortDirVal || undefined
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
    fetchCourses(1, search, statusFilter, categoryFilter, sortColumn, sortDirection);
    
    // Support query param viewDetail to auto-open course details modal on mount
    const params = new URLSearchParams(window.location.search);
    const viewDetailId = params.get("viewDetail");
    if (viewDetailId) {
      const loadDeepLinkCourse = async () => {
        try {
          const res = await adminApi.getCourses({ search: viewDetailId });
          if (res && res.success && res.data && res.data.length > 0) {
            openDetailsModal(res.data[0]);
          }
        } catch (err) {
          console.error("Error loading deep link course:", err);
        }
      };
      loadDeepLinkCourse();
    }
  }, []);

  const handleSort = (columnKey, event) => {
    const isShift = event && event.shiftKey;
    let activeCols = sortColumn ? sortColumn.split(",") : [];
    let activeDirs = sortDirection ? sortDirection.split(",") : [];

    const colIdx = activeCols.indexOf(columnKey);

    if (isShift) {
      if (colIdx !== -1) {
        if (activeDirs[colIdx] === "asc") {
          activeDirs[colIdx] = "desc";
        } else {
          activeCols.splice(colIdx, 1);
          activeDirs.splice(colIdx, 1);
        }
      } else {
        activeCols.push(columnKey);
        activeDirs.push("asc");
      }
    } else {
      if (colIdx !== -1 && activeCols.length === 1) {
        if (activeDirs[0] === "asc") {
          activeDirs[0] = "desc";
        } else {
          activeCols = [];
          activeDirs = [];
        }
      } else {
        activeCols = [columnKey];
        activeDirs = ["asc"];
      }
    }

    const nextCol = activeCols.join(",");
    const nextDirection = activeDirs.join(",");
    setSortColumn(nextCol);
    setSortDirection(nextDirection);
    fetchCourses(1, search, statusFilter, categoryFilter, nextCol, nextDirection);
  };

  const loadCurriculum = async (courseId) => {
    setCurriculumLoading(true);
    try {
      const res = await adminApi.getCourseCurriculum(courseId);
      if (res && res.success) {
        setCurriculum(res.data || []);
        // Expand all modules by default
        const expansions = {};
        (res.data || []).forEach(m => {
          expansions[m._id] = true;
        });
        setExpandedModules(expansions);
      } else {
        setCurriculum([]);
      }
    } catch (err) {
      console.error("Error loading curriculum:", err);
      setCurriculum([]);
    } finally {
      setCurriculumLoading(false);
    }
  };

  const triggerStatusChange = (courseId, targetStatus) => {
    if (targetStatus === "Reject") {
      setConfirmData({ courseId, targetStatus, rejectReason: "" });
      setRejectReasonText("");
      setRejectInputOpen(true);
    } else {
      setConfirmData({ courseId, targetStatus, rejectReason: "" });
      setConfirmOpen(true);
    }
  };

  const handleConfirmStatusChange = async () => {
    const { courseId, targetStatus } = confirmData;
    if (!courseId) return;

    setConfirmOpen(false);
    setRejectInputOpen(false);
    setSubmittingId(courseId);

    try {
      const reason = targetStatus === "Reject" ? rejectReasonText : "";
      const res = await adminApi.toggleCourseStatus(courseId, targetStatus);
      
      // Update reject reason if rejected
      if (targetStatus === "Reject" && reason) {
        await fetch(`${process.env.REACT_APP_API_URL || "https://localhost:5000"}/api/admin/courses/${courseId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("learnpath_token")}`
          },
          body: JSON.stringify({ status: targetStatus, rejectReason: reason })
        });
      }

      if (res && res.success) {
        fetchCourses(pagination.page, search, statusFilter, categoryFilter, sortColumn, sortDirection);
        if (selectedCourse && selectedCourse._id === courseId) {
          setSelectedCourse(prev => ({ ...prev, status: targetStatus, rejectReason: reason }));
        }
      } else {
        alert("Failed to update course status.");
      }
    } catch (err) {
      console.error("Error updating course status:", err);
      alert("An error occurred while updating the course status.");
    } finally {
      setSubmittingId(null);
      setConfirmData({ courseId: null, targetStatus: "", rejectReason: "" });
      setRejectReasonText("");
    }
  };

  const openDetailsModal = (course) => {
    setSelectedCourse(course);
    setDetailModalOpen(true);
    loadCurriculum(course._id);
  };

  const closeDetailsModal = () => {
    setDetailModalOpen(false);
    setSelectedCourse(null);
    setCurriculum([]);
    const params = new URLSearchParams(window.location.search);
    if (params.get("viewDetail")) {
      params.delete("viewDetail");
      const newRelativePathQuery = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
      window.history.replaceState(null, "", newRelativePathQuery);
    }
  };

  const toggleModuleExpand = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const columns = [
    {
      key: "title",
      label: "Course Title",
      sortable: true,
      render: (c) => (
        <div>
          <div className="font-bold text-slate-800">{c.title || c.courseName}</div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">{c._id}</div>
        </div>
      )
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (c) => (
        <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase">
          {c.category}
        </span>
      )
    },
    {
      key: "mentorName",
      label: "Instructor",
      sortable: true,
      render: (c) => (
        <div>
          <div className="font-semibold text-slate-700">{c.mentorName || "Unknown"}</div>
          <div className="text-[10px] text-slate-400 font-medium">{c.mentorEmail || ""}</div>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (c) => {
        let style = "bg-slate-100 text-slate-500 border-slate-200";
        if (c.status === "Active" || c.status === "Approved") {
          style = "bg-emerald-50 text-emerald-700 border-emerald-100";
        } else if (c.status === "Pending") {
          style = "bg-amber-50 text-amber-700 border-amber-100";
        } else if (c.status === "Reject" || c.status === "Inactive") {
          style = "bg-red-50 text-red-700 border-red-100";
        }
        return (
          <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold ${style}`}>
            {c.status}
          </span>
        );
      }
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (c) => (
        <button
          onClick={() => openDetailsModal(c)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Details</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 text-slate-855 font-sans animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-6 gap-4">
        <div>
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 font-bold text-xs uppercase tracking-wider mb-2.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>Course Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse courses, inspect lesson curriculums, and verify content structure prior to approval.
          </p>
        </div>
        <button
          onClick={() => fetchCourses(pagination.page, search, statusFilter, categoryFilter, sortColumn, sortDirection)}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Courses</span>
        </button>
      </div>

      {/* Table grid */}
      {error ? (
        <div className="p-6 border border-red-100 rounded-2xl bg-red-50/50 flex items-center gap-3 text-red-700 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm font-semibold">API connection error. Please verify database status.</div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={courses}
          pagination={pagination}
          onPageChange={(page) => fetchCourses(page, search, statusFilter, categoryFilter, sortColumn, sortDirection)}
          searchPlaceholder="Search by title or mentor..."
          onSearch={(val) => {
            setSearch(val);
            fetchCourses(1, val, statusFilter, categoryFilter, sortColumn, sortDirection);
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
                { value: "Active", label: "Approved" },
                { value: "Reject", label: "Reject" },
                { value: "Pending", label: "Pending" }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === "category") {
              setCategoryFilter(val);
              fetchCourses(1, search, statusFilter, val, sortColumn, sortDirection);
            } else if (key === "status") {
              setStatusFilter(val);
              fetchCourses(1, search, val, categoryFilter, sortColumn, sortDirection);
            }
          }}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          loading={loading}
        />
      )}

      {/* Details & Curriculum Tree Modal */}
      {detailModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-4xl h-[90vh] bg-white border border-slate-200 rounded-[1.8rem] shadow-xl flex flex-col overflow-hidden animate-in scale-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedCourse.title || selectedCourse.courseName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">ID: {selectedCourse._id}</p>
              </div>
              <button
                onClick={closeDetailsModal}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Course Meta Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 border border-slate-100 p-5 rounded-[1.4rem]">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instructor Details</span>
                  <div className="text-sm font-semibold text-slate-800">{selectedCourse.mentorName || "Unknown"}</div>
                  <div className="text-xs text-slate-500">{selectedCourse.mentorEmail || "No email available"}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Tag Level</span>
                  <div className="text-sm font-semibold text-slate-800 uppercase">{selectedCourse.category || "General"}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification Status</span>
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 border rounded-lg text-xs font-bold mt-0.5 ${
                      selectedCourse.status === "Active" || selectedCourse.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : selectedCourse.status === "Pending"
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-red-50 text-red-700 border-red-100"
                    }`}>
                      {selectedCourse.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Description */}
              {selectedCourse.description && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900">Course Syllabus Description</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedCourse.description}</p>
                </div>
              )}

              {/* Rejection Comments */}
              {selectedCourse.status === "Reject" && selectedCourse.rejectReason && (
                <div className="p-4 border border-red-100 rounded-2xl bg-red-50/30 text-red-950 space-y-1.5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-red-700">Rejection Reason</h5>
                  <p className="text-sm leading-relaxed">{selectedCourse.rejectReason}</p>
                </div>
              )}

              {/* Curriculum Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Curriculum Chapter Tree (Chapters & Lessons)</h4>
                
                {curriculumLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : curriculum.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 font-semibold text-sm">
                    No curriculum modules found for this course structure.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {curriculum.map((mod, index) => {
                      const isExpanded = expandedModules[mod._id];
                      return (
                        <div key={mod._id} className="border border-slate-100 rounded-[1.2rem] overflow-hidden">
                          <button
                            onClick={() => toggleModuleExpand(mod._id)}
                            className="w-full px-5 py-4 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
                          >
                            <span className="font-bold text-slate-800 text-sm">
                              Chapter {index + 1}: {mod.title || `Module ${mod.order}`}
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-500" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="divide-y divide-slate-100 bg-white">
                              {mod.lessons && mod.lessons.length > 0 ? (
                                mod.lessons.map((les) => (
                                  <div key={les._id} className="px-5 py-3.5 flex items-center justify-between text-sm hover:bg-slate-50/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                      {les.type === "video" && <Play className="w-4 h-4 text-blue-600 fill-blue-50/50" />}
                                      {les.type === "document" && <FileText className="w-4 h-4 text-purple-600" />}
                                      {les.type === "quiz" && <HelpCircle className="w-4 h-4 text-amber-600" />}
                                      <span className="font-semibold text-slate-700">{les.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                                      {les.free && (
                                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md text-[10px] uppercase font-bold">
                                          Free
                                        </span>
                                      )}
                                      <span>{les.duration || "N/A"}</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-5 py-3 text-xs italic text-slate-400">
                                  No lessons loaded inside this chapter.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Controls */}
            {selectedCourse.status === "Pending" && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => triggerStatusChange(selectedCourse._id, "Reject")}
                  disabled={submittingId !== null}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-200 hover:border-red-300 text-red-700 bg-white hover:bg-red-50 rounded-xl text-sm font-bold transition-all shadow-xs"
                >
                  <X className="w-4 h-4" />
                  <span>Reject Course</span>
                </button>
                <button
                  onClick={() => triggerStatusChange(selectedCourse._id, "Active")}
                  disabled={submittingId !== null}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Publish</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmOpen}
        title="Confirm Course Approval"
        message="Are you sure you want to approve and publish this course curriculum? Students will instantly be able to view and register."
        confirmText="Yes, Publish"
        cancelText="Cancel"
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Reject Modal with Input */}
      {rejectInputOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-[1.8rem] shadow-xl p-6 space-y-4 animate-in scale-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Reject Course Structure</h3>
              <p className="text-sm text-slate-500 mt-1">Please provide feedback explaining the reason for rejecting this course syllabus.</p>
            </div>
            <div>
              <textarea
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                placeholder="Missing necessary lessons in module 2 or quizzes need correction..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl text-sm font-semibold text-slate-700 placeholder-slate-400 outline-hidden transition-all resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setRejectInputOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={!rejectReasonText.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white disabled:opacity-50 rounded-xl text-sm font-bold transition-all"
              >
                Reject Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
