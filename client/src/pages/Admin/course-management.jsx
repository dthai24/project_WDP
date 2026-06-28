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
    </div>
  );
};

export default CourseManagement;
