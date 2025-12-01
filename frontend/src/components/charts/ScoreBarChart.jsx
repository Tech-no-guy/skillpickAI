import React from "react";

export default function ScoreBarChart({ candidates }) {
  // simple horizontal bar visualization with pure CSS
  const top = [...candidates].sort((a, b) => b.overall_score - a.overall_score).slice(0, 5);

  if (!top.length) {
    return (
      <div className="text-xs text-slate-400">
        No completed candidates yet.
      </div>
    );
  }

  const maxScore = Math.max(...top.map((c) => c.overall_score), 100);

  return (
    <div className="space-y-2">
      {top.map((c) => (
        <div key={c.candidate_id} className="space-y-1">
          <div className="flex justify-between text-xs text-slate-300">
            <span className="truncate mr-2">{c.name}</span>
            <span>{c.overall_score.toFixed(1)}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-emerald-400"
              style={{ width: `${(c.overall_score / maxScore) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
