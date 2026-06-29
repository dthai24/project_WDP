import React, { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import { ShieldCheck, RefreshCw, AlertCircle, ArrowLeft, Check, X, ExternalLink } from "lucide-react";
import DataTable from "../../components/common/DataTable";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { useNavigate } from "react-router-dom";

const MentorApprovalList = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);

  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("");

  // Confirmation Modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({ regId: null, targetStatus: "", rejectReason: "" });
  const [rejectInputOpen, setRejectInputOpen] = useState(false);
  const [rejectReasonText, setRejectReasonText] = useState("");

  const fetchApplications = async (pageNum = 1, searchVal = "", statusVal = "Pending", sortByVal = "", sortDirVal = "") => {
    setLoading(true);
    setError(false);
    try {
      const res = await adminApi.getMentorRegistrations({
        page: pageNum,
        limit: 10,
        search: searchVal,
        status: statusVal,
        sortBy: sortByVal || undefined,
        sortOrder: sortDirVal || undefined
      });
      if (res && res.success) {
        setApplications(res.data || []);
        setPagination(res.pagination || { total: 0, page: pageNum, limit: 10, pages: 1 });
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error("Error fetching mentor applications:", err);
      setError(true);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(1, search, statusFilter, sortColumn, sortDirection);
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
    fetchApplications(1, search, statusFilter, nextCol, nextDirection);
  };

  const triggerProcessRegistration = (regId, targetStatus) => {
    if (targetStatus === "Rejected") {
      setConfirmData({ regId, targetStatus, rejectReason: "" });
      setRejectReasonText("");
      setRejectInputOpen(true);
    } else {
      setConfirmData({ regId, targetStatus, rejectReason: "" });
      setConfirmOpen(true);
    }
  };

  const handleConfirmSubmit = async () => {
    const { regId, targetStatus } = confirmData;
    if (!regId) return;

    setConfirmOpen(false);
    setRejectInputOpen(false);
    setSubmittingId(regId);

    try {
      const reason = targetStatus === "Rejected" ? rejectReasonText : "";
      const res = await adminApi.processMentorRegistration(regId, targetStatus, reason);
      if (res && res.success) {
        fetchApplications(pagination.page, search, statusFilter, sortColumn, sortDirection);
      } else {
        alert("Failed to process mentor registration.");
      }
    } catch (err) {
      console.error("Error processing mentor registration:", err);
      alert("An error occurred while processing registration.");
    } finally {
      setSubmittingId(null);
      setConfirmData({ regId: null, targetStatus: "", rejectReason: "" });
      setRejectReasonText("");
    }
  };

  const columns = [
    {
      key: "fullName",
      label: "Full Name",
      sortable: true,
      render: (m) => (
        <div>
          <div className="font-bold text-slate-800">{m.fullName || m.name || "Unknown"}</div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">{m.email}</div>
        </div>
      )
    },
    {
      key: "certificate",
      label: "Verification Certificate",
      sortable: true,
      render: (m) => {
        const certLink = m.certificate || "https://coursera.org/verify/specialization/wdp-english";
        return (
          <a
            href={certLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 hover:text-blue-800 rounded-lg text-xs font-bold transition-all"
          >
            <span>Verify Credential</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        );
      }
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (m) => {
        let style = "bg-slate-100 text-slate-500 border-slate-200";
        if (m.status === "Approved") {
          style = "bg-emerald-50 text-emerald-700 border-emerald-100";
        } else if (m.status === "Pending") {
          style = "bg-amber-50 text-amber-700 border-amber-100";
        } else if (m.status === "Rejected") {
          style = "bg-red-50 text-red-700 border-red-100";
        }
        return (
          <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold ${style}`}>
            {m.status}
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
          <div className="inline-flex gap-2">
            <button
              onClick={() => triggerProcessRegistration(m._id, "Approved")}
              disabled={submittingId !== null}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => triggerProcessRegistration(m._id, "Rejected")}
              disabled={submittingId !== null}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-semibold italic">Processed</span>
        )
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
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>Mentor Approvals</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review submitted profiles, verify credentials, and approve or reject platform mentors.
          </p>
        </div>
        <button
          onClick={() => fetchApplications(pagination.page, search, statusFilter, sortColumn, sortDirection)}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Requests</span>
        </button>
      </div>

      {/* Main Table */}
      {error ? (
        <div className="p-6 border border-red-100 rounded-2xl bg-red-50/50 flex items-center gap-3 text-red-700 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm font-semibold">API connection error. Please verify the backend service or database status.</div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={applications}
          pagination={pagination}
          onPageChange={(page) => fetchApplications(page, search, statusFilter, sortColumn, sortDirection)}
          searchPlaceholder="Search by name or email..."
          onSearch={(val) => {
            setSearch(val);
            fetchApplications(1, val, statusFilter, sortColumn, sortDirection);
          }}
          filters={[
            {
              key: "status",
              label: "All statuses",
              value: statusFilter,
              options: [
                { value: "Pending", label: "Pending" },
                { value: "Approved", label: "Approved" },
                { value: "Rejected", label: "Rejected" }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === "status") {
              setStatusFilter(val);
              fetchApplications(1, search, val, sortColumn, sortDirection);
            }
          }}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          loading={loading}
        />
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmOpen}
        title="Confirm Mentor Approval"
        message="Are you sure you want to approve this mentor registration application? This will grant them content creation privileges."
        confirmText="Yes, Approve"
        cancelText="Cancel"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Reject Modal with Input */}
      {rejectInputOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-[1.8rem] shadow-xl p-6 space-y-4 animate-in scale-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Reject Mentor Application</h3>
              <p className="text-sm text-slate-500 mt-1">Please provide a feedback note explaining the reason for rejection.</p>
            </div>
            <div>
              <textarea
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                placeholder="Missing Coursera specialization certificates or credentials..."
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
                onClick={handleConfirmSubmit}
                disabled={!rejectReasonText.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white disabled:opacity-50 rounded-xl text-sm font-bold transition-all"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorApprovalList;
