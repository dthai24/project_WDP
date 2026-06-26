import React, { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import { BookOpen, RefreshCw, Search, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import DataTable from "../../components/common/DataTable";
import ConfirmationModal from "../../components/common/ConfirmationModal";

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

  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("");

  // Confirmation Modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({ courseId: null, targetStatus: "" });

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
            setSelectedCourse(res.data[0]);
            setDetailModalOpen(true);
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

  const triggerStatusChange = (courseId, targetStatus) => {
    setConfirmData({ courseId, targetStatus });
    setConfirmOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    const { courseId, targetStatus } = confirmData;
    if (!courseId) return;
    setConfirmOpen(false);
    setSubmittingId(courseId);
    try {
      const res = await adminApi.toggleCourseStatus(courseId, targetStatus);
      if (res && res.success) {
        fetchCourses(pagination.page, search, statusFilter, categoryFilter, sortColumn, sortDirection);
        if (selectedCourse && selectedCourse._id === courseId) {
          setSelectedCourse(prev => ({ ...prev, status: targetStatus }));
        }
      } else {
        alert("Failed to update course status.");
      }
    } catch (err) {
      console.error("Error updating course status:", err);
      alert("An error occurred while updating the course status.");
    } finally {
      setSubmittingId(null);
      setConfirmData({ courseId: null, targetStatus: "" });
    }
  };

  const openDetailsModal = (course) => {
    setSelectedCourse(course);
    setDetailModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailModalOpen(false);
    setSelectedCourse(null);
    const params = new URLSearchParams(window.location.search);
    if (params.get("viewDetail")) {
      params.delete("viewDetail");
      const newRelativePathQuery = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
      window.history.replaceState(null, "", newRelativePathQuery);
    }
  };

  const renderCurriculumTree = (paths) => {
    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return <p className="text-xs text-slate-400 italic">No chapters or curriculum defined for this course.</p>;
    }

    return (
      <div className="space-y-4 border border-slate-100 rounded-2xl p-4 bg-slate-50/30">
        {paths.map((chapter, chIdx) => (
          <div key={chapter.pathId || chIdx} className="space-y-2">
            {/* Chapter Level */}
            <div className="flex items-start gap-2 bg-slate-100/80 px-3 py-2 rounded-xl border border-slate-200/50">
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 mt-0.5">
                Chapter {chapter.order || chIdx + 1}
              </span>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">{chapter.pathName}</h4>
                {chapter.description && <p className="text-[11px] text-slate-500 font-medium">{chapter.description}</p>}
              </div>
            </div>

            {/* Lessons / Nodes Level */}
            <div className="pl-6 border-l border-slate-200 space-y-2 ml-4">
              {chapter.nodes && Array.isArray(chapter.nodes) && chapter.nodes.map((node, nodeIdx) => (
                <div key={node.nodeId || nodeIdx} className="space-y-1.5 py-1">
                  <div className="flex items-start gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase shrink-0 mt-0.5">
                      Lesson {node.nodeOrder || nodeIdx + 1}
                    </span>
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-800">{node.nodeName}</h5>
                      {node.description && <p className="text-[10px] text-slate-400 font-medium">{node.description}</p>}
                    </div>
                  </div>

                  {/* Materials Level */}
                  <div className="pl-6 border-l border-slate-100 space-y-1 ml-4">
                    {node.materials && Array.isArray(node.materials) && node.materials.map((mat, matIdx) => (
                      <div key={mat.materialId || matIdx} className="flex items-center justify-between gap-2 py-1 px-2.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-all text-xs text-slate-700">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                            mat.materialType === "VIDEO" 
                              ? "bg-purple-100 text-purple-700" 
                              : mat.materialType === "DOC" 
                              ? "bg-amber-100 text-amber-700" 
                              : "bg-rose-100 text-rose-700"
                          }`}>
                            {mat.materialType}
                          </span>
                          <span className="truncate font-semibold">{mat.title}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {mat.isFree && (
                            <span className="text-[8px] font-extrabold uppercase bg-slate-100 text-slate-500 px-1 py-0.2 rounded-md">
                              Free
                            </span>
                          )}
                          {mat.materialUrl && (
                            <a
                              href={mat.materialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-600 hover:underline font-bold"
                            >
                              Open Link
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!node.materials || node.materials.length === 0) && (
                      <p className="text-[10px] text-slate-400 italic">No materials uploaded.</p>
                    )}
                  </div>
                </div>
              ))}
              {(!chapter.nodes || chapter.nodes.length === 0) && (
                <p className="text-[11px] text-slate-400 italic">No lessons defined.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const columns = [
    {
      key: "title",
      label: "Course Title",
      sortable: true,
      render: (c) => (
        <div>
          <div className="font-extrabold text-slate-800 text-sm">{c.title}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c._id}</div>
        </div>
      )
    },
    {
      key: "mentor",
      label: "Mentor",
      sortable: true,
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
      sortable: true,
      render: (c) => (
        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-bold font-mono">
          {c.category}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
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
      label: "Actions",
      className: "text-right",
      render: (c) => (
        <button
          onClick={() => openDetailsModal(c)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-all border border-blue-100/50 shadow-xs"
        >
          View Details
        </button>
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
          onClick={() => fetchCourses(pagination.page, search, statusFilter, categoryFilter, sortColumn, sortDirection)}
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
              label: "All status",
              value: statusFilter,
              options: [
                { value: "Approved", label: "Approved" },
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

      {/* Course Details Modal */}
      {detailModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-slate-855 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeDetailsModal}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-850 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-xs font-bold">Back</span>
                </button>
                <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider ml-1">Course Inspection</h3>
              </div>
              <button
                onClick={closeDetailsModal}
                className="text-slate-400 hover:text-slate-655 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {/* Course Title and Mentor info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Course Title</span>
                  <h4 className="text-base font-extrabold text-slate-900 leading-snug">{selectedCourse.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[10px] font-bold font-mono">
                      {selectedCourse.category}
                    </span>
                    <span className={`px-2 py-0.5 border rounded-md text-[10px] font-bold ${
                      selectedCourse.status === "Active" || selectedCourse.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : selectedCourse.status === "Inactive" || selectedCourse.status === "Reject" || selectedCourse.status === "Rejected"
                        ? "bg-red-50 text-red-700 border-red-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                      {selectedCourse.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Instructor</span>
                  <div className="font-bold text-slate-800 text-sm">{selectedCourse.mentorName}</div>
                  <div className="text-xs text-slate-500 font-medium">{selectedCourse.mentorEmail}</div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Course Description</span>
                <p className="text-xs text-slate-655 leading-relaxed font-semibold">
                  {selectedCourse.description || "No description provided for this course."}
                </p>
              </div>

              {/* Curriculum structure tree */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Curriculum Structure</span>
                {renderCurriculumTree(selectedCourse.paths)}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 gap-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Current Status: {selectedCourse.status}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => triggerStatusChange(selectedCourse._id, "Inactive")}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl font-bold text-xs transition-all"
                >
                  Reject Course
                </button>
                <button
                  type="button"
                  onClick={() => triggerStatusChange(selectedCourse._id, "Active")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/10 transition-all"
                >
                  Approve Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmOpen}
        title="Confirm Status Change"
        message={`Are you sure you want to change this course status to ${confirmData.targetStatus === "Active" ? "Approved" : "Reject"}?`}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setConfirmOpen(false)}
        isSubmitting={submittingId !== null}
      />
    </div>
  );
};

export default CourseManagement;
