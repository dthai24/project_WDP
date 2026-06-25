import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

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

      const response = await fetch("http://127.0.0.1:5000/api/mentor/become-mentor", {
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
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 font-sans selection:bg-blue-100 flex flex-col antialiased">
      
      {/* Mini Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <Link to="/" className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"></path>
          </svg>
          Back to home
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400">Step 1 of 1:</span>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Application</span>
        </div>
      </header>

      {/* Main Layout - Split Columns */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Cột trái: Giới thiệu & Quyền lợi */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28 lg:pr-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-600 font-medium text-xs tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Join our global network
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Share your expertise. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                Shape the future.
              </span>
            </h1>
            <p className="text-base text-slate-500 leading-relaxed max-w-md">
              English Master connects industry professionals with eager learners. Build structured roadmaps, mentor students, and project your authority.
            </p>
          </div>

          <div className="space-y-4 border-t border-slate-200/60 pt-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">🛠️</div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Powerful Roadmap Builder</h4>
                <p className="text-xs text-slate-500 mt-0.5">Design rich curricula with videos, text documents, and quiz checkpoints effortlessly.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">📈</div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Build Your Personal Brand</h4>
                <p className="text-xs text-slate-500 mt-0.5">Showcase your portfolio, earn premium badging, and stand out in the tech community.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Khung Form nhập liệu */}
        <div className="lg:col-span-7 w-full">
          {!isSuccess ? (
            <div className="bg-white rounded-[2rem] border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 sm:p-10 transition-all">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Mentor Application</h2>
                <p className="text-xs text-slate-400 mt-1">Please fill out all the mandatory fields carefully. Admin will review within 48 hours.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none text-sm">👤</span>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. John Doe"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/30 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none text-sm">✉️</span>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="johndoe@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/30 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Portfolio URL */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Portfolio / LinkedIn URL</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none text-sm">🔗</span>
                    <input
                      type="url"
                      name="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleInputChange}
                      placeholder="https://github.com/johndoe"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/30 text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Short Bio & Experience <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute top-3 left-3.5 text-slate-400 pointer-events-none text-sm">📝</span>
                    <textarea
                      name="bio"
                      rows="4"
                      required
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about your tech stack, teaching history, or career highlights..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/30 text-sm font-medium resize-none min-h-[100px]"
                    ></textarea>
                  </div>
                </div>

                {/* Upload Chứng Chỉ (Drag and Drop UI) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Certificates & Qualifications <span className="text-red-500">*</span></label>
                  
                  <div className={`group mt-1 flex justify-center px-6 pt-7 pb-7 border-2 border-dashed rounded-2xl transition-all ${previewUrl ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 hover:border-blue-500 bg-slate-50/40'}`}>
                    <div className="space-y-3 text-center w-full">
                      
                      {previewUrl ? (
                        <div className="relative inline-block group/preview">
                          <img src={previewUrl} alt="Certificate preview" className="max-h-44 mx-auto rounded-xl shadow-md border border-slate-200/60 object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 rounded-xl opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              type="button" 
                              onClick={handleRemoveFile}
                              className="bg-white/95 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-red-50 transition-colors"
                            >
                              Remove File
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform text-xl">
                            📁
                          </div>
                          <div className="flex text-sm text-slate-600 justify-center font-medium">
                            <label className="relative cursor-pointer text-blue-600 hover:text-blue-700 font-semibold focus-within:outline-none">
                              <span>Upload a file</span>
                              <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} required={!certificate} />
                            </label>
                            <p className="pl-1 text-slate-400">or drag and drop here</p>
                          </div>
                          <p className="text-[11px] text-slate-400">Supports PNG, JPG or JPEG (Max capacity: 10MB)</p>
                        </div>
                      )}

                      {certificate && !previewUrl && (
                        <div className="p-2 bg-emerald-50 rounded-lg inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
                          <span>✓ Attached: {certificate.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nút Submit Đăng Ký */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying application profile...
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
            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 text-center max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-lg shadow-emerald-500/20">
                ✓
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application Received!</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Thank you for applying to English Master. Our screening panel will inspect your resume portfolio and credential media. We'll reach out via <span className="font-semibold text-slate-800">{formData.email || 'your email'}</span> shortly.
                </p>
              </div>
              <div className="pt-2">
                <button 
                  onClick={() => navigate("/")}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}