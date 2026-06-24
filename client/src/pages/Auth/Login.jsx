import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, Lock, User } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  
  const handleLogin = (e) => {
    e.preventDefault()
    if (mode === 'login') {
      navigate('/dashboard')
    } else {
      setMode('login')
    }
  }
  return (
    <div className="min-h-screen w-full bg-bg flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-light/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <img
            src="/images/logo.png"
            alt="English Master Logo"
            className="h-20 mx-auto mb-4 object-contain"
          />
          <p className="text-slate-500 font-medium">
            Trợ lý học tập thông minh AI
          </p>
        </div>

        <motion.div
          layout
          className="bg-card p-8 rounded-3xl shadow-xl border border-slate-100"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -20,
              }}
              transition={{
                duration: 0.2,
              }}
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">
                {mode === 'login'
                  ? 'Chào mừng trở lại'
                  : mode === 'register'
                    ? 'Tạo tài khoản mới'
                    : 'Khôi phục mật khẩu'}
              </h2>

              <form onSubmit={handleLogin} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-bg border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Alex Chen"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="email"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-bg border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="alex@stanford.edu"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Mật khẩu
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-xs text-primary-light hover:underline font-medium"
                        >
                          Quên mật khẩu?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-bg border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all mt-6"
                >
                  {mode === 'login'
                    ? 'Đăng nhập'
                    : mode === 'register'
                      ? 'Đăng ký'
                      : 'Gửi link khôi phục'}
                  <ArrowRight size={18} />
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-500">
                {mode === 'login' ? (
                  <p>
                    Chưa có tài khoản?{' '}
                    <button
                      onClick={() => setMode('register')}
                      className="text-primary-light font-semibold hover:underline"
                    >
                      Đăng ký ngay
                    </button>
                  </p>
                ) : (
                  <p>
                    Đã có tài khoản?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="text-primary-light font-semibold hover:underline"
                    >
                      Đăng nhập
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
