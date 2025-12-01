import logging
import secrets
from sqlalchemy.orm import Session

from models import HiringProcess, QuestionSet
from schemas import HiringProcessCreate, JDAnalysis, QuestionSetOut, MCQQuestion, CodingQuestion, TheoryQuestion
from gemini_client import jd_agent_extract, question_generator_agent

logger = logging.getLogger("skillpick.process")


def _generate_public_token() -> str:
    return secrets.token_urlsafe(12)


def create_hiring_process(db: Session, payload: HiringProcessCreate) -> HiringProcess:
    logger.info("Creating hiring process: %s", payload.title)

    # Call JD Agent
    jd_raw = jd_agent_extract(payload.description, payload.extra_context)
    jd_analysis = JDAnalysis(
        skills=jd_raw.get("skills", []),
        role_level=jd_raw.get("role_level", "unknown"),
        tech_stack=jd_raw.get("tech_stack", []),
        experience_expectations=jd_raw.get("experience_expectations", ""),
    )
    logger.info("JD analysis complete for title=%s", payload.title)

    process = HiringProcess(
        public_token=_generate_public_token(),
        title=payload.title,
        description=payload.description,
        num_mcq=payload.num_mcq,
        num_coding=payload.num_coding,
        num_theory=payload.num_theory,
        extra_context=payload.extra_context,
        jd_skills=jd_analysis.skills,
        jd_role_level=jd_analysis.role_level,
        jd_tech_stack=jd_analysis.tech_stack,
        jd_experience_expectations=jd_analysis.experience_expectations,
    )
    db.add(process)
    db.commit()
    db.refresh(process)

    # Generate questions once per process
    questions_raw = question_generator_agent(
        job_description=process.description,
        jd_analysis={
            "skills": process.jd_skills,
            "role_level": process.jd_role_level,
            "tech_stack": process.jd_tech_stack,
            "experience_expectations": process.jd_experience_expectations,
        },
        extra_context=process.extra_context,
        num_mcq=process.num_mcq,
        num_coding=process.num_coding,
        num_theory=process.num_theory,
    )

    question_set = QuestionSet(
        process_id=process.id,
        mcq_questions=questions_raw.get("mcq", []),
        coding_questions=questions_raw.get("coding", []),
        theory_questions=questions_raw.get("theory", []),
    )
    db.add(question_set)
    db.commit()
    db.refresh(question_set)

    logger.info("Question set generated for process_id=%s", process.id)
    return process


def get_process_by_id(db: Session, process_id: int) -> HiringProcess | None:
    return db.query(HiringProcess).filter(HiringProcess.id == process_id).first()


def get_process_by_token(db: Session, token: str) -> HiringProcess | None:
    return db.query(HiringProcess).filter(HiringProcess.public_token == token).first()


def get_question_set_for_process(db: Session, process_id: int) -> QuestionSet | None:
    return db.query(QuestionSet).filter(QuestionSet.process_id == process_id).first()


def to_question_set_out(qset: QuestionSet) -> QuestionSetOut:
    mcq_objs = [MCQQuestion(**q) for q in (qset.mcq_questions or [])]
    coding_objs = [CodingQuestion(**q) for q in (qset.coding_questions or [])]
    theory_objs = [TheoryQuestion(**q) for q in (qset.theory_questions or [])]
    return QuestionSetOut(mcq=mcq_objs, coding=coding_objs, theory=theory_objs)
