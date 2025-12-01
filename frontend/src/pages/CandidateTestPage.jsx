import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { submitCandidateAnswers } from "../api.js";

export default function CandidateTestPage() {
  const { token, candidateId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const questions = location.state?.questions;

  const [answers, setAnswers] = React.useState({
    mcq_answers: {},
    coding_answers: {},
    theory_answers: {}
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  if (!questions) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-3">
        <p className="text-sm text-amber-300">
          Test data missing. Please reopen the test from your resume upload
          step.
        </p>
      </div>
    );
  }

  function handleMCQChange(qid, idx) {
    setAnswers((a) => ({
      ...a,
      mcq_answers: {
        ...a.mcq_answers,
        [qid]: idx
      }
    }));
  }

  function handleCodingChange(qid, value) {
    setAnswers((a) => ({
      ...a,
      coding_answers: {
        ...a.coding_answers,
        [qid]: value
      }
    }));
  }

  function handleTheoryChange(qid, value) {
    setAnswers((a) => ({
      ...a,
      theory_answers: {
        ...a.theory_answers,
        [qid]: value
      }
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        mcq_answers: answers.mcq_answers,
        coding_answers: answers.coding_answers,
        theory_answers: answers.theory_answers
      };
      const result = await submitCandidateAnswers(candidateId, payload);
      navigate(`/test/${token}/candidate/${candidateId}/result`, {
        state: { result }
      });
    } catch (err) {
      setError(err.message || "Failed to submit answers");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">SkillPick AI Assessment</h1>
        <p className="text-xs text-slate-400">
          Please attempt all sections. Your answers will be evaluated by the AI
          agents. You can submit once.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 border border-slate-800 rounded-2xl p-5 bg-slate-900/40"
      >
        {/* MCQ Section */}
        {questions.mcq.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">
              Section 1 — MCQ
            </h2>
            {questions.mcq.map((q, idx) => (
              <div
                key={q.id}
                className="space-y-2 border border-slate-800 rounded-xl p-3"
              >
                <p className="text-xs text-slate-200">
                  Q{idx + 1}. {q.question}
                </p>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-pointer ${
                        answers.mcq_answers[q.id] === optIdx
                          ? "border-brand-500 bg-brand-500/10"
                          : "border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        className="h-3 w-3"
                        checked={answers.mcq_answers[q.id] === optIdx}
                        onChange={() => handleMCQChange(q.id, optIdx)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Coding Section */}
        {questions.coding.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">
              Section 2 — Coding
            </h2>
            {questions.coding.map((q, idx) => (
              <div
                key={q.id}
                className="space-y-2 border border-slate-800 rounded-xl p-3"
              >
                <p className="text-xs text-slate-200">
                  Q{idx + 1}. {q.title}
                </p>
                <p className="text-[11px] text-slate-300 whitespace-pre-wrap">
                  {q.description}
                </p>
                <textarea
                  rows={8}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:border-brand-500 font-mono"
                  placeholder="// Write your solution here (any language)"
                  value={answers.coding_answers[q.id] || ""}
                  onChange={(e) => handleCodingChange(q.id, e.target.value)}
                />
              </div>
            ))}
          </section>
        )}

        {/* Theory Section */}
        {questions.theory.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">
              Section 3 — Theory
            </h2>
            {questions.theory.map((q, idx) => (
              <div
                key={q.id}
                className="space-y-2 border border-slate-800 rounded-xl p-3"
              >
                <p className="text-xs text-slate-200">
                  Q{idx + 1}. {q.question}
                </p>
                <textarea
                  rows={5}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
                  placeholder="Write your explanation in detail..."
                  value={answers.theory_answers[q.id] || ""}
                  onChange={(e) => handleTheoryChange(q.id, e.target.value)}
                />
              </div>
            ))}
          </section>
        )}

        {error && (
          <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-medium disabled:opacity-60"
          >
            {submitting ? (
              <LoadingSpinner label="Submitting..." />
            ) : (
              "Submit Assessment"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
