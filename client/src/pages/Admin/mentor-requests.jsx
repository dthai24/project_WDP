import React, { useState, useEffect } from "react";
import { Check, X, Eye, ExternalLink, Mail, Globe, Calendar, Award, AlertCircle, FileText } from "lucide-react";

// Mẫu email phản hồi có sẵn cho Admin chọn
const templates = {
  approved: [
    {
      id: "app-1",
      label: "Mẫu 1: Đồng ý tiêu chuẩn (Khuyên dùng)",
      text: "Chúc mừng! Hồ sơ đăng ký làm Mentor của bạn trên English Master đã được duyệt thành công. Bạn đã có thể đăng nhập vào hệ thống và bắt đầu xây dựng lộ trình học cho các học viên."
    },
    {
      id: "app-2",
      label: "Mẫu 2: Đồng ý & Kèm lời chào mừng",
      text: "Chào bạn, Ban quản trị English Master đã xem xét hồ sơ và chứng chỉ của bạn. Chúng tôi rất vui mừng thông báo rằng hồ sơ của bạn đã được chấp thuận. Chúc mừng bạn chính thức gia nhập đội ngũ Mentor của English Master."
    }
  ],
  rejected: [
    {
      id: "rej-1",
      label: "Mẫu 1: Từ chối do thiếu chứng chỉ",
      text: "Rất tiếc, hồ sơ của bạn chưa đủ điều kiện xét duyệt tại thời điểm này. Vui lòng cập nhật thêm các chứng chỉ chuyên môn liên quan và gửi lại yêu cầu ứng tuyển sau."
    },
    {
      id: "rej-2",
      label: "Mẫu 2: Từ chối do thiếu kinh nghiệm thực tế",
      text: "Chào bạn, cảm ơn bạn đã quan tâm đến vị trí Mentor trên English Master. Tuy nhiên, sau khi xem xét chi tiết tiểu sử và kinh nghiệm, chúng tôi thấy năng lực chuyên môn của bạn chưa phù hợp với tiêu chí hiện tại của nền tảng."
    }
  ]
};

