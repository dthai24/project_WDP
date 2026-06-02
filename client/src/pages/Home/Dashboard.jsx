import React, { useEffect, useState, Children } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Target,
  Flame,
  Brain,
  FileText,
  Moon,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  CreditCard,
  TrendingUp,
  Edit2,
  X,
  Mail,
  Bell,
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { TopBar } from './Topbar'
import { Profile } from './Profile'
export function Dashboard() {
  const [isOpen, setIsOpen] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 5,
    minutes: 31,
    seconds: 57,
  })
  const [examName, setExamName] = useState('Thi cuối kỳ CSDL')
  const [isEditingExam, setIsEditingExam] = useState(false)
  const [editExamName, setEditExamName] = useState(examName)
  const [editExamDate, setEditExamDate] = useState('')
  const [showNotifPopup, setShowNotifPopup] = useState(true)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0)
          return {
            ...prev,
            seconds: prev.seconds - 1,
          }
        if (prev.minutes > 0)
          return {
            ...prev,
            minutes: prev.minutes - 1,
            seconds: 59,
          }
        if (prev.hours > 0)
          return {
            ...prev,
            hours: prev.hours - 1,
            minutes: 59,
            seconds: 59,
          }
        if (prev.days > 0)
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  const tasks = [
    {
      id: 1,
      title: 'Ôn tập B-Tree Indexing',
      duration: '45 phút',
      type: 'Đọc',
      status: 'done',
    },
    {
      id: 2,
      title: 'Luyện Quiz SQL Joins',
      duration: '30 phút',
      type: 'Thực hành',
      status: 'doing',
    },
    {
      id: 3,
      title: 'Đọc Chương 7: Chuẩn hóa',
      duration: '60 phút',
      type: 'Đọc',
      status: 'todo',
    },
  ]
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    show: {
      opacity: 1,
      y: 0,
    },
  }
  return (
    <div className="min-h-screen flex bg-slate-950 text-white">
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        <TopBar />
        {currentPage === 'profile' ? (
          <Profile
            onLogout={() => navigate('/login')}
            setCurrentPage={setCurrentPage}
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 pb-20"
          >
      {/* Email Notification Popup */}
      <AnimatePresence>
        {showNotifPopup && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNotifPopup(false)}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                y: 20,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 max-w-md w-full relative"
            >
              <button
                onClick={() => setShowNotifPopup(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Bật thông báo qua Email
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Bạn có muốn nhận thông báo nhắc nhở lịch học, kết quả quiz và
                  cập nhật mới qua email{' '}
                  <span className="font-semibold text-primary">
                    alex@stanford.edu
                  </span>{' '}
                  không?
                </p>
              </div>

              <div className="flex gap-3 mb-5">
                <button
                  onClick={() => setShowNotifPopup(false)}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-light text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                >
                  <Mail size={18} /> Có, gửi cho tôi
                </button>
                <button
                  onClick={() => setShowNotifPopup(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Không, cảm ơn
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer justify-center group">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                />
                <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                  Không hiển thị lại
                </span>
              </label>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-primary to-primary-light rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-center shadow-lg shadow-primary/20 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 mb-6 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Chào mừng trở lại, Alex! 🎯
          </h1>
          <p className="text-white/80">
            Bạn đã sẵn sàng 73% cho kỳ thi Hệ cơ sở dữ liệu.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
            <Target size={16} /> Trọng tâm hôm nay: Chuẩn hóa (3NF)
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="relative z-10 bg-sidebar/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center group">
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-xs font-semibold text-white/70 tracking-wider uppercase">
              {examName}
            </p>
            <button
              onClick={() => setIsEditingExam(true)}
              className="text-white/50 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
            >
              <Edit2 size={12} />
            </button>
          </div>
          <div className="flex gap-3">
            {[
              {
                label: 'DAYS',
                value: timeLeft.days,
              },
              {
                label: 'HOURS',
                value: timeLeft.hours,
              },
              {
                label: 'MINS',
                value: timeLeft.minutes,
              },
              {
                label: 'SECS',
                value: timeLeft.seconds,
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-white text-primary font-bold text-xl md:text-2xl w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shadow-inner">
                  {item.value.toString().padStart(2, '0')}
                </div>
                <span className="text-[10px] mt-1 text-white/80">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Row */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-card rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="73, 100"
                    className="animate-[dash_1.5s_ease-out]"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-primary">
                  73%
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Điểm sẵn sàng
                </p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp size={12} /> +5% tuần này
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                <Flame size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Chuỗi học tập
                </p>
                <p className="text-xl font-bold text-text-primary">14 Ngày</p>
                <p className="text-xs text-slate-400 mt-1">
                  Kỷ lục cá nhân: 21 ngày
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success flex-shrink-0">
                <Brain size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Chủ đề đã nắm
                </p>
                <p className="text-xl font-bold text-text-primary">
                  24{' '}
                  <span className="text-sm text-slate-400 font-normal">
                    / 35
                  </span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tasks */}
          <motion.div
            variants={itemVariants}
            className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-text-primary">
                Nhiệm vụ học hôm nay
              </h2>
              <button
                onClick={() => setCurrentPage('planner')}
                className="text-sm text-primary-light font-medium hover:underline flex items-center gap-1"
              >
                Xem kế hoạch <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${task.status === 'done' ? 'bg-slate-50 border-slate-100 opacity-60' : task.status === 'doing' ? 'bg-primary/5 border-primary/20' : 'bg-white border-slate-100 hover:border-primary/30'}`}
                >
                  {task.status === 'done' ? (
                    <CheckCircle2
                      className="text-success flex-shrink-0"
                      size={24}
                    />
                  ) : task.status === 'doing' ? (
                    <Clock className="text-primary flex-shrink-0" size={24} />
                  ) : (
                    <Circle
                      className="text-slate-300 flex-shrink-0"
                      size={24}
                    />
                  )}
                  <div className="flex-1">
                    <h4
                      className={`font-semibold ${task.status === 'done' ? 'line-through text-slate-500' : 'text-text-primary'}`}
                    >
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {task.duration}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.type === 'Đọc' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}
                      >
                        {task.type}
                      </span>
                    </div>
                  </div>
                  {task.status !== 'done' && (
                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                      {task.status === 'doing' ? 'Tiếp tục' : 'Bắt đầu'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Streak Calendar (Simplified) */}
          <motion.div
            variants={itemVariants}
            className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm"
          >
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Tính nhất quán học tập
            </h2>
            <div className="flex gap-1 overflow-x-auto pb-2 hide-scrollbar">
              {Array.from({
                length: 52,
              }).map((_, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-1">
                  {Array.from({
                    length: 7,
                  }).map((_, rowIndex) => {
                    // Randomize for mock visual
                    const intensity = Math.random()
                    let colorClass = 'bg-slate-100'
                    if (intensity > 0.8) colorClass = 'bg-success'
                    else if (intensity > 0.5) colorClass = 'bg-success-light'
                    else if (intensity > 0.3) colorClass = 'bg-success/30'
                    return (
                      <div
                        key={rowIndex}
                        className={`w-3 h-3 rounded-sm ${colorClass}`}
                        title="Học 2 giờ"
                      />
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="flex justify-end items-center gap-2 mt-2 text-xs text-slate-500">
              <span>Ít</span>
              <div className="w-3 h-3 rounded-sm bg-slate-100"></div>
              <div className="w-3 h-3 rounded-sm bg-success/30"></div>
              <div className="w-3 h-3 rounded-sm bg-success-light"></div>
              <div className="w-3 h-3 rounded-sm bg-success"></div>
              <span>Nhiều</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Quick Actions & Payment */}
        <div className="space-y-6">
          <motion.div
            variants={itemVariants}
            className="bg-card rounded-2xl p-6 border border-slate-100 shadow-sm"
          >
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Thao tác nhanh
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setCurrentPage('documents')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary-light hover:bg-primary/5 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary text-sm">
                    Tải tài liệu
                  </h4>
                  <p className="text-xs text-slate-500">PDF, DOCX, PPTX</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentPage('quiz')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-success-light hover:bg-success/5 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Brain size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary text-sm">
                    Bắt đầu Quiz
                  </h4>
                  <p className="text-xs text-slate-500">Kiểm tra kiến thức</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentPage('night')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-800 hover:bg-slate-900 hover:text-white transition-colors text-left group relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <Moon size={20} />
                </div>
                <div className="relative z-10">
                  <h4 className="font-semibold text-sm group-hover:text-white">
                    Chế độ đêm trước thi
                  </h4>
                  <p className="text-xs text-slate-500 group-hover:text-slate-300">
                    Ôn tập cấp tốc
                  </p>
                </div>
                <span className="absolute top-3 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded bg-danger text-white">
                  GẤP
                </span>
              </button>
            </div>
          </motion.div>

          {/* Payment Gateway Mock */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-slate-900 to-sidebar rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <CreditCard size={20} /> Nâng cấp Pro
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Mở khóa tất cả tính năng AI
                </p>
              </div>
              <span className="bg-accent text-sidebar text-xs font-bold px-2 py-1 rounded">
                PRO
              </span>
            </div>
            <div className="space-y-2 mb-6 relative z-10">
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <CheckCircle2 size={14} className="text-success-light" /> Không
                giới hạn Quiz AI
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <CheckCircle2 size={14} className="text-success-light" />{' '}
                Podcast bài giảng dài
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <CheckCircle2 size={14} className="text-success-light" /> Mentor
                1-1 ưu tiên
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('pricing')}
              className="w-full bg-white text-sidebar font-bold py-2.5 rounded-xl hover:bg-slate-100 transition-colors relative z-10"
            >
              Nâng cấp ngay - 99k/tháng
            </button>
          </motion.div>
        </div>
      </div>

      {/* Edit Exam Modal */}
      <AnimatePresence>
        {isEditingExam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900">
                  Chỉnh sửa kỳ thi
                </h3>
                <button
                  onClick={() => setIsEditingExam(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tên kỳ thi
                  </label>
                  <input
                    type="text"
                    value={editExamName}
                    onChange={(e) => setEditExamName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary text-sm"
                    placeholder="VD: Thi cuối kỳ CSDL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngày thi dự kiến
                  </label>
                  <input
                    type="date"
                    value={editExamDate}
                    onChange={(e) => setEditExamDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditingExam(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setExamName(editExamName || 'Kỳ thi mới')
                    if (editExamDate) {
                      // Simple mock calculation for demo
                      const target = new Date(editExamDate).getTime()
                      const now = new Date().getTime()
                      const diff = Math.max(0, target - now)
                      setTimeLeft({
                        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                        hours: Math.floor(
                          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
                        ),
                        minutes: Math.floor(
                          (diff % (1000 * 60 * 60)) / (1000 * 60),
                        ),
                        seconds: Math.floor((diff % (1000 * 60)) / 1000),
                      })
                    }
                    setIsEditingExam(false)
                  }}
                  className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-light transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </motion.div>
      )}
      </main>
    </div>
  )
}
