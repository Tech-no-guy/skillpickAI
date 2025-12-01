import React from "react";

export default function ScoreBadge({ label, value }) {
  let tone = "bg-slate-800 text-slate-100 border-slate-700";
  if (value >= 75) tone = "bg-emerald-900/40 text-emerald-200 border-emerald-500/60";
  else if (value >= 50) tone = "bg-amber-900/40 text-amber-200 border-amber-500/60";
  else tone = "bg-rose-900/40 text-rose-200 border-rose-500/60";

  return (
    <div className={`px-3 py-2 rounded-xl border text-xs sm:text-sm ${tone}`}>
      <div className="text-[11px] uppercase tracking-wide opacity-80">
        {label}
      </div>
      <div className="text-base font-semibold">{value.toFixed(1)} / 100</div>
    </div>
  );
}
