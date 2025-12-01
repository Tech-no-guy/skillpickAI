import logging
from sqlalchemy.orm import Session

from models import Candidate, QuestionSet, CandidateResponse
from schemas import (
    CandidateRegisterResponse,
    CandidateTestSubmission,
)
from utils.pdf_reader import extract_text_from_pdf_bytes
from gemini_client import resume_agent_match

logger = logging.getLogger("skillpick.candidate")


def register_candidate_and_screen(
    db: Session,
    process,
    question_set: QuestionSet,
    name: str,
    email: str,
    resume_bytes: bytes,
) -> CandidateRegisterResponse:
    logger.info("Registering candidate name=%s email=%s process_id=%s", name, email, process.id)

    resume_text = extract_text_from_pdf_bytes(resume_bytes)
    logger.info("Extracted resume text length=%s", len(resume_text))

    jd_analysis_dict = {
        "skills": process.jd_skills,
        "role_level": process.jd_role_level,
        "tech_stack": process.jd_tech_stack,
        "experience_expectations": process.jd_experience_expectations,
    }

    resume_result = resume_agent_match(
        job_description=process.description,
        jd_analysis=jd_analysis_dict,
        resume_text=resume_text,
    )

    match_score = float(resume_result.get("match_score", 0.0))
    decision = resume_result.get("decision", "reject")
    summary = resume_result.get("summary", "")
    skill_overlap = resume_result.get("skill_overlap", [])
    experience_relevance = resume_result.get("experience_relevance", "")

    status = "accepted" if decision == "allow" else "rejected"

    candidate = Candidate(
        process_id=process.id,
        name=name,
        email=email,
        resume_text=resume_text,
        resume_match_score=match_score,
        resume_skill_overlap=skill_overlap,
        resume_experience_relevance=experience_relevance,
        resume_decision=decision,
        resume_summary=summary,
        status=status if status == "accepted" else "rejected",
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    if status == "rejected":
        logger.info("Candidate %s rejected at resume screening.", candidate.id)
        return CandidateRegisterResponse(
            status="rejected",
            candidate_id=candidate.id,
            message="Your resume does not sufficiently match this role at this time.",
            resume_match_score=match_score,
            resume_summary=summary,
            questions=None,
        )

    logger.info("Candidate %s accepted for test.", candidate.id)
    from services.process_service import to_question_set_out

    q_out = to_question_set_out(question_set)

    return CandidateRegisterResponse(
        status="accepted",
        candidate_id=candidate.id,
        message="You are eligible to take this assessment. Good luck!",
        resume_match_score=match_score,
        resume_summary=summary,
        questions=q_out,
    )


def store_candidate_submission(
    db: Session,
    candidate: Candidate,
    submission: CandidateTestSubmission,
) -> CandidateResponse:
    logger.info("Storing test submission for candidate_id=%s", candidate.id)

    resp = CandidateResponse(
        candidate_id=candidate.id,
        mcq_answers=submission.mcq_answers,
        coding_answers=submission.coding_answers,
        theory_answers=submission.theory_answers,
    )
    db.add(resp)
    candidate.status = "completed"
    db.commit()
    db.refresh(resp)
    return resp
