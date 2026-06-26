import React, { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import { Check, X, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import DataTable from "../../components/common/DataTable";

const CourseApproval = () => {
  const [activeTab, setActiveTab] = useState("mentors"); // "mentors" or "courses"
  
  // Mentor registrations state
  const [mentors, setMentors] = useState([]);
  const [mentorPagination, setMentorPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [mentorSearch, setMentorSearch] = useState("");
  const [mentorStatus, setMentorStatus] = useState("Pending");

  // Courses state
  const [courses, setCourses] = useState([]);
  const [coursePagination, setCoursePagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [courseSearch, setCourseSearch] = useState("");
  const [courseStatus, setCourseStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);

  // Rejection Modal states for Mentor
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const fetchMentors = async (pageNum = 1, search = "", status = "Pending") => {
     setLoading(true);
     setError(false);
     try {
       const res = await adminApi.getMentorRegistrations({ page: pageNum, limit: 10, search, status });
       if (res && res.success) {
         setMentors(res.data || []);
         setMentorPagination(res.pagination || { total: 0, page: pageNum, limit: 10, pages: 0 });
       } else {
         setMentors([]);
       }
     } catch (err) {
       console.error("Error fetching mentor registrations:", err);
       setMentors([]);
     } finally {
       setLoading(false);
     }
   };
 
   const fetchCourses = async (pageNum = 1, search = "", status = "") => {
     setLoading(true);
     setError(false);
     try {
       const res = await adminApi.getCourses({ page: pageNum, limit: 10, search, status });
       if (res && res.success) {
         setCourses(res.data || []);
         setCoursePagination(res.pagination || { total: 0, page: pageNum, limit: 10, pages: 0 });
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
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "mentors" || tabParam === "courses") {
      setActiveTab(tabParam);
    }
  }, [window.location.search]);

  useEffect(() => {
    if (activeTab === "mentors") {
      fetchMentors(1, mentorSearch, mentorStatus);
    } else {
      fetchCourses(1, courseSearch, courseStatus);
    }
  }, [activeTab]);

  const handleApproveMentor = async (regId) => {
    if (!window.confirm("Approve this mentor application?")) return;
    setSubmittingId(regId);
    try {
      const res = await adminApi.processMentorRegistration(regId, "Approved");
      if (res && res.success) {
        fetchMentors(mentorPagination.page, mentorSearch, mentorStatus);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while approving the mentor application.");
    } finally {
      setSubmittingId(null);
    }
  };

  const openRejectMentorModal = (regId) => {
    setSelectedRegId(regId);
    setRejectReason("");
    setReasonError("");
    setRejectModalOpen(true);
  };

  const handleRejectMentorSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setReasonError("Rejection reason cannot be empty.");
      return;
    }

    setSubmittingId(selectedRegId);
    setRejectModalOpen(false);

    try {
      const res = await adminApi.processMentorRegistration(selectedRegId, "Rejected", rejectReason.trim());
      if (res && res.success) {
        fetchMentors(mentorPagination.page, mentorSearch, mentorStatus);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while rejecting the mentor application.");
    } finally {
      setSubmittingId(null);
      setSelectedRegId(null);
      setRejectReason("");
    }
  };

  const handleToggleCourseStatus = async (courseId, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const msg = nextStatus === "Active" ? "activate" : "suspend";
    if (!window.confirm(`Are you sure you want to ${msg} this course?`)) return;

    setSubmittingId(courseId);
    try {
      const res = await adminApi.toggleCourseStatus(courseId, nextStatus);
      if (res && res.success) {
        fetchCourses(coursePagination.page, courseSearch, courseStatus);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating the course status.");
    } finally {
      setSubmittingId(null);
    }
  };

  // Columns for Mentor registrations
  const mentorColumns = [
    {
      key: "fullName",
      label: "Full Name",
      render: (m) => (
        <div>
          <div className="font-bold text-slate-800">{m.fullName}</div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">{m._id}</div>
        </div>
      )
    },
    {
      key: "email",
      label: "Contact Info",
      render: (m) => (
        <div>
          <div className="font-semibold text-slate-700">{m.email}</div>
          {m.portfolioUrl && (
            <a href={m.portfolioUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline block mt-0.5">
              Portfolio / LinkedIn
            </a>
          )}
        </div>
      )
    },
    {
      key: "bio",
      label: "Bio & Experience",
      render: (m) => <span className="text-slate-500 text-xs line-clamp-2 max-w-xs">{m.bio}</span>
    },
    {
      key: "certificate",
      label: "Certificate",
      render: (m) => (
        <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded text-xs font-medium">
          {m.certificate || "Not uploaded"}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (m) => {
        let style = "bg-amber-50 text-amber-700 border-amber-100";
        let text = "Pending";
        if (m.status === "Approved") {
          style = "bg-emerald-50 text-emerald-700 border-emerald-100";
          text = "Approved";
        } else if (m.status === "Rejected") {
          style = "bg-red-50 text-red-700 border-red-100";
          text = "Rejected";
        }
        return (
          <span className={`px-2 py-0.5 rounded-lg border text-xs font-bold ${style}`}>
            {text}
          </span>
        );
      }
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (m) => (
        m.status === "Pending" ? (
          <div className="inline-flex gap-1.5">
            <button
              onClick={() => handleApproveMentor(m._id)}
              disabled={submittingId !== null}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => openRejectMentorModal(m._id)}
              disabled={submittingId !== null}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-750 rounded-xl text-xs font-bold transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-semibold italic">Completed</span>
        )
      )
    }
  ];

  // Columns for courses status toggle
  const courseColumns = [
    {
      key: "title",
      label: "Course Title",
      render: (c) => (
        <div>
          <div className="font-bold text-slate-800">{c.title}</div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">{c._id}</div>
        </div>
      )
    },
    {
      key: "category",
      label: "Level",
      render: (c) => (
        <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold">
          {c.category}
        </span>
      )
    },
    {
      key: "mentorName",
      label: "Instructor / Mentor",
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
      render: (c) => {
        const isActive = c.status === "Active";
        return (
          <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-slate-100 text-slate-500 border-slate-200"
          }`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      }
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (c) => {
        const isActive = c.status === "Active";
        return (
          <button
            onClick={() => handleToggleCourseStatus(c._id, c.status)}
            disabled={submittingId !== null}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
              isActive
                ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {isActive ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Suspend</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Activate</span>
              </>
            )}
          </button>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 text-slate-850 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Approvals & Status</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage mentor applications and active courses status.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 p-1 bg-slate-200/50 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("mentors")}
          className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "mentors" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Mentor Applications
        </button>
        <button
          onClick={() => setActiveTab("courses")}
          className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "courses" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Course Status
        </button>
      </div>

      {/* Tab Contents */}
      {error ? (
        <div className="p-6 border border-red-100 rounded-2xl bg-red-50/50 flex items-center gap-3 text-red-700 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm font-semibold">API connection error. Please verify the backend service or database status.</div>
        </div>
      ) : activeTab === "mentors" ? (
        <DataTable
          columns={mentorColumns}
          data={mentors}
          pagination={mentorPagination}
          onPageChange={(page) => fetchMentors(page, mentorSearch, mentorStatus)}
          searchPlaceholder="Search applications by applicant name or email..."
          onSearch={(val) => {
            setMentorSearch(val);
            fetchMentors(1, val, mentorStatus);
          }}
          filters={[
            {
              key: "status",
              label: "Application Status",
              value: mentorStatus,
              options: [
                { value: "Pending", label: "Pending" },
                { value: "Approved", label: "Approved" },
                { value: "Rejected", label: "Rejected" }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === "status") {
              setMentorStatus(val);
              fetchMentors(1, mentorSearch, val);
            }
          }}
          loading={loading}
        />
      ) : (
        <DataTable
          columns={courseColumns}
          data={courses}
          pagination={coursePagination}
          onPageChange={(page) => fetchCourses(page, courseSearch, courseStatus)}
          searchPlaceholder="Search courses by title..."
          onSearch={(val) => {
            setCourseSearch(val);
            fetchCourses(1, val, courseStatus);
          }}
          filters={[
            {
              key: "status",
              label: "Status",
              value: courseStatus,
              options: [
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Pending", label: "Pending" }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === "status") {
              setCourseStatus(val);
              fetchCourses(1, courseSearch, val);
            }
          }}
          loading={loading}
        />
      )}

      {/* Reject Mentor Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-slate-855">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Reject Mentor Application</h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleRejectMentorSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase">
                  Rejection Reason *
                </label>
                <textarea
                  rows="4"
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (e.target.value.trim()) setReasonError("");
                  }}
                  placeholder="Please provide a reason to send to the applicant..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold resize-none"
                  autoFocus
                ></textarea>
                {reasonError && <p className="text-xs font-semibold text-red-650">{reasonError}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/10 transition-all"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseApproval;
