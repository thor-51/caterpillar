#!/usr/bin/env python3
"""
CAT Legacy - Synthetic Telemetry Data Generator
==============================================
Generates a realistic, statistically grounded synthetic telemetry dataset
for heavy equipment operator behavior, technique discovery, and skill transfer.

Principles:
- Deterministic reproducibility via fixed SEED=42.
- Realistic behavioral variance and overlapping probability distributions.
- Emergent expert signatures (Fernandes soft-soil trenching, Rao heavy-load swing).
- Natural novice deviations (Aryan pre-coaching reposition latency).
- Verifiable transfer event (Aryan post-coaching cycle improvement).
- Multi-phase cycles (DIG, LIFT, SWING, DUMP, REPOSITION) with 1 Hz telemetry.
"""

import argparse
import csv
import datetime
import math
import os
import random
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Dict, Any, Tuple


# =============================================================================
# Domain Models & Profiles
# =============================================================================

@dataclass
class MachineProfile:
    machine_id: str
    model: str
    year: int
    operating_hours: float
    fuel_efficiency_factor: float  # Multiplier on fuel consumption (1.0 = baseline)
    hydraulic_health_index: float  # 0.90 - 1.00


@dataclass
class OperatorProfile:
    operator_id: str
    name: str
    experience_years: int
    skill_level: str  # "experienced" or "novice"
    preferred_task: str
    consistency: float  # 0.0 - 1.0 (higher = lower variance)
    reposition_efficiency: float  # Relative efficiency in repositioning phase
    fuel_efficiency: float  # Relative efficiency in throttle/hydraulic management
    safety_compliance: float  # 0.0 - 1.0 (higher = less unfastened seatbelt events)


# =============================================================================
# Fleet & Operator Initialization
# =============================================================================

MACHINES: List[MachineProfile] = [
    MachineProfile("EXC001", "CAT 320 GC", 2021, 1540.5, 1.00, 0.98),
    MachineProfile("EXC002", "CAT 323", 2019, 2245.0, 1.06, 0.94),
    MachineProfile("EXC003", "CAT 330", 2022, 912.0, 0.97, 0.99),
    MachineProfile("EXC004", "CAT 320", 2020, 1820.0, 1.02, 0.96),
    MachineProfile("EXC005", "CAT 326", 2021, 1260.5, 0.99, 0.97),
]

OPERATORS: List[OperatorProfile] = [
    # Experienced Veterans
    OperatorProfile("OP_EXP_001", "Fernandes", 14, "experienced", "trenching", 0.92, 0.91, 0.88, 0.99),
    OperatorProfile("OP_EXP_002", "Rao", 11, "experienced", "excavation", 0.89, 0.86, 0.88, 0.98),
    OperatorProfile("OP_EXP_003", "Mehta", 16, "experienced", "trenching", 0.94, 0.88, 0.85, 0.99),

    # Novices
    OperatorProfile("OP_NOV_001", "Aryan", 1, "novice", "trenching", 0.72, 0.68, 0.76, 0.95),
    OperatorProfile("OP_NOV_002", "Chen", 2, "novice", "excavation", 0.75, 0.78, 0.69, 0.94),
    OperatorProfile("OP_NOV_003", "Johnson", 1, "novice", "trenching", 0.70, 0.74, 0.72, 0.93),
    OperatorProfile("OP_NOV_004", "Silva", 1, "novice", "excavation", 0.68, 0.70, 0.70, 0.84),  # Lower safety compliance
    OperatorProfile("OP_NOV_005", "Kowalski", 2, "novice", "trenching", 0.74, 0.73, 0.75, 0.92),
]


CONTEXT_COMBINATIONS = [
    ("trenching", "soft", "medium"),
    ("trenching", "soft", "light"),
    ("trenching", "soft", "heavy"),
    ("trenching", "medium", "light"),
    ("trenching", "medium", "medium"),
    ("trenching", "medium", "heavy"),
    ("trenching", "hard", "light"),
    ("trenching", "hard", "medium"),
    ("trenching", "hard", "heavy"),
    ("excavation", "soft", "medium"),
    ("excavation", "medium", "medium"),
    ("excavation", "medium", "heavy"),
    ("excavation", "hard", "heavy"),
    ("excavation", "hard", "medium"),
]


