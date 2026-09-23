#!/usr/bin/env python3
"""
CAT Legacy - Database Seeding Pipeline
=====================================
Initializes tables, loads generated CSV files into database,
executes the unsupervised technique discovery engine, and prepares
the demo state.
"""

import argparse
import csv
import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from backend.database import engine, SessionLocal, Base
from backend.models import (
    Machine, Operator, Context, Cycle, CyclePhase,
    Telemetry, SafetyEvent, Technique, TransferSession
)
from backend.services.technique_miner import TechniqueMiner


def seed_database(data_dir: Path):
    print(f"[*] Connecting to database and creating schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("[*] Clearing existing database tables...")
        db.query(TransferSession).delete()
        db.query(Technique).delete()
        db.query(SafetyEvent).delete()
        db.query(Telemetry).delete()
        db.query(CyclePhase).delete()
        db.query(Cycle).delete()
        db.query(Context).delete()
        db.query(Operator).delete()
        db.query(Machine).delete()
        db.commit()

        # 1. Machines
        print("  -> Loading machines.csv...")
        with open(data_dir / "machines.csv", "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                db.add(Machine(
                    machine_id=row["machine_id"],
                    model=row["model"],
                    year=int(row["year"]),
                    operating_hours=float(row["operating_hours"]),
                    fuel_efficiency_factor=float(row["fuel_efficiency_factor"]),
                    hydraulic_health_index=float(row["hydraulic_health_index"])
                ))
        db.commit()

        # 2. Operators
        print("  -> Loading operators.csv...")
        with open(data_dir / "operators.csv", "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                db.add(Operator(
                    operator_id=row["operator_id"],
                    name=row["name"],
                    experience_years=int(row["experience_years"]),
                    skill_level=row["skill_level"],
                    preferred_task=row["preferred_task"],
                    consistency=float(row["consistency"]),
                    reposition_efficiency=float(row["reposition_efficiency"]),
                    fuel_efficiency=float(row["fuel_efficiency"]),
                    safety_compliance=float(row["safety_compliance"])
                ))
        db.commit()

        # 3. Contexts
        print("  -> Loading contexts.csv...")
        with open(data_dir / "contexts.csv", "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                db.add(Context(
                    context_id=row["context_id"],
                    task_type=row["task_type"],
                    soil_condition=row["soil_condition"],
                    load_condition=row["load_condition"],
                    description=row["description"]
                ))
        db.commit()

        # 4. Cycles
        print("  -> Loading cycles.csv...")
        with open(data_dir / "cycles.csv", "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                db.add(Cycle(
                    cycle_id=row["cycle_id"],
                    machine_id=row["machine_id"],
                    operator_id=row["operator_id"],
                    timestamp=row["timestamp"],
                    task_type=row["task_type"],
                    soil_condition=row["soil_condition"],
                    load_condition=row["load_condition"],
                    cycle_time_seconds=float(row["cycle_time_seconds"]),
                    fuel_used_l=float(row["fuel_used_l"]),
                    load_amount_tons=float(row["load_amount_tons"]),
                    idle_time_seconds=float(row["idle_time_seconds"]),
                    is_post_coaching=int(row.get("is_post_coaching", 0))
                ))
        db.commit()

        # 5. Cycle Phases
        print("  -> Loading cycle_phases.csv...")
        with open(data_dir / "cycle_phases.csv", "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                db.add(CyclePhase(
                    phase_id=row["phase_id"],
                    cycle_id=row["cycle_id"],
                    phase_name=row["phase_name"],
                    phase_order=int(row["phase_order"]),
                    duration_seconds=float(row["duration_seconds"])
                ))
        db.commit()

        # 6. Safety Events
        print("  -> Loading safety_events.csv...")
        with open(data_dir / "safety_events.csv", "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                db.add(SafetyEvent(
                    event_id=row["event_id"],
                    cycle_id=row["cycle_id"],
                    machine_id=row["machine_id"],
                    operator_id=row["operator_id"],
                    timestamp=row["timestamp"],
                    event_type=row["event_type"],
                    severity=row["severity"],
                    duration_seconds=float(row["duration_seconds"]),
                    description=row["description"]
                ))
        db.commit()

        # 7. Telemetry (batch commit for speed)
        print("  -> Loading telemetry.csv (14k+ time-series records)...")
        batch = []
        with open(data_dir / "telemetry.csv", "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                batch.append(Telemetry(
                    timestamp=row["timestamp"],
                    cycle_id=row["cycle_id"],
                    machine_id=row["machine_id"],
                    operator_id=row["operator_id"],
                    phase=row["phase"],
                    engine_hours=float(row["engine_hours"]),
                    engine_rpm=int(row["engine_rpm"]),
                    fuel_rate_l_hr=float(row["fuel_rate_l_hr"]),
                    bucket_load_pct=float(row["bucket_load_pct"]),
                    hydraulic_pressure_bar=float(row["hydraulic_pressure_bar"]),
                    hydraulic_temp_c=float(row["hydraulic_temp_c"]),
                    boom_angle_deg=float(row["boom_angle_deg"]),
                    arm_angle_deg=float(row["arm_angle_deg"]),
                    bucket_angle_deg=float(row["bucket_angle_deg"]),
                    machine_speed_kmh=float(row["machine_speed_kmh"]),
                    seatbelt_status=row["seatbelt_status"],
                    task_type=row["task_type"],
                    soil_condition=row["soil_condition"],
                    load_condition=row["load_condition"]
                ))
                if len(batch) >= 1000:
                    db.bulk_save_objects(batch)
                    db.commit()
                    batch = []
            if batch:
                db.bulk_save_objects(batch)
                db.commit()

        print("[*] Running Unsupervised Technique Discovery Engine...")
        miner = TechniqueMiner(db)
        discovered = miner.mine_and_store()

        print(f"[+] Successfully mined {len(discovered)} empirical techniques from cycle distributions:")
        for t in discovered:
            print(f"    • {t.technique_id}: '{t.title}' | Author: {t.author_name} | Adv: +{t.advantage_pct}% ({t.cycle_sample_count} cycles)")

        # Create Canonical Transfer Session (Fernandes -> Aryan)
        tech_17 = db.query(Technique).filter(Technique.technique_id == "TECH_017").first()
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
            print("[+] Initialized Fernandes -> Aryan Transfer Session Record.")

        print()
        print("==========================================")
        print("CAT LEGACY DATABASE SEEDING COMPLETED")
        print("==========================================")
        print(f"Machines:       {db.query(Machine).count()}")
        print(f"Operators:      {db.query(Operator).count()}")
        print(f"Cycles:         {db.query(Cycle).count()}")
        print(f"Cycle Phases:   {db.query(CyclePhase).count()}")
        print(f"Telemetry Rows: {db.query(Telemetry).count()}")
        print(f"Safety Events:  {db.query(SafetyEvent).count()}")
        print(f"Techniques:     {db.query(Technique).count()}")
        print(f"Transfer Proof: {db.query(TransferSession).count()}")
        print("Status:         ✓ SEEDED & MINED")
        print("==========================================")

    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Seed CAT Legacy database with synthetic dataset and mine techniques.")
    parser.add_argument("--data-dir", type=str, default="data", help="Directory containing CSV files (default: data)")
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    seed_database(data_dir)


if __name__ == "__main__":
    main()
