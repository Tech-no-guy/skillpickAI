import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ScoreBarChart from "../components/charts/ScoreBarChart.jsx";
import ScorePieChart from "../components/charts/ScorePieChart.jsx";
import TrendLineChart from "../components/charts/TrendLineChart.jsx";
import SkillGauge from "../components/charts/SkillGuage.jsx";
import ScoreBadge from "../components/ScoreBadge.jsx";

import { getProcessAnalytics } from "../api.js";

export default function ProcessAnalyticsPage() {
  const { processId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getProcessAnalytics(processId);
        setAnalytics(data);
      } catch (err) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, [processId]);

  if (loading) {
    return (
      <div className="flex justify-center pt-10">
        <LoadingSpinner label="Loading analytics..." />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-3">
        <p className="text-sm text-rose-300">{error || "No analytics"}</p>
        <Link
          to={`/recruiter/process/${processId}`}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-medium"
        >
          Back to process
        </Link>
      </div>
    );
  }

  const { overview, candidates } = analytics;

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">
            Analytics — {overview.title}
          </h1>
          <p className="text-xs text-slate-400">
            Process ID: {overview.process_id} • Created:{" "}
            {new Date(overview.created_at).toLocaleString()}
          </p>
        </div>
        <Link
          to={`/recruiter/process/${overview.process_id}`}
          className="px-3 py-1.5 rounded-xl border border-slate-700 hover:border-brand-500 text-xs"
        >
          Back to Process
        </Link>
      </div>

      <section className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 flex flex-wrap gap-3">
          <ScoreBadge label="Avg Overall Score" value={overview.average_overall_score} />
          <ScoreBadge label="Avg Resume Match" value={overview.average_resume_match} />
        </div>
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-slate-200">Candidates</p>
          <p className="text-slate-300">
            Total: {overview.total_candidates}
            <br />
            Completed: {overview.completed_candidates}
          </p>
        </div>
        <div className="flex items-center justify-center">
          <SkillGauge averageResumeMatch={overview.average_resume_match} />
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 border border-slate-800 rounded-2xl p-4 bg-slate-900/40">
          <h2 className="text-sm font-semibold text-slate-200 mb-3">
            Top Candidate Overall Scores
          </h2>
          <ScoreBarChart candidates={candidates} />
        </div>
        <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/40">
          <h2 className="text-sm font-semibold text-slate-200 mb-3">
            Verdict Distribution
          </h2>
          <ScorePieChart candidates={candidates} />
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/40 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">
            Overall Score Trend
          </h2>
          <TrendLineChart candidates={candidates} />
        </div>
        <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/40">
          <h2 className="text-sm font-semibold text-slate-200 mb-2">
            Candidate Table
          </h2>
          <div className="max-h-64 overflow-auto">
            <table className="w-full text-[11px] text-left">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-1 pr-2">Name</th>
                  <th className="py-1 pr-2">Resume</th>
                  <th className="py-1 pr-2">MCQ</th>
                  <th className="py-1 pr-2">Code</th>
                  <th className="py-1 pr-2">Theory</th>
                  <th className="py-1 pr-2">Overall</th>
                  <th className="py-1">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.candidate_id} className="border-b border-slate-900">
                    <td className="py-1 pr-2">{c.name}</td>
                    <td className="py-1 pr-2">{c.resume_match_score.toFixed(1)}</td>
                    <td className="py-1 pr-2">{c.mcq_score.toFixed(1)}</td>
                    <td className="py-1 pr-2">{c.coding_score.toFixed(1)}</td>
                    <td className="py-1 pr-2">{c.theory_score.toFixed(1)}</td>
                    <td className="py-1 pr-2">{c.overall_score.toFixed(1)}</td>
                    <td className="py-1 capitalize">{c.final_verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Scores are aggregated from MCQ auto-grading, Code Evaluation Agent
            and Theory Evaluation Agent, then normalized by the Summary Agent.
          </p>
        </div>
      </section>
    </section>
  );
}
