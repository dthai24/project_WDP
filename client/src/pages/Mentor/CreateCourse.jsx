import React, { useState } from "react";

export default function CreateCourse({ currentUser, onBackDashboard }) {
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    objectives: "",
    level: "",
    duration: "",
    steps: [{ title: "", type: "Vocabulary", duration: "" }], // Mặc định có 1 step tiếng Anh ban đầu
    completionConditions: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Danh mục môn học chuyên biệt cho nền tảng Tiếng Anh
  const categories = [
    "General English",
    "IELTS Preparation",
    "TOEIC Master",
    "English for Business",
    "English for IT & Tech",
    "Academic English",
    "English for Beginners"
  ];

  // Giả lập Exception 403: Kiểm tra quyền Mentor
  if (!currentUser || currentUser.role !== "Mentor") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-4 border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto">🚫</div>
          <h2 className="text-xl font-black text-slate-900">403 - Forbidden</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Tài khoản của bạn là <b>{currentUser?.role || "Learner"}</b>. Bạn cần có quyền <b>Mentor</b> đã được phê duyệt để truy cập tính năng này.
          </p>
          <button onClick={onBackDashboard} className="mt-2 text-sm font-bold text-blue-600 hover:underline">
            ← Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Xử lý thay đổi dữ liệu các trường cơ bản
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Xử lý thay đổi dữ liệu trong danh sách Steps (Mảng động)
  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index][field] = value;
    setFormData((prev) => ({ ...prev, steps: updatedSteps }));
    if (errors.steps) {
      setErrors((prev) => ({ ...prev, steps: "" }));
    }
  };

  // Thêm một step mới (Alternative Scenario 2a/2b)
  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, { title: "", type: "Vocabulary", duration: "" }],
    }));
  };

  // Xóa một step
  const removeStep = (index) => {
    if (formData.steps.length === 1) return; // Giữ lại ít nhất 1 step theo BR-01
    const updatedSteps = formData.steps.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, steps: updatedSteps }));
  };

  // Hàm Validate nghiêm ngặt (VAL-01 / BR-01)
  const validateForm = () => {
    const nextErrors = {};

    if (!formData.title.trim()) nextErrors.title = "Course Title is required.";
    if (!formData.category) nextErrors.category = "Please select a Subject/Category.";
    if (!formData.objectives.trim()) nextErrors.objectives = "Learning Objectives are required.";
    if (!formData.level) nextErrors.level = "Please select a difficulty level.";
    if (!formData.duration.trim()) nextErrors.duration = "Estimated Duration is required.";
    if (!formData.completionConditions.trim()) nextErrors.completionConditions = "Completion Conditions are required.";

    // Validate danh sách steps
    const hasEmptyStep = formData.steps.some((step) => !step.title.trim() || !step.duration.trim());
    if (hasEmptyStep) {
      nextErrors.steps = "Please fill in all step titles and durations.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Xử lý Submit Form (Main Success Scenario - Step 3)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // VAL-01: Hiển thị thông báo lỗi tổng
      setErrors((prev) => ({ ...prev, form: "Please fill in all mandatory fields before submitting." }));
      return;
    }

    setIsSubmitting(true);

    // Giả lập độ trễ API lưu vào Database (1s)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Reset form sau khi tạo thành công
      setFormData({
        title: "",
        category: "",
        objectives: "",
        level: "",
        duration: "",
        steps: [{ title: "", type: "Vocabulary", duration: "" }],
        completionConditions: "",
      });
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Thanh điều hướng trên cùng */}
        <div className="flex justify-between items-center">
          <button 
            onClick={onBackDashboard}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <span>←</span> Back 
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-200/50 px-3 py-1.5 rounded-lg">
            Course Creation Gate
          </span>
        </div>

        {/* Thông báo thành công */}
        {submitSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div>
              <p className="text-lg font-bold">🎉 Course Created Successfully!</p>
              <p className="text-sm text-emerald-600/90 mt-0.5">Lộ trình học tập của bạn đã được đồng bộ vào cơ sở dữ liệu và công khai tới học viên.</p>
            </div>
            <button 
              onClick={() => setSubmitSuccess(false)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
            >
              Tạo thêm lộ trình mới
            </button>
          </div>
        )}

        {/* Form chính */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          
          {/* Header Form */}
          <div className="bg-slate-950 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(37,99,235,0.25),transparent_50%)]" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-2">English Master</p>
            <h1 className="text-3xl font-black tracking-tight">Create a New Roadmap</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Xây dựng cấu trúc bài giảng thông minh, tối ưu hóa trải nghiệm cá nhân hóa và tính năng Gamification cho học viên.
            </p>
          </div>

          {/* Body Form */}
          <div className="p-6 sm:p-10 space-y-8">
            
            {/* VAL-01 Error Block */}
            {errors.form && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm font-semibold text-red-600 flex items-center gap-2">
                <span>⚠️</span> {errors.form}
              </div>
            )}

            {/* PHẦN 1: THÔNG TIN CỐT LÕI */}
            <section className="space-y-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                01. Basic Information
              </h3>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Course Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Master 500 Vocabulary Words for IELTS Speaking & Writing"
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-4 ${
                    errors.title ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                  }`}
                />
                {errors.title && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Subject / Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-4 ${
                      errors.category ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Estimated Duration *</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 24 hours / 4 weeks"
                    className={`w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-4 ${
                      errors.duration ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />
                  {errors.duration && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.duration}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <span className="block text-sm font-bold text-slate-700 sm:col-span-3">Difficulty Level * (BR-02 Evaluation)</span>
                {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                  <label 
                    key={lvl}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.level === lvl 
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 font-bold" 
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <span className="text-sm">{lvl}</span>
                    <input
                      type="radio"
                      name="level"
                      value={lvl}
                      checked={formData.level === lvl}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                  </label>
                ))}
                {errors.level && <p className="sm:col-span-3 text-xs font-bold text-red-500">{errors.level}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Learning Objectives *</label>
                <textarea
                  name="objectives"
                  rows="3"
                  value={formData.objectives}
                  onChange={handleInputChange}
                  placeholder="What will learners achieve? (e.g., Confidently answer IELTS Speaking Part 1 topics, use academic vocab...)"
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-4 ${
                    errors.objectives ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                  }`}
                />
                {errors.objectives && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.objectives}</p>}
              </div>
            </section>

            {/* PHẦN 2: LỘ TRÌNH CHI TIẾT (LIST OF LEARNING STEPS) */}
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                    02. List of Learning Steps *
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Thiết kế từng bước nhỏ trong lộ trình học (Ví dụ: Học từ vựng -> Nghe -> Thực hành Nói)</p>
                </div>
                <button
                  type="button"
                  onClick={addStep}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold px-4 py-2 rounded-xl transition-all shrink-0 shadow-sm active:scale-95"
                >
                  ➕ Add New Step
                </button>
              </div>

              {errors.steps && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-fade-in">
                  ⚠️ {errors.steps}
                </div>
              )}

              <div className="space-y-4">
                {formData.steps.map((step, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col md:flex-row items-start md:items-center gap-4 p-5 bg-slate-50 border border-slate-200/60 rounded-2xl relative group hover:border-blue-200 hover:bg-blue-50/10 transition-all"
                  >
                    {/* Số thứ tự bước */}
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10">
                      {index + 1}
                    </div>

                    {/* Ô nhập tiêu đề của bước học */}
                    <div className="w-full md:flex-1">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">Step Title / Topic</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleStepChange(index, "title", e.target.value)}
                        placeholder="e.g., 50 Common Vocabulary for IELTS Speaking Part 1"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                      />
                    </div>

                    {/* Dropdown chọn loại kỹ năng tiếng Anh */}
                    <div className="w-full md:w-44">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">Skill / Activity</label>
                      <select
                        value={step.type}
                        onChange={(e) => handleStepChange(index, "type", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                      >
                        <option value="Vocabulary">📚 Vocabulary (Từ vựng)</option>
                        <option value="Grammar">✍️ Grammar (Ngữ pháp)</option>
                        <option value="Listening">🎧 Listening (Luyện nghe)</option>
                        <option value="Reading">📖 Reading (Luyện đọc)</option>
                        <option value="Speaking">🗣️ Speaking (Luyện nói AI)</option>
                        <option value="Quiz">📝 Quiz / Test (Kiểm tra)</option>
                      </select>
                    </div>

                    {/* Ô nhập thời lượng làm bước này */}
                    <div className="w-full md:w-32">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">Duration</label>
                      <input
                        type="text"
                        value={step.duration}
                        onChange={(e) => handleStepChange(index, "duration", e.target.value)}
                        placeholder="e.g., 20 mins"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Nút xóa step */}
                    <div className="self-end md:self-center pt-2 md:pt-4">
                      <button
                        type="button"
                        disabled={formData.steps.length === 1} // BR-01: Cấm xóa nếu chỉ còn 1 bước duy nhất
                        onClick={() => removeStep(index)}
                        className="w-9 h-9 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-sm bg-white"
                        title="Remove this step"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PHẦN 3: ĐIỀU KIỆN HOÀN THÀNH */}
            <section className="space-y-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                03. Gatekeeping & Gamification
              </h3>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Completion Conditions *</label>
                <textarea
                  name="completionConditions"
                  rows="2"
                  value={formData.completionConditions}
                  onChange={handleInputChange}
                  placeholder="e.g., Must pass the final vocabulary quiz and AI Speaking challenge with a score over 80% to achieve the badge."
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-4 ${
                    errors.completionConditions ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                  }`}
                />
                {errors.completionConditions && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.completionConditions}</p>}
              </div>
            </section>

          </div>

          {/* Footer Form */}
          <div className="bg-slate-50 border-t border-slate-100 px-8 py-6 flex justify-end items-center gap-4">
            <button
              type="button"
              onClick={onBackDashboard}
              className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? "Validating & Saving..." : "Publish Roadmap"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}