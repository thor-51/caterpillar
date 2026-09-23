from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Cycle, CyclePhase, Telemetry
from backend.schemas import CycleSchema, CycleDetailSchema, TelemetrySchema

router = APIRouter(prefix="/cycles", tags=["Cycles"])


@router.get("", response_model=List[CycleSchema])
def list_cycles(
    operator_id: Optional[str] = Query(None),
    task_type: Optional[str] = Query(None),
    soil_condition: Optional[str] = Query(None),
    limit: int = Query(50, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Cycle)
    if operator_id:
        query = query.filter(Cycle.operator_id == operator_id)
    if task_type:
        query = query.filter(Cycle.task_type == task_type)
    if soil_condition:
        query = query.filter(Cycle.soil_condition == soil_condition)
    return query.offset(offset).limit(limit).all()


@router.get("/{cycle_id}")
def get_cycle_detail(cycle_id: str, db: Session = Depends(get_db)):
    cycle = db.query(Cycle).filter(Cycle.cycle_id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")

    phases = db.query(CyclePhase).filter(CyclePhase.cycle_id == cycle_id).order_by(CyclePhase.phase_order).all()
    telemetry = db.query(Telemetry).filter(Telemetry.cycle_id == cycle_id).order_by(Telemetry.id).all()

    return {
        "cycle": CycleSchema.model_validate(cycle),
        "phases": [
            {
                "phase_name": p.phase_name,
                "phase_order": p.phase_order,
                "duration_seconds": p.duration_seconds
            }
            for p in phases
        ],
        "telemetry_points": [TelemetrySchema.model_validate(t) for t in telemetry]
    }
