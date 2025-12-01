import React from "react";

export default function SkillGauge({ averageResumeMatch }) {
  const value = averageResumeMatch || 0;
  const max = 100;
  const pct = value / max;

  let color = "text-rose-400";
  if (value >= 75) color = "text-emerald-400";
  else if (value >= 50) color = "text-amber-300";

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative h-24 w-48 overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-slate-900 rounded-b-full" />
        <div className="absolute inset-0 flex items-end justify-center">
          <div
            className="h-20 w-20 rounded-full border-2 border-slate-700 flex items-center justify-center"
            style={{
              boxShadow: "0 0 40px rgba(129, 140, 248, 0.4)"
            }}
          >
            <div className={`text-xl font-semibold ${color}`}>
              {value.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
      <div className="text-xs text-slate-300">
        Average Resume Match (% of JD skills)
      </div>
    </div>
  );
}
