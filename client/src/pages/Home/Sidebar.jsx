import React from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Network,
  Brain,
  Target,
  Moon,
  TrendingUp,
  Users,
  Headphones,
  PlayCircle,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Gamepad2,
} from 'lucide-react'
const navItems = [
  {
    id: 'dashboard',
    label: 'Trang chủ',
    icon: LayoutDashboard,
  },
  {
    id: 'planner',
    label: 'Kế hoạch học',
    icon: Calendar,
  },
  {
    id: 'documents',
    label: 'Tài liệu',
    icon: FileText,
  },
  {
    id: 'knowledge',
    label: 'Bản đồ kiến thức',
    icon: Network,
  },
  {
    id: 'quiz',
    label: 'Kiểm tra',
    icon: Brain,
  },
  {
    id: 'readiness',
    label: 'Độ sẵn sàng thi',
    icon: Target,
  },
  {
    id: 'gamification',
    label: 'Gamification',
    icon: Gamepad2,
  },
  {
    id: 'night',
    label: 'Chế độ đêm',
    icon: Moon,
    badge: 'GẤP',
  },
  {
    id: 'progress',
    label: 'Tiến độ',
    icon: TrendingUp,
  },
  {
    id: 'community',
    label: 'Cộng đồng',
    icon: Users,
  },
  {
    id: 'podcast',
    label: 'Podcast Bài giảng',
    icon: Headphones,
  },
  {
    id: 'video',
    label: 'Video Tóm tắt',
    icon: PlayCircle,
  },
  {
    id: 'mentor',
    label: 'Hỗ trợ Mentor',
    icon: UserCheck,
  },
]

export function Sidebar({
  isOpen,
  setIsOpen,
  currentPage,
  setCurrentPage,
  currentUser,
}) {
  return (
    <motion.aside
      animate={{
        width: isOpen ? 256 : 80,
      }}
      className="h-full bg-white/70 backdrop-blur-md text-slate-800 flex flex-col relative z-20 flex-shrink-0 border-r border-rose-100/40 transition-all duration-300"
    >
      <div className="p-4 flex items-center justify-between h-16 border-b border-slate-100">
        <div
          className={`flex items-center gap-3 overflow-hidden ${!isOpen && 'justify-center w-full'}`}
        >
          <img
            src="/images/logo.png"
            alt="English Master Logo"
            className="w-10 h-10 object-contain flex-shrink-0"
          />
          {isOpen && (
            <motion.span
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="font-bold text-lg tracking-wide whitespace-nowrap text-primary"
            >
              English Master
            </motion.span>
          )}
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-6 bg-white text-slate-600 rounded-full p-1 border border-slate-200 hover:bg-slate-50 z-30 shadow-sm"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl relative group transition-all ${isActive ? 'text-primary font-bold' : 'text-slate-600 hover:text-primary hover:bg-rose-50/50'}`}
              title={!isOpen ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/5 rounded-xl border-l-4 border-primary"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
              <Icon
                size={20}
                className={`relative z-10 flex-shrink-0 ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-primary transition-colors'}`}
              />

              {isOpen && (
                <span className="relative z-10 text-sm font-medium whitespace-nowrap flex-1 text-left">
                  {item.label}
                </span>
              )}

              {isOpen && item.badge && (
                <span className="relative z-10 text-[10px] font-bold px-1.5 py-0.5 rounded bg-danger text-white">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="p-4 border-t border-slate-100 space-y-3">
        <button
          onClick={() => setCurrentPage('profile')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-rose-50/50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 overflow-hidden">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || 'Alex'}`}
              alt="Avatar"
              className="w-full h-full"
            />
          </div>
          {isOpen && (
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {currentUser?.name || 'Alex Chen'}
              </p>
              <p className="text-xs text-slate-500 truncate">Hồ sơ</p>
            </div>
          )}
        </button>

        <button
          className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl py-2.5 hover:shadow-lg hover:shadow-primary/20 transition-all ${!isOpen && 'px-0'}`}
        >
          <Sparkles size={18} />
          {isOpen && <span className="text-sm font-medium">Trợ lý AI</span>}
        </button>
      </div>
    </motion.aside>
  )
}
