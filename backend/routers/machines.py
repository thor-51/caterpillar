from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Machine, Cycle
from backend.schemas import MachineSchema

router = APIRouter(prefix="/machines", tags=["Machines"])


@router.get("", response_model=List[MachineSchema])
def list_machines(db: Session = Depends(get_db)):
    return db.query(Machine).order_by(Machine.machine_id).all()


@router.get("/{machine_id}")
def get_machine(machine_id: str, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.machine_id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    cycle_count = db.query(Cycle).filter(Cycle.machine_id == machine_id).count()
    return {
        "machine": MachineSchema.model_validate(machine),
        "telemetry_summary": {
            "total_cycles_logged": cycle_count,
            "status": "OPERATIONAL",
            "telemetry_stream": "ACTIVE_1HZ"
        }
    }
