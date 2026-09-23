import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings:
    PROJECT_NAME: str = "CAT Legacy API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Environment & Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/cat_legacy.db")
    
    # CORS Origins
    _cors_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000")
    CORS_ORIGINS: list[str] = [origin.strip() for origin in _cors_raw.split(",") if origin.strip()]
    
    # Simulation & Stream
    SEED: int = int(os.getenv("SEED", "42"))
    DEMO_STREAMING_SPEED: float = float(os.getenv("DEMO_STREAMING_SPEED", "1.0"))

settings = Settings()
