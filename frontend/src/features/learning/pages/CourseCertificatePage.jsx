import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyCertificateByCode } from '@/features/profile/services/profileService';
import {
  Sparkle,
  Trophy,
  Clock,
  CheckCircle,
  Copy,
  Download,
  ArrowLeft,
  GraduationCap
} from '@phosphor-icons/react';

export default function CourseCertificatePage() {
  const { code } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadCert() {
      try {
        const res = await verifyCertificateByCode(code);
        if (res.success) {
          setCert(res.certificate);
        } else {
          setError(res.message || 'Không tìm thấy chứng chỉ');
        }
      } catch (err) {
        console.error('Error fetching certificate:', err);
        setError('Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    }
    loadCert();
  }, [code]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Đang tải chứng chỉ...</p>
        </div>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans p-4">
        <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Chứng Chỉ Không Hợp Lệ</h3>
          <p className="text-xs text-slate-400 mb-6">{error || 'Mã xác minh chứng chỉ không chính xác hoặc đã bị xóa.'}</p>
          <Link to="/" className="inline-flex items-center gap-1 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all decoration-none">
            <ArrowLeft size={16} /> Quay về Trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const { userId: student, courseId: course, issuedAt, grade, certificateCode } = cert;
  const issueDate = new Date(issuedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const studyHours = Math.max(8, Math.round((course?.totalLessons || 10) * 1.5));

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12 print:bg-white print:p-0 print:pb-0">
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #fff !important;
            transform: scale(1.0) !important;
            transform-origin: top left !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />

      {/* Standalone Header */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-50 no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-emerald-600 font-black text-lg decoration-none font-sans">
            <GraduationCap size={28} weight="fill" className="text-emerald-500" />
            <span>StarLearning</span>
          </Link>
          <Link to="/profile" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors decoration-none">
            <ArrowLeft size={16} /> Quay lại trang cá nhân
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8 items-start print:mt-0 print:p-0">
        
        {/* LEFT COLUMN: Verification Details (no-print) */}
        <section className="w-full lg:w-1/3 space-y-6 no-print">
          
          {/* Completion info box */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-xl border border-emerald-100">
                {student?.fullName ? student.fullName.split(' ').pop().charAt(0) : 'U'}
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Học viên hoàn thành</p>
                <h3 className="text-base font-extrabold text-slate-800">{student?.fullName || 'Học viên'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{issueDate}</p>
              </div>
            </div>

            <div className="space-y-4 text-slate-600 text-[13px] leading-relaxed">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-emerald-500" />
                <span>Thời lượng ước tính: <strong>~{studyHours} giờ học</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <Trophy size={18} className="text-amber-500" />
                <span>Điểm số đạt được: <strong>{grade}%</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={18} className="text-indigo-500" />
                <span>Tài khoản đã được xác minh danh tính</span>
              </div>
              
              <p className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                Hệ thống giáo dục <strong>StarLearning</strong> xác nhận rằng học viên đã tham gia đầy đủ các chương học, hoàn thành tất cả bài trắc nghiệm và đạt tiêu chuẩn tốt nghiệp đối với khóa học này.
              </p>
            </div>
          </div>

          {/* Course Details Card */}
          {course && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-4">Chi tiết khóa học</h4>
              <div className="flex gap-4 items-start mb-4">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300'}
                  alt={course.courseName}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                />
                <div>
                  <h5 className="text-[13px] font-extrabold text-slate-800 leading-snug line-clamp-2">{course.courseName}</h5>
                  <p className="text-[11px] text-slate-400 mt-1">Giảng viên: {course.instructorName || 'Giảng viên'}</p>
                </div>
              </div>

              {course.description && (
                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
                  {course.description}
                </p>
              )}

              {/* What you will learn */}
              <div className="space-y-1.5 mt-4 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Kiến thức đã trang bị:</p>
                <div className="flex items-start gap-2 text-xs text-slate-500">
                  <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" weight="fill" />
                  <span>Ứng dụng từ vựng & cấu trúc ngữ pháp học thuật nâng cao vào thực tiễn</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-500">
                  <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" weight="fill" />
                  <span>Đọc hiểu, phân tích tài liệu chuyên sâu và viết luận tự tin</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-500">
                  <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" weight="fill" />
                  <span>Phát triển kỹ năng giao tiếp và tranh luận học thuật chuyên nghiệp</span>
                </div>
              </div>
            </div>
          )}

        </section>

        {/* RIGHT COLUMN: The Certificate itself */}
        <section className="w-full lg:w-2/3 flex flex-col items-center space-y-6 print:w-full print:p-0">
          
          {/* Certificate Board */}
          <div className="print-area w-full aspect-[1.414/1] bg-white border-8 border-double border-slate-200 p-8 md:p-12 relative flex flex-col justify-between shadow-md rounded-2xl print:rounded-none print:shadow-none print:border-slate-300">
            {/* Elegant Double border border-accent */}
            <div className="absolute inset-2 border border-amber-800/10 pointer-events-none"></div>
            
            {/* Header logo / school */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-serif text-lg md:text-xl font-bold tracking-widest text-slate-700 uppercase flex items-center gap-1.5">
                  <GraduationCap className="text-amber-700" size={24} weight="fill" />
                  StarLearning
                </h2>
                <p className="text-[9px] text-slate-400 tracking-wider font-sans uppercase mt-0.5">Education Excellence System</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Course Certificate</span>
                <span className="text-[10px] font-mono text-slate-700 font-semibold tracking-wider block mt-0.5">{certificateCode}</span>
              </div>
            </div>

            {/* Main content body */}
            <div className="text-center my-auto py-4">
              <span className="text-xs md:text-sm font-serif italic text-slate-400 block mb-3 md:mb-5">This is to certify that</span>
              
              <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-extrabold text-amber-900 tracking-wide mb-3 md:mb-5">
                {student?.fullName || 'Học viên'}
              </h1>
              
              <p className="text-xs md:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed mb-4 md:mb-6">
                has successfully completed the online curriculum and academic evaluations for
              </p>

              <h2 className="text-lg md:text-xl lg:text-2xl font-sans font-black text-slate-800 max-w-xl mx-auto leading-snug mb-3">
                {course?.courseName || 'Khóa học của StarLearning'}
              </h2>

              <p className="text-[10px] md:text-xs text-slate-400 max-w-md mx-auto italic">
                an online course authorized by StarLearning and offered through its learning platform.
              </p>
            </div>

            {/* Footer with sign and verify seal */}
            <div className="flex justify-between items-end border-t border-slate-100 pt-6">
              {/* Signatures */}
              <div className="w-1/3">
                <div className="h-8 flex items-end mb-1 pl-2">
                  <svg className="w-24 h-8 text-slate-700 opacity-80" viewBox="0 0 100 35" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10,25 Q30,5 50,22 T90,10" strokeLinecap="round" />
                    <path d="M25,28 C40,20 60,30 75,20" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="border-t border-slate-200 pt-1.5 max-w-[120px]">
                  <span className="text-[9px] font-bold text-slate-600 block uppercase font-sans tracking-wide">StarLearning Dean</span>
                  <span className="text-[8px] text-slate-400 block font-sans">Academic Board</span>
                </div>
              </div>

              {/* Seal */}
              <div className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24">
                <svg className="w-full h-full text-amber-700/10 absolute animate-spin-slow" viewBox="0 0 100 100">
                  <path d="M50,5 L50,95 M5,50 L95,50" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
                </svg>
                {/* Gold Seal Center */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 text-white flex flex-col items-center justify-center shadow-md relative z-10 border-2 border-yellow-300">
                  <GraduationCap size={24} weight="fill" className="text-yellow-100" />
                  <span className="text-[7px] font-bold tracking-widest uppercase mt-0.5">VERIFIED</span>
                </div>
              </div>

              {/* Verifications info */}
              <div className="w-1/3 text-right">
                <div className="border-t border-slate-200 pt-1.5 inline-block text-left">
                  <span className="text-[8px] text-slate-400 block">Verify identity and course at:</span>
                  <span className="text-[8px] font-mono text-emerald-600 font-bold block mt-0.5 tracking-tighter">
                    http://localhost:5173/certificate/{code}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons (no-print) */}
          <div className="flex gap-4 w-full justify-center no-print">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 font-bold rounded-2xl text-xs transition-all shadow-sm cursor-pointer"
            >
              <Copy size={16} />
              {copied ? 'Đã sao chép liên kết!' : 'Chia sẻ chứng chỉ'}
            </button>
            
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md cursor-pointer"
            >
              <Download size={16} />
              Tải chứng chỉ (PDF/In)
            </button>
          </div>

        </section>

      </main>
    </div>
  );
}
