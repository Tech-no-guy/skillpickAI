import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPublicProcessInfo, registerCandidate } from "../api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function CandidateRegisterPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [process, setProcess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", resume: null });
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPublicProcessInfo(token);
        setProcess(data);
      } catch (err) {
        setError(err.message || "Invalid test link");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  function handleFieldChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null;
    setForm((f) => ({ ...f, resume: file }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.resume) {
      setError("Please upload your resume as PDF.");
      return;
    }
    setError("");
    setRegistering(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("resume", form.resume);
      const data = await registerCandidate(token, fd);
      setResult(data);
      if (data.status === "accepted" && data.candidate_id) {
        // send to test page with questions in state
        navigate(`/test/${token}/candidate/${data.candidate_id}`, {
          state: { questions: data.questions }
        });
      }
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center pt-10">
        <LoadingSpinner label="Loading test..." />
      </div>
    );
  }

  if (error || !process) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-3">
        <p className="text-sm text-rose-300">{error || "Test not found"}</p>
      </div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{process.title}</h1>
        <p className="text-xs text-slate-400">
          This assessment is powered by SkillPick AI. Your resume will be
          screened against the job description. If selected, a tailored test
          will be unlocked automatically.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2 text-xs text-slate-300">
          <h2 className="text-sm font-semibold text-slate-200">About the role</h2>
          <p className="whitespace-pre-wrap">{process.description}</p>
          <div>
            <p className="font-semibold text-slate-200 mt-3 mb-1 text-xs">
              JD Agent — key skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {process.jd_analysis.skills.map((s) => (
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
        <div className="space-y-2 text-xs">
          <h2 className="text-sm font-semibold text-slate-200">
            Candidate Instructions
          </h2>
          <p className="text-slate-300">{process.instructions}</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-slate-300">
            <li>Upload your resume as a single PDF file.</li>
            <li>Use a desktop browser for the coding section.</li>
            <li>
              You will see the test immediately if the Resume Agent approves
              your profile.
            </li>
          </ul>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 border border-slate-800 rounded-2xl p-5 bg-slate-900/40"
      >
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleFieldChange}
            required
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleFieldChange}
            required
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">
            Resume (PDF)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full text-xs"
          />
        </div>

        {error && (
          <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {result && (
          <div
            className={`text-xs rounded-xl px-3 py-2 border ${
              result.status === "accepted"
                ? "border-emerald-700 bg-emerald-950/40 text-emerald-200"
                : "border-amber-700 bg-amber-950/40 text-amber-200"
            }`}
          >
            <p className="font-semibold mb-1">{result.message}</p>
            <p>Resume match score: {result.resume_match_score?.toFixed(1)}</p>
            {result.resume_summary && (
              <p className="mt-1 text-slate-200">{result.resume_summary}</p>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <p className="text-[11px] text-slate-500">
            By continuing, you agree that your responses will be used for
            evaluation only.
          </p>
          <button
            type="submit"
            disabled={registering}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-medium disabled:opacity-60"
          >
            {registering ? (
              <LoadingSpinner label="Submitting..." />
            ) : (
              "Upload Resume & Continue"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
