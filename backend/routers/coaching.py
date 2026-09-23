import statistics
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Technique, Operator, Cycle, CyclePhase, TransferSession
from backend.schemas import (
    CoachingMatchRequest, CoachingMatchResponse,
    TechniqueSchema, TransferSessionSchema
)

router = APIRouter(prefix="/coaching", tags=["Coaching"])


@router.post("/match", response_model=CoachingMatchResponse)
def match_coaching(req: CoachingMatchRequest, db: Session = Depends(get_db)):
    op = db.query(Operator).filter(Operator.operator_id == req.operator_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operator not found")

    # Match technique by operational context
    tech = (
        db.query(Technique)
        .filter(
            Technique.task_type == req.task_type,
            Technique.soil_condition == req.soil_condition,
            Technique.load_condition == req.load_condition
        )
        .first()
    )

    if not tech:
        # Fallback to broader task match if exact load condition differs
        tech = (
            db.query(Technique)
            .filter(
                Technique.task_type == req.task_type,
                Technique.soil_condition == req.soil_condition
            )
            .first()
        )

    if not tech:
        return CoachingMatchResponse(
            match_found=False,
            operator_deviation_detected=False
        )

    # Check operator's actual historical performance in this context
    op_cycles = (
        db.query(Cycle)
        .filter(
            Cycle.operator_id == req.operator_id,
            Cycle.task_type == req.task_type,
            Cycle.soil_condition == req.soil_condition,
            Cycle.is_post_coaching == 0
        )
        .all()
    )

    deviation_detected = False
    deviation_pct = 0.0

    if op_cycles:
        cycle_ids = [c.cycle_id for c in op_cycles]
        target_phases = (
            db.query(CyclePhase)
            .filter(
                CyclePhase.cycle_id.in_(cycle_ids),
                CyclePhase.phase_name == tech.primary_phase
            )
            .all()
        )
        if target_phases:
            op_phase_median = statistics.median(p.duration_seconds for p in target_phases)
            if op_phase_median > tech.technique_duration * 1.10:
                deviation_detected = True
                deviation_pct = round(((op_phase_median - tech.technique_duration) / tech.technique_duration) * 100.0, 1)

    # Gentle, non-surveillance coaching message
    gentle_message = (
        f"You are working in conditions similar to {tech.author_name}'s {tech.task_type} benchmark cycles. "
        f"His telemetry demonstrates keeping the boom low and using compact track pulses to avoid soft soil sinkage."
        if tech.technique_id == "TECH_017"
        else tech.cab_coaching_prompt
    )

    mentor_story = (
        f"{tech.author_name} spent 14 years perfecting soft-soil trenching before retiring. "
        f"CAT Legacy captured his exact hydraulic rhythm from 94 benchmark cycles to assist you today."
        if tech.technique_id == "TECH_017"
        else f"Mined from {tech.cycle_sample_count} verified cycles by {tech.author_name}."
    )

    return CoachingMatchResponse(
        match_found=True,
        technique=TechniqueSchema.model_validate(tech),
        operator_deviation_detected=deviation_detected,
        deviation_pct=deviation_pct if deviation_detected else None,
        gentle_coaching_message=gentle_message,
        mentor_story=mentor_story
    )


@router.post("/evaluate-transfer/{student_id}")
def evaluate_transfer(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Operator).filter(Operator.operator_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student operator not found")

    tech_17 = db.query(Technique).filter(Technique.technique_id == "TECH_017").first()
    if not tech_17:
        raise HTTPException(status_code=404, detail="Technique #17 not found")

    # Fetch pre-coaching and post-coaching cycles for this student
    pre_cycles = (
        db.query(Cycle)
        .filter(
            Cycle.operator_id == student_id,
            Cycle.task_type == "trenching",
            Cycle.soil_condition == "soft",
            Cycle.is_post_coaching == 0
        )
        .all()
    )
    post_cycles = (
        db.query(Cycle)
        .filter(
            Cycle.operator_id == student_id,
            Cycle.task_type == "trenching",
            Cycle.soil_condition == "soft",
            Cycle.is_post_coaching == 1
        )
        .all()
    )

    if not pre_cycles or not post_cycles:
        raise HTTPException(status_code=400, detail="Insufficient pre or post coaching cycle telemetry")

    pre_ids = [c.cycle_id for c in pre_cycles]
    post_ids = [c.cycle_id for c in post_cycles]

    pre_reps = (
        db.query(CyclePhase)
        .filter(CyclePhase.cycle_id.in_(pre_ids), CyclePhase.phase_name == "REPOSITION")
        .all()
    )
    post_reps = (
        db.query(CyclePhase)
        .filter(CyclePhase.cycle_id.in_(post_ids), CyclePhase.phase_name == "REPOSITION")
        .all()
    )

    pre_median = statistics.median(p.duration_seconds for p in pre_reps)
    post_median = statistics.median(p.duration_seconds for p in post_reps)
    improvement_pct = round(((pre_median - post_median) / pre_median) * 100.0, 1)

    # Update or persist transfer session
    session = db.query(TransferSession).filter(TransferSession.student_operator_id == student_id).first()
    if not session:
        session = TransferSession(
            session_id=f"SESS_TRANSFER_{student_id}",
            student_operator_id=student.operator_id,
            student_name=student.name,
            technique_id=tech_17.technique_id,
            technique_title=tech_17.title,
            mentor_operator_id=tech_17.author_operator_id,
            mentor_name=tech_17.author_name,
            task_type="trenching",
            soil_condition="soft",
            load_condition="medium",
            pre_coaching_median=round(pre_median, 2),
            post_coaching_median=round(post_median, 2),
            improvement_pct=improvement_pct,
            pre_cycle_count=len(pre_cycles),
            post_cycle_count=len(post_cycles),
            status="COMPLETED"
        )
        db.add(session)
    else:
        session.pre_coaching_median = round(pre_median, 2)
        session.post_coaching_median = round(post_median, 2)
        session.improvement_pct = improvement_pct
        session.pre_cycle_count = len(pre_cycles)
        session.post_cycle_count = len(post_cycles)

    db.commit()

    return {
        "status": "SUCCESS",
        "transfer_session": TransferSessionSchema.model_validate(session),
        "comparison": {
            "pre_coaching_median": round(pre_median, 2),
            "post_coaching_median": round(post_median, 2),
            "improvement_pct": improvement_pct,
            "expert_benchmark": tech_17.technique_duration
        }
    }


@router.get("/transfers", response_model=List[TransferSessionSchema])
def list_transfer_sessions(db: Session = Depends(get_db)):
    return db.query(TransferSession).all()
