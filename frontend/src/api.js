// api.js
// Fixed version — fully compatible with your FastAPI backend

const API_BASE_URL = "http://localhost:8000";

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    let detail = text;
    try {
      const json = JSON.parse(text);
      detail = json.detail || text;
    } catch {}
    throw new Error(detail || `HTTP ${res.status}`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

// ----------------------------------------------
// PROCESS ROUTES
// ----------------------------------------------

export async function createProcess(payload) {
  const res = await fetch(`${API_BASE_URL}/api/processes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function getProcess(processId) {
  const res = await fetch(`${API_BASE_URL}/api/processes/${processId}`);
  return handleResponse(res);
}

export async function getPublicProcessInfo(token) {
  const res = await fetch(`${API_BASE_URL}/api/processes/public/${token}`);
  return handleResponse(res);
}

// ----------------------------------------------
// CANDIDATE ROUTES — FIXED
// ----------------------------------------------

export async function registerCandidate(token, formData) {
  const res = await fetch(
    `${API_BASE_URL}/api/candidates/register/${token}`,
    {
      method: "POST",
      body: formData
    }
  );
  return handleResponse(res);
}

export async function submitCandidateAnswers(candidateId, payload) {
  const res = await fetch(
    `${API_BASE_URL}/api/candidates/${candidateId}/submit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  );
  return handleResponse(res);
}

export async function getCandidateResult(candidateId) {
  const res = await fetch(
    `${API_BASE_URL}/api/candidates/${candidateId}/result`
  );
  return handleResponse(res);
}

// ----------------------------------------------
// ANALYTICS ROUTES
// ----------------------------------------------

export async function getProcessAnalytics(processId) {
  const res = await fetch(
    `${API_BASE_URL}/api/analytics/process/${processId}`
  );
  return handleResponse(res);
}