export default function MentorRequests() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(null); // Lưu application để hiển thị chứng chỉ
  const [reviewStatus, setReviewStatus] = useState("approved"); // approved hoặc rejected
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch danh sách hồ sơ đăng ký từ API
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5050"}/api/mentor/applications`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        console.error("Không thể lấy danh sách đơn ứng tuyển");
      }
    } catch (error) {
      console.error("Lỗi kết nối API lấy danh sách:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Khi thay đổi trạng thái phê duyệt (Approve/Reject) trong modal, cập nhật mẫu mặc định
  useEffect(() => {
    if (selectedApp) {
      const currentTemplates = templates[reviewStatus] || [];
      const defaultTemplate = currentTemplates[0]?.text || "";
      setSelectedTemplateIndex(0);
      setCommentText(defaultTemplate);
    }
  }, [reviewStatus, selectedApp]);

  // Khi chọn mẫu email khác từ dropdown
  const handleTemplateChange = (index) => {
    setSelectedTemplateIndex(index);
    const currentTemplates = templates[reviewStatus] || [];
    setCommentText(currentTemplates[index]?.text || "");
  };

  // Mở modal duyệt hồ sơ
  const openReviewModal = (app, status) => {
    setSelectedApp(app);
    setReviewStatus(status);
  };

  // Đóng modal duyệt hồ sơ
  const closeReviewModal = () => {
    setSelectedApp(null);
    setCommentText("");
  };

  // Gửi phê duyệt lên API
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5050"}/api/mentor/applications/${selectedApp._id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: reviewStatus,
          comment: commentText
        })
      });

      const resData = await response.json();

      if (response.ok) {
        alert(reviewStatus === "approved" ? "Hồ sơ đã được phê duyệt thành công!" : "Đã từ chối hồ sơ ứng viên.");
        closeReviewModal();
        fetchApplications(); // Tải lại danh sách mới nhất
      } else {
        alert(resData.message || "Gặp lỗi khi cập nhật hồ sơ.");
      }
    } catch (error) {
      console.error("Lỗi gửi duyệt:", error);
      alert("Không thể kết nối đến server backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            Yêu cầu Đăng ký Mentor
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Xem xét hồ sơ, thông tin kinh nghiệm và ảnh chứng chỉ chuyên môn của ứng viên trước khi duyệt.
          </p>
        </div>
        <button 
          onClick={fetchApplications}
          className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-sm"
        >
          Làm mới danh sách
        </button>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400 mt-4">Đang tải danh sách hồ sơ...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto text-xl">
            📭
          </div>
          <h3 className="font-bold text-slate-800">Không có hồ sơ nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Hệ thống hiện tại chưa nhận được đơn ứng tuyển làm Mentor nào từ học viên.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Ứng viên</th>
                  <th className="px-6 py-4">Giới thiệu & Kinh nghiệm</th>
                  <th className="px-6 py-4">Portfolio</th>
                  <th className="px-6 py-4">Chứng chỉ</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Thông tin ứng viên */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{app.fullName}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {app.email}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(app.createdAt).toLocaleDateString("vi-VN")} {new Date(app.createdAt).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </td>

                    {/* Giới thiệu */}
                    <td className="px-6 py-4 max-w-xs">
                      <p className="line-clamp-2 text-xs text-slate-600 leading-relaxed" title={app.bio}>
                        {app.bio}
                      </p>
                    </td>

                    {/* Portfolio Link */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {app.portfolioUrl ? (
                        <a 
                          href={app.portfolioUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Xem Portfolio
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Không cung cấp</span>
                      )}
                    </td>

                    {/* Ảnh chứng chỉ */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => setShowCertificateModal(app)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200/50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Xem chứng chỉ
                      </button>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        app.status === "pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : app.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        {app.status === "pending" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        )}
                        {app.status === "pending" ? "Chờ duyệt" : app.status === "approved" ? "Đã duyệt" : "Từ chối"}
                      </span>
                    </td>

                    {/* Thao tác phê duyệt */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {app.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openReviewModal(app, "approved")}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                            title="Phê duyệt ứng viên"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openReviewModal(app, "rejected")}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                            title="Từ chối ứng viên"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL XEM ẢNH CHỨNG CHỈ */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Chứng chỉ ứng viên</h3>
                <p className="text-xs text-slate-400 mt-0.5">Ứng viên: {showCertificateModal.fullName}</p>
              </div>
              <button 
                onClick={() => setShowCertificateModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-slate-950 flex items-center justify-center max-h-[500px]">
              <img 
                src={`${process.env.REACT_APP_API_URL || "http://localhost:5050"}${showCertificateModal.certificatePath}`} 
                alt="Certificate" 
                className="max-h-[450px] max-w-full object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = "https://placehold.co/600x400?text=Loi+tai+anh+chung+chi";
                }}
              />
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowCertificateModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PHÊ DUYỆT / TỪ CHỐI NHANH */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                {reviewStatus === "approved" ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                )}
                {reviewStatus === "approved" ? "Duyệt hồ sơ Mentor" : "Từ chối hồ sơ Mentor"}
              </h3>
              <button 
                onClick={closeReviewModal}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thông tin ứng viên</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Họ tên: </span>
                    <span className="font-semibold text-slate-700">{selectedApp.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Email: </span>
                    <span className="font-semibold text-slate-700">{selectedApp.email}</span>
                  </div>
                </div>
              </div>

              {/* Lựa chọn Mẫu Email phản hồi nhanh */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Chọn mẫu phản hồi nhanh (Không cần gõ tay)
                </label>
                <select 
                  value={selectedTemplateIndex}
                  onChange={(e) => handleTemplateChange(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs text-slate-700 bg-white"
                >
                  {(templates[reviewStatus] || []).map((tpl, index) => (
                    <option key={tpl.id} value={index}>
                      {tpl.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chi tiết nội dung phản hồi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Nội dung thư thông báo gửi đi
                </label>
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows="4"
                  required
                  placeholder="Nội dung thông báo gửi cho ứng viên..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs text-slate-700 font-medium resize-none min-h-[100px]"
                />
              </div>

              <div className="flex items-start gap-2 text-[11px] text-slate-400">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <p>Nội dung này sẽ được gửi trực tiếp đến hòm thư <span className="font-semibold">{selectedApp.email}</span> ngay sau khi bạn xác nhận.</p>
              </div>

              {/* Nút Submit */}
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeReviewModal}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-white text-xs font-semibold rounded-xl transition-colors shadow-md flex items-center gap-1.5 ${
                    reviewStatus === "approved" 
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10" 
                      : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      {reviewStatus === "approved" ? "Đồng ý phê duyệt" : "Xác nhận từ chối"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
