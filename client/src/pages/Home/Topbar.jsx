import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Bell, Settings, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
export function TopBar({ currentUser }) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const notifications = [
    {
      id: 1,
      title: 'Đã đến giờ ôn tập',
      desc: 'Chương 3: Thì Hiện tại hoàn thành',
      time: '10 phút trước',
      unread: true,
    },
    {
      id: 2,
      title: 'Kết quả Quiz mới',
      desc: 'Bạn đạt 85% bài kiểm tra Thì Tiếng Anh',
      time: '2 giờ trước',
      unread: false,
    },
    {
      id: 3,
      title: 'Tài liệu đã xử lý xong',
      desc: 'Bài giảng Ngữ pháp IELTS.pdf đã sẵn sàng',
      time: 'Hôm qua',
      unread: false,
    },
  ]
  return (
    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 relative z-30 flex-shrink-0">
      <div className="flex-1 max-w-xl relative">
        <div
          className={`flex items-center bg-slate-50/80 rounded-full px-4 py-2 border transition-all ${isSearchFocused ? 'border-primary/50 ring-4 ring-primary/5' : 'border-slate-200/60'}`}
        >
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Tìm chủ đề, tài liệu hoặc câu hỏi..."
            className="bg-transparent border-none outline-none flex-1 ml-2 text-sm text-text-primary placeholder:text-slate-400"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        {currentUser?.role === 'Learner' && (
          <Link
            to="/become-mentor"
            className="text-xs font-bold text-slate-600 hover:text-primary transition-all bg-rose-50/60 hover:bg-rose-100/40 border border-rose-100/60 px-3.5 py-1.5 rounded-full shadow-sm hover:shadow active:scale-[0.98] mr-1 flex items-center gap-1"
          >
            🎓 Become a Mentor
          </Link>
        )}

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:bg-rose-50/50 rounded-full transition-colors relative"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-card"></span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95,
                }}
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-semibold text-text-primary">Thông báo</h3>
                  <button className="text-xs text-primary-light hover:underline flex items-center gap-1">
                    <Check size={14} /> Đánh dấu đã đọc
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${notif.unread ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4
                          className={`text-sm ${notif.unread ? 'font-semibold text-primary' : 'font-medium text-text-primary'}`}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{notif.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-slate-100">
                  <button className="text-sm text-primary-light font-medium hover:underline">
                    Xem tất cả
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-text-primary">{currentUser?.name || 'Alex Chen'}</p>
            <p className="text-xs text-slate-500">{currentUser?.role === 'Learner' ? 'Học viên' : currentUser?.role === 'Mentor' ? 'Mentor' : 'Quản trị viên'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
            {(currentUser?.name || 'Alex Chen').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}
