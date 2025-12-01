import logging
from typing import Dict, Any
from sqlalchemy.orm import Session

from models import Candidate, QuestionSet, Evaluation
from schemas import (
    CandidateTestSubmission,
    EvaluationOut,
)
from gemini_client import (
    code_evaluation_agent,
    theory_evaluation_agent,
    summary_agent,
)

logger = logging.getLogger("skillpick.evaluation")


def _evaluate_mcq(mcq_questions: list[dict], mcq_answers: Dict[str, int]) -> float:
    if not mcq_questions:
        return 0.0
    total = len(mcq_questions)
    correct = 0
    for q in mcq_questions:
        qid = q.get("id")
        if qid in mcq_answers:
            selected = mcq_answers[qid]
            if selected == q.get("correct_index"):
                correct += 1
    return (correct / total) * 100.0


def evaluate_candidate(
    db: Session,
    candidate: Candidate,
    question_set: QuestionSet,
    submission: CandidateTestSubmission,
) -> EvaluationOut:
    logger.info("Evaluating candidate_id=%s", candidate.id)

    mcq_questions = question_set.mcq_questions or []
    coding_questions = question_set.coding_questions or []
    theory_questions = question_set.theory_questions or []

    # MCQ evaluation
    mcq_score = _evaluate_mcq(mcq_questions, submission.mcq_answers)
    logger.info("MCQ score for candidate_id=%s: %.2f", candidate.id, mcq_score)

    # Code evaluation via agent
    code_eval_raw: Dict[str, Any] = code_evaluation_agent(
        coding_questions=coding_questions,
        candidate_code_answers=submission.coding_answers,
    )
    coding_score = float(code_eval_raw.get("total_score", 0.0))

    # Theory evaluation via agent
    theory_eval_raw: Dict[str, Any] = theory_evaluation_agent(
        theory_questions=theory_questions,
        candidate_theory_answers=submission.theory_answers,
    )
    theory_score = float(theory_eval_raw.get("total_score", 0.0))

    # Summary agent
    jd_analysis_dict = {
        "skills": candidate.process.jd_skills,
        "role_level": candidate.process.jd_role_level,
        "tech_stack": candidate.process.jd_tech_stack,
        "experience_expectations": candidate.process.jd_experience_expectations,
    }
    resume_result = {
        "match_score": candidate.resume_match_score,
        "skill_overlap": candidate.resume_skill_overlap,
        "experience_relevance": candidate.resume_experience_relevance,
        "summary": candidate.resume_summary,
        "decision": candidate.resume_decision,
    }

    summary_raw: Dict[str, Any] = summary_agent(
        jd_analysis=jd_analysis_dict,
        resume_result=resume_result,
        mcq_score=mcq_score,
        code_eval_result=code_eval_raw,
        theory_eval_result=TheoryEvalShim(theory_eval_raw),
    )

    overall_score = float(summary_raw.get("overall_score", 0.0))
    strengths = summary_raw.get("strengths", []) or []
    weaknesses = summary_raw.get("weaknesses", []) or []
    verdict = summary_raw.get("verdict", "borderline")
    explanation = summary_raw.get("explanation", "")

    eval_obj = Evaluation(
        candidate_id=candidate.id,
        mcq_score=mcq_score,
        coding_score=coding_score,
        theory_score=theory_score,
        resume_match_score=candidate.resume_match_score or 0.0,
        overall_score=overall_score,
        strengths=strengths,
        weaknesses=weaknesses,
        final_verdict=verdict,
        summary=explanation,
        raw_agent_responses={
            "code_eval": code_eval_raw,
            "theory_eval": theory_eval_raw,
            "summary": summary_raw,
        },
    )
    db.add(eval_obj)
    db.commit()
    db.refresh(eval_obj)

    return EvaluationOut(
        mcq_score=mcq_score,
        coding_score=coding_score,
        theory_score=theory_score,
        resume_match_score=eval_obj.resume_match_score,
        overall_score=eval_obj.overall_score,
        strengths=strengths,
        weaknesses=weaknesses,
        final_verdict=verdict,
        summary=explanation,
    )


def TheoryEvalShim(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Thin shim in case we want to pre-process theory eval before sending to summary agent.
    For now, just return as-is.
    """
    return raw
