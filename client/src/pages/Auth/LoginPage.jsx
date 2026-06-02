import React, { useState } from "react";

const testAccounts = [
  {
    email: "admin@gmail.com",
    password: "123456",
    name: "Admin User",
    role: "Admin",
  },
  {
    email: "student@gmail.com",
    password: "123456",
    name: "Student User",
    role: "Learner",
  },
  {
    email: "mentor@gmail.com",
    password: "123456",
    name: "Mentor User",
    role: "Mentor",
  },
];

export default function LoginPage({ onLogin, onBackHome }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const account = testAccounts.find(
        (item) =>
          item.email.toLowerCase() === formData.email.trim().toLowerCase() &&
          item.password === formData.password
      );

      if (!account) {
        setErrors({
          form: "Email or password is incorrect. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }

      const userSession = {
        email: account.email,
        name: account.name,
        role: account.role,
        loggedInAt: new Date().toISOString(),
      };

      onLogin(userSession);
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:flex relative overflow-hidden bg-slate-950 px-12 py-10 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.35),transparent_34%),radial-gradient(circle_at_78%_72%,rgba(14,165,233,0.22),transparent_32%)]" />
          <div className="relative z-10 flex h-full w-full flex-col justify-between">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
            >
              <span aria-hidden="true">←</span>
              Home
            </button>

            <div className="max-w-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-black shadow-lg shadow-blue-600/30">
                  L
                </div>
                <span className="text-2xl font-extrabold tracking-tight">
                  LearnPath
                </span>
              </div>
              <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
                Continue your learning roadmap with one secure sign in.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
                Access courses, mentor roadmaps, quiz progress, XP streaks, and
                personalized recommendations from a single account.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold">24+</p>
                <p className="mt-1 text-slate-300">roadmaps</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold">1.2k</p>
                <p className="mt-1 text-slate-300">learners</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold">98%</p>
                <p className="mt-1 text-slate-300">progress saved</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <button
              type="button"
              onClick={onBackHome}
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600 lg:hidden"
            >
              <span aria-hidden="true">←</span>
              Home
            </button>

            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-600/25 lg:hidden">
                L
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                Welcome back
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
                Login to LearnPath
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Use your account to resume lessons and keep every milestone in
                sync.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.form && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {errors.form}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  placeholder="student@gmail.com"
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                    className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                  >
                    {isPasswordVisible ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  id="password"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                />
                {errors.password && (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
