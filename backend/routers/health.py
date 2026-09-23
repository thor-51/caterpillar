from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.database import get_db
from backend.models import Cycle, Technique, Operator, Machine

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    cycle_count = db.query(Cycle).count()
    technique_count = db.query(Technique).count()
    operator_count = db.query(Operator).count()
    machine_count = db.query(Machine).count()

    return {
        "status": "online",
        "service": "CAT Legacy Backend API",
        "database": db_status,
        "metrics": {
            "machines": machine_count,
            "operators": operator_count,
            "cycles": cycle_count,
            "discovered_techniques": technique_count
        }
    }
