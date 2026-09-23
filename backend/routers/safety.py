from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import SafetyEvent, Operator
from backend.schemas import SafetyEventSchema

router = APIRouter(prefix="/safety", tags=["Safety"])


@router.get("")
def get_safety_overview(db: Session = Depends(get_db)):
    events = db.query(SafetyEvent).order_by(SafetyEvent.timestamp.desc()).all()
    operators = db.query(Operator).all()

    # Compliance rankings
    compliance_scores = [
        {
            "operator_id": op.operator_id,
            "name": op.name,
            "skill_level": op.skill_level,
            "safety_compliance": op.safety_compliance,
            "incident_count": sum(1 for e in events if e.operator_id == op.operator_id)
        }
        for op in sorted(operators, key=lambda x: x.safety_compliance, reverse=True)
    ]

    critical_count = sum(1 for e in events if e.severity == "CRITICAL")
    warning_count = sum(1 for e in events if e.severity == "WARNING")

    return {
        "total_events": len(events),
        "critical_events": critical_count,
        "warning_events": warning_count,
        "compliance_rankings": compliance_scores,
        "events": [SafetyEventSchema.model_validate(e) for e in events]
    }
