from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from database import get_db
from models import HiringProcess, Candidate, CandidateResponse, Evaluation  # ✔ matches your models
from schemas import (
    CandidateRegisterResponse,
    CandidateTestSubmission,
    EvaluationOut
)
from utils.pdf_reader import extract_text_from_pdf_bytes as extract_text_from_pdf
from gemini_client import (
    resume_agent_match,
    question_generator_agent,
    code_evaluation_agent,
    theory_evaluation_agent,
    summary_agent
)

import json


router = APIRouter(prefix="/api/candidates", tags=["candidates"])



@router.post("/register/{public_token}", response_model=CandidateRegisterResponse)
async def register_candidate(
    public_token: str,
    name: str = Form(...),
    email: str = Form(...),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Validate process
    process = db.query(HiringProcess).filter(HiringProcess.public_token == public_token).first()
    if not process:
        raise HTTPException(status_code=404, detail="Invalid or expired test link")

    # Extract resume text
    resume_bytes = await resume.read()
    resume_text = extract_text_from_pdf(resume_bytes)

    # Run resume agent
    jd_analysis = {
        "skills": process.jd_skills or [],
        "role_level": process.jd_role_level or "",
        "tech_stack": process.jd_tech_stack or [],
        "experience_expectations": process.jd_experience_expectations or ""
    }

    resume_result = resume_agent_match(
        job_description=process.description,
        jd_analysis=jd_analysis,
        resume_text=resume_text
    )

    # Reject candidate
    if resume_result["decision"] == "reject":
        return CandidateRegisterResponse(
            status="rejected",
            message="Your profile does not match our requirements.",
            resume_match_score=resume_result["match_score"],
            resume_summary=resume_result["summary"],
        )

    # Create candidate entry
    candidate = Candidate(
        name=name,
        email=email,
        process_id=process.id,
        resume_text=resume_text,
        resume_match_score=resume_result["match_score"],
        resume_skill_overlap=resume_result.get("skill_overlap", []),
        resume_experience_relevance=resume_result.get("experience_relevance", ""),
        resume_decision="accepted",
        resume_summary=resume_result.get("summary", ""),
        status="accepted"
    )

    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    # Generate questions
    qs = question_generator_agent(
        job_description=process.description,
        jd_analysis=jd_analysis,
        extra_context=process.extra_context,
        num_mcq=process.num_mcq,
        num_coding=process.num_coding,
        num_theory=process.num_theory
    )

    # Store questions in DB (linked to process)
    if not process.question_set:
        from models import QuestionSet
        qset = QuestionSet(
            process_id=process.id,
            mcq_questions=qs["mcq"],
            coding_questions=qs["coding"],
            theory_questions=qs["theory"]
        )
        db.add(qset)
        db.commit()

    return CandidateRegisterResponse(
        status="accepted",
        message="Resume approved! Test unlocked.",
        candidate_id=candidate.id,
        resume_match_score=resume_result["match_score"],
        resume_summary=resume_result["summary"],
        questions=qs
    )



@router.post("/{candidate_id}/submit", response_model=EvaluationOut)
async def submit_answers(
    candidate_id: int,
    payload: CandidateTestSubmission,
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    process = candidate.process
    qset = process.question_set

    # Save raw candidate answers
    response = CandidateResponse(
        candidate_id=candidate.id,
        mcq_answers=payload.mcq_answers,
        coding_answers=payload.coding_answers,
        theory_answers=payload.theory_answers
    )
    db.add(response)
    db.commit()

   
    mcq_score = 0
    for q in qset.mcq_questions:
        qid = q["id"]
        correct = q["correct_index"]
        candidate_ans = payload.mcq_answers.get(qid)
        if candidate_ans == correct:
            mcq_score += 1

    total_mcq = max(len(qset.mcq_questions), 1)
    mcq_score = (mcq_score / total_mcq) * 100

   
    code_eval = code_evaluation_agent(
        qset.coding_questions,
        payload.coding_answers
    )

   
    theory_eval = theory_evaluation_agent(
        qset.theory_questions,
        payload.theory_answers
    )

    jd_analysis = {
        "skills": process.jd_skills or [],
        "role_level": process.jd_role_level or "",
        "tech_stack": process.jd_tech_stack or [],
        "experience_expectations": process.jd_experience_expectations or ""
    }

    resume_result = {
        "match_score": candidate.resume_match_score,
        "summary": candidate.resume_summary
    }

    final_summary = summary_agent(
        jd_analysis=jd_analysis,
        resume_result=resume_result,
        mcq_score=mcq_score,
        code_eval_result=code_eval,
        theory_eval_result=theory_eval
    )

    # Store evaluation
    evaluation = Evaluation(
        candidate_id=candidate.id,
        mcq_score=mcq_score,
        coding_score=code_eval["total_score"],
        theory_score=theory_eval["total_score"],
        resume_match_score=candidate.resume_match_score,
        overall_score=final_summary["overall_score"],
        strengths=final_summary["strengths"],
        weaknesses=final_summary["weaknesses"],
        final_verdict=final_summary["verdict"],
        summary=final_summary["explanation"],
        raw_agent_responses={
            "code": code_eval,
            "theory": theory_eval,
            "summary": final_summary
        }
    )

    db.add(evaluation)
    candidate.status = "completed"
    db.commit()

    return EvaluationOut(
        mcq_score=mcq_score,
        coding_score=code_eval["total_score"],
        theory_score=theory_eval["total_score"],
        resume_match_score=candidate.resume_match_score,
        overall_score=final_summary["overall_score"],
        strengths=final_summary["strengths"],
        weaknesses=final_summary["weaknesses"],
        summary=final_summary["explanation"],
        final_verdict=final_summary["verdict"]
    )



@router.get("/{candidate_id}/result", response_model=EvaluationOut)
async def get_result(candidate_id: int, db: Session = Depends(get_db)):
    evaluation = db.query(Evaluation).filter(Evaluation.candidate_id == candidate_id).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Result not found")

    return EvaluationOut(
        mcq_score=evaluation.mcq_score,
        coding_score=evaluation.coding_score,
        theory_score=evaluation.theory_score,
        resume_match_score=evaluation.resume_match_score,
        overall_score=evaluation.overall_score,
        strengths=evaluation.strengths or [],
        weaknesses=evaluation.weaknesses or [],
        summary=evaluation.summary or "",
        final_verdict=evaluation.final_verdict or ""
    )
