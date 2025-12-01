import os
import json
import logging
from typing import Any, Dict

import google.generativeai as genai

from config import settings

logger = logging.getLogger("skillpick.gemini")

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not set. Gemini calls will fail.")

MODEL_NAME = settings.GEMINI_MODEL


def _get_model():
    return genai.GenerativeModel(MODEL_NAME)


def _extract_json(text: str) -> Dict[str, Any]:
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find first { and last }
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            candidate = text[start : end + 1]
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                logger.error("Failed to parse JSON even after trimming.")
    raise ValueError("Gemini response is not valid JSON")


def _call_gemini_json(prompt: str) -> Dict[str, Any]:
    logger.info("Calling Gemini model=%s", MODEL_NAME)
    model = _get_model()
    response = model.generate_content(
        [
            {
                "role": "user",
                "parts": [
                    {
                        "text": prompt,
                    }
                ],
            }
        ]
    )
    text = response.text or ""
    logger.debug("Gemini raw response: %s", text[:1000])
    return _extract_json(text)


# -------- JD Agent ---------


def jd_agent_extract(job_description: str, extra_context: str | None = None) -> Dict[str, Any]:
    ctx = extra_context or ""
    prompt = f"""
You are the JD Agent in an autonomous hiring system called SkillPick AI.

Analyze the following Job Description and (optionally) extra context.
Return ONLY a JSON object in this EXACT format:

{{
  "skills": ["list", "of", "skills"],
  "role_level": "junior | mid | senior | lead | principal | manager | unknown",
  "tech_stack": ["Python", "React", "AWS"],
  "experience_expectations": "short natural language phrase"
}}

Rules:
- Return ONLY valid JSON, no markdown, no explanation.
- "skills" must be 5-20 core skills.
- "tech_stack" should list key technologies.

JOB DESCRIPTION:
\"\"\"{job_description}\"\"\"

EXTRA CONTEXT:
\"\"\"{ctx}\"\"\"
"""
    return _call_gemini_json(prompt)


# -------- Resume Agent ---------


def resume_agent_match(
    job_description: str,
    jd_analysis: Dict[str, Any],
    resume_text: str,
) -> Dict[str, Any]:
    prompt = f"""
You are the Resume Screening Agent in SkillPick AI.

Compare this JD + JD analysis with a candidate resume.
Output ONLY JSON in this exact format:

{{
  "match_score": 0-100,
  "skill_overlap": ["skill1", "skill2"],
  "experience_relevance": "short phrase",
  "summary": "2-4 sentence human-readable summary",
  "decision": "allow" | "reject"
}}

Guidelines:
- "decision" = "allow" for match_score >= 40, else "reject".
- Be strict but fair.

JOB DESCRIPTION:
\"\"\"{job_description}\"\"\"

JD ANALYSIS (JSON):
{json.dumps(jd_analysis)}

RESUME TEXT:
\"\"\"{resume_text}\"\"\"
"""
    return _call_gemini_json(prompt)


# -------- Question Generator Agent ---------


def question_generator_agent(
    job_description: str,
    jd_analysis: Dict[str, Any],
    extra_context: str | None,
    num_mcq: int,
    num_coding: int,
    num_theory: int,
) -> Dict[str, Any]:
    ctx = extra_context or ""
    prompt = f"""
You are the Question Generator Agent in SkillPick AI.

Generate technical assessment questions based on the JD and JD analysis.
Return ONLY JSON in this EXACT structure:

{{
  "mcq": [
    {{
      "id": "mcq1",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct_index": 0,
      "skill": "Python"
    }}
  ],
  "coding": [
    {{
      "id": "code1",
      "title": "Implement X",
      "description": "Detailed description of the task",
      "difficulty": "easy | medium | hard",
      "expected_time_minutes": 20,
      "skill": "Data Structures"
    }}
  ],
  "theory": [
    {{
      "id": "theory1",
      "question": "Explain concept Y",
      "skill": "System Design"
    }}
  ]
}}

Constraints:
- Generate EXACTLY {num_mcq} MCQ questions.
- Generate EXACTLY {num_coding} coding questions.
- Generate EXACTLY {num_theory} theory questions.
- MCQs should be single-correct-answer.
- Make questions aligned with the JD skills and tech stack.

JOB DESCRIPTION:
\"\"\"{job_description}\"\"\"

JD ANALYSIS (JSON):
{json.dumps(jd_analysis)}

EXTRA CONTEXT FOR QUESTION STYLE:
\"\"\"{ctx}\"\"\"
"""
    return _call_gemini_json(prompt)


# -------- Code Evaluation Agent ---------


def code_evaluation_agent(
    coding_questions: Dict[str, Any],
    candidate_code_answers: Dict[str, str],
) -> Dict[str, Any]:
    prompt = f"""
You are the Code Evaluation Agent for SkillPick AI.

You will receive coding questions and the candidate's submitted code.
Evaluate QUALITY, READABILITY, CORRECTNESS, and EFFICIENCY.

Return ONLY JSON in this format:

{{
  "per_question": [
    {{
      "question_id": "code1",
      "score": 0-100,
      "feedback": "short feedback"
    }}
  ],
  "total_score": 0-100,
  "summary": "2-4 sentence summary"
}}

CODING QUESTIONS (JSON):
{json.dumps(coding_questions)}

CANDIDATE CODE ANSWERS (JSON MAP question_id -> code):
{json.dumps(candidate_code_answers)}
"""
    return _call_gemini_json(prompt)


# -------- Theory Evaluation Agent ---------


def theory_evaluation_agent(
    theory_questions: Dict[str, Any],
    candidate_theory_answers: Dict[str, str],
) -> Dict[str, Any]:
    prompt = f"""
You are the Theory Evaluation Agent for SkillPick AI.

You will receive open-ended theory questions and candidate's answers.

Return ONLY JSON in this format:

{{
  "per_question": [
    {{
      "question_id": "theory1",
      "score": 0-100,
      "feedback": "short feedback"
    }}
  ],
  "total_score": 0-100,
  "summary": "2-4 sentence summary"
}}

THEORY QUESTIONS (JSON):
{json.dumps(theory_questions)}

CANDIDATE THEORY ANSWERS (JSON MAP question_id -> answer):
{json.dumps(candidate_theory_answers)}
"""
    return _call_gemini_json(prompt)


# -------- Summary Agent ---------


def summary_agent(
    jd_analysis: Dict[str, Any],
    resume_result: Dict[str, Any],
    mcq_score: float,
    code_eval_result: Dict[str, Any],
    theory_eval_result: Dict[str, Any],
) -> Dict[str, Any]:
    prompt = f"""
You are the Final Summary Agent for SkillPick AI.

Summarize the candidate's performance across RESUME, MCQ, CODING, and THEORY
into a final hiring recommendation.

Return ONLY JSON in this EXACT format:

{{
  "overall_score": 0-100,
  "strengths": ["point1", "point2"],
  "weaknesses": ["point1", "point2"],
  "verdict": "strong_hire" | "hire" | "borderline" | "reject",
  "explanation": "3-6 sentences summarizing the candidate"
}}

Reference Data:

JD ANALYSIS:
{json.dumps(jd_analysis)}

RESUME RESULT:
{json.dumps(resume_result)}

MCQ SCORE: {mcq_score}

CODE EVAL RESULT:
{json.dumps(code_eval_result)}

THEORY EVAL RESULT:
{json.dumps(theory_eval_result)}
"""
    return _call_gemini_json(prompt)
