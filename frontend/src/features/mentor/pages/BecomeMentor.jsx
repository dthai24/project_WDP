import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Link2, FileText, Upload, Trash2, CheckCircle, Sparkles, Map, Award } from "lucide-react";

export default function BecomeMentor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    portfolioUrl: "",
    bio: "",
  });
  const [certificate, setCertificate] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Thu hồi URL tạm thời để tránh rò rỉ bộ nhớ khi đóng/đổi ảnh
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Xử lý thay đổi dữ liệu text
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý khi chọn file ảnh chứng chỉ
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl); 
      setCertificate(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Hủy file đã chọn
  const handleRemoveFile = () => {
    setCertificate(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Xử lý gửi Form liên kết với Backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!certificate) {
      alert("Vui lòng tải lên ảnh chứng chỉ chuyên môn.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("email", formData.email);
      data.append("portfolioUrl", formData.portfolioUrl || "");
      data.append("bio", formData.bio);
      data.append("certificate", certificate);

      const response = await fetch("http://localhost:5000/api/mentor/become-mentor", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        alert(result.message || "Đã xảy ra lỗi trong quá trình gửi hồ sơ.");
      }
    } catch (error) {
      console.error("Lỗi khi kết nối đến máy chủ:", error);
      alert("Không thể kết nối đến máy chủ. Vui lòng đảm bảo server backend đang chạy.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen text-text-primary font-sans antialiased flex flex-col relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #fff5f5 0%, #fff0f3 30%, #fdf2f8 60%, #faf5ff 100%)"
      }}
    >
      {/* Decorative background spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Mini Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <Link 
          to="/" 
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/40 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Quay lại Trang chủ
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-text-muted">Đăng ký Mentor:</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-rose-50 border border-rose-100/50 px-2.5 py-1 rounded-full">
            Bước 1 / 1
          </span>
        </div>
      </header>

      {/* Main Layout - Split Columns */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Cột trái: Giới thiệu & Quyền lợi */}
        <div className="lg:col-span-5 space-y-8 lg:pr-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100/80 text-primary font-medium text-xs tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Gia nhập mạng lưới Mentor toàn cầu
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-text-primary tracking-tight leading-[1.15]">
              Chia sẻ kiến thức.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-primary to-pink-600">
                Kiến tạo tương lai.
              </span>
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed max-w-md">
              English Master kết nối những chuyên gia hàng đầu với các học viên nhiệt huyết. Hãy cùng chúng tôi xây dựng lộ trình học tập hiệu quả, hướng dẫn học viên phát triển toàn diện.
            </p>
          </div>

          <div className="space-y-5 border-t border-rose-100/60 pt-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-rose-50 border border-rose-100/40 text-primary flex items-center justify-center">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-text-primary text-sm">Công cụ tạo Lộ trình mạnh mẽ</h4>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">Thiết kế giáo trình phong phú với video, bài đọc và hệ thống kiểm tra đánh giá một cách dễ dàng.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-pink-50 border border-pink-100/40 text-pink-500 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-text-primary text-sm">Xây dựng Thương hiệu cá nhân</h4>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">Quảng bá năng lực của bạn, nhận huy hiệu chứng nhận cao cấp và khẳng định uy tín cá nhân.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Khung Form nhập liệu */}
        <div className="lg:col-span-7 w-full">
          {!isSuccess ? (
            <div className="bg-white/70 backdrop-blur-md border border-rose-100/40 p-6 sm:p-10 rounded-[2.5rem] shadow-xl shadow-rose-500/5 transition-all duration-300 hover:shadow-rose-500/10">
              <div className="mb-6">
                <h2 className="text-xl font-black text-text-primary tracking-tight">Hồ sơ ứng tuyển Mentor</h2>
                <p className="text-xs text-text-secondary mt-1">Vui lòng điền đầy đủ thông tin bắt buộc dưới đây. Ban quản trị sẽ phê duyệt trong vòng 48 giờ làm việc.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Họ tên & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-primary">Họ và tên <span className="text-primary">*</span></label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted pointer-events-none">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Nguyễn Văn A"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary placeholder-text-muted"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-primary">Địa chỉ Email <span className="text-primary">*</span></label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted pointer-events-none">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary placeholder-text-muted"
                      />
                    </div>
                  </div>
                </div>

                {/* Portfolio URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-primary">Link Portfolio / LinkedIn</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted pointer-events-none">
                      <Link2 className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      name="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleInputChange}
                      placeholder="https://github.com/username hoặc link linkedin"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary placeholder-text-muted"
                    />
                  </div>
                </div>

                {/* Giới thiệu ngắn */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-primary">Giới thiệu bản thân & Kinh nghiệm <span className="text-primary">*</span></label>
                  <div className="relative">
                    <span className="absolute top-3.5 left-3.5 text-text-muted pointer-events-none">
                      <FileText className="w-4 h-4" />
                    </span>
                    <textarea
                      name="bio"
                      rows="3"
                      required
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Chia sẻ về thế mạnh, lịch sử giảng dạy hoặc các thành tựu nổi bật trong sự nghiệp của bạn..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-rose-100/40 bg-white/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-text-primary placeholder-text-muted resize-none min-h-[100px]"
                    ></textarea>
                  </div>
                </div>

                {/* Upload Chứng Chỉ */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-primary">Chứng chỉ & Bằng cấp chuyên môn <span className="text-primary">*</span></label>
                  
                  <div className={`group mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-dashed rounded-2xl transition-all duration-200 ${previewUrl ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-100 hover:border-primary bg-white/40'}`}>
                    <div className="space-y-3 text-center w-full">
                      
                      {previewUrl ? (
                        <div className="relative inline-block group/preview">
                          <img src={previewUrl} alt="Certificate preview" className="max-h-40 mx-auto rounded-xl shadow-md border border-rose-100/20 object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 rounded-xl opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              type="button" 
                              onClick={handleRemoveFile}
                              className="bg-white text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa tệp
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-rose-100/50 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform text-primary">
                            <Upload className="w-4 h-4" />
                          </div>
                          <div className="flex text-xs text-text-secondary justify-center font-medium">
                            <label className="relative cursor-pointer text-primary hover:text-primary-dark font-bold focus-within:outline-none">
                              <span>Tải tệp lên</span>
                              <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} required={!certificate} />
                            </label>
                            <p className="pl-1 text-text-muted">hoặc kéo thả vào đây</p>
                          </div>
                          <p className="text-[10px] text-text-muted">Định dạng hỗ trợ: PNG, JPG hoặc JPEG (Tối đa 10MB)</p>
                        </div>
                      )}

                      {certificate && !previewUrl && (
                        <div className="p-2 bg-emerald-50 rounded-lg inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Đã đính kèm: {certificate.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nút Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang gửi hồ sơ xét tuyển...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Gửi hồ sơ ứng tuyển
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Giao diện khi gửi hồ sơ thành công */
            <div className="bg-white/70 backdrop-blur-md border border-rose-100/40 p-10 text-center max-w-xl mx-auto space-y-6 rounded-[2.5rem] shadow-xl shadow-rose-500/5">
              <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-pink-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-text-primary tracking-tight">Đã nhận hồ sơ đăng ký!</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Cảm ơn bạn đã nộp đơn đăng ký làm Mentor trên hệ thống English Master. Ban quản trị sẽ đánh giá năng lực và phản hồi kết quả trực tiếp qua địa chỉ email <span className="font-semibold text-text-primary">{formData.email}</span> của bạn sớm nhất.
                </p>
              </div>
              <div className="pt-2">
                <button 
                  onClick={() => navigate("/")}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-[0.98]"
                >
                  Quay lại Trang chủ
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}