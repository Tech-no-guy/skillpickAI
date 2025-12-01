import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProcess } from "../api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function CreateProcessPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    num_mcq: 5,
    num_coding: 1,
    num_theory: 2,
    extra_context: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        name.startsWith("num_") && value !== "" ? parseInt(value, 10) : value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await createProcess(form);
      navigate(`/recruiter/process/${data.id}`, { state: { process: data } });
    } catch (err) {
      setError(err.message || "Failed to create process");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Create Hiring Process</h1>
        <p className="text-xs text-slate-400">
          Define the job description and question distribution. SkillPick AI
          will analyse the JD and generate a tailored assessment.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 border border-slate-800 rounded-2xl p-5 bg-slate-900/40"
      >
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">
            Job Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            placeholder="e.g. Backend Engineer (Python, FastAPI)"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">
            Job Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={6}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            placeholder="Paste the full JD here, including responsibilities, requirements and preferred skills."
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">
            Extra Context (optional)
          </label>
          <textarea
            name="extra_context"
            value={form.extra_context}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            placeholder="Any constraints, company culture notes, or custom evaluation hints."
          />
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <NumberField
            label="MCQ count"
            name="num_mcq"
            value={form.num_mcq}
            onChange={handleChange}
          />
          <NumberField
            label="Coding questions"
            name="num_coding"
            value={form.num_coding}
            onChange={handleChange}
          />
          <NumberField
            label="Theory questions"
            name="num_theory"
            value={form.num_theory}
            onChange={handleChange}
          />
        </div>

        {error && (
          <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <p className="text-[11px] text-slate-400">
            On submission, the JD Agent and Question Generator Agent will run
            automatically.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-medium disabled:opacity-60"
          >
            {loading ? <LoadingSpinner label="Creating..." /> : "Create Process"}
          </button>
        </div>
      </form>
    </section>
  );
}

function NumberField({ label, name, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-200">{label}</label>
      <input
        type="number"
        name={name}
        min={0}
        max={50}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
      />
    </div>
  );
}
