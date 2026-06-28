import React, { useState } from "react";
import { Flame, Zap, Award, Gift, ChevronRight, Sparkles, Target, Clock, Shield, Star, Trophy, Lock, CheckCircle2, TrendingUp } from "lucide-react";
import { getStreakData, getWeekHistory, getMonthHistory, STREAK_MILESTONES, recordStudySession } from "../../services/data";

export default function StreakTracker({ onClose, onStudy }) {
  const [activeTab, setActiveTab] = useState("streak"); // streak | milestones | calendar
  const streakData = getStreakData();
  const weekHistory = getWeekHistory();
  const monthHistory = getMonthHistory();

  const today = new Date().toISOString().split("T")[0];
  const todayStudied = weekHistory.find(d => d.date === today)?.studied || false;

  // Calculate next milestone
  const nextMilestone = STREAK_MILESTONES.find(m => !streakData.milestones?.includes(m.days));
  const progressToNext = nextMilestone
    ? Math.min(100, Math.round((streakData.currentStreak / nextMilestone.days) * 100))
    : 100;

  const handleStudyNow = () => {
    const result = recordStudySession(50);
    if (onStudy) onStudy(result);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-border/40 w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header - Fire gradient */}
        <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-6 text-white overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-black/15 rounded-full blur-3xl pointer-events-none" />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative z-10 text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Flame className="w-8 h-8 text-orange-200" />
              <span className="text-5xl font-black">{streakData.currentStreak}</span>
            </div>
            <p className="text-lg font-bold text-white/90">Ngay lien tiep</p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                {streakData.totalXp.toLocaleString()} XP
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                Ky luc: {streakData.longestStreak} ngay
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Freeze: {streakData.freezes}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/30 px-6 pt-4 gap-1">
          {[
            { id: "streak", label: "Chuoi", icon: Flame },
            { id: "milestones", label: "Thanh tuu", icon: Award },
            { id: "calendar", label: "Lich su", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[55vh] p-6 space-y-5">
          {/* STREAK TAB */}
          {activeTab === "streak" && (
            <>
              {/* Weekly Calendar */}
              <div className="bg-surface-muted rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Tuan nay</span>
                </h3>
                <div className="grid grid-cols-7 gap-2.5 text-center">
                  {weekHistory.map((day, i) => (
                    <div key={i} className="space-y-1.5">
                      <p className="text-[9px] font-bold text-text-muted uppercase">{day.day}</p>
                      <div className={`h-10 rounded-xl flex items-center justify-center text-xs font-bold border transition-all ${
                        day.studied
                          ? "bg-gradient-to-br from-orange-400 to-red-500 text-white border-orange-300 shadow-sm shadow-orange-200"
                          : day.date === today
                            ? "bg-white text-text-muted border-dashed border-border"
                            : "bg-white text-text-muted border-border/60"
                      }`}>
                        {day.studied ? (
                          <Flame className="w-4 h-4" />
                        ) : day.date === today ? (
                          <span className="text-[9px]">Hom nay</span>
                        ) : (
                          <span className="text-[9px]">—</span>
                        )}
                      </div>
                      {day.studied && (
                        <p className="text-[8px] font-bold text-orange-500">+{day.xp}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress to next milestone */}
              {nextMilestone && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-text-primary">Coc moc tiep theo</h3>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-md">
                      {nextMilestone.icon} {nextMilestone.title}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-text-secondary font-semibold">
                      <span>{streakData.currentStreak} ngay</span>
                      <span>{nextMilestone.days} ngay</span>
                    </div>
                    <div className="progress-bar bg-orange-200">
                      <div className="progress-fill bg-gradient-to-r from-orange-400 to-red-500" style={{ width: `${progressToNext}%` }} />
                    </div>
                    <p className="text-[10px] text-text-muted text-center">
                      Con {nextMilestone.days - streakData.currentStreak} ngay de nhan {nextMilestone.xp} XP
                    </p>
                  </div>
                </div>
              )}

              {/* Streak Info */}
              <div className="bg-surface-muted rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-bold text-text-primary">Meo duy tri chuoi</h3>
                <div className="space-y-2 text-[10px] text-text-secondary">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-success shrink-0 mt-0.5" />
                    <span>Hoc it nhat 15 phut moi ngay de duy tri chuoi</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-success shrink-0 mt-0.5" />
                    <span>Su dung "Freeze" de bao ve chuoi khi ban ban</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-success shrink-0 mt-0.5" />
                    <span>Dat muc tieu hang ngay de co dong luc</span>
                  </div>
                </div>
              </div>

              {/* Study Now CTA */}
              {!todayStudied && (
                <button
                  onClick={handleStudyNow}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 active:scale-[0.97] transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                >
                  <Flame className="w-4 h-4" />
                  <span>Hoc ngay de duy tri chuoi</span>
                </button>
              )}
            </>
          )}

          {/* MILESTONES TAB */}
          {activeTab === "milestones" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-text-primary">Cac moc da dat duoc</h3>
              <div className="space-y-2">
                {STREAK_MILESTONES.map((milestone) => {
                  const achieved = streakData.milestones?.includes(milestone.days);
                  const isNext = !achieved && !STREAK_MILESTONES.find(m => m.days < milestone.days && !streakData.milestones?.includes(m.days));
                  return (
                    <div
                      key={milestone.days}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                        achieved
                          ? "bg-success/5 border-success/20"
                          : isNext
                            ? "bg-orange-50 border-orange-200 border-dashed"
                            : "bg-surface-muted border-border/40 opacity-50"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        achieved ? "bg-success/10" : isNext ? "bg-orange-100" : "bg-white"
                      }`}>
                        {milestone.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-bold ${achieved ? "text-success" : "text-text-primary"}`}>
                            {milestone.title}
                          </p>
                          {achieved && <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />}
                        </div>
                        <p className="text-[10px] text-text-muted">{milestone.desc}</p>
                        <p className="text-[9px] font-bold text-primary mt-0.5">+{milestone.xp} XP</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-black text-text-muted">{milestone.days}</p>
                        <p className="text-[8px] font-bold text-text-muted uppercase">ngay</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === "calendar" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-text-primary">Lich su hoc tap thang nay</h3>
              <div className="bg-surface-muted rounded-2xl p-5">
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day, i) => (
                    <p key={i} className="text-[8px] font-bold text-text-muted uppercase py-1">{day}</p>
                  ))}
                  {/* Empty cells for alignment */}
                  {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {monthHistory.map((day, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                        day.studied
                          ? "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm"
                          : day.date === today
                            ? "bg-white border border-dashed border-border text-text-muted"
                            : "bg-white text-text-muted"
                      }`}
                      title={day.studied ? `+${day.xp} XP` : ""}
                    >
                      {day.day}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 text-[10px] text-text-muted">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gradient-to-br from-orange-400 to-red-500" />
                  <span>Da hoc</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-white border border-dashed border-border" />
                  <span>Hom nay</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-white border border-border/60" />
                  <span>Chua hoc</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
