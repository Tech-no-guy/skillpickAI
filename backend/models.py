from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Float,
    JSON,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class HiringProcess(Base):
    __tablename__ = "hiring_processes"

    id = Column(Integer, primary_key=True, index=True)
    public_token = Column(String(64), unique=True, index=True, nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    num_mcq = Column(Integer, nullable=False)
    num_coding = Column(Integer, nullable=False)
    num_theory = Column(Integer, nullable=False)
    extra_context = Column(Text, nullable=True)

    jd_skills = Column(JSON, nullable=True)
    jd_role_level = Column(String(64), nullable=True)
    jd_tech_stack = Column(JSON, nullable=True)
    jd_experience_expectations = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    question_set = relationship(
        "QuestionSet", back_populates="process", uselist=False, cascade="all, delete"
    )
    candidates = relationship(
        "Candidate", back_populates="process", cascade="all, delete-orphan"
    )


class QuestionSet(Base):
    __tablename__ = "question_sets"

    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(Integer, ForeignKey("hiring_processes.id"), nullable=False)

    mcq_questions = Column(JSON, nullable=False)
    coding_questions = Column(JSON, nullable=False)
    theory_questions = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    process = relationship("HiringProcess", back_populates="question_set")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(Integer, ForeignKey("hiring_processes.id"), nullable=False)

    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)

    resume_text = Column(Text, nullable=True)

    resume_match_score = Column(Float, nullable=True)
    resume_skill_overlap = Column(JSON, nullable=True)
    resume_experience_relevance = Column(String(255), nullable=True)
    resume_decision = Column(String(32), nullable=True)
    resume_summary = Column(Text, nullable=True)

    status = Column(
        String(32),
        nullable=False,
        default="pending",
        comment="pending | rejected | accepted | completed",
    )

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    process = relationship("HiringProcess", back_populates="candidates")
    response = relationship(
        "CandidateResponse", uselist=False, back_populates="candidate"
    )
    evaluation = relationship(
        "Evaluation", uselist=False, back_populates="candidate"
    )


class CandidateResponse(Base):
    __tablename__ = "candidate_responses"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)

    mcq_answers = Column(JSON, nullable=True)
    coding_answers = Column(JSON, nullable=True)
    theory_answers = Column(JSON, nullable=True)

    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    candidate = relationship("Candidate", back_populates="response")


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)

    mcq_score = Column(Float, nullable=True)
    coding_score = Column(Float, nullable=True)
    theory_score = Column(Float, nullable=True)
    resume_match_score = Column(Float, nullable=True)

    overall_score = Column(Float, nullable=True)

    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    final_verdict = Column(String(64), nullable=True)
    summary = Column(Text, nullable=True)

    raw_agent_responses = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    candidate = relationship("Candidate", back_populates="evaluation")
