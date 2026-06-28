import React from "react";
import { ArrowLeft, Award, Download, Share2, CheckCircle2, Star, Clock, BookOpen, ChevronRight, Video, HelpCircle } from "lucide-react";
import { getLearningProgress, curriculumData } from "../../services/data";

export default function CompletionPage({ course, onNavigate, onBack }) {
  const completionDate = new Date().toLocaleDateString("vi-VN", {
    year: "numeric", month: "long", day: "numeric"
  });

  const progress = getLearningProgress();
  const completedLessons = new Set(progress.completedLessons);
  const totalLessons = curriculumData.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = completedLessons.size;
  const totalVideos = curriculumData.reduce((sum, m) => sum + m.lessons.filter(l => l.type === "video").length, 0);
  const totalHours = totalVideos * 12;

  // Calculate quiz scores
  const quizScores = Object.values(progress.quizScores);
  const avgScore = quizScores.length > 0
    ? Math.round(quizScores.reduce((sum, q) => sum + (q.score / q.total) * 100, 0) / quizScores.length)
    : 85;

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-muted via-white to-primary/5">
      <div className="bg-white/80 backdrop-blur-sm border-b border-border/30">
        <div className="section-container py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lai</span>
          </button>
        </div>
      </div>

      <div className="section-container py-16">
        <div className="max-w-2xl mx-auto space-y-12">
          {/* Hero section */}
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-success/10 mx-auto flex items-center justify-center animate-bounce">
              <Award className="w-10 h-10 text-success" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-black text-text-primary tracking-tight">
                Xin chuc mung!
              </h1>
              <p className="text-text-secondary text-sm max-w-md mx-auto">
                Ban da hoan thanh xong khoa hoc. Chung toi rat tu hao ve su co gang cua ban.
              </p>
            </div>
          </div>

          {/* Certificate */}
          <div className="bg-white rounded-3xl border-2 border-border/60 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary via-primary-dark to-purple-600 p-8 text-center text-white space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Chung chi hoan thanh</p>
              <h2 className="text-2xl font-black tracking-tight">Certificate of Completion</h2>
              <p className="text-xs opacity-80">This certifies that</p>
            </div>
            <div className="p-8 sm:p-12 space-y-6 text-center">
              <p className="text-2xl sm:text-3xl font-black text-text-primary">Nguyen Van A</p>
              <p className="text-sm text-text-secondary">has successfully completed the course</p>
              <p className="text-xl font-black text-primary">{course?.title || "Khoa hoc tieng Anh"}</p>
              <div className="flex items-center justify-center gap-6 text-xs text-text-muted font-semibold">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{totalHours} gio</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" />
                  <span>{completedCount}/{totalLessons} bai</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" />
                  <span>Dat yeu cau</span>
                </div>
              </div>
              <div className="border-t border-border/40 pt-6 flex items-center justify-between text-xs text-text-muted">
                <div className="text-left">
                  <p className="font-bold text-text-primary">Ngay cap</p>
                  <p>{completionDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-text-primary">Ma chung chi</p>
                  <p>CERT-{String(Math.floor(Math.random() * 100000)).padStart(6, "0")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Bai hoc hoan thanh", value: `${completedCount}/${totalLessons}`, icon: BookOpen },
              { label: "Diem kiem tra", value: `${avgScore}%`, icon: Star },
              { label: "Thoi gian hoc", value: `${totalHours} gio`, icon: Clock },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border/60 p-5 text-center space-y-2">
                <stat.icon className="w-5 h-5 text-primary mx-auto" />
                <p className="text-xl font-black text-text-primary">{stat.value}</p>
                <p className="text-[10px] font-bold text-text-muted uppercase">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-primary text-white hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              <Download className="w-4 h-4" />
              <span>Tai chung chi (PDF)</span>
            </button>
            <button className="px-8 py-3.5 rounded-2xl font-bold text-sm border border-border/60 text-text-secondary hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              <span>Chia se thanh tuu</span>
            </button>
          </div>

          <div className="text-center">
            <button onClick={onBack} className="text-sm font-bold text-primary hover:underline">
              Quay ve khoa hoc cua toi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
