import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, Shield, Lock, CreditCard, Wallet, Building2, ChevronRight, AlertCircle, Sparkles, Award, Clock, BookOpen, Star, Check } from "lucide-react";
import { formatPrice, paymentMethods, enrollCourse } from "../../services/data";

export default function PaymentPage({ course, currentUser, onNavigate, onBack }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [step, setStep] = useState("review"); // review | processing | success
  const [agreeTerms, setAgreeTerms] = useState(false);

  const isFree = course.price === null || course.price === undefined;

  const handlePayment = async () => {
    if (!agreeTerms) return;
    setStep("processing");
    
    // Gọi API thông báo bắt đầu giao dịch thanh toán
    try {
      await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/payment/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser?.email || "learnpath.project@gmail.com",
          userName: currentUser?.name || "Học viên",
          courseTitle: course.title,
          price: course.price,
          paymentMethod: selectedMethod || "Miễn phí"
        })
      });
    } catch (err) {
      console.warn("Lỗi gửi email bắt đầu thanh toán:", err.message);
    }

    setTimeout(async () => {
      enrollCourse(course.id);
      
      // Gọi API thông báo giao dịch hoàn tất thành công
      try {
        await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/payment/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentUser?.email || "learnpath.project@gmail.com",
            userName: currentUser?.name || "Học viên",
            courseTitle: course.title,
            price: course.price,
            paymentMethod: selectedMethod || "Miễn phí"
          })
        });
      } catch (err) {
        console.warn("Lỗi gửi email thanh toán thành công:", err.message);
      }

      setStep("success");
    }, 2000);
  };

  const handleStartLearning = () => {
    onNavigate("course-player", { course });
  };

  if (step === "processing") {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm mx-auto p-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-text-primary tracking-tight">Dang xu ly thanh toan</h2>
            <p className="text-sm text-text-secondary">Vui long khong tat trang nay...</p>
          </div>
          <div className="bg-white rounded-2xl border border-border/60 p-4 space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-text-secondary">Xac thuc phuong thuc thanh toan</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary/40" />
              <span className="text-xs font-medium text-text-muted">Xu ly giao dich</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary/40" />
              <span className="text-xs font-medium text-text-muted">Kich hoat khoa hoc</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm mx-auto p-8">
          <div className="w-20 h-20 rounded-full bg-success/10 mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-text-primary tracking-tight">Thanh toan thanh cong!</h2>
            <p className="text-sm text-text-secondary">Khoa hoc da duoc kich hoat. Bat dau hoc ngay!</p>
          </div>
          <div className="bg-white rounded-2xl border border-border/60 p-4 text-left space-y-2">
            <div className="flex items-center gap-3">
              <img src={course.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <p className="text-xs font-bold text-text-primary">{course.title}</p>
                <p className="text-[10px] text-text-muted">{course.instructor}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-semibold text-text-muted">
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessons} bai</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.hours} gio</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{course.rating}</span>
            </div>
          </div>
          <button
            onClick={handleStartLearning}
            className="w-full py-3.5 rounded-2xl font-bold text-sm bg-primary text-white hover:bg-primary-dark active:scale-[0.97] transition-all shadow-lg shadow-primary/20"
          >
            Vao hoc ngay
          </button>
          <button
            onClick={() => onNavigate("my-learning")}
            className="text-sm font-bold text-primary hover:underline"
          >
            Quay ve khoa hoc cua toi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Header */}
      <div className="bg-white border-b border-border/30">
        <div className="section-container py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lai</span>
          </button>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-black text-text-primary tracking-tight mb-8">Thanh toan</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Payment Methods */}
            <div className="lg:col-span-7 space-y-6">
              {/* Course Summary */}
              <div className="bg-white rounded-2xl border border-border/60 p-5 flex items-center gap-4">
                <img src={course.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">{course.title}</p>
                  <p className="text-[10px] text-text-muted font-medium">{course.instructor}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold text-text-muted bg-surface-muted px-2 py-0.5 rounded-md">{course.level}</span>
                    <span className="text-[10px] font-semibold text-text-muted">{course.lessons} bai hoc</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-2xl border border-border/60 p-6 space-y-4">
                <h2 className="text-sm font-bold text-text-primary">Chon phuong thuc thanh toan</h2>
                <div className="space-y-2">
                  {paymentMethods.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    let Icon;
                    if (method.id === "momo") Icon = Wallet;
                    else if (method.id === "zalopay") Icon = Wallet;
                    else if (method.id === "vnpay") Icon = CreditCard;
                    else if (method.id === "bank") Icon = Building2;
                    else Icon = CreditCard;

                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border/60 hover:border-primary/30 hover:bg-surface-muted"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-primary text-white" : "bg-surface-muted text-text-secondary"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${isSelected ? "text-primary" : "text-text-primary"}`}>{method.name}</p>
                          {method.id === "momo" && <p className="text-[9px] text-text-muted">Thanh toan qua vi dien tu MoMo</p>}
                          {method.id === "zalopay" && <p className="text-[9px] text-text-muted">Thanh toan qua ZaloPay</p>}
                          {method.id === "vnpay" && <p className="text-[9px] text-text-muted">Thanh toan qua cong VNPay</p>}
                          {method.id === "bank" && <p className="text-[9px] text-text-muted">Chuyen khoan den tai khoan ngan hang</p>}
                          {method.id === "card" && <p className="text-[9px] text-text-muted">Visa, Mastercard, JCB</p>}
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border/60 text-primary focus:ring-primary/30"
                />
                <span className="text-xs text-text-secondary">
                  Toi dong y voi{" "}
                  <span className="text-primary font-semibold hover:underline cursor-pointer">Dieu khoan su dung</span>
                  {" "}va{" "}
                  <span className="text-primary font-semibold hover:underline cursor-pointer">Chinh sach bao mat</span>
                  {" "}cua English Master.
                </span>
              </label>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-border/60 p-6 space-y-5 sticky top-24">
                <h2 className="text-sm font-bold text-text-primary">Tom tat don hang</h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">Gia khoa hoc</span>
                    <span className="font-bold text-text-primary">{formatPrice(course.price)}</span>
                  </div>
                  {course.originalPrice && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Gia goc</span>
                      <span className="font-bold text-text-muted line-through">{formatPrice(course.originalPrice)}</span>
                    </div>
                  )}
                  {course.originalPrice && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Giam gia</span>
                      <span className="font-bold text-success">
                        -{formatPrice(course.originalPrice - course.price)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border/40 pt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-text-primary">Tong cong</span>
                    <span className="text-xl font-black text-primary">{formatPrice(course.price)}</span>
                  </div>
                </div>

                {course.originalPrice && (
                  <div className="bg-success/5 rounded-2xl p-4 border border-success/10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-success" />
                      <span className="text-xs font-bold text-success">Tiet kiem {formatPrice(course.originalPrice - course.price)}</span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">Uu dai co thoi gian, hay dang ky ngay!</p>
                  </div>
                )}

                <div className="space-y-2 text-[10px] text-text-muted">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    <span>Thanh toan an toan, bao mat tuyet doi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3 h-3" />
                    <span>Hoc moi luc, moi noi, khong gioi han</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    <span>Bao hanh hoan tien trong 7 ngay</span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={!selectedMethod || !agreeTerms}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    selectedMethod && agreeTerms
                      ? "bg-primary text-white hover:bg-primary-dark active:scale-[0.97] shadow-lg shadow-primary/20"
                      : "bg-slate-100 text-text-muted cursor-not-allowed"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Thanh toan {formatPrice(course.price)}</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-text-muted">
                  <Shield className="w-3 h-3" />
                  <span>Duoc bao ve boi SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
