import React, { useState } from "react";
import { Sparkles, ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react";

const testAccounts = [
  {
    email: "admin@gmail.com",
    password: "123456",
    name: "Admin User",
    role: "Admin",
  },
  {
    email: "student@gmail.com",
    password: "123456",
    name: "Student User",
    role: "Learner",
  },
  {
    email: "mentor@gmail.com",
    password: "123456",
    name: "Mentor User",
    role: "Mentor",
  },
];

export default function LoginPage({ onLogin, onBackHome }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Định dạng email không hợp lệ.";
    }

    if (!formData.password) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Mật khẩu phải chứa ít nhất 6 ký tự.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Cố gắng kết nối và xác thực qua API Backend
      const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        const userSession = {
          email: data.email,
          name: data.name,
          role: data.role,
          loggedInAt: new Date().toISOString(),
        };

        onLogin(userSession);
        setIsSubmitting(false);
        return;
      } else {
        throw new Error(data.message || "Tài khoản không chính xác.");
      }

    } catch (error) {
      console.warn("Kết nối API thất bại, chuyển hướng kiểm tra tài khoản test tĩnh:", error.message);
      
      // 2. Chế độ dự phòng (Fallback): Kiểm tra trong danh sách tài khoản test cục bộ
      const account = testAccounts.find(
        (item) =>
          item.email.toLowerCase() === formData.email.trim().toLowerCase() &&
          item.password === formData.password
      );

      if (!account) {
        setErrors({
          form: "Email hoặc mật khẩu không chính xác. Vui lòng thử lại.",
        });
        setIsSubmitting(false);
        return;
      }

      const userSession = {
        email: account.email,
        name: account.name,
        role: account.role,
        loggedInAt: new Date().toISOString(),
      };

      onLogin(userSession);
      setIsSubmitting(false);
    }
  };

  return (
    <main 
      className="min-h-screen text-text-primary font-sans antialiased flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #fff5f5 0%, #fff0f3 30%, #fdf2f8 60%, #faf5ff 100%)"
      }}
    >
      {/* Decorative background spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Back to home button (absolute top-left) */}
      <div className="absolute top-6 left-6 z-10">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/40 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại Trang chủ
        </button>
      </div>

      {/* Centered Login Card */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-rose-100/40 p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-rose-500/5 space-y-8 relative z-10 transition-all duration-300 hover:shadow-rose-500/10">
        
        {/* Header section (Centered logo & titles) */}
        <div className="flex flex-col items-center text-center space-y-1.5">
          <img 
            src="/images/logo.png" 
            alt="English Master Logo" 
            className="w-20 h-20 object-contain hover:scale-105 transition-transform duration-300 mb-2" 
          />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary pt-2.5">
            Chào mừng quay trở lại
          </p>
          <h2 className="text-2xl font-black tracking-tight text-text-primary">
            Đăng nhập tài khoản
          </h2>
          <p className="text-xs leading-relaxed text-text-secondary max-w-xs">
            Đăng nhập để tiếp tục bài học và đồng bộ tiến trình học tập của bạn.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.form && (
            <div className="rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-xs font-bold text-red-600">
              {errors.form}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-bold text-text-primary"
            >
              Địa chỉ Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="name@domain.com"
                className={`w-full rounded-2xl border bg-white pl-10 pr-4 py-3 text-xs outline-none transition-all placeholder:text-text-muted/60 focus:ring-4 ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-border focus:border-primary focus:ring-primary/10"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-bold text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-bold text-text-primary"
              >
                Mật khẩu
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={isPasswordVisible ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="Nhập mật khẩu của bạn"
                className={`w-full rounded-2xl border bg-white pl-10 pr-10 py-3 text-xs outline-none transition-all placeholder:text-text-muted/60 focus:ring-4 ${
                  errors.password
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-border focus:border-primary focus:ring-primary/10"
                }`}
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary transition-colors"
              >
                {isPasswordVisible ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-bold text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs font-bold text-primary hover:text-primary-light transition-colors"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-3.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold text-xs"
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

      </div>
    </main>
  );
}