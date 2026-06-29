import { Link } from "react-router-dom";
import {
  GraduationCap,
  Envelope,
  MapPin,
} from "@phosphor-icons/react";

const FOOTER_LINKS = {
  "Platform": [
    { label: "Courses", path: "/courses" },
    { label: "My Learning", path: "/my-courses" },
    { label: "Practice", path: "/practice" },
    { label: "Pricing", path: "/pricing" },
  ],
  "Support": [
    { label: "Help Center", path: "/help" },
    { label: "Contact Us", path: "/contact" },
    { label: "FAQ", path: "/faq" },
    { label: "Report Issue", path: "/report" },
  ],
  "Company": [
    { label: "About Us", path: "/about" },
    { label: "Blog", path: "/blog" },
    { label: "Careers", path: "/careers" },
    { label: "Privacy Policy", path: "/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/home" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
                <GraduationCap size={20} weight="fill" className="text-white" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                S.T.A.R
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-4">
              Personalized English learning platform. Master English with interactive lessons, expert mentors, and real progress tracking.
            </p>
            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>Ho Chi Minh City, Vietnam</span>
              </div>
              <div className="flex items-center gap-2">
                <Envelope size={14} />
                <span>hello@star-english.com</span>
              </div>
            </div>
          </div>

          {/* Link Groups */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                {group}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-slate-500 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-10 sm:mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} S.T.A.R English Learning Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-slate-500 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-slate-500 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
