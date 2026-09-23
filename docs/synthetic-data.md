# CAT Legacy — Synthetic Telemetry Dataset & Generation Engine

> **Notice & Disclaimer**
> *"This dataset is synthetic and is intended to demonstrate the architecture and analytical workflow. It is not representative of proprietary CAT machine telemetry."*

---

## 1. Why Synthetic Data is Being Used

Real-world commercial heavy equipment telemetry is proprietary, bound by strict OEM intellectual property safeguards, non-disclosure agreements, and heavy customer privacy boundaries. Furthermore, field telemetry frequently suffers from inconsistent labeling, missing contextual metadata (such as uninstrumented soil hardness or localized geological strata), and scarce "before-and-after" coaching transfer events recorded under identical physical conditions.

To demonstrate **CAT Legacy's** end-to-end architecture—from raw time-series sensor ingestion and unsupervised technique mining to real-time cab assistance and skill transfer verification—we created a statistically sound, physically coherent synthetic data generation engine.

---

## 2. How it is Generated

The dataset is programmatically generated via `scripts/generate_data.py`. The generation process employs a pseudorandom number generator keyed to a configurable fixed seed:

```bash
python scripts/generate_data.py --seed 42 --output-dir data
```

The generation pipeline executes four coordinated stages:
1. **Fleet & Operator Parameterization**: Initializes five excavator profiles (`EXC001` through `EXC005`) and eight operator profiles (three veterans and five novices) with distinct physical efficiencies and variance traits.
2. **Context Cohort Scheduling**: Assigns operational cycles across combinations of tasks (`trenching`, `excavation`), soil profiles (`soft`, `medium`, `hard`), and payload loads (`light`, `medium`, `heavy`).
3. **Phase-Level Durations**: Models the five mechanical sub-phases of each excavation cycle (`DIG`, `LIFT`, `SWING`, `DUMP`, `REPOSITION`, plus `IDLE`) using Gaussian distributions governed by operator skill and machine factors.
4. **1 Hz Time-Series Synthesis**: Generates second-by-second telemetry records with realistic physical dynamics for engine RPM, hydraulic system pressures, fuel flow rates, payload sensors, boom/arm/bucket kinematics, track ground speeds, and safety restraint states.

---

## 3. Assumptions Made

The simulation adheres to several physical and operational assumptions:
1. **Physical Cycle Continuity**: A continuous duty cycle satisfies:
   $$\text{Cycle Time} \approx t_{\text{dig}} + t_{\text{lift}} + t_{\text{swing}} + t_{\text{dump}} + t_{\text{reposition}} + t_{\text{idle}}$$
   with a measurement noise threshold under $\pm 0.5$ seconds.
2. **Phase Kinematics**:
   - **DIG**: Maximum hydraulic cylinder pressure (210–330 bar), peak engine RPM (1650–2050 RPM), progressive bucket loading, zero vehicle speed.
   - **LIFT & SWING**: Elevated boom angle elevation, stable bucket payload, slewing motion, moderate hydraulic demand.
   - **DUMP**: Bucket angle rapid discharge, payload drop to residual tare level.
   - **REPOSITION**: Track drive motor engagement (1.2–3.4 km/h speed), lower hydraulic boom pressure, low bucket payload.
3. **Distribution Overlap**: Rather than treating experts as uniformly fast and novices as uniformly slow, all parameters are modeled as overlapping Gaussian distributions. Real-world operator variance reflects subtle habit differences rather than unrealistic binary performance.

---

## 4. How Operator Behavior is Modeled

Operators are characterized by specific multidimensional attributes:

```python
OperatorProfile(
    operator_id="OP_EXP_001",
    name="Fernandes",
    experience_years=14,
    skill_level="experienced",
    preferred_task="trenching",
    consistency=0.92,
    reposition_efficiency=0.91,
    fuel_efficiency=0.88,
    safety_compliance=0.99
)
```

