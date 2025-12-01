import React from "react";

export default function TrendLineChart({ candidates }) {
  const completed = candidates.filter((c) => c.overall_score > 0);
  if (!completed.length) {
    return (
      <div className="text-xs text-slate-400">
        No completed candidates yet.
      </div>
    );
  }

  const sorted = [...completed].sort(
    (a, b) => a.candidate_id - b.candidate_id
  );
  const maxScore = Math.max(...sorted.map((c) => c.overall_score), 100);

  return (
    <div className="relative h-32 w-full border border-slate-800 rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/60" />
      <svg className="relative z-10 h-full w-full">
        {sorted.map((c, idx) => {
          if (idx === 0) return null;
          const prev = sorted[idx - 1];
          const x1 = ((idx - 1) / (sorted.length - 1 || 1)) * 100;
          const x2 = (idx / (sorted.length - 1 || 1)) * 100;
          const y1 = 100 - (prev.overall_score / maxScore) * 100;
          const y2 = 100 - (c.overall_score / maxScore) * 100;
          return (
            <line
              key={c.candidate_id}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="currentColor"
              className="text-brand-500"
              strokeWidth="2"
            />
          );
        })}
        {sorted.map((c, idx) => {
          const x = (idx / (sorted.length - 1 || 1)) * 100;
          const y = 100 - (c.overall_score / maxScore) * 100;
          return (
            <circle
              key={c.candidate_id}
              cx={`${x}%`}
              cy={`${y}%`}
              r="3"
              className="fill-emerald-400"
            />
          );
        })}
      </svg>
      <div className="absolute bottom-1 left-2 text-[10px] text-slate-400">
        Candidate index →
      </div>
      <div className="absolute top-1 right-2 text-[10px] text-slate-400">
        Overall score trend
      </div>
    </div>
  );
}
