import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class MachineSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    machine_id: str
    model: str
    year: int
    operating_hours: float
    fuel_efficiency_factor: float
    hydraulic_health_index: float


class OperatorSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    operator_id: str
    name: str
    experience_years: int
    skill_level: str
    preferred_task: str
    consistency: float
    reposition_efficiency: float
    fuel_efficiency: float
    safety_compliance: float


class PhaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    phase_id: str
    cycle_id: str
    phase_name: str
    phase_order: int
    duration_seconds: float


class CycleSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    cycle_id: str
    machine_id: str
    operator_id: str
    timestamp: str
    task_type: str
    soil_condition: str
    load_condition: str
    cycle_time_seconds: float
    fuel_used_l: float
    load_amount_tons: float
    idle_time_seconds: float
    is_post_coaching: int


class CycleDetailSchema(CycleSchema):
    phases: List[PhaseSchema] = []


class TelemetrySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    timestamp: str
    cycle_id: str
    machine_id: str
    operator_id: str
    phase: str
    engine_hours: float
    engine_rpm: int
    fuel_rate_l_hr: float
    bucket_load_pct: float
    hydraulic_pressure_bar: float
    hydraulic_temp_c: float
    boom_angle_deg: float
    arm_angle_deg: float
    bucket_angle_deg: float
    machine_speed_kmh: float
    seatbelt_status: str
    task_type: str
    soil_condition: str
    load_condition: str


class SafetyEventSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    event_id: str
    cycle_id: Optional[str] = None
    machine_id: str
    operator_id: str
    timestamp: str
    event_type: str
    severity: str
    duration_seconds: float
    description: str


class TechniqueSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    technique_id: str
    title: str
    author_operator_id: str
    author_name: str
    task_type: str
    soil_condition: str
    load_condition: str
    primary_phase: str
    baseline_cohort_duration: float
    technique_duration: float
    advantage_pct: float
    consistency_score: float
    cycle_sample_count: int
    summary: str
    cab_coaching_prompt: str
    discovered_at: Optional[datetime.datetime] = None


class TransferSessionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    session_id: str
    student_operator_id: str
    student_name: str
    technique_id: str
    technique_title: str
    mentor_operator_id: str
    mentor_name: str
    task_type: str
    soil_condition: str
    load_condition: str
    pre_coaching_median: float
    post_coaching_median: float
    improvement_pct: float
    pre_cycle_count: int
    post_cycle_count: int
    transferred_at: Optional[datetime.datetime] = None
    status: str


class CoachingMatchRequest(BaseModel):
    operator_id: str
    task_type: str
    soil_condition: str
    load_condition: str
    current_reposition_avg: Optional[float] = None


class CoachingMatchResponse(BaseModel):
    match_found: bool
    technique: Optional[TechniqueSchema] = None
    operator_deviation_detected: bool
    deviation_pct: Optional[float] = None
    gentle_coaching_message: Optional[str] = None
    mentor_story: Optional[str] = None


class DemoTransferSummary(BaseModel):
    headline: str
    mentor: str
    mentor_experience: str
    student: str
    student_experience: str
    task: str
    soil: str
    pre_coaching_reposition_median: float
    post_coaching_reposition_median: float
    improvement_pct: float
    expert_cycles_mined: int
    coached_cycles: int
    punchline: str
