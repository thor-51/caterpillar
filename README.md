# CAT Legacy 🚜
> **Capture the expertise. Transfer the skill. Keep the knowledge.**

CAT Legacy captures veteran equipment operator expertise directly from machine telemetry, transforms tacit operational habits into codified organizational knowledge (Techniques), and contextually transfers that expertise to novice operators with measurable pre/post-coaching skill verification.

---

## 🌟 The Core Insight

> *"We found a gap between operator assistance and institutional knowledge capture."*
>
> *"We're not building an AI that watches the new operator. We're building a system that makes sure the best operator's knowledge doesn't retire with them."*

Veteran heavy equipment operators carry 10–20 years of tacit mastery—subtle throttle modulations, terrain-specific bucket angles, and repositioning rhythms that cannot be learned from manuals. When veterans retire, decades of operational wisdom walk off the site. CAT Legacy bridges this gap by turning raw machine telemetry into enduring institutional knowledge.

```
Veteran Telemetry ──► Technique Mining ──► Expert Knowledge Base
                                                 │
                                                 ▼
Skill Transfer ◄── Novice Coaching ◄── Context Matching
```

---

## 🚀 Repository Structure

```text
caterpillar/
├── frontend/              # React + Vite + TypeScript (Phase 3)
├── backend/               # FastAPI + Technique Mining Engine (Phase 2)
├── data/                  # Synthetic Telemetry Datasets (Phase 1)
│   ├── machines.csv
│   ├── operators.csv
│   ├── contexts.csv
│   ├── cycles.csv
│   ├── cycle_phases.csv
│   ├── safety_events.csv
│   └── telemetry.csv
├── scripts/               # Automation & Quality Scripts
│   ├── generate_data.py   # Deterministic synthetic data generator (SEED=42)
│   ├── validate_dataset.py# Statistical and logical dataset validation suite
│   ├── seed_database.py   # Database loader & technique miner (Phase 2)
│   └── demo_reset.py      # Deterministic demo state reset (Phase 2)
├── docs/                  # In-Depth Documentation
│   └── synthetic-data.md  # Data generation methodology & physics model
├── docker-compose.yml     # Multi-service local execution
├── .env.example           # Environment configuration template
├── .gitignore             # Git exclusion rules
└── README.md
```

---

## ⚡ Quick Start

### 1. Clone & Configure
```bash
git clone https://github.com/thor-51/caterpillar.git
cd caterpillar
cp .env.example .env
```

### 2. Generate Synthetic Telemetry Dataset
```bash
python scripts/generate_data.py --seed 42 --output-dir data
```

### 3. Validate Dataset Quality
```bash
python scripts/validate_dataset.py --data-dir data
```

Output:
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

## 🛠️ Implementation Phases

- [x] **Phase 1: Project Scaffolding, Synthetic Telemetry Generator & Validation Pipeline**
- [ ] **Phase 2: FastAPI Backend, Database Seeding & Data-Driven Technique Discovery Engine**
- [ ] **Phase 3: High-Performance Frontend with CAT Industrial Design System**
- [ ] **Phase 4: Dockerization, CI Workflows & Fresh-Clone Verification**

---

## 📜 License & Synthetic Disclaimer

This dataset is synthetic and is intended to demonstrate the architecture and analytical workflow. It is not representative of proprietary CAT machine telemetry.
