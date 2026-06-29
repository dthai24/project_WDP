import React, { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import { Bell, AlertCircle, Loader2, Check, Eye, Trash2, MailOpen, Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await adminApi.getNotifications();
      if (res && res.success) {
        setNotifications(res.data || []);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleToggleRead = async (notif) => {
    setActionLoadingId(notif._id);
    const nextReadState = !notif.isRead;
    try {
      const res = await adminApi.toggleNotificationReadStatus(notif._id, nextReadState);
      if (res && res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: nextReadState } : n))
        );
        if (selectedNotif && selectedNotif._id === notif._id) {
          setSelectedNotif((prev) => ({ ...prev, isRead: nextReadState }));
        }
      }
    } catch (err) {
      console.error("Error updating notification status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

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
            <Bell className="w-6 h-6 text-blue-655" />
            <span>System Notifications</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor and manage automated alerts and transactional notifications.
          </p>
        </div>
        <button
          onClick={fetchNotifications}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-350 rounded-xl hover:bg-slate-50 text-slate-705 font-bold text-sm transition-all shadow-xs disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
          ) : (
            <Bell className="w-4 h-4 text-slate-500" />
          )}
          <span>Sync Feed</span>
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-650 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 border border-red-100 rounded-2xl bg-red-50/50 flex items-center gap-3 text-red-700 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm font-semibold">Failed to fetch notification feed. Please try again.</div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm font-medium border border-dashed border-slate-200 rounded-2xl bg-white/40">
          No system notifications available.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Notifications List Pane */}
          <div className="lg:col-span-2 space-y-3">
            {notifications.map((notif) => {
              const dateStr = notif.createdAt ? new Date(notif.createdAt).toLocaleString("en-US") : "N/A";
              return (
                <div
                  key={notif._id}
                  onClick={() => {
                    setSelectedNotif(notif);
                    setDetailOpen(true);
                  }}
                  className={`group p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all duration-200 cursor-pointer flex items-start gap-4 relative overflow-hidden ${
                    !notif.isRead ? "ring-1 ring-blue-500/20 bg-blue-50/10 border-blue-50/30" : ""
                  }`}
                >
                  {/* Read/Unread status side accent */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    !notif.isRead ? "bg-blue-655" : "bg-transparent"
                  }`} />
                  
                  {/* Status Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                    !notif.isRead 
                      ? "bg-blue-50 text-blue-650 border-blue-100/50" 
                      : "bg-slate-50 text-slate-400 border-slate-100"
                  }`}>
                    {notif.isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-extrabold text-sm text-slate-800 truncate">{notif.title}</span>
                      <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">{dateStr}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details Preview Pane (Sleek Sidebar Panel) */}
          <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 space-y-5 shadow-xs sticky top-20 min-h-[300px] flex flex-col">
            {detailOpen && selectedNotif ? (
              <div className="flex-1 flex flex-col space-y-5">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-start gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    Notification Details
                  </h3>
                  <button
                    onClick={() => {
                      setDetailOpen(false);
                      setSelectedNotif(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold font-mono"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Title</span>
                    <div className="text-sm font-bold text-slate-800">{selectedNotif.title}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Received Timestamp</span>
                    <div className="text-xs font-semibold text-slate-500 font-mono">
                      {selectedNotif.createdAt ? new Date(selectedNotif.createdAt).toLocaleString("en-US") : "N/A"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notification Type</span>
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-655 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                      {selectedNotif.type}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message Content</span>
                    <div className="text-xs text-slate-650 leading-relaxed bg-slate-50 p-4 border border-slate-150/45 rounded-2xl whitespace-pre-wrap">
                      {selectedNotif.message}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-405 font-bold uppercase tracking-wider">
                    Status: {selectedNotif.isRead ? "Read" : "Unread"}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => handleToggleRead(selectedNotif)}
                    disabled={actionLoadingId !== null}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.98] ${
                      selectedNotif.isRead 
                        ? "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                        : "bg-blue-600 text-white border-blue-500 hover:bg-blue-700 hover:border-blue-600 shadow-blue-500/10"
                    }`}
                  >
                    {actionLoadingId === selectedNotif._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : selectedNotif.isRead ? (
                      <Mail className="w-3.5 h-3.5" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>{selectedNotif.isRead ? "Mark Unread" : "Mark as Read"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Bell className="w-8 h-8 text-slate-300 mb-3 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Details View Panel</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-[20ch]">
                  Select a notification from the list to view its complete content and toggle status.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
