from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/training", tags=["Operator Training Hub"])


class TrainingModule(BaseModel):
    module_id: str
    title: str
    format: str  # SIMULATION, VIDEO_DRILL, MENTOR_WORKSHOP
    duration_min: int
    difficulty: str  # BEGINNER, INTERMEDIATE, MASTER
    technique_id: Optional[str] = None
    instructor_name: str
    rating: float
    enrolled_count: int
    summary: str
    objectives: List[str]


class BookingRequest(BaseModel):
    operator_id: str
    instructor_id: str
    date: str
    time_slot: str
    focus_technique: str
    notes: Optional[str] = None


class BookingResponse(BaseModel):
    booking_id: str
    status: str
    confirmation_message: str
    scheduled_time: str
    instructor: str


class SimScoreRequest(BaseModel):
    operator_id: str
    boom_angle_used: float
    reposition_latency_s: float
    track_speed_kmh: float


class SimScoreResponse(BaseModel):
    score: int
    grade: str
    passed: bool
    feedback: str
    delta_vs_fernandes: str


@router.get("/modules", response_model=List[TrainingModule])
def get_training_modules():
    return [
        TrainingModule(
            module_id="MOD-017",
            title="Technique #17 Interactive Simulator: Soft-Soil Trenching",
            format="SIMULATION",
            duration_min=15,
            difficulty="INTERMEDIATE",
            technique_id="TECH_017",
            instructor_name="Fernandes (14 Yrs Veteran Master)",
            rating=4.96,
            enrolled_count=42,
            summary="Interactive kinematic flight-simulator style drill. Practice keeping the boom pinned low (<26°) during track repositioning to eliminate counterweight rock.",
            objectives=[
                "Maintain boom angle below 28 degrees during track movement",
                "Execute pulsed track engagement to prevent track trenching",
                "Achieve sub-9.0s repositioning latency with zero bucket swing"
            ]
        ),
        TrainingModule(
            module_id="MOD-023",
            title="Heavy Payload Kinetic Inertial Swing Mastery",
            format="VIDEO_DRILL",
            duration_min=12,
            difficulty="MASTER",
            technique_id="TECH_023",
            instructor_name="Rao (16 Yrs Veteran Master)",
            rating=4.88,
            enrolled_count=28,
            summary="Split-screen telemetry breakdown showing concurrent boom lift and rotational acceleration without tripping hydraulic pressure relief.",
            objectives=[
                "Synchronize swing acceleration with 40% boom cylinder extension",
                "Eliminate hydraulic pressure relief valve chattering",
                "Save 1.4s per swing phase on heavy blasted granite"
            ]
        ),
        TrainingModule(
            module_id="MOD-009",
            title="Tactical Proximity Radar & Trench Hazard Avoidance",
            format="SIMULATION",
            duration_min=10,
            difficulty="BEGINNER",
            technique_id=None,
            instructor_name="Mehta (11 Yrs Safety Lead)",
            rating=4.92,
            enrolled_count=65,
            summary="Master 360-degree blind-spot radar monitoring, ultrasonic audio cues, and active site ground crew protection protocols.",
            objectives=[
                "Identify blind-spot proximity alarms within 500ms",
                "Enforce mandatory track lock when workers enter 4m red zone",
                "Ensure 100% seatbelt latch compliance prior to engine throttle"
            ]
        )
    ]


@router.post("/book-instructor", response_model=BookingResponse)
def book_instructor(booking: BookingRequest):
    return BookingResponse(
        booking_id=f"BK-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        status="CONFIRMED",
        confirmation_message=f"Session booked with {booking.instructor_id}! A live dual-cab telemetry review will be initiated at the scheduled time.",
        scheduled_time=f"{booking.date} at {booking.time_slot}",
        instructor=booking.instructor_id
    )


@router.post("/evaluate-sim", response_model=SimScoreResponse)
def evaluate_simulation(req: SimScoreRequest):
    # Perfect Fernandes: boom <= 26.5 deg, reposition ~ 8.4s
    angle_penalty = max(0.0, (req.boom_angle_used - 26.5) * 2.5)
    time_penalty = max(0.0, (req.reposition_latency_s - 8.4) * 8.0)
    score = max(40, min(100, int(100 - (angle_penalty + time_penalty))))

    passed = score >= 80
    grade = "A+ (Master)" if score >= 92 else "A (Proficient)" if score >= 85 else "B (Developing)" if score >= 75 else "C (Needs Practice)"

    feedback = (
        "Flawless execution! Low boom elevation preserved center of gravity, matching Fernandes's veteran benchmark."
        if passed else
        f"Boom was elevated to {req.boom_angle_used:.1f}°. Keep boom below 28° to eliminate counterweight rocking."
    )

    delta = f"{req.reposition_latency_s - 8.37:+.2f}s vs Fernandes benchmark"

    return SimScoreResponse(
        score=score,
        grade=grade,
        passed=passed,
        feedback=feedback,
        delta_vs_fernandes=delta
    )
