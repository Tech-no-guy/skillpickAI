from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from services import process_service
from schemas import (
    ProcessAnalyticsResponse,
    ProcessAnalyticsOverview,
    CandidateAnalyticsItem,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/process/{process_id}", response_model=ProcessAnalyticsResponse)
def get_process_analytics(process_id: int, db: Session = Depends(get_db)):
    from models import Candidate, Evaluation, HiringProcess

    process: HiringProcess | None = process_service.get_process_by_id(db, process_id)
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")

    candidates = (
        db.query(Candidate)
        .filter(Candidate.process_id == process_id)
        .all()
    )
    candidate_ids = [c.id for c in candidates]

    evals = (
        db.query(Evaluation)
        .filter(Evaluation.candidate_id.in_(candidate_ids))
        .all()
    )

    eval_by_candidate = {e.candidate_id: e for e in evals}

    items: list[CandidateAnalyticsItem] = []
    total_overall = 0.0
    total_resume = 0.0
    count_overall = 0
    completed = 0

    for c in candidates:
        e = eval_by_candidate.get(c.id)
        if e:
            completed += 1
            overall = e.overall_score or 0.0
            resume_ms = e.resume_match_score or 0.0
            total_overall += overall
            total_resume += resume_ms
            count_overall += 1
            items.append(
                CandidateAnalyticsItem(
                    candidate_id=c.id,
                    name=c.name,
                    email=c.email,
                    resume_match_score=resume_ms,
                    mcq_score=e.mcq_score or 0.0,
                    coding_score=e.coding_score or 0.0,
                    theory_score=e.theory_score or 0.0,
                    overall_score=overall,
                    final_verdict=e.final_verdict or "borderline",
                )
            )
        else:
            items.append(
                CandidateAnalyticsItem(
                    candidate_id=c.id,
                    name=c.name,
                    email=c.email,
                    resume_match_score=c.resume_match_score or 0.0,
                    mcq_score=0.0,
                    coding_score=0.0,
                    theory_score=0.0,
                    overall_score=0.0,
                    final_verdict=c.status,
                )
            )

    avg_overall = total_overall / count_overall if count_overall else 0.0
    avg_resume = total_resume / count_overall if count_overall else 0.0

    overview = ProcessAnalyticsOverview(
        process_id=process.id,
        title=process.title,
        total_candidates=len(candidates),
        completed_candidates=completed,
        average_overall_score=avg_overall,
        average_resume_match=avg_resume,
        created_at=process.created_at.isoformat(),
    )

    return ProcessAnalyticsResponse(overview=overview, candidates=items)
