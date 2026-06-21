import React, { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import { UserCheck, UserMinus, Eye, Loader2, AlertCircle } from "lucide-react";
import DataTable from "../../components/common/DataTable";

const UserControl = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  
  // Profile View Modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewLoadingId, setViewLoadingId] = useState(null);

  const fetchUsers = async (pageNum = 1, searchVal = "", roleVal = "", statusVal = "") => {
    setLoading(true);
    setError(false);
    try {
      const res = await adminApi.getUsers({
        page: pageNum,
        limit: 10,
        search: searchVal,
        role: roleVal,
        isBlocked: statusVal
      });
      if (res && res.success) {
        setUsers(res.data || []);
        setPagination(res.pagination || { total: 0, page: pageNum, limit: 10, pages: 0 });
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, search, roleFilter, statusFilter);
  }, []);

  const handleToggleBlock = async (userId, currentBlockedStatus) => {
    const action = currentBlockedStatus ? "unblock" : "block";
    if (!window.confirm(`Confirm you want to ${action} this user account?`)) return;

    setSubmittingId(userId);
    try {
      const targetNewStatus = !currentBlockedStatus;
      const res = await adminApi.toggleUserBlock(userId, targetNewStatus);
      if (res && res.success) {
        fetchUsers(pagination.page, search, roleFilter, statusFilter);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while changing the user account status.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleViewProfile = async (userId) => {
    setViewLoadingId(userId);
    try {
      const res = await adminApi.getUserById(userId);
      if (res && res.success) {
        setSelectedUser(res.data);
        setProfileModalOpen(true);
      } else {
        alert("Failed to retrieve user details.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while fetching user profile details.");
    } finally {
      setViewLoadingId(null);
    }
  };

  const columns = [
    {
      key: "name",
      label: "User",
      render: (u) => (
        <div>
          <div className="font-bold text-slate-800">{u.name || u.fullName}</div>
          <div className="text-xs text-slate-500 font-semibold">{u.email}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{u._id}</div>
        </div>
      )
    },
    {
      key: "role",
      label: "Role",
      render: (u) => {
        let color = "bg-slate-100 text-slate-655 border-slate-200";
        let text = "Student";
        if (u.role === "Admin") {
          color = "bg-red-50 text-red-700 border-red-100";
          text = "Admin";
        } else if (u.role === "Mentor") {
          color = "bg-blue-50 text-blue-700 border-blue-100";
          text = "Mentor";
        }
        return (
          <span className={`px-2.5 py-0.5 border rounded-lg text-xs font-bold ${color}`}>
            {text}
          </span>
        );
      }
    },
    {
      key: "xp",
      label: "XP Points",
      render: (u) => (
        <span className="font-bold text-slate-800">{u.xp !== undefined ? u.xp : 0} XP</span>
      )
    },
    {
      key: "streak",
      label: "Streak",
      render: (u) => (
        <span className="text-slate-600 text-sm font-semibold">{u.streak !== undefined ? u.streak : 0} days</span>
      )
    },
    {
      key: "isBlocked",
      label: "Status",
      render: (u) => (
        <span className={`px-2.5 py-0.5 border rounded-lg text-xs font-bold ${
          u.isBlocked
            ? "bg-red-50 text-red-700 border-red-100"
            : "bg-emerald-50 text-emerald-700 border-emerald-100"
        }`}>
          {u.isBlocked ? "BLOCKED" : "ACTIVE"}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (u) => (
        <div className="flex justify-end items-center gap-2">
          <button
            onClick={() => handleViewProfile(u._id)}
            disabled={viewLoadingId !== null}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-350 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-xs disabled:opacity-50"
          >
            {viewLoadingId === u._id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>View Profile</span>
          </button>
          
          {u.role !== "Admin" && (
            <button
              onClick={() => handleToggleBlock(u._id, u.isBlocked)}
              disabled={submittingId !== null}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-bold transition-all shadow-xs ${
                u.isBlocked
                  ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              }`}
            >
              {u.isBlocked ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Unblock</span>
                </>
              ) : (
                <>
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>Block Account</span>
                </>
              )}
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 text-slate-855 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Control</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor registered user accounts. View profiles or manage block/unblock status.
        </p>
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
          data={users}
          pagination={pagination}
          onPageChange={(page) => fetchUsers(page, search, roleFilter, statusFilter)}
          searchPlaceholder="Search by user name or email..."
          onSearch={(val) => {
            setSearch(val);
            fetchUsers(1, val, roleFilter, statusFilter);
          }}
          filters={[
            {
              key: "role",
              label: "All roles",
              value: roleFilter,
              options: [
                { value: "Admin", label: "Admin" },
                { value: "Mentor", label: "Mentor" },
                { value: "Student", label: "Student" }
              ]
            },
            {
              key: "isBlocked",
              label: "All statuses",
              value: statusFilter,
              options: [
                { value: "false", label: "Active" },
                { value: "true", label: "Blocked" }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === "role") {
              setRoleFilter(val);
              fetchUsers(1, search, val, statusFilter);
            } else if (key === "isBlocked") {
              setStatusFilter(val);
              fetchUsers(1, search, roleFilter, val);
            }
          }}
          loading={loading}
        />
      )}

      {/* Profile Details Modal (Read-Only) */}
      {profileModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                User Profile Details
              </h3>
              <button
                onClick={() => {
                  setProfileModalOpen(false);
                  setSelectedUser(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</span>
                <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                  {selectedUser.name || selectedUser.fullName || "N/A"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                  {selectedUser.email || "N/A"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Role</span>
                  <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                    {selectedUser.role || "N/A"}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                  <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                    {selectedUser.isBlocked ? "Blocked" : "Active"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">XP Points</span>
                  <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 font-mono">
                    {selectedUser.xp !== undefined ? selectedUser.xp : 0} XP
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Streak</span>
                  <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 font-mono">
                    {selectedUser.streak !== undefined ? selectedUser.streak : 0} Days
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Created At</span>
                <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString("en-US") : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setProfileModalOpen(false);
                  setSelectedUser(null);
                }}
                className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-xs shadow-md transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserControl;
