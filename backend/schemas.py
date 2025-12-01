from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Dict, Any


# ---------- JD / Process ----------


class JDAnalysis(BaseModel):
    skills: List[str] = []
    role_level: str = "unknown"
    tech_stack: List[str] = []
    experience_expectations: str = ""


class HiringProcessCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: str
    num_mcq: int = Field(..., ge=0, le=30)
    num_coding: int = Field(..., ge=0, le=10)
    num_theory: int = Field(..., ge=0, le=20)
    extra_context: Optional[str] = None


class HiringProcessOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    public_token: str
    title: str
    description: str
    num_mcq: int
    num_coding: int
    num_theory: int
    extra_context: Optional[str]
    jd_analysis: JDAnalysis


class PublicProcessInfo(BaseModel):
    title: str
    description: str
    jd_analysis: JDAnalysis
    instructions: str


# ---------- Questions / Candidate ----------


class MCQQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_index: int
    skill: Optional[str] = None


class CodingQuestion(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str
    expected_time_minutes: int
    skill: Optional[str] = None


class TheoryQuestion(BaseModel):
    id: str
    question: str
    skill: Optional[str] = None


class QuestionSetOut(BaseModel):
    mcq: List[MCQQuestion]
    coding: List[CodingQuestion]
    theory: List[TheoryQuestion]


class CandidateRegisterResponse(BaseModel):
    status: str  # "accepted" | "rejected"
    candidate_id: Optional[int] = None
    message: str
    resume_match_score: Optional[float] = None
    resume_summary: Optional[str] = None
    questions: Optional[QuestionSetOut] = None


class CandidateTestSubmission(BaseModel):
    mcq_answers: Dict[str, int]  # question_id -> selected option index
    coding_answers: Dict[str, str]  # question_id -> code
    theory_answers: Dict[str, str]  # question_id -> text


# ---------- Evaluation / Analytics ----------


class CodeQuestionScore(BaseModel):
    question_id: str
    score: float
    feedback: str


class TheoryQuestionScore(BaseModel):
    question_id: str
    score: float
    feedback: str


class CodeEvaluationResult(BaseModel):
    per_question: List[CodeQuestionScore]
    total_score: float
    summary: str


class TheoryEvaluationResult(BaseModel):
    per_question: List[TheoryQuestionScore]
    total_score: float
    summary: str


class SummaryAgentResult(BaseModel):
    overall_score: float
    strengths: List[str]
    weaknesses: List[str]
    verdict: str
    explanation: str


class EvaluationOut(BaseModel):
    mcq_score: float
    coding_score: float
    theory_score: float
    resume_match_score: float
    overall_score: float
    strengths: List[str]
    weaknesses: List[str]
    final_verdict: str
    summary: str


class CandidateAnalyticsItem(BaseModel):
    candidate_id: int
    name: str
    email: str
    resume_match_score: float
    mcq_score: float
    coding_score: float
    theory_score: float
    overall_score: float
    final_verdict: str


class ProcessAnalyticsOverview(BaseModel):
    process_id: int
    title: str
    total_candidates: int
    completed_candidates: int
    average_overall_score: float
    average_resume_match: float
    created_at: str


class ProcessAnalyticsResponse(BaseModel):
    overview: ProcessAnalyticsOverview
    candidates: List[CandidateAnalyticsItem]
