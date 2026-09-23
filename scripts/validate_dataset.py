#!/usr/bin/env python3
"""
CAT Legacy - Synthetic Dataset Validation Pipeline
=================================================
Validates basic integrity, logical relationships, and statistical behavioral
signatures of the generated telemetry dataset.
"""

import argparse
import csv
import math
import statistics
import sys
from pathlib import Path
from typing import Dict, List, Any


def load_csv(path: Path) -> List[Dict[str, str]]:
    if not path.exists():
        raise FileNotFoundError(f"Missing expected CSV file: {path}")
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def validate_dataset(data_dir: Path) -> bool:
    machines = load_csv(data_dir / "machines.csv")
    operators = load_csv(data_dir / "operators.csv")
    cycles = load_csv(data_dir / "cycles.csv")
    cycle_phases = load_csv(data_dir / "cycle_phases.csv")
    safety_events = load_csv(data_dir / "safety_events.csv")
    contexts = load_csv(data_dir / "contexts.csv")
    telemetry = load_csv(data_dir / "telemetry.csv")

    errors = []
    warnings = []

    # -------------------------------------------------------------------------
    # 1. Basic Referential Integrity & Non-Null Checks
    # -------------------------------------------------------------------------
    machine_ids = {m["machine_id"] for m in machines}
    operator_ids = {op["operator_id"] for op in operators}
    exp_op_ids = {op["operator_id"] for op in operators if op["skill_level"] == "experienced"}
    nov_op_ids = {op["operator_id"] for op in operators if op["skill_level"] == "novice"}

    if len(machine_ids) < 3:
        errors.append(f"Expected at least 3 machines, found {len(machine_ids)}")
    if len(operator_ids) < 5:
        errors.append(f"Expected at least 5 operators, found {len(operator_ids)}")

    cycle_ids = set()
    prev_timestamp = None

    for c in cycles:
        c_id = c["cycle_id"]
        cycle_ids.add(c_id)

        if c["operator_id"] not in operator_ids:
            errors.append(f"Cycle {c_id} has invalid operator_id: {c['operator_id']}")
        if c["machine_id"] not in machine_ids:
            errors.append(f"Cycle {c_id} has invalid machine_id: {c['machine_id']}")

        # Numerical bounds
        c_time = float(c["cycle_time_seconds"])
        fuel = float(c["fuel_used_l"])
        load = float(c["load_amount_tons"])

        if c_time <= 0:
            errors.append(f"Cycle {c_id} has non-positive cycle time: {c_time}")
        if fuel <= 0:
            errors.append(f"Cycle {c_id} has non-positive fuel: {fuel}")
        if load < 0:
            errors.append(f"Cycle {c_id} has negative load: {load}")

        # Timestamp ordering check
        ts = c["timestamp"]
        if prev_timestamp and ts < prev_timestamp:
            errors.append(f"Cycle {c_id} timestamp out of order: {ts} < {prev_timestamp}")
        prev_timestamp = ts

    # -------------------------------------------------------------------------
    # 2. Logical Coherence (cycle_time ≈ sum of phase durations + idle)
    # -------------------------------------------------------------------------
    phases_by_cycle: Dict[str, List[Dict[str, str]]] = {}
    for p in cycle_phases:
        phases_by_cycle.setdefault(p["cycle_id"], []).append(p)

    for c in cycles:
        c_id = c["cycle_id"]
        c_phases = phases_by_cycle.get(c_id, [])
        if len(c_phases) != 5:
            errors.append(f"Cycle {c_id} does not have 5 phases (found {len(c_phases)})")

        sum_phases = sum(float(p["duration_seconds"]) for p in c_phases)
        idle = float(c["idle_time_seconds"])
        c_time = float(c["cycle_time_seconds"])

        # Allowance for rounding noise is 0.5s
        if abs(c_time - (sum_phases + idle)) > 0.5:
            errors.append(f"Cycle {c_id} duration mismatch: {c_time} != sum({sum_phases}) + idle({idle})")

    # -------------------------------------------------------------------------
    # 3. Behavioral Analysis & Candidate Techniques
    # -------------------------------------------------------------------------
    # Group cycles by (task, soil, load)
    cohorts: Dict[tuple, List[Dict[str, Any]]] = {}
    for c in cycles:
        key = (c["task_type"], c["soil_condition"], c["load_condition"])
        cohorts.setdefault(key, []).append(c)

    # Calculate Fernandes comparable cohort
    fernandes_comparable = [
        c for c in cycles
        if c["operator_id"] == "OP_EXP_001"
        and c["task_type"] == "trenching"
        and c["soil_condition"] == "soft"
        and c["load_condition"] == "medium"
    ]
    fernandes_count = len(fernandes_comparable)

    # Aryan pre/post cycles
    aryan_pre = [
        c for c in cycles
        if c["operator_id"] == "OP_NOV_001"
        and c["task_type"] == "trenching"
        and c["soil_condition"] == "soft"
        and c["load_condition"] == "medium"
        and int(c.get("is_post_coaching", 0)) == 0
    ]
    aryan_post = [
        c for c in cycles
        if c["operator_id"] == "OP_NOV_001"
        and c["task_type"] == "trenching"
        and c["soil_condition"] == "soft"
        and c["load_condition"] == "medium"
        and int(c.get("is_post_coaching", 0)) == 1
    ]

    if fernandes_count < 50:
        errors.append(f"Fernandes comparable cycles too low: {fernandes_count} (expected >= 50, target 94)")
    if len(aryan_pre) < 5:
        errors.append(f"Aryan pre-coaching cycles too low: {len(aryan_pre)}")
    if len(aryan_post) < 5:
        errors.append(f"Aryan post-coaching cycles too low: {len(aryan_post)}")

    # Check Aryan reposition improvement
    # Map reposition duration by cycle_id
    rep_durations = {
        p["cycle_id"]: float(p["duration_seconds"])
        for p in cycle_phases
        if p["phase_name"] == "REPOSITION"
    }

    fernandes_rep_times = [rep_durations[c["cycle_id"]] for c in fernandes_comparable]
    aryan_pre_rep_times = [rep_durations[c["cycle_id"]] for c in aryan_pre]
    aryan_post_rep_times = [rep_durations[c["cycle_id"]] for c in aryan_post]

    fer_median = statistics.median(fernandes_rep_times)
    fer_stdev = statistics.stdev(fernandes_rep_times)
    pre_median = statistics.median(aryan_pre_rep_times)
    post_median = statistics.median(aryan_post_rep_times)
    post_stdev = statistics.stdev(aryan_post_rep_times)

    if pre_median <= fer_median:
        errors.append(f"Aryan pre-coaching ({pre_median}s) not slower than Fernandes ({fer_median}s)")

    improvement_pct = ((pre_median - post_median) / pre_median) * 100.0
    if improvement_pct < 15.0:
        errors.append(f"Aryan post-coaching improvement too small: {improvement_pct:.1f}% (expected > 15%)")

    # Discover potential techniques algorithmically
    # A potential technique is an (operator, context, phase/cycle) cluster with >= 6 cycles where
    # the operator has lower cycle time or lower phase duration than cohort average with low variance
    potential_techniques = []
    
    # Phase map by cycle
    cycle_phase_durations = {}
    for p in cycle_phases:
        cycle_phase_durations.setdefault(p["cycle_id"], {})[p["phase_name"]] = float(p["duration_seconds"])

    for ctx_key, cohort_cycles in cohorts.items():
        if len(cohort_cycles) < 8:
            continue
        
        # Group by operator in this cohort
        op_groups: Dict[str, List[Dict[str, Any]]] = {}
        for c in cohort_cycles:
            op_groups.setdefault(c["operator_id"], []).append(c)

        for phase_name in ["OVERALL", "REPOSITION", "SWING", "DIG"]:
            if phase_name == "OVERALL":
                cohort_vals = [float(c["cycle_time_seconds"]) for c in cohort_cycles]
            else:
                cohort_vals = [cycle_phase_durations[c["cycle_id"]][phase_name] for c in cohort_cycles if c["cycle_id"] in cycle_phase_durations]
            
            if not cohort_vals:
                continue
            cohort_avg = statistics.mean(cohort_vals)

            for op_id, op_cycles in op_groups.items():
                if op_id not in exp_op_ids or len(op_cycles) < 7:
                    continue

                if phase_name == "OVERALL":
                    op_vals = [float(c["cycle_time_seconds"]) for c in op_cycles]
                else:
                    op_vals = [cycle_phase_durations[c["cycle_id"]][phase_name] for c in op_cycles if c["cycle_id"] in cycle_phase_durations]
                
                op_avg = statistics.mean(op_vals)
                op_stdev = statistics.stdev(op_vals) if len(op_vals) > 1 else 0

                # Statistical advantage criteria: >= 9% faster than cohort with high consistency (stdev < 1.4s)
                if op_avg < cohort_avg * 0.91 and op_stdev < 1.4:
                    potential_techniques.append({
                        "operator_id": op_id,
                        "context": ctx_key,
                        "phase": phase_name,
                        "cycle_count": len(op_cycles),
                        "advantage_pct": round(((cohort_avg - op_avg) / cohort_avg) * 100.0, 1)
                    })

    # Summary counts
    trenching_count = sum(1 for c in cycles if c["task_type"] == "trenching")
    excavation_count = sum(1 for c in cycles if c["task_type"] == "excavation")
    soft_count = sum(1 for c in cycles if c["soil_condition"] == "soft")
    medium_count = sum(1 for c in cycles if c["soil_condition"] == "medium")
    hard_count = sum(1 for c in cycles if c["soil_condition"] == "hard")

    # -------------------------------------------------------------------------
    # Formatted CLI Output
    # -------------------------------------------------------------------------
    print("CAT LEGACY DATASET VALIDATION")
    print("──────────────────────────────")
    print()
    print(f"Machines: {len(machines)}")
    print(f"Operators: {len(operators)}")
    print(f"Experienced: {len(exp_op_ids)}")
    print(f"Novice: {len(nov_op_ids)}")
    print()
    print(f"Cycles: {len(cycles)}")
    print()
    print(f"Trenching cycles: {trenching_count}")
    print(f"Excavation cycles: {excavation_count}")
    print()
    print(f"Soft soil: {soft_count}")
    print(f"Medium soil: {medium_count}")
    print(f"Hard soil: {hard_count}")
    print()
    print("Fernandes comparable cycles:")
    print(f"{fernandes_count}")
    print()
    print("Potential techniques discovered:")
    print(f"{len(potential_techniques)}")
    print()
    print("Aryan pre-coaching cycles:")
    print(f"{len(aryan_pre)}")
    print()
    print("Aryan post-coaching cycles:")
    print(f"{len(aryan_post)}")
    print()
    print("Safety events:")
    print(f"{len(safety_events)}")
    print()
    print("Validation:")

    if errors:
        print("✗ FAILED")
        for err in errors:
            print(f"  - ERROR: {err}")
        return False
    else:
        print("✓ PASS")
        print()
        print(f"  Statistical Verification Metrics:")
        print(f"  • Fernandes Repositioning: median={fer_median:.2f}s, stdev={fer_stdev:.2f}s (n={fernandes_count})")
        print(f"  • Aryan Pre-Coaching Repositioning: median={pre_median:.2f}s (n={len(aryan_pre)})")
        print(f"  • Aryan Post-Coaching Repositioning: median={post_median:.2f}s, stdev={post_stdev:.2f}s (n={len(aryan_post)})")
        print(f"  • Measured Transfer Delta: {improvement_pct:.1f}% repositioning time reduction")
        return True


def main():
    parser = argparse.ArgumentParser(description="Validate CAT Legacy synthetic dataset.")
    parser.add_argument("--data-dir", type=str, default="data", help="Directory containing CSV files (default: data)")
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    passed = validate_dataset(data_dir)
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
