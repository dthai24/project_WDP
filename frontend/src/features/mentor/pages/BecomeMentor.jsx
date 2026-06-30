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
      className="min-h-screen text-slate-900 font-sans antialiased flex flex-col relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--color-brand-50) 0%, #ffffff 50%, var(--color-accent-50) 100%)"
      }}
    >
      {/* Decorative background spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-200/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Mini Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <Link 
          to="/" 
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/60 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-slate-500 group-hover:text-brand-600" />
          Back to Homepage
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Become a Mentor:</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-700 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-full">
            Step 1 / 1
          </span>
        </div>
      </header>

      {/* Main Layout - Split Columns */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Cột trái: Giới thiệu & Quyền lợi */}
        <div className="lg:col-span-5 space-y-8 lg:pr-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 border border-brand-200/60 text-brand-700 font-bold text-xs tracking-wide uppercase shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
              Join the Network
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Share Knowledge.<br />
              <span className="gradient-text font-black">
                Shape the Future.
              </span>
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md">
              English Master connects top language professionals with eager learners. Build your curriculum, guide motivated students, and contribute to their personal growth.
            </p>
          </div>

          <div className="space-y-5 border-t border-slate-200/60 pt-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-50 border border-brand-100/40 text-brand-600 flex items-center justify-center">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Powerful Learning Path Builder</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Design comprehensive courses using videos, reading materials, and interactive quizzes with ease.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-50 border border-accent-100/40 text-accent-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Build Your Personal Brand</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Showcase your credentials, earn verified badges, and establish your reputation inside our growing community.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Khung Form nhập liệu */}
        <div className="lg:col-span-7 w-full">
          {!isSuccess ? (
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-6 sm:p-10 rounded-[2rem] shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Mentor Application</h2>
                <p className="text-xs text-slate-500 mt-1">Please provide the required details below. Our administrative team will review your application within 48 business hours.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Họ tên & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Full Name <span className="text-brand-600">*</span></label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. John Doe"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Email Address <span className="text-brand-600">*</span></label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Portfolio URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Portfolio / LinkedIn URL</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Link2 className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      name="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Giới thiệu ngắn */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Biography & Experience <span className="text-brand-600">*</span></label>
                  <div className="relative">
                    <span className="absolute top-3.5 left-3.5 text-slate-400 pointer-events-none">
                      <FileText className="w-4 h-4" />
                    </span>
                    <textarea
                      name="bio"
                      rows="3"
                      required
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about your teaching experience, linguistic background, or professional accomplishments..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-medium text-slate-900 placeholder-slate-400 resize-none min-h-[100px]"
                    ></textarea>
                  </div>
                </div>

                {/* Upload Chứng Chỉ */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Professional Certificate / Credentials <span className="text-brand-600">*</span></label>
                  
                  <div className={`group mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-dashed rounded-2xl transition-all duration-200 ${previewUrl ? 'border-brand-200 bg-brand-50/20' : 'border-slate-200 hover:border-brand-500 bg-white/40'}`}>
                    <div className="space-y-3 text-center w-full">
                      
                      {previewUrl ? (
                        <div className="relative inline-block group/preview">
                          <img src={previewUrl} alt="Certificate preview" className="max-h-40 mx-auto rounded-xl shadow-md border border-slate-200/20 object-cover" />
                          <div className="absolute inset-0 bg-slate-950/40 rounded-xl opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              type="button" 
                              onClick={handleRemoveFile}
                              className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-red-50 transition-colors flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove File
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200/80 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform text-brand-600">
                            <Upload className="w-4 h-4" />
                          </div>
                          <div className="flex text-xs text-slate-500 justify-center font-medium">
                            <label className="relative cursor-pointer text-brand-600 hover:text-brand-700 font-bold focus-within:outline-none">
                              <span>Upload a file</span>
                              <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} required={!certificate} />
                            </label>
                            <p className="pl-1 text-slate-400">or drag and drop</p>
                          </div>
                          <p className="text-[10px] text-slate-400">Supported formats: PNG, JPG, or JPEG (Max 10MB)</p>
                        </div>
                      )}

                      {certificate && !previewUrl && (
                        <div className="p-2 bg-brand-50 rounded-lg inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Attached: {certificate.name}
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
                    className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending application...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Giao diện khi gửi hồ sơ thành công */
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-10 text-center max-w-xl mx-auto space-y-6 rounded-[2rem] shadow-card">
              <div className="w-16 h-16 bg-gradient-to-tr from-brand-600 to-accent-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application Received!</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Thank you for submitting your application to become a Mentor on English Master. Our review board will assess your credentials and contact you directly via <span className="font-semibold text-slate-800">{formData.email}</span> shortly.
                </p>
              </div>
              <div className="pt-2">
                <button 
                  onClick={() => navigate("/")}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  Back to Homepage
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}