# CAT Legacy 🚜
> **Capture the expertise. Transfer the skill. Keep the knowledge.**

[![Backend CI & Dataset Validation](https://github.com/thor-51/caterpillar/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/thor-51/caterpillar/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/thor-51/caterpillar/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/thor-51/caterpillar/actions/workflows/frontend-ci.yml)

---

## 🌟 The Core Insight

> *"We found a gap between operator assistance and institutional knowledge capture."*
>
> *"We're not building an AI that watches the new operator. We're building a system that makes sure the best operator's knowledge doesn't retire with them."*

By 2031, over **41% of the current construction and heavy equipment workforce is projected to retire** (NCCER). Heavy equipment mastery is fundamentally tacit—subtle throttle modulations, terrain-specific bucket angles, and repositioning rhythms refined over 10–20 years that are absent from operating manuals.

When a veteran operator like Fernandes retires, decades of operational mastery walk off the job site forever. Today's commercial telematics systems monitor machine health and fuel burn, but they treat every operator as an interchangeable input.

**CAT Legacy** bridges this gap: it mines veteran telemetry to discover tacit operational habits, codifies them into an institutional knowledge graph, and contextually transfers them to novice operators with scientifically measured before-and-after skill verification.

---

## 🔁 The Closed-Loop Feedback Architecture

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           CAT Legacy Architecture                      │
  └────────────────────────────────────────────────────────────────────────┘

  [Veteran Telemetry] (14 Yrs Archive)
          │
          ▼
  [Technique Mining Engine] ──────────► [Expert Knowledge Graph]
  (Unsupervised Statistical Discovery)    • Technique #17: Soft Soil Repositioning
          │                              • Technique #23: Heavy Load Inertial Slew
          │                              • Technique #09: Layered Dig Rhythm
          ▼                                       │
  [In-Cab Context Matcher] ◄──────────────────────┘
  (Task: Trenching | Soil: Soft)
          │
          ▼
  [Gentle In-Cab Coaching] (Aryan, 1st Year Novice)
  "His data shows a shorter repositioning phase here. Try this approach..."
          │
          ▼
  [Skill Transfer Verification]
  Repositioning Latency: ↓ 27.1% (11.62s ➔ 8.48s)
          │
          ▼
  [Knowledge Base Continually Enriched] ──► (The Next Operator Learns from Both)
```

---

## 🏗️ Repository Architecture

```text
caterpillar/
├── frontend/                     # React 19 + Vite + TypeScript (CAT Industrial Design System)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx        # System status, metrics & one-click demo reset
│   │   │   ├── CabAssistant.tsx  # Live 1 Hz telemetry stream & in-cab guidance
│   │   │   ├── TechniqueLibrary.tsx # Discovered techniques (Technique #17 featured)
│   │   │   ├── TechniqueDetailModal.tsx # Statistical evidence & cycle sample records
│   │   │   ├── SkillTransfer.tsx # Pre/post coaching transfer delta & pitch climax
│   │   │   └── SafetyFleet.tsx   # Fleet health & seatbelt restraint monitor
│   │   ├── services/api.ts       # Type-safe API client & SSE streaming connector
│   │   └── index.css             # Caterpillar industrial design system
│   └── Dockerfile
├── backend/                      # FastAPI + SQLAlchemy
│   ├── routers/
│   │   ├── health.py             # System & database health probes
│   │   ├── techniques.py         # Mined technique queries & evidence lookups
│   │   ├── coaching.py           # Context matching & skill transfer evaluation
│   │   ├── demo.py               # Real-time SSE telemetry streaming & reset
│   │   ├── operators.py          # Operator histories & behavioral variance
│   │   ├── machines.py           # Fleet hours, health indices, and fuel ratings
│   │   ├── cycles.py             # 5-phase duty cycle breakdowns
│   │   └── safety.py             # Safety event logs & compliance rankings
│   ├── services/
│   │   └── technique_miner.py    # Data-driven unsupervised pattern miner
│   ├── models.py                 # Relational schema (Machines, Cycles, Telemetry, Techniques)
│   ├── config.py                 # Environment configuration
│   └── Dockerfile
├── data/                         # Programmatically Generated Synthetic Telemetry
│   ├── machines.csv              # 5 excavators (EXC001-EXC005)
│   ├── operators.csv             # 3 veterans (Fernandes, Rao, Mehta) & 5 novices (Aryan...)
│   ├── contexts.csv              # Task x Soil x Payload geological clusters
│   ├── cycles.csv                # 384 duty cycles with strict physical integrity
│   ├── cycle_phases.csv          # 1,920 phase records (DIG, LIFT, SWING, DUMP, REPOSITION)
│   ├── telemetry.csv             # 14,398 rows of 1 Hz raw time-series sensor data
│   └── safety_events.csv         # 8 unfastened seatbelt events
├── scripts/                      # Core Automation & Quality Verification
│   ├── generate_data.py          # Deterministic generation engine (SEED=42)
│   ├── validate_dataset.py       # Statistical and logical validation suite
│   ├── seed_database.py          # Database population & technique mining
│   └── demo_reset.py             # Instant demo state reset
├── docs/
│   └── synthetic-data.md         # Generative methodology & physics model
├── docker-compose.yml            # Multi-service local execution
├── .env.example                  # Environment configuration template
└── README.md
```

---

## ⚡ Quick Start: Clone ➔ Configure ➔ Run ➔ Demo

### Option A: Docker Compose (Recommended for Judges)

```bash
# 1. Clone the repository
git clone https://github.com/thor-51/caterpillar.git
cd caterpillar

# 2. Configure environment
cp .env.example .env

# 3. Launch full stack with Docker Compose
docker compose up --build
```
* **Frontend UI**: [http://localhost:5173](http://localhost:5173)
* **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **API Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### Option B: Local Native Terminal Execution

```bash
# 1. Clone repository
git clone https://github.com/thor-51/caterpillar.git
cd caterpillar
cp .env.example .env

# 2. Set up Backend (Python 3.11+)
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# 3. Seed Database & Mine Techniques
python scripts/seed_database.py --data-dir data

# 4. Start Backend Server (Terminal 1)
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# 5. Set up & Start Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

---

## 🧪 Automated Verification Suite

Run the statistical and logical verification scripts:

```bash
# 1. Validate dataset logic, distributions, and sample counts
python scripts/validate_dataset.py --data-dir data

# 2. Run backend automated unit tests
pytest backend/tests
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

  Statistical Verification Metrics:
  • Fernandes Repositioning: median=8.42s, stdev=0.92s (n=94)
  • Aryan Pre-Coaching Repositioning: median=11.62s (n=10)
  • Aryan Post-Coaching Repositioning: median=8.48s, stdev=0.96s (n=10)
  • Measured Transfer Delta: 27.1% repositioning time reduction
```

---

## 🎬 4-Minute Hackathon Demo Script

### Screen 1: Technique Library (`/library`)
1. Click **Technique Library** tab.
2. Note the banner: **Technique #17 — Soft Soil Repositioning**.
3. **Judge Talk Track**: *"Notice Technique #17 was not hardcoded into our database. Our unsupervised mining engine analyzed 384 cycles and discovered that Fernandes had 94 comparable cycles in soft-soil trenching where his repositioning time was 16.3% faster with remarkable consistency."*
4. Click on Technique #17 to reveal empirical telemetry evidence and verified sample cycles.

### Screen 2: In-Cab Assistant (`/cab`)
1. Switch to **In-Cab Assistant** tab.
2. Observe Aryan operating Excavator EXC001 in soft soil trenching.
3. Click **"Simulate Pre-Coaching Cycle"**. Watch the real-time 1 Hz telemetry stream:
   - RPM dial, hydraulic pressure bar, implement kinematics, and phase progression (`DIG ➔ LIFT ➔ SWING ➔ DUMP ➔ REPOSITION`).
4. Highlight the proactive coaching prompt:
   *"You are working in soft soil trenching similar to Fernandes' benchmark cycles. His telemetry demonstrates keeping the boom low and using compact track pulses to avoid sinkage."*
5. Highlight the non-surveillance philosophy: We don't tell the operator "You are 24% worse than Fernandes." We gently offer his proven physical rhythm.
6. Click **"Simulate Coached Cycle"** to see Aryan applying the technique in real time.

### Screen 3: Skill Transfer Proof (`/transfer`) — The Climax
1. Navigate to **Skill Transfer Proof** tab.
2. Highlight the empirical results derived from actual recorded post-coaching telemetry:
   - **Repositioning Latency: ↓ 27.1%** (from 11.62s down to 8.48s, benchmark 8.37s)
   - **Behavioral Variance: ↓ 50.8%** (novice variance collapsed toward the expert distribution)
   - **Fuel Consumption: ↓ 8.5%**
3. Deliver the pitch climax quote:
   > **"Fernandes retired 6 months ago. His technique didn't."**
4. Walk through the feedback loop: Fernandes teaches ➔ Aryan learns ➔ Aryan becomes an expert ➔ Aryan's telemetry improves the model ➔ the next operator learns from both.

### Screen 4: Safety & Fleet Diagnostics (`/safety`)
1. Show the connected equipment fleet (EXC001–EXC005) with hydraulic health indices and 8 logged safety events (unfastened seatbelts during track movement).

---

## 🔄 Instant Demo Reset

Prior to presenting to a new panel of judges:

```bash
python scripts/demo_reset.py
```
Or simply click the **"Demo Reset"** button in the top navigation bar.

---

## 📜 Synthetic Data Disclaimer

*This dataset is synthetic and is intended to demonstrate the analytical architecture and workflow. It is not representative of proprietary Caterpillar machine telemetry.*
