import React, { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import { Check, X, AlertCircle, Loader2 } from "lucide-react";
import DataTable from "../../components/common/DataTable";
import ConfirmationModal from "../../components/common/ConfirmationModal";

const CourseApproval = () => {
  // Mentor registrations state
  const [mentors, setMentors] = useState([]);
  const [mentorPagination, setMentorPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [mentorSearch, setMentorSearch] = useState("");
  const [mentorStatus, setMentorStatus] = useState(""); // Defaults to all

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);

  // Sorting states
  const [mentorSortColumn, setMentorSortColumn] = useState("");
  const [mentorSortDirection, setMentorSortDirection] = useState("");

  // Rejection Modal states for Mentor
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  // Confirmation Modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({ type: "", id: null, extra: null });

  const fetchMentors = async (pageNum = 1, search = "", status = "", sortByVal = "", sortDirVal = "") => {
     setLoading(true);
     setError(false);
     try {
       const res = await adminApi.getMentorRegistrations({
         page: pageNum,
         limit: 10,
         search,
         status,
         sortBy: sortByVal || undefined,
         sortOrder: sortDirVal || undefined
       });
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

  useEffect(() => {
    fetchMentors(1, mentorSearch, mentorStatus, mentorSortColumn, mentorSortDirection);
  }, []);

  const handleMentorSort = (columnKey, event) => {
    const isShift = event && event.shiftKey;
    let activeCols = mentorSortColumn ? mentorSortColumn.split(",") : [];
    let activeDirs = mentorSortDirection ? mentorSortDirection.split(",") : [];

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
    setMentorSortColumn(nextCol);
    setMentorSortDirection(nextDirection);
    fetchMentors(1, mentorSearch, mentorStatus, nextCol, nextDirection);
  };

  const triggerApproveMentor = (regId) => {
    setConfirmData({ type: "approveMentor", id: regId });
    setConfirmOpen(true);
  };

  const handleApproveMentor = async () => {
    const regId = confirmData.id;
    if (!regId) return;
    setConfirmOpen(false);
    setSubmittingId(regId);
    try {
      const res = await adminApi.processMentorRegistration(regId, "Approved");
      if (res && res.success) {
        fetchMentors(mentorPagination.page, mentorSearch, mentorStatus, mentorSortColumn, mentorSortDirection);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while approving the mentor application.");
    } finally {
      setSubmittingId(null);
      setConfirmData({ type: "", id: null, extra: null });
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
    // Open confirmation popup for rejection!
    setConfirmData({ type: "rejectMentor", id: selectedRegId, extra: rejectReason.trim() });
    setRejectModalOpen(false);
    setConfirmOpen(true);
  };

  const handleRejectMentor = async () => {
    const { id: regId, extra: reason } = confirmData;
    if (!regId) return;
    setConfirmOpen(false);
    setSubmittingId(regId);
    try {
      const res = await adminApi.processMentorRegistration(regId, "Rejected", reason);
      if (res && res.success) {
        fetchMentors(mentorPagination.page, mentorSearch, mentorStatus, mentorSortColumn, mentorSortDirection);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while rejecting the mentor application.");
    } finally {
      setSubmittingId(null);
      setConfirmData({ type: "", id: null, extra: null });
      setSelectedRegId(null);
      setRejectReason("");
    }
  };

  const handleConfirmAction = () => {
    if (confirmData.type === "approveMentor") {
      handleApproveMentor();
    } else if (confirmData.type === "rejectMentor") {
      handleRejectMentor();
    }
  };

  // Columns for Mentor registrations
  const mentorColumns = [
    {
      key: "fullName",
      label: "Full Name",
      sortable: true,
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
      sortable: true,
      render: (m) => {
        if (!m.certificate) {
          return <span className="text-slate-450 text-xs italic">Not uploaded</span>;
        }
        const href = m.certificate.startsWith("http") ? m.certificate : `https://${m.certificate}`;
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-755 hover:underline font-bold"
          >
            View Credential
          </a>
        );
      }
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
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
              onClick={() => triggerApproveMentor(m._id)}
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

  return (
    <div className="space-y-6 text-slate-850 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mentor Approval List</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and approve incoming instructor registration profiles.
        </p>
      </div>

      {/* Tab Contents */}
      {error ? (
        <div className="p-6 border border-red-100 rounded-2xl bg-red-50/50 flex items-center gap-3 text-red-700 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm font-semibold">API connection error. Please verify the backend service or database status.</div>
        </div>
      ) : (
        <DataTable
          columns={mentorColumns}
          data={mentors}
          pagination={mentorPagination}
          onPageChange={(page) => fetchMentors(page, mentorSearch, mentorStatus, mentorSortColumn, mentorSortDirection)}
          searchPlaceholder="Search applications by applicant name or email..."
          onSearch={(val) => {
            setMentorSearch(val);
            fetchMentors(1, val, mentorStatus, mentorSortColumn, mentorSortDirection);
          }}
          filters={[
            {
              key: "status",
              label: "All status",
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
              fetchMentors(1, mentorSearch, val, mentorSortColumn, mentorSortDirection);
            }
          }}
          sortColumn={mentorSortColumn}
          sortDirection={mentorSortDirection}
          onSort={handleMentorSort}
          loading={loading}
        />
      )}

      {/* Reject Mentor Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-slate-855">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-850 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">Back</span>
                </button>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider ml-1">Reject Application</h3>
              </div>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-655 text-sm font-semibold"
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmOpen}
        title="Confirm Operation"
        message={
          confirmData.type === "approveMentor"
            ? "Are you sure you want to approve this mentor registration?"
            : confirmData.type === "rejectMentor"
            ? "Are you sure you want to reject this mentor registration?"
            : "Are you sure you want to proceed?"
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmOpen(false)}
        isSubmitting={submittingId !== null}
      />
    </div>
  );
};

export default CourseApproval;
