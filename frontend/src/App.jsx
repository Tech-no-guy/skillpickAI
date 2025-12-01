import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

import LandingPage from "./pages/LandingPage.jsx";
import CreateProcessPage from "./pages/CreateProcessPage.jsx";
import ProcessDashboardPage from "./pages/ProcessDashboardPage.jsx";
import ProcessAnalyticsPage from "./pages/ProcessAnalyticsPage.jsx";
import CandidateRegisterPage from "./pages/CandidateRegisterPage.jsx";
import CandidateTestPage from "./pages/CandidateTestPage.jsx";
import CandidateResultPage from "./pages/CandidateResultPage.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/recruiter/create" element={<CreateProcessPage />} />
          <Route path="/recruiter/process/:processId" element={<ProcessDashboardPage />} />
          <Route path="/recruiter/process/:processId/analytics" element={<ProcessAnalyticsPage />} />
          <Route path="/test/:token" element={<CandidateRegisterPage />} />
          <Route path="/test/:token/candidate/:candidateId" element={<CandidateTestPage />} />
          <Route path="/test/:token/candidate/:candidateId/result" element={<CandidateResultPage />} />
        </Routes>
      </main>
    </div>
  );
}