# =============================================================================
# Generator Class
# =============================================================================

class DatasetGenerator:
    def __init__(self, seed: int = 42):
        self.seed = seed
        self.rng = random.Random(seed)
        self.base_time = datetime.datetime(2026, 8, 10, 7, 0, 0)
        
        # State tracking
        self.cycles: List[Dict[str, Any]] = []
        self.cycle_phases: List[Dict[str, Any]] = []
        self.telemetry_rows: List[Dict[str, Any]] = []
        self.safety_events: List[Dict[str, Any]] = []
        self.contexts_set: set = set()

    def _gaussian(self, mean: float, std: float, min_val: float, max_val: float) -> float:
        val = self.rng.gauss(mean, std)
        return max(min_val, min(max_val, val))

    def _generate_phase_durations(
        self,
        operator: OperatorProfile,
        task_type: str,
        soil: str,
        load: str,
        is_aryan_post_coaching: bool = False
    ) -> Tuple[float, float, float, float, float, float]:
        """
        Calculates realistic phase durations based on physical soil resistance,
        load weight, operator consistency, and individual technique signatures.
        """
        # Context multipliers
        soil_mult = {"soft": 0.95, "medium": 1.00, "hard": 1.15}[soil]
        load_mult = {"light": 0.92, "medium": 1.00, "heavy": 1.12}[load]
        variance_scale = (1.0 - operator.consistency) * 1.8 + 0.35

        # Baseline durations (seconds)
        dig_base = 8.6 * soil_mult * load_mult
        lift_base = 5.8 * load_mult
        swing_base = 6.8 * load_mult
        dump_base = 5.6
        idle_base = 0.8

        # --- Operator-specific Technique Signatures ---
        if operator.operator_id == "OP_EXP_001":  # Fernandes
            if task_type == "trenching" and soil == "soft" and load == "medium":
                # Master Signature: Technique #17 (Soft Soil Trenching Repositioning)
                # Fernandes repositions with fluent micro-track shifts without high bucket raise
                reposition_base = 8.2
                rep_std = 0.9
                dig_mean = 8.5
                lift_mean = 5.8
                swing_mean = 6.7
                dump_mean = 5.5
            else:
                reposition_base = 8.8
                rep_std = 1.1
                dig_mean = dig_base
                lift_mean = lift_base
                swing_mean = swing_base
                dump_mean = dump_base

            dig = self._gaussian(dig_mean, 0.55 * variance_scale, 6.5, 12.0)
            lift = self._gaussian(lift_mean, 0.40 * variance_scale, 4.2, 8.5)
            swing = self._gaussian(swing_mean, 0.45 * variance_scale, 5.0, 9.5)
            dump = self._gaussian(dump_mean, 0.38 * variance_scale, 4.0, 8.0)
            reposition = self._gaussian(reposition_base, rep_std, 6.5, 11.0)

        elif operator.operator_id == "OP_EXP_002":  # Rao
            # Rao's Signature: Excavation + Heavy Load Swing optimization
            if task_type == "excavation" and load == "heavy":
                swing_mean = 6.2
                reposition_base = 8.9
            else:
                swing_mean = swing_base
                reposition_base = 9.2

            dig = self._gaussian(dig_base, 0.65 * variance_scale, 7.0, 13.0)
            lift = self._gaussian(lift_base, 0.45 * variance_scale, 4.5, 9.0)
            swing = self._gaussian(swing_mean, 0.45 * variance_scale, 5.0, 9.2)
            dump = self._gaussian(dump_base, 0.45 * variance_scale, 4.2, 8.5)
            reposition = self._gaussian(reposition_base, 1.1 * variance_scale, 7.0, 12.0)

        elif operator.operator_id == "OP_EXP_003":  # Mehta
            dig = self._gaussian(dig_base * 0.97, 0.50 * variance_scale, 6.8, 11.5)
            lift = self._gaussian(lift_base, 0.40 * variance_scale, 4.4, 8.2)
            swing = self._gaussian(swing_base, 0.45 * variance_scale, 5.1, 9.0)
            dump = self._gaussian(dump_base, 0.40 * variance_scale, 4.0, 8.0)
            reposition = self._gaussian(8.7, 1.0 * variance_scale, 6.8, 11.5)

        elif operator.operator_id == "OP_NOV_001":  # Aryan
            if is_aryan_post_coaching:
                # Post-Coaching Aryan: Adopts Fernandes' repositioning fluidity!
                # Target: ~8.4s repositioning with tight variance
                dig = self._gaussian(8.8, 0.70, 7.0, 12.0)
                lift = self._gaussian(5.9, 0.50, 4.5, 8.5)
                swing = self._gaussian(6.8, 0.55, 5.2, 9.5)
                dump = self._gaussian(5.7, 0.45, 4.3, 8.2)
                reposition = self._gaussian(8.45, 0.95, 6.8, 10.8)
            else:
                # Pre-Coaching Aryan: Hesitates on soft soil repositioning, raises boom too high
                # Target: ~11.6s repositioning
                dig = self._gaussian(9.15, 1.10, 7.2, 13.5)
                lift = self._gaussian(6.15, 0.75, 4.6, 9.2)
                swing = self._gaussian(7.05, 0.80, 5.2, 10.5)
                dump = self._gaussian(5.90, 0.65, 4.3, 8.8)
                reposition = self._gaussian(11.65, 1.95, 8.8, 16.5)

        else:
            # Other Novices (Realistic variation & natural overlap)
            novice_rep_mean = 10.4 + (1.0 - operator.reposition_efficiency) * 3.5
            dig = self._gaussian(dig_base * 1.06, 1.15 * variance_scale, 7.0, 14.0)
            lift = self._gaussian(lift_base * 1.04, 0.75 * variance_scale, 4.5, 9.5)
            swing = self._gaussian(swing_base * 1.05, 0.80 * variance_scale, 5.0, 10.5)
            dump = self._gaussian(dump_base * 1.03, 0.65 * variance_scale, 4.2, 9.0)
            reposition = self._gaussian(novice_rep_mean, 2.10 * variance_scale, 7.5, 16.0)

        idle = self._gaussian(idle_base, 0.25, 0.2, 1.8)
        return (
            round(dig, 2),
            round(lift, 2),
            round(swing, 2),
            round(dump, 2),
            round(reposition, 2),
            round(idle, 2)
        )

    def _generate_1hz_telemetry(
        self,
        cycle_id: str,
        machine: MachineProfile,
        operator: OperatorProfile,
        task_type: str,
        soil: str,
        load: str,
        start_time: datetime.datetime,
        phase_durations: Tuple[float, float, float, float, float, float],
        has_seatbelt_alert: bool
    ) -> List[Dict[str, Any]]:
        """
        Generates 1 Hz raw sensor telemetry covering the physical phases of the cycle.
        """
        dig_t, lift_t, swing_t, dump_t, rep_t, idle_t = phase_durations
        phases_plan = [
            ("DIG", dig_t),
            ("LIFT", lift_t),
            ("SWING", swing_t),
            ("DUMP", dump_t),
            ("REPOSITION", rep_t)
        ]

        telemetry_records = []
        current_time = start_time
        sec_offset = 0

        for phase_name, dur in phases_plan:
            steps = max(1, int(round(dur)))
            for step in range(steps):
                progress = step / float(steps)

                # Sensor modeling by phase
                if phase_name == "DIG":
                    rpm = self._gaussian(1850, 45, 1650, 2050)
                    pressure = self._gaussian(275.0, 18.0, 210.0, 330.0)
                    fuel_rate = self._gaussian(22.5 * machine.fuel_efficiency_factor, 1.5, 17.0, 29.0)
                    bucket_load = min(100.0, 25.0 + progress * 72.0)
                    boom_pos = self._gaussian(24.0, 2.0, 18.0, 32.0)
                    arm_pos = self._gaussian(42.0 + progress * 28.0, 3.0, 35.0, 85.0)
                    bucket_pos = self._gaussian(30.0 + progress * 60.0, 4.0, 25.0, 105.0)
                    speed = 0.0

                elif phase_name == "LIFT":
                    rpm = self._gaussian(1780, 40, 1600, 1950)
                    pressure = self._gaussian(240.0, 15.0, 190.0, 290.0)
                    fuel_rate = self._gaussian(19.8 * machine.fuel_efficiency_factor, 1.2, 15.0, 25.0)
                    bucket_load = self._gaussian(94.0, 3.0, 80.0, 102.0)
                    boom_pos = self._gaussian(30.0 + progress * 26.0, 2.5, 28.0, 62.0)
                    arm_pos = self._gaussian(70.0, 3.0, 60.0, 80.0)
                    bucket_pos = self._gaussian(88.0, 3.0, 78.0, 98.0)
                    speed = 0.0

                elif phase_name == "SWING":
                    rpm = self._gaussian(1650, 35, 1500, 1800)
                    pressure = self._gaussian(185.0, 12.0, 150.0, 230.0)
                    fuel_rate = self._gaussian(16.5 * machine.fuel_efficiency_factor, 1.0, 13.0, 21.0)
                    bucket_load = self._gaussian(93.5, 3.0, 80.0, 102.0)
                    boom_pos = self._gaussian(54.0, 2.0, 48.0, 60.0)
                    arm_pos = self._gaussian(68.0, 2.5, 60.0, 76.0)
                    bucket_pos = self._gaussian(87.0, 2.0, 80.0, 95.0)
                    speed = 0.0

                elif phase_name == "DUMP":
                    rpm = self._gaussian(1700, 40, 1520, 1850)
                    pressure = self._gaussian(195.0, 14.0, 160.0, 240.0)
                    fuel_rate = self._gaussian(17.2 * machine.fuel_efficiency_factor, 1.1, 13.5, 22.0)
                    bucket_load = max(5.0, 90.0 - progress * 82.0)
                    boom_pos = self._gaussian(52.0, 2.0, 46.0, 58.0)
                    arm_pos = self._gaussian(72.0, 3.0, 62.0, 82.0)
                    bucket_pos = self._gaussian(85.0 - progress * 55.0, 3.0, 25.0, 90.0)
                    speed = 0.0

                elif phase_name == "REPOSITION":
                    rpm = self._gaussian(1720, 50, 1500, 1900)
                    pressure = self._gaussian(165.0, 16.0, 130.0, 215.0)
                    fuel_rate = self._gaussian(18.0 * machine.fuel_efficiency_factor, 1.4, 14.0, 23.0)
                    bucket_load = 5.0
                    boom_pos = self._gaussian(35.0, 3.0, 25.0, 45.0)
                    arm_pos = self._gaussian(45.0, 3.0, 35.0, 55.0)
                    bucket_pos = self._gaussian(32.0, 3.0, 25.0, 42.0)
                    # Vehicle tracks move during reposition
                    speed = self._gaussian(2.2, 0.4, 1.2, 3.4)

                seatbelt_status = "UNFASTENED" if has_seatbelt_alert and step < 4 else "FASTENED"

                row_time = current_time + datetime.timedelta(seconds=sec_offset)
                sec_offset += 1

                telemetry_records.append({
                    "timestamp": row_time.isoformat(),
                    "cycle_id": cycle_id,
                    "machine_id": machine.machine_id,
                    "operator_id": operator.operator_id,
                    "phase": phase_name,
                    "engine_hours": round(machine.operating_hours + (sec_offset / 3600.0), 3),
                    "engine_rpm": int(round(rpm)),
                    "fuel_rate_l_hr": round(fuel_rate, 2),
                    "bucket_load_pct": round(bucket_load, 1),
                    "hydraulic_pressure_bar": round(pressure, 1),
                    "hydraulic_temp_c": round(self._gaussian(74.0, 2.5, 66.0, 84.0), 1),
                    "boom_angle_deg": round(boom_pos, 1),
                    "arm_angle_deg": round(arm_pos, 1),
                    "bucket_angle_deg": round(bucket_pos, 1),
                    "machine_speed_kmh": round(speed, 2),
                    "seatbelt_status": seatbelt_status,
                    "task_type": task_type,
                    "soil_condition": soil,
                    "load_condition": load
                })

        return telemetry_records

    def generate_dataset(self) -> Dict[str, Any]:
        """
        Orchestrates full dataset generation according to exact specification:
        - Total cycles: 384
        - Trenching cycles: 271
        - Excavation cycles: 113
        - Soft soil: 142
        - Medium soil: 161
        - Hard soil: 81
        - Fernandes comparable cycles: 94
        - Aryan pre-coaching cycles: 10
        - Aryan post-coaching cycles: 10
        - Safety events: 8
        """
        self.rng.seed(self.seed)

        # Plan cycle allocations deterministically to match exact distribution
        # Total: 384
        # Trenching: 271 | Excavation: 113
        # Soft: 142 | Medium: 161 | Hard: 81

        # We construct a balanced plan:
        # Context 1: ("trenching", "soft", "medium") -> 94 for Fernandes, 10 Aryan Pre, 10 Aryan Post, 12 others = 126
        # Soft total needed = 142. Remaining soft = 142 - 126 = 16:
        #   - ("trenching", "soft", "light") -> 10
        #   - ("excavation", "soft", "medium") -> 6
        # Medium total needed = 161:
        #   - ("trenching", "medium", "medium") -> 75
        #   - ("trenching", "medium", "light") -> 30
        #   - ("trenching", "medium", "heavy") -> 10
        #   - ("excavation", "medium", "medium") -> 26
        #   - ("excavation", "medium", "heavy") -> 20
        # Hard total needed = 81:
        #   - ("trenching", "hard", "medium") -> 10
        #   - ("trenching", "hard", "heavy") -> 10
        #   - ("excavation", "hard", "heavy") -> 41
        #   - ("excavation", "hard", "medium") -> 20
        # Check trenching: 126 + 10 + 75 + 30 + 10 + 10 + 10 = 271! Exactly 271!
        # Check excavation: 6 + 26 + 20 + 41 + 20 = 113! Exactly 113!
        # Check soft: 126 + 10 + 6 = 142! Exactly 142!
        # Check medium: 75 + 30 + 10 + 26 + 20 = 161! Exactly 161!
        # Check hard: 10 + 10 + 41 + 20 = 81! Exactly 81!
        # Total = 142 + 161 + 81 = 384! Flawlessly balanced.

        cycle_specs = []

        # 1. Fernandes comparable cohort (Technique #17 Candidate)
        for i in range(94):
            cycle_specs.append({
                "operator_id": "OP_EXP_001",
                "task_type": "trenching",
                "soil_condition": "soft",
                "load_condition": "medium",
                "is_post_coaching": False
            })

        # 2. Aryan pre-coaching cohort (10 cycles under same condition)
        for i in range(10):
            cycle_specs.append({
                "operator_id": "OP_NOV_001",
                "task_type": "trenching",
                "soil_condition": "soft",
                "load_condition": "medium",
                "is_post_coaching": False
            })

        # 3. Aryan post-coaching cohort (10 cycles under same condition)
        for i in range(10):
            cycle_specs.append({
                "operator_id": "OP_NOV_001",
                "task_type": "trenching",
                "soil_condition": "soft",
                "load_condition": "medium",
                "is_post_coaching": True
            })

        # Remaining soft medium trenching (12 cycles from other operators)
        other_ops_trench = ["OP_EXP_003", "OP_NOV_002", "OP_NOV_003", "OP_NOV_005"]
        for i in range(12):
            cycle_specs.append({
                "operator_id": other_ops_trench[i % len(other_ops_trench)],
                "task_type": "trenching",
                "soil_condition": "soft",
                "load_condition": "medium",
                "is_post_coaching": False
            })

        # 4. Remaining soft soil
        # ("trenching", "soft", "light") -> 10
        for i in range(10):
            cycle_specs.append({
                "operator_id": self.rng.choice(["OP_EXP_001", "OP_EXP_003", "OP_NOV_001", "OP_NOV_003"]),
                "task_type": "trenching",
                "soil_condition": "soft",
                "load_condition": "light",
                "is_post_coaching": False
            })

        # ("excavation", "soft", "medium") -> 6
        for i in range(6):
            cycle_specs.append({
                "operator_id": self.rng.choice(["OP_EXP_002", "OP_NOV_002", "OP_NOV_004"]),
                "task_type": "excavation",
                "soil_condition": "soft",
                "load_condition": "medium",
                "is_post_coaching": False
            })

        # 5. Medium soil cycles (161 total)
        # ("trenching", "medium", "medium") -> 75
        for i in range(75):
            cycle_specs.append({
                "operator_id": self.rng.choice(["OP_EXP_001", "OP_EXP_003", "OP_NOV_001", "OP_NOV_003", "OP_NOV_005"]),
                "task_type": "trenching",
                "soil_condition": "medium",
                "load_condition": "medium",
                "is_post_coaching": False
            })

        # ("trenching", "medium", "light") -> 30
        for i in range(30):
            cycle_specs.append({
                "operator_id": self.rng.choice(["OP_EXP_001", "OP_EXP_003", "OP_NOV_002", "OP_NOV_004"]),
                "task_type": "trenching",
                "soil_condition": "medium",
                "load_condition": "light",
                "is_post_coaching": False
            })

        # ("trenching", "medium", "heavy") -> 10
        for i in range(10):
            cycle_specs.append({
                "operator_id": self.rng.choice(["OP_EXP_001", "OP_EXP_002", "OP_EXP_003", "OP_NOV_005"]),
                "task_type": "trenching",
                "soil_condition": "medium",
                "load_condition": "heavy",
                "is_post_coaching": False
            })

        # ("excavation", "medium", "medium") -> 26
        for i in range(26):
            cycle_specs.append({
                "operator_id": self.rng.choice(["OP_EXP_002", "OP_NOV_002", "OP_NOV_004", "OP_EXP_003"]),
                "task_type": "excavation",
                "soil_condition": "medium",
                "load_condition": "medium",
                "is_post_coaching": False
            })

        # ("excavation", "medium", "heavy") -> 20
        for i in range(20):
            cycle_specs.append({
                "operator_id": self.rng.choice(["OP_EXP_002", "OP_NOV_002", "OP_NOV_004"]),
                "task_type": "excavation",
                "soil_condition": "medium",
                "load_condition": "heavy",
                "is_post_coaching": False
            })

        # 6. Hard soil cycles (81 total)
        # ("trenching", "hard", "medium") -> 10
        for i in range(10):
            cycle_specs.append({
                "operator_id": self.rng.choice(["OP_EXP_001", "OP_EXP_003", "OP_NOV_003"]),
                "task_type": "trenching",
                "soil_condition": "hard",
                "load_condition": "medium",
                "is_post_coaching": False
            })

        # ("trenching", "hard", "heavy") -> 10
        for i in range(10):
            cycle_specs.append({
                "operator_id": self.rng.choice(["OP_EXP_001", "OP_EXP_003", "OP_NOV_001"]),
                "task_type": "trenching",
                "soil_condition": "hard",
                "load_condition": "heavy",
                "is_post_coaching": False
            })

        # ("excavation", "hard", "heavy") -> 41 (Rao's signature candidate)
        for i in range(41):
            cycle_specs.append({
                "operator_id": "OP_EXP_002" if i < 22 else self.rng.choice(["OP_NOV_002", "OP_NOV_004", "OP_EXP_003"]),
                "task_type": "excavation",
                "soil_condition": "hard",
                "load_condition": "heavy",
                "is_post_coaching": False
            })

        # ("excavation", "hard", "medium") -> 20
        for i in range(20):
            cycle_specs.append({
                "operator_id": self.rng.choice(["OP_EXP_002", "OP_NOV_002", "OP_NOV_004", "OP_NOV_005"]),
                "task_type": "excavation",
                "soil_condition": "hard",
                "load_condition": "medium",
                "is_post_coaching": False
            })

        # Map lookup
        op_map = {op.operator_id: op for op in OPERATORS}
        mach_map = {m.machine_id: m for m in MACHINES}

        # Target safety events: exactly 8 safety events across the dataset
        safety_event_target = 8
        safety_event_count = 0
        safety_assigned_indices = {18, 54, 88, 142, 195, 230, 290, 345}

        # Generate cycles
        current_time = self.base_time

        for idx, spec in enumerate(cycle_specs):
            cycle_id = f"CYC_{idx + 1:04d}"
            op = op_map[spec["operator_id"]]
            
            # Select machine deterministically with preference
            mach_idx = (idx % len(MACHINES))
            mach = MACHINES[mach_idx]

            # Context tracking
            ctx_key = (spec["task_type"], spec["soil_condition"], spec["load_condition"])
            self.contexts_set.add(ctx_key)

            # Generate phase durations
            dig, lift, swing, dump, rep, idle = self._generate_phase_durations(
                operator=op,
                task_type=spec["task_type"],
                soil=spec["soil_condition"],
                load=spec["load_condition"],
                is_aryan_post_coaching=spec["is_post_coaching"]
            )

            # Strict logical coherence: cycle_time ≈ sum of phases + idle
            cycle_time = round(dig + lift + swing + dump + rep + idle, 2)

            # Fuel calculation based on machine factor, operator efficiency, and cycle time
            base_fuel_rate_l_s = 0.0052 * mach.fuel_efficiency_factor * (1.18 - op.fuel_efficiency * 0.25)
            fuel_used = round(cycle_time * base_fuel_rate_l_s, 3)

            # Bucket payload (metric tons or kg)
            load_tons_base = {"light": 1.45, "medium": 1.95, "heavy": 2.40}[spec["load_condition"]]
            payload = round(load_tons_base * self._gaussian(1.0, 0.04 * (1.0 - op.consistency + 0.1), 0.85, 1.15), 2)

            # Safety event check
            has_safety = (idx in safety_assigned_indices) and (safety_event_count < safety_event_target)
            if has_safety:
                safety_event_count += 1
                evt_id = f"SE_{safety_event_count:03d}"
                self.safety_events.append({
                    "event_id": evt_id,
                    "cycle_id": cycle_id,
                    "machine_id": mach.machine_id,
                    "operator_id": op.operator_id,
                    "timestamp": current_time.isoformat(),
                    "event_type": "SEATBELT_UNFASTENED",
                    "severity": "WARNING" if op.skill_level == "experienced" else "CRITICAL",
                    "duration_seconds": round(self._gaussian(4.5, 1.2, 2.0, 8.0), 1),
                    "description": f"Operator {op.name} operated tracks/hydraulics while seatbelt unbuckled."
                })

            # Append Cycle Summary Record
            cycle_rec = {
                "cycle_id": cycle_id,
                "machine_id": mach.machine_id,
                "operator_id": op.operator_id,
                "timestamp": current_time.isoformat(),
                "task_type": spec["task_type"],
                "soil_condition": spec["soil_condition"],
                "load_condition": spec["load_condition"],
                "cycle_time_seconds": cycle_time,
                "fuel_used_l": fuel_used,
                "load_amount_tons": payload,
                "idle_time_seconds": idle,
                "is_post_coaching": 1 if spec["is_post_coaching"] else 0
            }
            self.cycles.append(cycle_rec)

            # Append Phase Breakdown Records
            for p_order, (p_name, p_dur) in enumerate([
                ("DIG", dig),
                ("LIFT", lift),
                ("SWING", swing),
                ("DUMP", dump),
                ("REPOSITION", rep)
            ], start=1):
                self.cycle_phases.append({
                    "phase_id": f"{cycle_id}_P{p_order}",
                    "cycle_id": cycle_id,
                    "phase_name": p_name,
                    "phase_order": p_order,
                    "duration_seconds": p_dur
                })

            # Generate 1 Hz raw telemetry samples for all cycles
            telemetry_pts = self._generate_1hz_telemetry(
                cycle_id=cycle_id,
                machine=mach,
                operator=op,
                task_type=spec["task_type"],
                soil=spec["soil_condition"],
                load=spec["load_condition"],
                start_time=current_time,
                phase_durations=(dig, lift, swing, dump, rep, idle),
                has_seatbelt_alert=has_safety
            )
            self.telemetry_rows.extend(telemetry_pts)

            # Advance clock
            current_time += datetime.timedelta(seconds=math.ceil(cycle_time) + 5)

        return {
            "cycles": self.cycles,
            "cycle_phases": self.cycle_phases,
            "telemetry": self.telemetry_rows,
            "safety_events": self.safety_events,
            "contexts": list(self.contexts_set)
        }

    def write_csvs(self, output_dir: Path):
        """Writes all generated data artifacts to CSV files."""
        output_dir.mkdir(parents=True, exist_ok=True)

        # 1. machines.csv
        with open(output_dir / "machines.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["machine_id", "model", "year", "operating_hours", "fuel_efficiency_factor", "hydraulic_health_index"])
            for m in MACHINES:
                writer.writerow([m.machine_id, m.model, m.year, m.operating_hours, m.fuel_efficiency_factor, m.hydraulic_health_index])

        # 2. operators.csv
        with open(output_dir / "operators.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["operator_id", "name", "experience_years", "skill_level", "preferred_task", "consistency", "reposition_efficiency", "fuel_efficiency", "safety_compliance"])
            for op in OPERATORS:
                writer.writerow([op.operator_id, op.name, op.experience_years, op.skill_level, op.preferred_task, op.consistency, op.reposition_efficiency, op.fuel_efficiency, op.safety_compliance])

        # 3. contexts.csv
        with open(output_dir / "contexts.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["context_id", "task_type", "soil_condition", "load_condition", "description"])
            for idx, (task, soil, load) in enumerate(sorted(self.contexts_set), start=1):
                writer.writerow([f"CTX_{idx:03d}", task, soil, load, f"{task.capitalize()} in {soil} soil with {load} payload"])

        # 4. cycles.csv
        with open(output_dir / "cycles.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "cycle_id", "machine_id", "operator_id", "timestamp", "task_type",
                "soil_condition", "load_condition", "cycle_time_seconds", "fuel_used_l",
                "load_amount_tons", "idle_time_seconds", "is_post_coaching"
            ])
            writer.writeheader()
            writer.writerows(self.cycles)

        # 5. cycle_phases.csv
        with open(output_dir / "cycle_phases.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["phase_id", "cycle_id", "phase_name", "phase_order", "duration_seconds"])
            writer.writeheader()
            writer.writerows(self.cycle_phases)

        # 6. safety_events.csv
        with open(output_dir / "safety_events.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "event_id", "cycle_id", "machine_id", "operator_id",
                "timestamp", "event_type", "severity", "duration_seconds", "description"
            ])
            writer.writeheader()
            writer.writerows(self.safety_events)

        # 7. telemetry.csv
        with open(output_dir / "telemetry.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "timestamp", "cycle_id", "machine_id", "operator_id", "phase",
                "engine_hours", "engine_rpm", "fuel_rate_l_hr", "bucket_load_pct",
                "hydraulic_pressure_bar", "hydraulic_temp_c", "boom_angle_deg",
                "arm_angle_deg", "bucket_angle_deg", "machine_speed_kmh",
                "seatbelt_status", "task_type", "soil_condition", "load_condition"
            ])
            writer.writeheader()
            writer.writerows(self.telemetry_rows)


# =============================================================================
# CLI Entry Point
# =============================================================================

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic CAT equipment telemetry dataset.")
    parser.add_argument("--seed", type=int, default=42, help="Fixed random seed for deterministic generation (default: 42)")
    parser.add_argument("--output-dir", type=str, default="data", help="Output directory for CSV files (default: data)")
    args = parser.parse_args()

    print(f"[*] Initializing synthetic data generation with SEED={args.seed}...")
    generator = DatasetGenerator(seed=args.seed)
    data = generator.generate_dataset()
    
    out_path = Path(args.output_dir)
    generator.write_csvs(out_path)

    print(f"[+] Successfully generated {len(data['cycles'])} cycles and {len(data['telemetry'])} telemetry rows.")
    print(f"[+] CSV files written to: {out_path.resolve()}")


if __name__ == "__main__":
    main()
