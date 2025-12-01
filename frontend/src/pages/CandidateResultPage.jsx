import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getCandidateResult } from "../api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ScoreBadge from "../components/ScoreBadge.jsx";

export default function CandidateResultPage() {
  const { candidateId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!result) {
      (async () => {
        setLoading(true);
        setError("");
        try {
          const data = await getCandidateResult(candidateId);
          setResult(data);
        } catch (err) {
          setError(err.message || "Failed to load result");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [candidateId, result]);

  if (loading) {
    return (
      <div className="flex justify-center pt-10">
        <LoadingSpinner label="Loading result..." />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-3">
        <p className="text-sm text-rose-300">{error || "Result not found"}</p>
      </div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Thank you for submitting</h1>
        <p className="text-xs text-slate-400">
          Your responses have been evaluated by the SkillPick AI agents.
        </p>
      </header>

      <section className="flex flex-wrap gap-3 justify-center">
        <ScoreBadge label="Overall" value={result.overall_score} />
        <ScoreBadge label="Resume Match" value={result.resume_match_score} />
        <ScoreBadge label="MCQ" value={result.mcq_score} />
        <ScoreBadge label="Coding" value={result.coding_score} />
        <ScoreBadge label="Theory" value={result.theory_score} />
      </section>

      <section className="grid md:grid-cols-2 gap-4 text-xs">
        <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/40">
          <h2 className="text-sm font-semibold text-slate-200 mb-2">
            Strengths
          </h2>
          <ul className="space-y-1 text-slate-300 list-disc list-inside">
            {result.strengths.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/40">
          <h2 className="text-sm font-semibold text-slate-200 mb-2">
            Areas to Improve
          </h2>
          <ul className="space-y-1 text-slate-300 list-disc list-inside">
            {result.weaknesses.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border border-slate-800 rounded-2xl p-4 bg-slate-900/40 text-xs space-y-2">
        <h2 className="text-sm font-semibold text-slate-200">AI Summary</h2>
        <p className="text-slate-300 whitespace-pre-wrap">{result.summary}</p>
        <p className="text-[11px] text-slate-500 mt-2">
          Note: Final hiring decisions are always made by human reviewers. This
          AI-generated feedback is intended to support that process.
        </p>
      </section>
    </section>
  );
}
