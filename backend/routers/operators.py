import statistics
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Operator, Cycle, CyclePhase
from backend.schemas import OperatorSchema

router = APIRouter(prefix="/operators", tags=["Operators"])


@router.get("", response_model=List[OperatorSchema])
def list_operators(db: Session = Depends(get_db)):
    return db.query(Operator).order_by(Operator.experience_years.desc()).all()


@router.get("/{operator_id}")
def get_operator_profile(operator_id: str, db: Session = Depends(get_db)):
    op = db.query(Operator).filter(Operator.operator_id == operator_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operator not found")

    cycles = db.query(Cycle).filter(Cycle.operator_id == operator_id).all()
    cycle_times = [c.cycle_time_seconds for c in cycles]
    total_fuel = sum(c.fuel_used_l for c in cycles)

    avg_time = statistics.mean(cycle_times) if cycle_times else 0.0
    stdev_time = statistics.stdev(cycle_times) if len(cycle_times) > 1 else 0.0

    return {
        "operator": OperatorSchema.model_validate(op),
        "analytics": {
            "total_cycles": len(cycles),
            "avg_cycle_time_seconds": round(avg_time, 2),
            "cycle_time_stdev": round(stdev_time, 2),
            "total_fuel_l": round(total_fuel, 2),
            "estimated_shift_hours": round((sum(cycle_times) + len(cycles) * 5) / 3600.0, 2)
        }
    }
