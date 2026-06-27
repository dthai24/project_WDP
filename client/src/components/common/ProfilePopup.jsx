import React, { useState, useRef, useEffect } from "react";
import { X, User, Settings, LogOut, Bell, Shield, Moon, Sun, ChevronRight, Edit2, Check, BookOpen, Award, Clock, Sparkles } from "lucide-react";
import { mockUsers, enrolledCourses } from "../../services/data";

const PROFILE_KEY = "wdp_user_profile";

function getSavedProfile() {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function saveProfile(data) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
}

export default function ProfilePopup({ currentUser, onLogout, onClose, onNavigate }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const popupRef = useRef(null);

  const userData = mockUsers.learner;
  const savedProfile = getSavedProfile();

  const defaultProfile = {
    name: currentUser?.name || userData.name,
    email: currentUser?.email || userData.email,
    school: userData.school,
    major: userData.major,
    year: userData.year,
    phone: userData.phone,
    bio: userData.bio,
  };

  const [profileData, setProfileData] = useState(savedProfile || defaultProfile);
  const [editData, setEditData] = useState(profileData);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSave = () => {
    setProfileData(editData);
    saveProfile(editData);
    setIsEditing(false);
  };


  const totalLessons = enrolledCourses.reduce((sum, c) => sum + c.completedLessons, 0);
  const stats = [
    { label: "Khoa hoc", value: String(enrolledCourses.length), icon: BookOpen, color: "text-blue-500 bg-blue-50" },
    { label: "Bai hoc", value: String(totalLessons), icon: Clock, color: "text-amber-500 bg-amber-50" },
    { label: "XP", value: "2,450", icon: Award, color: "text-purple-500 bg-purple-50" },
  ];


  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        ref={popupRef}
        className="bg-white rounded-3xl shadow-2xl border border-border/40 w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary via-primary-dark to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black border-2 border-white/40">
              {profileData.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">{profileData.name}</h2>
              <p className="text-sm text-white/70">{profileData.email}</p>
              <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                {currentUser?.role === "Admin" ? "Quan tri vien" : currentUser?.role === "Mentor" ? "Giang vien" : "Hoc vien"}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/30 px-6 pt-4 gap-1">
          {[
            { id: "profile", label: "Ho so", icon: User },
            { id: "settings", label: "Cai dat", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsEditing(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary/5 text-primary border-b-2 border-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-6 space-y-5">
          {activeTab === "profile" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className={`rounded-2xl p-3 text-center space-y-1 ${stat.color}`}>
                      <Icon className="w-4 h-4 mx-auto" />
                      <p className="text-lg font-black">{stat.value}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Profile Info */}
              <div className="bg-surface-muted rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-text-primary">Thong tin ca nhan</h3>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                      <Edit2 className="w-3 h-3" /> Chinh sua
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="text-[10px] font-bold text-success hover:underline flex items-center gap-1">
                        <Check className="w-3 h-3" /> Luu
                      </button>
                      <button onClick={() => setIsEditing(false)} className="text-[10px] font-bold text-text-muted hover:underline">
                        Huy
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2.5">
                    {[
                      { key: "name", label: "Ho ten", type: "text" },
                      { key: "email", label: "Email", type: "email" },
                      { key: "phone", label: "So dien thoai", type: "text" },
                      { key: "school", label: "Truong", type: "text" },
                      { key: "major", label: "Nganh", type: "text" },
                      { key: "year", label: "Khoa", type: "text" },
                      { key: "bio", label: "Gioi thieu", type: "textarea" },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wider">{field.label}</label>
                        {field.type === "textarea" ? (
                          <textarea
                            value={editData[field.key]}
                            onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                            className="w-full bg-white rounded-xl border border-border/60 px-3 py-2 text-xs outline-none focus:border-primary/50 resize-none"
                            rows={2}
                          />
                        ) : (
                          <input
                            type={field.type}
                            value={editData[field.key]}
                            onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                            className="w-full bg-white rounded-xl border border-border/60 px-3 py-2 text-xs outline-none focus:border-primary/50"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    {[
                      { label: "Truong", value: profileData.school },
                      { label: "Nganh", value: profileData.major },
                      { label: "Khoa", value: profileData.year },
                      { label: "So dien thoai", value: profileData.phone },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-b-0">
                        <span className="text-text-muted">{item.label}</span>
                        <span className="font-semibold text-text-primary">{item.value}</span>
                      </div>
                    ))}
                    <div className="pt-1">
                      <p className="text-text-muted text-[10px]">Gioi thieu</p>
                      <p className="font-medium text-text-primary text-xs mt-0.5">{profileData.bio}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-1.5">
                <button
                  onClick={() => { onClose(); onNavigate("my-learning"); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-muted transition-all text-left group"
                >
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-text-primary flex-1">Khoa hoc cua toi</span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                </button>
                <button
                  onClick={() => { onClose(); onNavigate("course-list"); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-muted transition-all text-left group"
                >
                  <Award className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-semibold text-text-primary flex-1">Kham pha khoa hoc</span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                </button>
              </div>
            </>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-text-primary">Tuy chinh he thong</h3>
              
              {/* Settings items */}
              <div className="bg-surface-muted rounded-2xl divide-y divide-border/20">
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Thong bao</p>
                      <p className="text-[10px] text-text-muted">Nhan thong bao hoc tap</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                      notifications ? "bg-primary" : "bg-slate-200"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                      notifications ? "left-5" : "left-0.5"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Moon className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Che do toi</p>
                      <p className="text-[10px] text-text-muted">Giao dien toi cho mat</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                      darkMode ? "bg-primary" : "bg-slate-200"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                      darkMode ? "left-5" : "left-0.5"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Bao mat</p>
                      <p className="text-[10px] text-text-muted">Quan ly mat khau & xac thuc</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-border/30">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs font-bold flex-1 text-left">Dang xuat</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
