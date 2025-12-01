import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <section className="space-y-10">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
            SkillPick AI
            <span className="block text-lg sm:text-xl text-brand-300 mt-2">
              Autonomous Hiring &amp; Assessment Agent
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            SkillPick AI is a multi-agent hiring assistant built for the{" "}
            <span className="font-semibold text-brand-300">
              Kaggle AI Agents Capstone (Nov 2025)
            </span>
            . It automates the end-to-end flow of technical hiring — from JD
            understanding, resume screening, question generation and test
            evaluation, to recruiter-ready analytics.
          </p>

          <div className="space-y-3 text-xs sm:text-sm">
            <h2 className="font-semibold text-slate-200 text-sm">
              Multi-Agent AI Engine
            </h2>
            <ul className="grid grid-cols-2 gap-2 text-slate-300">
              <li>• JD Agent</li>
              <li>• Resume Agent</li>
              <li>• Question Generator Agent</li>
              <li>• Code Evaluation Agent</li>
              <li>• Theory Evaluation Agent</li>
              <li>• Final Summary Agent</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/recruiter/create"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs sm:text-sm font-medium shadow"
            >
              Recruiter Portal
            </Link>
            <Link
              to="/test/demo-token"
              className="px-4 py-2 rounded-xl border border-slate-700 hover:border-brand-500 text-xs sm:text-sm"
            >
              Candidate Test (Demo)
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">
            Workflow Overview
          </h3>
          <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
            <li>
              Recruiter creates a hiring process with JD + question counts.
            </li>
            <li>
              JD Agent extracts skills, role-level, tech stack &amp; experience.
            </li>
            <li>
              Candidate opens a public test link, uploads resume.
            </li>
            <li>
              Resume Agent screens profile; only eligible candidates continue.
            </li>
            <li>
              Question Generator Agent serves MCQ, coding and theory questions.
            </li>
            <li>
              Code &amp; Theory Evaluation Agents score the test.
            </li>
            <li>
              Final Summary Agent produces an overall verdict and insights.
            </li>
            <li>
              Recruiter dashboard shows per-candidate scores &amp; charts.
            </li>
          </ol>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <h4 className="font-semibold text-slate-200 mb-1">
                Backend Stack
              </h4>
              <ul className="space-y-1 text-slate-300">
                <li>• FastAPI</li>
                <li>• SQLAlchemy + SQLite</li>
                <li>• Pydantic v2</li>
                <li>• google-generativeai (Gemini)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-1">
                Frontend Stack
              </h4>
              <ul className="space-y-1 text-slate-300">
                <li>• React + Vite</li>
                <li>• React Router</li>
                <li>• Tailwind CSS v4</li>
                <li>• Minimal, deploy-ready UI</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-3 text-xs sm:text-sm text-slate-300">
        <h2 className="text-sm font-semibold text-slate-200">
          Kaggle Submission Notes
        </h2>
        <p>
          This repository satisfies the Kaggle AI Agents Capstone requirements:
          a multi-agent system with custom Gemini tools, long-running state
          across the hiring process, observable logging on the backend, and a
          deploy-ready FastAPI + React stack. All sensitive configuration, such
          as API keys, is injected via environment variables using{" "}
          <code>.env</code>.
        </p>
      </section>
    </section>
  );
}
