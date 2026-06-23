import React, { useState } from "react";
import { Shield, ShieldAlert, CheckCircle, AlertCircle, Ban } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: "usr_001",
      name: "Tran Van A",
      email: "vana@gmail.com",
      role: "Student",
      xp: 1250,
      streak: 5,
      status: "Active"
    },
    {
      id: "usr_002",
      name: "Nguyen Thi B",
      email: "thib@gmail.com",
      role: "Mentor",
      xp: 4300,
      streak: 12,
      status: "Active"
    },
    {
      id: "usr_003",
      name: "Le Hoang C",
      email: "hoangc@gmail.com",
      role: "Student",
      xp: 0,
      streak: 0,
      status: "Blocked"
    }
  ]);

  const toggleUserStatus = (userId) => {
    setUsers(
      users.map((user) => {
        if (user.id === userId) {
          const newStatus = user.status === "Active" ? "Blocked" : "Active";
          return { ...user, status: newStatus };
        }
        return user;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Quản lý Học viên & Mentor</h2>
        <p className="text-sm text-slate-500 mt-1">
          Danh sách người dùng hệ thống. Hỗ trợ kích hoạt hoặc khóa tài khoản (Block / Unblock).
        </p>
      </div>

      {/* User Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">User ID & Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-center">XP</th>
                <th className="px-6 py-4 text-center">Streak</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                    <div className="text-[10px] text-slate-300 font-mono mt-0.5">{user.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.role === "Mentor"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {user.role === "Mentor" ? (
                        <Shield className="w-3.5 h-3.5" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      )}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-600">{user.xp} XP</td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-600">{user.streak} ngày 🔥</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
                        user.status === "Active"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {user.status === "Active" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                        user.status === "Active"
                          ? "border-rose-100 hover:border-rose-200 text-rose-600 hover:bg-rose-50"
                          : "border-emerald-100 hover:border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      {user.status === "Active" ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
