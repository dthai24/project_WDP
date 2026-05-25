import React, { useState } from "react";

export default function BecomeMentor() {
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

  // Xử lý thay đổi dữ liệu text
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý khi chọn file ảnh chứng chỉ
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCertificate(file);
      // Tạo đường dẫn tạm thời để xem trước ảnh
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Xử lý gửi Form lên Admin
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mô phỏng gọi API gửi lên Server (Backend NodeJS của bạn)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Sau này bạn sẽ dùng mạng axios hoặc fetch để gửi formData và certificate lên backend
      console.log("Data submitted to Admin:", { ...formData, certificate });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Nút quay lại trang chủ (Tùy chọn) */}
        <button 
          onClick={() => window.history.back()} 
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          ← Back to Home
        </button>

        {/* Khung Form chính */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          
          {/* Header của Form */}
          <div className="bg-slate-900 text-white px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 pointer-events-none"></div>
            <span className="text-3xl mb-2 inline-block">🚀</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Become a Mentor</h2>
            <p className="mt-2 text-slate-400 max-w-md mx-auto text-sm">
              Share your knowledge, build structured roadmaps, and help thousands of students grow.
            </p>
          </div>

          {/* Nội dung Form */}
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Họ tên */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="johndoe@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Portfolio URL */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Portfolio / LinkedIn URL</label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleInputChange}
                  placeholder="https://github.com/or-your-website"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
                />
              </div>

              {/* Bio / Giới thiệu */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Short Bio / Experience *</label>
                <textarea
                  name="bio"
                  rows="4"
                  required
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about your expertise, teaching experience, or what technologies you specialize in..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 resize-none"
                ></textarea>
              </div>

              {/* Upload ảnh chứng chỉ */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Certificates & Qualifications *</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-2xl hover:border-blue-500 transition-colors bg-slate-50/30">
                  <div className="space-y-2 text-center">
                    
                    {previewUrl ? (
                      <div className="mb-4 relative inline-block">
                        <img src={previewUrl} alt="Certificate preview" className="max-h-40 rounded-lg shadow-sm border border-slate-200" />
                        <button 
                          type="button" 
                          onClick={() => { setCertificate(null); setPreviewUrl(null); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center shadow hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}

                    <div className="flex text-sm text-slate-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-semibold text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>{certificate ? "Change file" : "Upload a file"}</span>
                        <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} required={!certificate} />
                      </label>
                      {!certificate && <p className="pl-1">or drag and drop</p>}
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, JPEG up to 10MB</p>
                    {certificate && <p className="text-sm font-medium text-emerald-600">✓ {certificate.name}</p>}
                  </div>
                </div>
              </div>

              {/* Nút Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Application...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            </form>
          ) : (
            
            /* Giao diện hiển thị khi gửi thành công */
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Application Submitted!</h3>
              <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
                Thank you for applying to be a mentor on LearnPath. Our administration team will review your portfolio and certificates. You will receive an email notification once approved.
              </p>
              <div className="pt-4">
                <button 
                  onClick={() => window.history.back()}
                  className="bg-slate-900 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}