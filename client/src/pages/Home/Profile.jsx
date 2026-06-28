import React, { useState } from 'react'
import {
  Bell,
  Shield,
  Download,
  LogOut,
  Edit2,
  Plus,
  Clock,
  BookOpen,
  Target,
  ChevronRight,
  Sparkles,
  Check,
  Award,
  Flame,
  Zap,
  Video,
  FileText,
  HelpCircle,
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Star,
} from 'lucide-react'
import { mockUsers, enrolledCourses } from '../../services/data'

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

export function Profile({ onLogout, setCurrentPage, currentUser }) {
  const userData = mockUsers.learner;
  const savedProfile = getSavedProfile();

  const defaultProfile = {
    name: currentUser?.name || userData.name,
    school: userData.school,
    major: userData.major,
    year: userData.year,
    email: currentUser?.email || userData.email,
    memberSince: userData.memberSince,
    preferredStudyTime: userData.preferredStudyTime,
    dailyGoal: userData.dailyGoal,
    quizDifficulty: userData.quizDifficulty,
    notifications: userData.notifications ? 'Nhắc nhở thông minh' : 'Tắt',
    phone: userData.phone,
    bio: userData.bio,
  };

  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState(savedProfile || defaultProfile)
  const [editData, setEditData] = useState(profileData)

  const handleSave = () => {
    setProfileData(editData)
    saveProfile(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(profileData)
    setIsEditing(false)
  }

  const totalLessons = enrolledCourses.reduce((sum, c) => sum + c.completedLessons, 0);
  const totalQuizzes = enrolledCourses.reduce((sum, c) => sum + c.completedQuizzes, 0);
  const totalQuizCount = enrolledCourses.reduce((sum, c) => sum + c.quizzes, 0);

  const stats = [
    { label: 'Khóa học', value: String(enrolledCourses.length), icon: BookOpen, color: 'text-blue-500 bg-blue-50' },
    { label: 'Bài học', value: String(totalLessons), icon: Flame, color: 'text-amber-500 bg-amber-50' },
    { label: 'XP', value: '2,450', icon: Zap, color: 'text-purple-500 bg-purple-50' },
    { label: 'Quiz', value: `${totalQuizzes}/${totalQuizCount}`, icon: HelpCircle, color: 'text-green-500 bg-green-50' },
  ]

  const recentActivity = [
    { action: 'Hoàn thành bài học', detail: 'Module 3: Vocabulary', time: '2 giờ trước', icon: Video },
    { action: 'Làm quiz', detail: 'Đạt 8/10 câu đúng', time: '1 ngày trước', icon: HelpCircle },
    { action: 'Đọc tài liệu', detail: 'Grammar Guide - Unit 5', time: '2 ngày trước', icon: FileText },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Profile Card - Redesigned */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary via-primary-dark to-purple-600 px-6 pt-8 pb-20 relative">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Profile content */}
        <div className="px-6 pb-6 -mt-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
            <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center text-3xl font-black text-primary border-4 border-white">
              {profileData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-3 bg-slate-50 rounded-2xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Tên</label>
                      <input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Email</label>
                      <input value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Trường</label>
                      <input value={editData.school} onChange={(e) => setEditData({ ...editData, school: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Ngành</label>
                      <input value={editData.major} onChange={(e) => setEditData({ ...editData, major: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Khóa</label>
                      <input value={editData.year} onChange={(e) => setEditData({ ...editData, year: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Số điện thoại</label>
                      <input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-primary/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Giới thiệu</label>
                    <textarea value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-primary/50 resize-none" rows={2} />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-black text-slate-900 mb-1">{profileData.name}</h1>
                  <div className="space-y-0.5 text-sm text-slate-500 mb-3">
                    <p>{profileData.school} - {profileData.major}</p>
                    <p>{profileData.year}</p>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 text-[10px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Mail className="w-3 h-3" /> {profileData.email}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Calendar className="w-3 h-3" /> Thành viên từ {profileData.memberSince}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Phone className="w-3 h-3" /> {profileData.phone}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20">
                  <Edit2 size={14} /> Chỉnh sửa
                </button>
              ) : (
                <>
                  <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all">
                    <Check size={14} /> Lưu
                  </button>
                  <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all">
                    Hủy
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className={`rounded-2xl p-4 flex items-center gap-3 ${stat.color} border border-transparent`}>
              <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-black">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: My Courses */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <BookOpen size={18} className="text-primary" /> Khóa học của tôi
            </h2>
            <button className="text-[10px] font-bold text-primary flex items-center gap-1 hover:text-primary-light transition-colors">
              <Plus size={14} /> Thêm
            </button>
          </div>

          <div className="space-y-3">
            {enrolledCourses.map((course, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-100 hover:border-primary/30 transition-all flex justify-between items-center group cursor-pointer">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{course.title}</h3>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock size={11} /> {course.progress}% hoàn thành
                  </p>
                </div>
                <span className={`px-3 py-1 text-[10px] font-bold rounded-lg group-hover:scale-105 transition-transform ${
                  course.progress >= 100 ? 'bg-green-50 text-green-600' : course.progress > 0 ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  {course.progress >= 100 ? 'Hoàn thành' : course.progress > 0 ? 'Đang học' : 'Sắp tới'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Learning Preferences */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Settings size={18} className="text-primary" /> Tùy chọn học tập
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Thời gian học ưa thích', value: profileData.preferredStudyTime },
              { label: 'Mục tiêu học hàng ngày', value: profileData.dailyGoal },
              { label: 'Độ khó Quiz', value: profileData.quizDifficulty, badge: true },
              { label: 'Thông báo', value: profileData.notifications },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-b-0">
                <span className="text-xs text-slate-600">{item.label}</span>
                {item.badge ? (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">{item.value}</span>
                ) : (
                  <span className="text-xs font-bold text-slate-900">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
          <TrendingUp size={18} className="text-primary" /> Hoạt động gần đây
        </h2>
        <div className="space-y-3">
          {recentActivity.map((activity, i) => {
            const Icon = activity.icon
            return (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all">
                <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">{activity.action}</p>
                  <p className="text-[10px] text-slate-500">{activity.detail}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">{activity.time}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Settings List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {[
            { icon: Bell, color: 'bg-blue-50 text-blue-500', title: 'Cài đặt thông báo', desc: 'Quản lý email và thông báo đẩy' },
            { icon: Shield, color: 'bg-green-50 text-green-500', title: 'Quyền riêng tư & Bảo mật', desc: 'Mật khẩu, xác thực 2 bước và chia sẻ dữ liệu' },
            { icon: Download, color: 'bg-purple-50 text-purple-500', title: 'Xuất dữ liệu', desc: 'Tải lịch sử học tập và ghi chú' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <button key={i} className="w-full p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${item.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-600" />
              </button>
            )
          })}

          <button onClick={onLogout} className="w-full p-5 flex items-center gap-4 hover:bg-red-50 transition-colors text-left group">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <LogOut size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-600 text-sm">Đăng xuất</h4>
              <p className="text-xs text-red-400">Đăng xuất khỏi tài khoản</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
