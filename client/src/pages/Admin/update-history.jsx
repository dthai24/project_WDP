import React from "react";
import { History, Calendar, User, FileText, ArrowRight } from "lucide-react";

const UpdateHistory = () => {
  const historyLogs = [
    {
      id: "log_001",
      action: "Created Course",
      target: "React JS Core Fundamentals",
      targetType: "Course",
      actor: "Nguyen Thi B",
      timestamp: "2026-06-01 14:30",
      details: "Định nghĩa lộ trình cơ bản với 4 bài học chính và 1 bài test trắc nghiệm."
    },
    {
      id: "log_002",
      action: "Updated Category",
      target: "Backend Development",
      targetType: "Category",
      actor: "Nguyen Nhat Minh",
      timestamp: "2026-05-30 09:15",
      details: "Thay đổi mô tả danh mục và sắp xếp thứ tự hiển thị ưu tiên lên hàng đầu."
    },
    {
      id: "log_003",
      action: "Deactivated Course",
      target: "CI/CD Pipeline with GitHub Actions",
      targetType: "Course",
      actor: "Tran Van A",
      timestamp: "2026-05-28 17:45",
      details: "Tạm ẩn khóa học vì chưa hoàn thành chỉnh sửa giáo trình thực hành."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Lịch sử cập nhật hệ thống</h2>
        <p className="text-sm text-slate-500 mt-1">
          Nhật ký hoạt động thay đổi cấu trúc dữ liệu, cập nhật danh mục, lộ trình hoặc khóa học.
        </p>
      </div>

      {/* History Timeline */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 relative">
        <div className="absolute left-9 top-8 bottom-8 w-0.5 bg-slate-100 hidden sm:block"></div>

        <div className="space-y-8 relative">
          {historyLogs.map((log) => (
            <div key={log.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
              {/* Icon marker */}
              <div className="z-10 w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                <History className="w-4 h-4" />
              </div>

              {/* Log Card */}
              <div className="flex-1 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl p-5 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 font-bold rounded">
                      {log.action}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> {log.targetType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {log.timestamp}
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  {log.target}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{log.details}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Thực hiện bởi: <strong className="text-slate-700">{log.actor}</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-slate-300">{log.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdateHistory;
