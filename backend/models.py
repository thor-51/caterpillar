import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from backend.database import Base


class Machine(Base):
    __tablename__ = "machines"

    machine_id = Column(String(50), primary_key=True, index=True)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    operating_hours = Column(Float, nullable=False)
    fuel_efficiency_factor = Column(Float, default=1.0)
    hydraulic_health_index = Column(Float, default=0.98)

    cycles = relationship("Cycle", back_populates="machine")


class Operator(Base):
    __tablename__ = "operators"

    operator_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    experience_years = Column(Integer, nullable=False)
    skill_level = Column(String(50), nullable=False)  # "experienced" or "novice"
    preferred_task = Column(String(100), default="trenching")
    consistency = Column(Float, default=0.8)
    reposition_efficiency = Column(Float, default=0.8)
    fuel_efficiency = Column(Float, default=0.8)
    safety_compliance = Column(Float, default=0.95)

    cycles = relationship("Cycle", back_populates="operator")


class Context(Base):
    __tablename__ = "contexts"

    context_id = Column(String(50), primary_key=True, index=True)
    task_type = Column(String(50), nullable=False, index=True)
    soil_condition = Column(String(50), nullable=False, index=True)
    load_condition = Column(String(50), nullable=False, index=True)
    description = Column(String(255))


class Cycle(Base):
    __tablename__ = "cycles"

    cycle_id = Column(String(50), primary_key=True, index=True)
    machine_id = Column(String(50), ForeignKey("machines.machine_id"), nullable=False, index=True)
    operator_id = Column(String(50), ForeignKey("operators.operator_id"), nullable=False, index=True)
    timestamp = Column(String(50), nullable=False, index=True)
    task_type = Column(String(50), nullable=False, index=True)
    soil_condition = Column(String(50), nullable=False, index=True)
    load_condition = Column(String(50), nullable=False, index=True)
    cycle_time_seconds = Column(Float, nullable=False)
    fuel_used_l = Column(Float, nullable=False)
    load_amount_tons = Column(Float, nullable=False)
    idle_time_seconds = Column(Float, default=0.0)
    is_post_coaching = Column(Integer, default=0)

    machine = relationship("Machine", back_populates="cycles")
    operator = relationship("Operator", back_populates="cycles")
    phases = relationship("CyclePhase", back_populates="cycle", cascade="all, delete-orphan")


class CyclePhase(Base):
    __tablename__ = "cycle_phases"

    phase_id = Column(String(50), primary_key=True, index=True)
    cycle_id = Column(String(50), ForeignKey("cycles.cycle_id"), nullable=False, index=True)
    phase_name = Column(String(50), nullable=False, index=True)  # DIG, LIFT, SWING, DUMP, REPOSITION
    phase_order = Column(Integer, nullable=False)
    duration_seconds = Column(Float, nullable=False)

    cycle = relationship("Cycle", back_populates="phases")


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(50), nullable=False, index=True)
    cycle_id = Column(String(50), ForeignKey("cycles.cycle_id"), nullable=False, index=True)
    machine_id = Column(String(50), nullable=False, index=True)
    operator_id = Column(String(50), nullable=False, index=True)
    phase = Column(String(50), nullable=False, index=True)
    engine_hours = Column(Float, nullable=False)
    engine_rpm = Column(Integer, nullable=False)
    fuel_rate_l_hr = Column(Float, nullable=False)
    bucket_load_pct = Column(Float, nullable=False)
    hydraulic_pressure_bar = Column(Float, nullable=False)
    hydraulic_temp_c = Column(Float, nullable=False)
    boom_angle_deg = Column(Float, nullable=False)
    arm_angle_deg = Column(Float, nullable=False)
    bucket_angle_deg = Column(Float, nullable=False)
    machine_speed_kmh = Column(Float, default=0.0)
    seatbelt_status = Column(String(20), default="FASTENED")
    task_type = Column(String(50), nullable=False)
    soil_condition = Column(String(50), nullable=False)
    load_condition = Column(String(50), nullable=False)


class SafetyEvent(Base):
    __tablename__ = "safety_events"

    event_id = Column(String(50), primary_key=True, index=True)
    cycle_id = Column(String(50), ForeignKey("cycles.cycle_id"), nullable=True)
    machine_id = Column(String(50), nullable=False)
    operator_id = Column(String(50), nullable=False)
    timestamp = Column(String(50), nullable=False)
    event_type = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)
    duration_seconds = Column(Float, nullable=False)
    description = Column(Text, nullable=False)


class Technique(Base):
    __tablename__ = "techniques"

    technique_id = Column(String(50), primary_key=True, index=True)  # e.g. "TECH_017"
    title = Column(String(200), nullable=False)
    author_operator_id = Column(String(50), ForeignKey("operators.operator_id"), nullable=False)
    author_name = Column(String(100), nullable=False)
    task_type = Column(String(50), nullable=False)
    soil_condition = Column(String(50), nullable=False)
    load_condition = Column(String(50), nullable=False)
    primary_phase = Column(String(50), nullable=False)  # REPOSITION, SWING, DIG, etc.
    baseline_cohort_duration = Column(Float, nullable=False)
    technique_duration = Column(Float, nullable=False)
    advantage_pct = Column(Float, nullable=False)
    consistency_score = Column(Float, nullable=False)
    cycle_sample_count = Column(Integer, nullable=False)
    summary = Column(Text, nullable=False)
    cab_coaching_prompt = Column(Text, nullable=False)
    discovered_at = Column(DateTime, default=datetime.datetime.utcnow)


class TransferSession(Base):
    __tablename__ = "transfer_sessions"

    session_id = Column(String(50), primary_key=True, index=True)
    student_operator_id = Column(String(50), nullable=False)
    student_name = Column(String(100), nullable=False)
    technique_id = Column(String(50), ForeignKey("techniques.technique_id"), nullable=False)
    technique_title = Column(String(200), nullable=False)
    mentor_operator_id = Column(String(50), nullable=False)
    mentor_name = Column(String(100), nullable=False)
    task_type = Column(String(50), nullable=False)
    soil_condition = Column(String(50), nullable=False)
    load_condition = Column(String(50), nullable=False)
    pre_coaching_median = Column(Float, nullable=False)
    post_coaching_median = Column(Float, nullable=False)
    improvement_pct = Column(Float, nullable=False)
    pre_cycle_count = Column(Integer, nullable=False)
    post_cycle_count = Column(Integer, nullable=False)
    transferred_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), default="COMPLETED")
