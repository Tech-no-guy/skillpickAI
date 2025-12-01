import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-sm font-bold">
            SP
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide">
              SkillPick AI
            </div>
            <div className="text-[11px] text-slate-400">
              Autonomous Hiring &amp; Assessment Agent
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-xs sm:text-sm">
          <Link
            to="/recruiter/create"
            className={`px-3 py-1.5 rounded-full border ${
              location.pathname.startsWith("/recruiter")
                ? "border-brand-500 bg-brand-500/10 text-brand-100"
                : "border-slate-700 hover:border-brand-600 hover:text-brand-200"
            }`}
          >
            Recruiter Portal
          </Link>
          
        </nav>
      </div>
    </header>
  );
}
