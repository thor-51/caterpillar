import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal, Base, engine
from scripts.seed_database import seed_database
from pathlib import Path

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    data_dir = Path(__file__).resolve().parent.parent.parent / "data"
    seed_database(data_dir)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["database"] == "healthy"
    assert data["metrics"]["cycles"] == 384
    assert data["metrics"]["discovered_techniques"] >= 7


def test_list_techniques():
    response = client.get("/api/techniques")
    assert response.status_code == 200
    techniques = response.json()
    assert len(techniques) >= 7

    # Technique #17 must exist and be mined from Fernandes
    tech_17 = next((t for t in techniques if t["technique_id"] == "TECH_017"), None)
    assert tech_17 is not None
    assert tech_17["author_name"] == "Fernandes"
    assert tech_17["task_type"] == "trenching"
    assert tech_17["soil_condition"] == "soft"
    assert tech_17["primary_phase"] == "REPOSITION"
    assert tech_17["cycle_sample_count"] == 94


def test_technique_detail():
    response = client.get("/api/techniques/TECH_017")
    assert response.status_code == 200
    data = response.json()
    assert data["technique"]["technique_id"] == "TECH_017"
    assert len(data["evidence"]["sample_evidence"]) > 0


def test_coaching_match_for_aryan():
    payload = {
        "operator_id": "OP_NOV_001",
        "task_type": "trenching",
        "soil_condition": "soft",
        "load_condition": "medium"
    }
    response = client.post("/api/coaching/match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["match_found"] is True
    assert data["technique"]["technique_id"] == "TECH_017"
    assert data["operator_deviation_detected"] is True
    assert "Fernandes" in data["gentle_coaching_message"]


def test_demo_transfer_summary():
    response = client.get("/api/demo/transfer-summary")
    assert response.status_code == 200
    data = response.json()
    assert data["mentor"] == "Fernandes"
    assert data["student"] == "Aryan"
    assert data["improvement_pct"] >= 20.0
    assert "Fernandes retired 6 months ago. His technique didn't." in data["punchline"]


def test_operators_and_machines():
    ops_resp = client.get("/api/operators")
    assert ops_resp.status_code == 200
    assert len(ops_resp.json()) == 8

    mach_resp = client.get("/api/machines")
    assert mach_resp.status_code == 200
    assert len(mach_resp.json()) == 5


def test_safety_overview():
    safety_resp = client.get("/api/safety")
    assert safety_resp.status_code == 200
    data = safety_resp.json()
    assert data["total_events"] == 8
    assert "official_shift_logs" in data
    assert len(data["official_shift_logs"]) == 4
    assert data["official_shift_logs"][1]["idling_time_min"] == 55


def test_daily_tasks_and_estimation():
    tasks_resp = client.get("/api/tasks")
    assert tasks_resp.status_code == 200
    tasks = tasks_resp.json()
    assert len(tasks) == 3

    estimate_payload = {
        "task_type": "trenching",
        "soil_condition": "soft",
        "load_condition": "medium",
        "target_units": 120.0,
        "weather_condition": "dry",
        "operator_profile": "novice_baseline"
    }
    est_resp = client.post("/api/tasks/estimate", json=estimate_payload)
    assert est_resp.status_code == 200
    est = est_resp.json()
    assert est["time_saved_pct"] > 15.0
    assert "Technique #17" in est["recommended_technique"]


def test_training_modules_and_simulation():
    train_resp = client.get("/api/training/modules")
    assert train_resp.status_code == 200
    mods = train_resp.json()
    assert len(mods) >= 3

    # Test simulation evaluation scoring
    sim_eval_payload = {
        "operator_id": "OP_NOV_001",
        "boom_angle_used": 24.5,
        "reposition_latency_s": 8.42,
        "track_speed_kmh": 2.2
    }
    eval_resp = client.post("/api/training/evaluate-sim", json=sim_eval_payload)
    assert eval_resp.status_code == 200
    res = eval_resp.json()
    assert res["score"] >= 90
    assert res["passed"] is True

