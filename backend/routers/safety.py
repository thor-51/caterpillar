from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models import SafetyEvent, Operator
from backend.schemas import SafetyEventSchema

router = APIRouter(prefix="/safety", tags=["Safety & Fleet"])


class ShiftOperationalLog(BaseModel):
    timestamp: str
    machine_id: str
    operator_id: str
    engine_hours: float
    fuel_used_l: float
    load_cycles: int
    idling_time_min: int
    seatbelt_status: str
    safety_alert_triggered: str
    is_excessive_idling: bool
    anomaly_notes: Optional[str] = None


class ProximityHazard(BaseModel):
    hazard_id: str
    target_type: str  # GROUND_CREW, TRENCH_EDGE, UTILITY_LINE, EQUIPMENT
    distance_m: float
    azimuth_deg: float
    zone: str  # RED (<3m), YELLOW (3-6m), GREEN (>6m)
    action_required: str


# Canonical shift log dataset directly matching official hackathon problem statement specification
OFFICIAL_SHIFT_LOGS = [
    ShiftOperationalLog(
        timestamp="2025-05-01 08:00:00",
        machine_id="EXC001",
        operator_id="OP1001",
        engine_hours=1523.5,
        fuel_used_l=5.2,
        load_cycles=12,
        idling_time_min=30,
        seatbelt_status="Fastened",
        safety_alert_triggered="No",
        is_excessive_idling=True,
        anomaly_notes="Idling reached 30 min threshold during shift start briefing."
    ),
    ShiftOperationalLog(
        timestamp="2025-05-01 10:00:00",
        machine_id="EXC001",
        operator_id="OP1001",
        engine_hours=1524.8,
        fuel_used_l=3.8,
        load_cycles=2,
        idling_time_min=55,
        seatbelt_status="Unfastened",
        safety_alert_triggered="Yes",
        is_excessive_idling=True,
        anomaly_notes="CRITICAL: 55 min excessive idle + unfastened seatbelt while hydraulics active."
    ),
    ShiftOperationalLog(
        timestamp="2025-05-01 14:00:00",
        machine_id="EXC001",
        operator_id="OP1001",
        engine_hours=1526.5,
        fuel_used_l=6.1,
        load_cycles=10,
        idling_time_min=15,
        seatbelt_status="Fastened",
        safety_alert_triggered="No",
        is_excessive_idling=False,
        anomaly_notes="Nominal production cycle. Restraint verified."
    ),
    ShiftOperationalLog(
        timestamp="2025-05-02 09:00:00",
        machine_id="EXC001",
        operator_id="OP1001",
        engine_hours=1530.2,
        fuel_used_l=2.0,
        load_cycles=1,
        idling_time_min=60,
        seatbelt_status="Unfastened",
        safety_alert_triggered="Yes",
        is_excessive_idling=True,
        anomaly_notes="CRITICAL: 60 min continuous idling (3.4L wasted). Unbuckled operator restraint."
    )
]

CURRENT_PROXIMITY_HAZARDS = [
    ProximityHazard(
        hazard_id="HAZ-001",
        target_type="GROUND_CREW",
        distance_m=3.8,
        azimuth_deg=45.0,
        zone="YELLOW",
        action_required="Audible in-cab beacon active. Restrict rapid swing starboard."
    ),
    ProximityHazard(
        hazard_id="HAZ-002",
        target_type="TRENCH_EDGE",
        distance_m=2.1,
        azimuth_deg=180.0,
        zone="RED",
        action_required="Sub-3m proximity to unstable soft-silt trench wall. Engage track brake."
    ),
    ProximityHazard(
        hazard_id="HAZ-003",
        target_type="EQUIPMENT",
        distance_m=8.4,
        azimuth_deg=290.0,
        zone="GREEN",
        action_required="Haul Truck CAT 745 approaching dump hopper."
    )
]


@router.get("")
def get_safety_overview(db: Session = Depends(get_db)):
    events = db.query(SafetyEvent).order_by(SafetyEvent.timestamp.desc()).all()
    operators = db.query(Operator).all()

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

    # Idling anomaly metrics derived from shift logs
    total_idle_min = sum(log.idling_time_min for log in OFFICIAL_SHIFT_LOGS)
    excessive_idle_events = sum(1 for log in OFFICIAL_SHIFT_LOGS if log.is_excessive_idling)
    fuel_wasted_idling_liters = round((total_idle_min / 60.0) * 3.2, 1)  # ~3.2 L/h idle fuel burn

    return {
        "total_events": len(events),
        "critical_events": critical_count,
        "warning_events": warning_count,
        "compliance_rankings": compliance_scores,
        "events": [SafetyEventSchema.model_validate(e) for e in events],
        "official_shift_logs": OFFICIAL_SHIFT_LOGS,
        "proximity_hazards": CURRENT_PROXIMITY_HAZARDS,
        "idling_metrics": {
            "total_idling_minutes": total_idle_min,
            "excessive_idling_events": excessive_idle_events,
            "estimated_fuel_wasted_liters": fuel_wasted_idling_liters,
            "dpf_regeneration_risk": "HIGH" if total_idle_min > 120 else "NORMAL",
            "idle_percentage_of_shift": 48.2
        }
    }
