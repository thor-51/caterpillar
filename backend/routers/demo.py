import asyncio
import json
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.database import get_db, SessionLocal
from backend.models import Telemetry, Cycle, Technique, TransferSession
from backend.schemas import DemoTransferSummary
from backend.services.technique_miner import TechniqueMiner

router = APIRouter(prefix="/demo", tags=["Demo"])


@router.post("/reset")
def reset_demo_endpoint(db: Session = Depends(get_db)):
    miner = TechniqueMiner(db)
    discovered = miner.mine_and_store()
    
    # Ensure transfer session is fresh
    tech_17 = db.query(Technique).filter(Technique.technique_id == "TECH_017").first()
    db.query(TransferSession).delete()
    if tech_17:
        transfer_session = TransferSession(
            session_id="SESS_TRANSFER_001",
            student_operator_id="OP_NOV_001",
            student_name="Aryan",
            technique_id=tech_17.technique_id,
            technique_title=tech_17.title,
            mentor_operator_id=tech_17.author_operator_id,
            mentor_name=tech_17.author_name,
            task_type="trenching",
            soil_condition="soft",
            load_condition="medium",
            pre_coaching_median=11.62,
            post_coaching_median=8.48,
            improvement_pct=27.1,
            pre_cycle_count=10,
            post_cycle_count=10,
            status="COMPLETED"
        )
        db.add(transfer_session)
        db.commit()

    return {
        "status": "RESET_SUCCESSFUL",
        "techniques_mined": len(discovered),
        "fernandes_technique_active": bool(tech_17)
    }


@router.get("/stream")
async def stream_live_telemetry(
    mode: str = Query("live", description="'live' or 'coached'"),
    speed_factor: float = Query(2.0, description="Streaming speed multiplier")
):
    """
    Streams simulated real-time machine telemetry (1 Hz) for Aryan via Server-Sent Events.
    Demonstrates in-cab cycle transition: DIG -> LIFT -> SWING -> DUMP -> REPOSITION.
    """
    db = SessionLocal()
    try:
        # Choose a representative cycle: pre-coaching or post-coaching
        is_post = 1 if mode == "coached" else 0
        cycle = (
            db.query(Cycle)
            .filter(
                Cycle.operator_id == "OP_NOV_001",
                Cycle.task_type == "trenching",
                Cycle.soil_condition == "soft",
                Cycle.is_post_coaching == is_post
            )
            .first()
        )
        if not cycle:
            cycle = db.query(Cycle).first()

        telemetry_rows = (
            db.query(Telemetry)
            .filter(Telemetry.cycle_id == cycle.cycle_id)
            .order_by(Telemetry.id)
            .all()
        )
    finally:
        db.close()

    async def event_generator():
        yield f"event: cycle_start\ndata: {json.dumps({'cycle_id': cycle.cycle_id, 'operator': 'Aryan', 'mode': mode, 'task': 'trenching', 'soil': 'soft'})}\n\n"
        
        sleep_duration = max(0.05, 1.0 / speed_factor)

        for row in telemetry_rows:
            data = {
                "timestamp": row.timestamp,
                "cycle_id": row.cycle_id,
                "phase": row.phase,
                "engine_rpm": row.engine_rpm,
                "fuel_rate_l_hr": row.fuel_rate_l_hr,
                "hydraulic_pressure_bar": row.hydraulic_pressure_bar,
                "bucket_load_pct": row.bucket_load_pct,
                "boom_angle_deg": row.boom_angle_deg,
                "arm_angle_deg": row.arm_angle_deg,
                "bucket_angle_deg": row.bucket_angle_deg,
                "machine_speed_kmh": row.machine_speed_kmh,
                "seatbelt_status": row.seatbelt_status
            }
            yield f"event: telemetry\ndata: {json.dumps(data)}\n\n"
            await asyncio.sleep(sleep_duration)

        yield f"event: cycle_complete\ndata: {json.dumps({'cycle_id': cycle.cycle_id, 'cycle_time': cycle.cycle_time_seconds, 'fuel_used': cycle.fuel_used_l})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/transfer-summary", response_model=DemoTransferSummary)
def get_transfer_summary(db: Session = Depends(get_db)):
    tech_17 = db.query(Technique).filter(Technique.technique_id == "TECH_017").first()
    session = db.query(TransferSession).first()

    return DemoTransferSummary(
        headline="KNOWLEDGE TRANSFERRED",
        mentor="Fernandes",
        mentor_experience="14 Years Field Experience (Retired)",
        student="Aryan",
        student_experience="1st Year Novice Operator",
        task="Trenching",
        soil="Soft Soil",
        pre_coaching_reposition_median=session.pre_coaching_median if session else 11.62,
        post_coaching_reposition_median=session.post_coaching_median if session else 8.48,
        improvement_pct=session.improvement_pct if session else 27.1,
        expert_cycles_mined=tech_17.cycle_sample_count if tech_17 else 94,
        coached_cycles=session.post_cycle_count if session else 10,
        punchline="Fernandes retired 6 months ago. His technique didn't."
    )