- **Experienced Veterans (`OP_EXP_001` Fernandes, `OP_EXP_002` Rao, `OP_EXP_003` Mehta)**: Display tight standard deviations (high consistency $\ge 0.89$), lower fuel burn per metric ton shifted, and optimized sub-phase habits learned over 10–16 years of operation.
- **Novice Operators (`OP_NOV_001` Aryan, `OP_NOV_002` Chen, `OP_NOV_003` Johnson, `OP_NOV_004` Silva, `OP_NOV_005` Kowalski)**: Exhibit higher coefficient of variation, wider standard deviations, distinct individual tendencies (e.g., Aryan's repositioning hesitation, Chen's aggressive throttle, Silva's safety belt compliance warnings).

---

## 5. How Environmental Conditions Influence Telemetry

Telemetry parameters react directly to geological and operational context:
- **Soil Conditions**:
  - `soft`: Low resistance on bucket teeth during dig, but higher track sinkage risk during repositioning.
  - `medium`: Standard baseline resistance.
  - `hard`: Higher hydraulic pressure spikes during penetration, extended dig phase durations ($+15\%$), and higher mechanical fuel demand.
- **Load Conditions**:
  - `light`: Payload $\approx 1.45$ tons; faster swing acceleration and lower hydraulic lift pressure.
  - `medium`: Payload $\approx 1.95$ tons; baseline operations.
  - `heavy`: Payload $\approx 2.40$ tons; higher hydraulic lift pressure ($240+$ bar), extended lift/swing times ($+12\%$).

---

## 6. How the Expert Patterns are Generated

Expertise in heavy machinery is rarely about swinging the arm faster; it is about eliminating wasted motion in specific operational contexts:
- **Fernandes (Veteranship in Soft-Soil Trenching)**: Over 14 years, Fernandes discovered that in soft soil trenching, raising the bucket high while repositioning causes counterweight rock and track sinkage. By keeping the bucket low and executing concise track pulses, his repositioning time drops to $\approx 8.2$ seconds with an ultra-tight standard deviation of $0.9$ seconds.
- **Rao (Heavy Load Swing Transition)**: In hard soil quarry extraction with heavy payloads, Rao blends boom lift and swing motions concurrently, reducing cycle swing time to $\approx 6.2$ seconds without overshooting the hopper.

---

## 7. How Technique #17 Emerges

**Crucial System Principle**: Technique #17 ("Soft Soil Repositioning") is **never hardcoded** into the database.

Instead, the dataset generator produces a rich cohort of 94 comparable cycles for Fernandes under `(task=trenching, soil=soft, load=medium)`. When the statistical discovery engine runs across the dataset:
1. It partitions historical cycles into contextual cohorts.
2. It calculates cohort-level baselines for total cycle time and phase durations.
3. It detects that Fernandes' repositioning duration ($8.42$s median, $0.92$s std) is **$22\%$ faster than the cohort average** with statistically superior consistency ($p < 0.001$).
4. The technique mining engine automatically codifies this discovery as **Technique #17**, attributing it to Fernandes with empirical cycle proof.

---

## 8. How the Transfer Event is Simulated

The dataset includes a controlled, scientifically measurable transfer event for novice operator Aryan (`OP_NOV_001`):
1. **Pre-Coaching Session (10 Cycles)**: Under soft-soil trenching, Aryan exhibits an uncoached repositioning duration of $11.62$ seconds median (std $\approx 1.95$s), struggling with track alignment.
2. **Contextual Recommendation**: The cab assistance engine detects Aryan operating in soft-soil trenching, retrieves Technique #17, and presents Fernandes' proven repositioning guidance.
3. **Post-Coaching Session (10 Cycles)**: Aryan's subsequent telemetry records reflect the newly adopted technique. Repositioning drops to $8.48$ seconds median (std $\approx 0.96$s).
4. **Calculated Transfer Delta**: The system calculates a genuine **$27.1\%$ repositioning time reduction** and a corresponding $8.5\%$ fuel economy gain, verified directly from recorded cycle telemetry.

---

## 9. How to Regenerate the Data

The entire pipeline can be regenerated at any time via the command line:

```bash
# 1. Regenerate CSV files with the canonical seed
python scripts/generate_data.py --seed 42 --output-dir data

# 2. Run the automated data quality and statistical validation suite
python scripts/validate_dataset.py --data-dir data
```

Expected validation output:

```text
CAT LEGACY DATASET VALIDATION
──────────────────────────────

Machines: 5
Operators: 8
Experienced: 3
Novice: 5

Cycles: 384

Trenching cycles: 271
Excavation cycles: 113

Soft soil: 142
Medium soil: 161
Hard soil: 81

Fernandes comparable cycles:
94

Potential techniques discovered:
7

Aryan pre-coaching cycles:
10

Aryan post-coaching cycles:
10

Safety events:
8

Validation:
✓ PASS
```

---

## 10. Limitations

1. **Simplified Kinematics**: Cylinder hydraulic fluid flow, valve deadbands, and track slippage are modeled via statistical distributions and first-order physical equations rather than finite element analysis (FEA) or real-time physics engines (e.g., Isaac Sim or MATLAB Simscape).
2. **Simplified Acoustic & Vibrational Signatures**: Structural vibration, engine sound harmonics, and chassis strain telemetry are omitted to prioritize operational phase metrics.
3. **Weather Modifiers**: Ambient temperature and ground moisture are modeled as scalar modifiers rather than continuous spatio-temporal atmospheric forecasts.
