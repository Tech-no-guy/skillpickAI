from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from services import process_service
from schemas import (
    HiringProcessCreate,
    HiringProcessOut,
    JDAnalysis,
    PublicProcessInfo,
)

router = APIRouter(prefix="/api/processes", tags=["processes"])


# ---------------------------------------------
# CREATE HIRING PROCESS (Recruiter)
# ---------------------------------------------
@router.post("", response_model=HiringProcessOut)
def create_process(payload: HiringProcessCreate, db: Session = Depends(get_db)):
    process = process_service.create_hiring_process(db, payload)

    jd = JDAnalysis(
        skills=process.jd_skills or [],
        role_level=process.jd_role_level or "unknown",
        tech_stack=process.jd_tech_stack or [],
        experience_expectations=process.jd_experience_expectations or "",
    )

    return HiringProcessOut(
        id=process.id,
        public_token=process.public_token,
        title=process.title,
        description=process.description,
        num_mcq=process.num_mcq,
        num_coding=process.num_coding,
        num_theory=process.num_theory,
        extra_context=process.extra_context,
        jd_analysis=jd,
    )


# ---------------------------------------------
# GET PROCESS BY ID (Recruiter dashboard)
# ---------------------------------------------
@router.get("/{process_id}", response_model=HiringProcessOut)
def get_process(process_id: int, db: Session = Depends(get_db)):
    process = process_service.get_process_by_id(db, process_id)
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")

    jd = JDAnalysis(
        skills=process.jd_skills or [],
        role_level=process.jd_role_level or "unknown",
        tech_stack=process.jd_tech_stack or [],
        experience_expectations=process.jd_experience_expectations or "",
    )

    return HiringProcessOut(
        id=process.id,
        public_token=process.public_token,
        title=process.title,
        description=process.description,
        num_mcq=process.num_mcq,
        num_coding=process.num_coding,
        num_theory=process.num_theory,
        extra_context=process.extra_context,
        jd_analysis=jd,
    )


# ---------------------------------------------
# PUBLIC ENDPOINT — CANDIDATE OPENS TEST LINK
# (Used by frontend: /api/processes/public/<token>)
# ---------------------------------------------
@router.get("/public/{public_token}", response_model=PublicProcessInfo)
def get_public_process_info(public_token: str, db: Session = Depends(get_db)):
    process = process_service.get_process_by_token(db, public_token)
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")

    jd = JDAnalysis(
        skills=process.jd_skills or [],
        role_level=process.jd_role_level or "unknown",
        tech_stack=process.jd_tech_stack or [],
        experience_expectations=process.jd_experience_expectations or "",
    )

    instructions = (
        "Welcome to SkillPick AI! Upload your resume to begin. "
        "If your profile matches the job description, the AI engine will "
        "unlock your personalized assessment: MCQs, coding tasks, and theory questions."
    )

    return PublicProcessInfo(
        title=process.title,
        description=process.description,
        jd_analysis=jd,
        instructions=instructions,
        num_mcq=process.num_mcq,
        num_coding=process.num_coding,
        num_theory=process.num_theory,
    )
