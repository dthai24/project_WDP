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
}) {
  return (
    <motion.aside
      animate={{
        width: isOpen ? 256 : 80,
      }}
      className="h-full bg-sidebar text-white flex flex-col relative z-20 flex-shrink-0 transition-all duration-300"
    >
      <div className="p-4 flex items-center justify-between h-16 border-b border-slate-800">
        <div
          className={`flex items-center gap-3 overflow-hidden ${!isOpen && 'justify-center w-full'}`}
        >
          <img
            src="https://cdn.magicpatterns.com/uploads/6HH8798EgvRqQxpsuayZEj/pasted-image.jpg"
            alt="LearnMate Logo"
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-primary-light"
          />
          {isOpen && (
            <motion.span
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="font-bold text-lg tracking-wide whitespace-nowrap"
            >
              LearnPath
            </motion.span>
          )}
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-6 bg-slate-800 text-white rounded-full p-1 border border-slate-700 hover:bg-slate-700 z-30"
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl relative group transition-colors ${isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              title={!isOpen ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/20 rounded-xl border-l-4 border-primary-light"
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
                className={`relative z-10 flex-shrink-0 ${isActive ? 'text-primary-light' : ''}`}
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

      <div className="p-4 border-t border-slate-800 space-y-3">
        <button
          onClick={() => setCurrentPage('profile')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 overflow-hidden">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
              alt="Avatar"
              className="w-full h-full"
            />
          </div>
          {isOpen && (
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                Alex Chen
              </p>
              <p className="text-xs text-slate-400 truncate">Hồ sơ</p>
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
