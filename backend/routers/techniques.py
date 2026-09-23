from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Technique, Cycle, CyclePhase
from backend.schemas import TechniqueSchema

router = APIRouter(prefix="/techniques", tags=["Techniques"])


@router.get("", response_model=List[TechniqueSchema])
def list_techniques(
    task_type: Optional[str] = Query(None, description="Filter by task type"),
    operator_id: Optional[str] = Query(None, description="Filter by author operator ID"),
    db: Session = Depends(get_db)
):
    query = db.query(Technique)
    if task_type:
        query = query.filter(Technique.task_type == task_type)
    if operator_id:
        query = query.filter(Technique.author_operator_id == operator_id)
    return query.order_by(Technique.advantage_pct.desc()).all()


@router.get("/{technique_id}")
def get_technique_detail(technique_id: str, db: Session = Depends(get_db)):
    tech = db.query(Technique).filter(Technique.technique_id == technique_id).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technique not found")

    # Fetch sample cycles mined from this author in this exact context
    author_cycles = (
        db.query(Cycle)
        .filter(
            Cycle.operator_id == tech.author_operator_id,
            Cycle.task_type == tech.task_type,
            Cycle.soil_condition == tech.soil_condition,
            Cycle.load_condition == tech.load_condition
        )
        .limit(10)
        .all()
    )

    cycle_ids = [c.cycle_id for c in author_cycles]
    phases = db.query(CyclePhase).filter(CyclePhase.cycle_id.in_(cycle_ids)).all()
    phase_durations_by_cycle = {}
    for p in phases:
        phase_durations_by_cycle.setdefault(p.cycle_id, {})[p.phase_name] = p.duration_seconds

    sample_evidence = []
    for c in author_cycles:
        sample_evidence.append({
            "cycle_id": c.cycle_id,
            "timestamp": c.timestamp,
            "cycle_time_seconds": c.cycle_time_seconds,
            "fuel_used_l": c.fuel_used_l,
            "target_phase_duration": phase_durations_by_cycle.get(c.cycle_id, {}).get(tech.primary_phase, 0.0),
            "phases": phase_durations_by_cycle.get(c.cycle_id, {})
        })

    return {
        "technique": TechniqueSchema.model_validate(tech),
        "evidence": {
            "cycle_sample_count": tech.cycle_sample_count,
            "sample_evidence": sample_evidence,
            "cohort_baseline": tech.baseline_cohort_duration,
            "expert_benchmark": tech.technique_duration,
            "efficiency_gain_pct": tech.advantage_pct,
            "target_phase": tech.primary_phase
        }
    }
