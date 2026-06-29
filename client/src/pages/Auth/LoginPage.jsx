import React, { useState } from "react";
import { Sparkles, ArrowLeft, Eye, EyeOff, Mail, Lock, User } from "lucide-react";

const testAccounts = [
  {
    email: "admin@wdp.edu.vn",
    password: "Admin@123",
    name: "Admin",
    role: "Admin",
  },
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
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
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

    if (isRegisterMode && !formData.name.trim()) {
      nextErrors.name = "Vui lòng nhập họ tên.";
    }

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

    const apiEndpoint = isRegisterMode ? "/api/auth/register" : "/api/auth/login";
    const requestBody = isRegisterMode
      ? { name: formData.name.trim(), email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };

    try {
      // 1. Cố gắng kết nối và xác thực qua API Backend
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}${apiEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const res = await response.json();

      if (response.ok && res && res.success) {
        const userSession = {
          email: res.user.email,
          name: res.user.name || (res.user.roleName === "Admin" ? "Admin" : ""),
          role: res.user.role || res.user.roleName,
          roleId: res.user.roleId,
          roleName: res.user.roleName,
          roles: res.user.roles || (res.user.roleName === "Admin" ? [{ roleId: 1, roleName: "Admin" }] : []),
          loggedInAt: new Date().toISOString(),
        };

        // Save JWT token and user info under both keys
        localStorage.setItem("learnpath_token", res.token);
        localStorage.setItem("learnpath_user", JSON.stringify(userSession));
        localStorage.setItem("lexiora_user", JSON.stringify(userSession));

        // Force redirect for admin users
        if (res.user.email === "admin@wdp.edu.vn" || res.user.roleName === "Admin" || res.user.roleId === 1) {
          console.log("==> [FRONTEND AUTH] Admin detected, forcing window.location.href to /admin");
          window.location.href = "/admin";
          return;
        }
        
        onLogin(userSession);
        setIsSubmitting(false);
        return;
      } else {
        throw new Error(res.message || (isRegisterMode ? "Đăng ký thất bại." : "Tài khoản không chính xác."));
      }

    } catch (error) {
      console.warn("Kết nối API thất bại, chuyển hướng kiểm tra tài khoản test tĩnh:", error.message);
      
      if (isRegisterMode) {
        setErrors({
          form: error.message || "Kết nối máy chủ thất bại. Không thể đăng ký lúc này."
        });
        setIsSubmitting(false);
        return;
      }

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

      const isAdmin = account.email === "admin@gmail.com" || account.email === "admin@wdp.edu.vn" || account.role === "Admin";
      const isMentor = account.email === "mentor@gmail.com" || account.role === "Mentor";

      const userSession = {
        email: account.email,
        name: account.name,
        role: account.role,
        roleId: isAdmin ? 1 : (isMentor ? 2 : 3),
        roleName: isAdmin ? "Admin" : (isMentor ? "Mentor" : "Student"),
        roles: isAdmin
          ? [{ roleId: 1, roleName: "Admin" }]
          : (isMentor
            ? [{ roleId: 2, roleName: "Mentor" }]
            : [{ roleId: 3, roleName: "Student" }]),
        loggedInAt: new Date().toISOString(),
      };

      // Persist to localStorage for fallback sessions
      localStorage.setItem("learnpath_token", "mock_fallback_jwt_token_2026");
      localStorage.setItem("learnpath_user", JSON.stringify(userSession));
      localStorage.setItem("lexiora_user", JSON.stringify(userSession));

      if (isAdmin) {
        console.log("==> [FRONTEND AUTH] Admin detected (fallback), forcing window.location.href to /admin");
        window.location.href = "/admin";
        return;
      }

      onLogin(userSession);
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (platform) => {
    setIsSubmitting(true);
    // Simulating OAuth popup window
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      "",
      `Kết nối ${platform}`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,status=no`
    );

    if (popup) {
      popup.document.write(`
        <html>
          <head>
            <title>Đăng nhập bằng ${platform}</title>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background-color: #f8fafc;
                text-align: center;
              }
              .loader {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #e11d48;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              h2 { color: #0f172a; margin: 0 0 10px 0; }
              p { color: #64748b; font-size: 14px; margin: 0; }
            </style>
          </head>
          <body>
            <div class="loader"></div>
            <h2>Đang kết nối tài khoản ${platform}...</h2>
            <p>Vui lòng không đóng cửa sổ này.</p>
            <script>
              setTimeout(() => {
                window.close();
              }, 1500);
            </script>
          </body>
        </html>
      `);
    }

    setTimeout(() => {
      // Create a simulated social user session
      const socialUser = {
        email: `${platform.toLowerCase()}.user@wdp.edu.vn`,
        name: `${platform} Student`,
        role: "Learner",
        roles: [{ roleId: 3, roleName: "Learner" }],
        loggedInAt: new Date().toISOString(),
      };

      // Mock backend sync by writing to localStorage
      localStorage.setItem("learnpath_token", "mock_social_jwt_token_2026");
      localStorage.setItem("learnpath_user", JSON.stringify(socialUser));
      localStorage.setItem("lexiora_user", JSON.stringify(socialUser));

      onLogin(socialUser);
      setIsSubmitting(false);
    }, 1800);
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

      {/* Centered Login/Register Card */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-rose-100/40 p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-rose-500/5 space-y-8 relative z-10 transition-all duration-300 hover:shadow-rose-500/10">
        
        {/* Header section (Centered logo & titles) */}
        <div className="flex flex-col items-center text-center space-y-1.5">
          <img 
            src="/images/logo.png" 
            alt="English Master Logo" 
            className="w-20 h-20 object-contain hover:scale-105 transition-transform duration-300 mb-2" 
          />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary pt-2.5">
            {isRegisterMode ? "Gia nhập English Master" : "Chào mừng quay trở lại"}
          </p>
          <h2 className="text-2xl font-black tracking-tight text-text-primary">
            {isRegisterMode ? "Đăng ký tài khoản" : "Đăng nhập tài khoản"}
          </h2>
          <p className="text-xs leading-relaxed text-text-secondary max-w-xs">
            {isRegisterMode 
              ? "Tạo tài khoản học viên miễn phí và bứt phá tiếng Anh ngay hôm nay."
              : "Đăng nhập để tiếp tục bài học và đồng bộ tiến triển học tập của bạn."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.form && (
            <div className="rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-xs font-bold text-red-600 animate-pulse">
              {errors.form}
            </div>
          )}

          {isRegisterMode && (
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-xs font-bold text-text-primary"
              >
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className={`w-full rounded-2xl border bg-white pl-10 pr-4 py-3 text-xs outline-none transition-all placeholder:text-text-muted/60 focus:ring-4 ${
                    errors.name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "border-border focus:border-primary focus:ring-primary/10"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-bold text-red-500">
                  {errors.name}
                </p>
              )}
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
                autoComplete="new-password"
                placeholder="Nhập mật khẩu của bạn (ít nhất 6 ký tự)"
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

          {!isRegisterMode && (
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs font-bold text-primary hover:text-primary-light transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-3.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold text-xs"
          >
            {isSubmitting 
              ? (isRegisterMode ? "Đang tạo tài khoản..." : "Đang đăng nhập...") 
              : (isRegisterMode ? "Đăng ký" : "Đăng nhập")}
          </button>
        </form>

        {/* Divider for Social Logins */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border/60"></div>
          <span className="flex-shrink mx-4 text-[10px] text-text-muted font-bold uppercase tracking-wider">Hoặc tiếp tục với</span>
          <div className="flex-grow border-t border-border/60"></div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleSocialLogin("Google")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-border/60 bg-white hover:bg-surface-muted hover:border-primary/20 active:scale-[0.97] transition-all font-bold text-xs"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.114 3-.99 4.05v3.36h1.61c.94-.87 1.68-1.95 2.16-3.19.49-1.25.75-2.58.75-3.92.01-1.39-.24-2.77-.73-4.08.49.77.49 1.34 1.65.65.65.65.65.65z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.36-2.61c-1.25.84-2.85 1.35-4.6 1.35-3.55 0-6.56-2.4-7.63-5.63H.73v2.7A11.987 11.987 0 0012 24z" />
              <path fill="#FBBC05" d="M4.37 14.2c-.27-.81-.42-1.68-.42-2.58 0-.9.15-1.77.42-2.58V6.34H.73A11.976 11.976 0 000 12c0 2.07.53 4.02 1.46 5.73l2.91-3.53z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.34 0 3.28 2.67 1.46 6.34l3.64 2.7c1.07-3.23 4.08-5.63 7.63-5.63z" />
            </svg>
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin("Facebook")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-border/60 bg-white hover:bg-surface-muted hover:border-primary/20 active:scale-[0.97] transition-all font-bold text-xs"
          >
            <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </button>
        </div>

        <hr style={{ border: 0, borderTop: "1px solid #f1f5f9" }} />

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(prev => !prev);
              setErrors({});
            }}
            className="text-xs font-bold text-primary hover:underline transition-colors"
          >
            {isRegisterMode 
              ? "Đã có tài khoản? Đăng nhập ngay" 
              : "Chưa có tài khoản? Đăng ký học viên miễn phí"}
          </button>
        </div>

      </div>
    </main>
  );
}