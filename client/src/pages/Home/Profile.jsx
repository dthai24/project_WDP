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
} from 'lucide-react'
export function Profile({ onLogout, setCurrentPage, currentUser }) {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || 'Alex Chen',
    school: 'Đại học Stanford',
    major: 'Khoa học Máy tính',
    year: 'Năm 3',
    email: currentUser?.email || 'alex.chen@stanford.edu',
    memberSince: '10/2023',
    preferredStudyTime: 'Buổi sáng (6h - 12h)',
    dailyGoal: '3 Giờ',
    quizDifficulty: 'Thích ứng',
    notifications: 'Nhắc nhở thông minh',
  })
  const [editData, setEditData] = useState(profileData)

  const handleSave = () => {
    setProfileData(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(profileData)
    setIsEditing(false)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Profile Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row gap-6 items-center md:items-start relative">
        <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-md">
          AC
        </div>
        <div className="flex-1 text-center md:text-left">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Tên
                </label>
                <input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900"
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Trường
                  </label>
                  <input
                    value={editData.school}
                    onChange={(e) => setEditData({ ...editData, school: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Ngành/Khoa
                  </label>
                  <input
                    value={editData.major}
                    onChange={(e) => setEditData({ ...editData, major: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Khóa
                  </label>
                  <input
                    value={editData.year}
                    onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Email
                  </label>
                  <input
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Thành viên từ
                  </label>
                  <input
                    value={editData.memberSince}
                    disabled
                    className="w-full rounded-2xl border border-slate-200 bg-slate-100/80 text-slate-500 px-4 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {profileData.name}
              </h1>
              <div className="space-y-1 text-slate-500 text-sm mb-3">
                <p>{profileData.school}</p>
                <p>{profileData.major}</p>
                <p>{profileData.year}</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  ✉️ {profileData.email}
                </span>
                <span className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  👤 Thành viên từ {profileData.memberSince}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="absolute top-6 right-6 flex items-center gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Edit2 size={14} /> Chỉnh sửa
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-light transition-colors"
              >
                <Check size={14} /> Lưu
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: My Courses */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <BookOpen size={18} className="text-primary" /> Khóa học của tôi
            </h2>
            <button className="text-sm font-medium text-primary flex items-center gap-1 hover:text-primary-light transition-colors">
              <Plus size={16} /> Thêm khóa học
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl border border-slate-100 hover:border-primary/30 transition-colors flex justify-between items-center group cursor-pointer">
              <div>
                <h3 className="font-bold text-slate-900 mb-1">
                  Hệ cơ sở dữ liệu
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={12} /> Còn 12 ngày
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg group-hover:bg-blue-100 transition-colors">
                Đang học
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 hover:border-orange-200 transition-colors flex justify-between items-center group cursor-pointer">
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Thuật toán</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={12} /> Tháng sau
                </p>
              </div>
              <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-lg group-hover:bg-orange-100 transition-colors">
                Sắp tới
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 hover:border-green-200 transition-colors flex justify-between items-center group cursor-pointer">
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Hệ điều hành</h3>
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  🎯 Điểm A
                </p>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-lg group-hover:bg-green-100 transition-colors">
                Hoàn thành
              </span>
            </div>
          </div>
        </div>

        {/* Right: Learning Preferences */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Edit2 size={18} className="text-primary" /> Tùy chọn học tập
            </h2>
            <button className="text-sm font-medium text-primary hover:text-primary-light transition-colors">
              Sửa
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <span className="text-sm text-slate-600">
                Thời gian học ưa thích
              </span>
              <span className="text-sm font-bold text-slate-900">
                {profileData.preferredStudyTime}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <span className="text-sm text-slate-600">
                Mục tiêu học hàng ngày
              </span>
              <span className="text-sm font-bold text-slate-900">
                {profileData.dailyGoal}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <span className="text-sm text-slate-600">Độ khó Quiz</span>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                {profileData.quizDifficulty}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Thông báo</span>
              <span className="text-sm font-bold text-slate-900">
                {profileData.notifications}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Settings List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-100">
          <button className="w-full p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left group">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-sm">
                Cài đặt thông báo
              </h4>
              <p className="text-xs text-slate-500">
                Quản lý email và thông báo đẩy
              </p>
            </div>
            <ChevronRight
              size={18}
              className="text-slate-400 group-hover:text-slate-600"
            />
          </button>

          <button className="w-full p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left group">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <Shield size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-sm">
                Quyền riêng tư & Bảo mật
              </h4>
              <p className="text-xs text-slate-500">
                Mật khẩu, xác thực 2 bước và chia sẻ dữ liệu
              </p>
            </div>
            <ChevronRight
              size={18}
              className="text-slate-400 group-hover:text-slate-600"
            />
          </button>

          <button className="w-full p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left group">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Download size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-sm">Xuất dữ liệu</h4>
              <p className="text-xs text-slate-500">
                Tải lịch sử học tập và ghi chú
              </p>
            </div>
            <ChevronRight
              size={18}
              className="text-slate-400 group-hover:text-slate-600"
            />
          </button>

          <button
            onClick={onLogout}
            className="w-full p-5 flex items-center gap-4 hover:bg-red-50 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-100 transition-colors">
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
