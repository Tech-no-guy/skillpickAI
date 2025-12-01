import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { getProcess } from "../api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function ProcessDashboardPage() {
  const { processId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [process, setProcess] = useState(location.state?.process || null);
  const [loading, setLoading] = useState(!location.state?.process);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!process) {
      (async () => {
        setLoading(true);
        setError("");
        try {
          const data = await getProcess(processId);
          setProcess(data);
        } catch (err) {
          setError(err.message || "Failed to load process");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [processId, process]);

  if (loading) {
    return (
      <div className="flex justify-center pt-10">
        <LoadingSpinner label="Loading process..." />
      </div>
    );
  }

  if (error || !process) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-3">
        <p className="text-sm text-rose-300">{error || "Process not found"}</p>
        <button
          onClick={() => navigate("/recruiter/create")}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-medium"
        >
          Create new process
        </button>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/test/${process.public_token}`;

  return (
    <section className="space-y-6">
      <div className="flex justify-between gap-3 items-start">
        <div>
          <h1 className="text-2xl font-semibold mb-1">{process.title}</h1>
          <p className="text-xs text-slate-400">
            Process ID: {process.id} • Token: {process.public_token}
          </p>
        </div>
        <Link
          to={`/recruiter/process/${process.id}/analytics`}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-brand-500 text-xs"
        >
          View Analytics
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">
            Job Description
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap">
            {process.description}
          </p>
        </div>
        <div className="space-y-4 border border-slate-800 rounded-2xl p-4 bg-slate-900/40">
          <h3 className="text-sm font-semibold text-slate-200">Assessment</h3>
          <div className="text-xs text-slate-300 space-y-1">
            <p>MCQ: {process.num_mcq}</p>
            <p>Coding: {process.num_coding}</p>
            <p>Theory: {process.num_theory}</p>
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-slate-200">Public Test Link</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={publicUrl}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-[11px]"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(publicUrl)}
                className="px-2 py-1 rounded-lg border border-slate-700 text-[11px] hover:border-brand-500"
              >
                Copy
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Share this link with candidates. They will upload resumes and
              attempt the AI-generated test.
            </p>
          </div>
        </div>
      </div>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <h2 className="text-sm font-semibold text-slate-200">
            JD Agent Analysis
          </h2>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
            <span className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700">
              Role level:{" "}
              <span className="font-semibold text-brand-300">
                {process.jd_analysis?.role_level || "unknown"}
              </span>
            </span>
            {process.jd_analysis?.tech_stack?.map((t) => (
              <span
                key={t}
                className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="text-xs text-slate-300">
            <p className="font-semibold mb-1">Key skills:</p>
            <div className="flex flex-wrap gap-1.5">
              {process.jd_analysis?.skills?.map((s) => (
                <span
                  key={s}
                  className="px-2 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-1 text-xs border border-slate-800 rounded-2xl p-4 bg-slate-900/40">
          <p className="font-semibold text-slate-200 text-sm">
            Experience Expectations
          </p>
          <p className="text-slate-300">
            {process.jd_analysis?.experience_expectations ||
              "Captured from JD by JD Agent."}
          </p>
        </div>
      </section>
    </section>
  );
}
