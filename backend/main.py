from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.routers import (
    health,
    techniques,
    operators,
    machines,
    cycles,
    safety,
    coaching,
    demo
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CAT Legacy - Expertise Mining & Contextual Skill Transfer Platform"
)

# CORS Middleware for React frontend and remote hosts
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in settings.CORS_ORIGINS else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(techniques.router, prefix=settings.API_PREFIX)
app.include_router(operators.router, prefix=settings.API_PREFIX)
app.include_router(machines.router, prefix=settings.API_PREFIX)
app.include_router(cycles.router, prefix=settings.API_PREFIX)
app.include_router(safety.router, prefix=settings.API_PREFIX)
app.include_router(coaching.router, prefix=settings.API_PREFIX)
app.include_router(demo.router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    return {
        "platform": "CAT Legacy",
        "tagline": "Capture the expertise. Transfer the skill. Keep the knowledge.",
        "docs_url": "/docs",
        "health_check": f"{settings.API_PREFIX}/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
