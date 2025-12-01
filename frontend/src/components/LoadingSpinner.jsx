import React from "react";

export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
      <div className="h-4 w-4 rounded-full border-2 border-slate-600 border-t-brand-500 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
