import React from "react";

export default function ScorePieChart({ candidates }) {
  const buckets = { strong_hire: 0, hire: 0, borderline: 0, reject: 0 };
  candidates.forEach((c) => {
    const v = (c.final_verdict || "").toLowerCase();
    if (v.includes("strong")) buckets.strong_hire++;
    else if (v === "hire") buckets.hire++;
    else if (v.includes("reject")) buckets.reject++;
    else buckets.borderline++;
  });

  const values = Object.values(buckets);
  const total = values.reduce((a, b) => a + b, 0) || 1;

  // We'll do a simple legend-based "pie" with progress ring representation
  return (
    <div className="space-y-3">
      <div className="relative flex items-center justify-center">
        <div className="h-24 w-24 rounded-full border border-slate-700 flex items-center justify-center">
          <div className="text-xs text-center">
            Total
            <div className="text-lg font-semibold">{total}</div>
            <div className="text-[10px] text-slate-400">candidates</div>
          </div>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <Legend color="bg-emerald-500" label="Strong Hire" value={buckets.strong_hire} total={total} />
        <Legend color="bg-brand-500" label="Hire" value={buckets.hire} total={total} />
        <Legend color="bg-amber-500" label="Borderline" value={buckets.borderline} total={total} />
        <Legend color="bg-rose-500" label="Reject" value={buckets.reject} total={total} />
      </div>
    </div>
  );
}

function Legend({ color, label, value, total }) {
  const pct = ((value / total) * 100).toFixed(1);
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        <span>{label}</span>
      </div>
      <div className="text-slate-300">
        {value} <span className="text-slate-500">({pct}%)</span>
      </div>
    </div>
  );
}
