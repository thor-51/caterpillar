#!/bin/bash
set -e

echo "=========================================================="
echo "  🚜 Starting CAT Legacy Local Dev Environment"
echo "  Capture the expertise. Transfer the skill. Keep the knowledge."
echo "=========================================================="

# 1. Environment Config
if [ ! -f .env ]; then
  echo "[*] Creating .env from .env.example..."
  cp .env.example .env
fi

# 2. Python Virtualenv & Dependencies
if [ ! -d ".venv" ]; then
  echo "[*] Setting up Python virtual environment (.venv)..."
  python3 -m venv .venv
fi

source .venv/bin/activate
echo "[*] Ensuring Python dependencies are installed..."
pip install -q -r backend/requirements.txt

# 3. Database Seeding & Technique Mining
if [ ! -f "cat_legacy.db" ]; then
  echo "[*] Initializing database and mining expert techniques from data..."
  python scripts/seed_database.py --data-dir data
fi

# 4. Frontend Dependencies
if [ ! -d "frontend/node_modules" ]; then
  echo "[*] Installing frontend dependencies..."
  (cd frontend && npm install)
fi

echo ""
echo "=========================================================="
echo "  🚀 Launching Backend API & React Frontend..."
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo "  Frontend: http://localhost:5173"
echo "  Press Ctrl+C to stop both services."
echo "=========================================================="
echo ""

# Start backend in background
uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend in background
(cd frontend && npm run dev -- --host 0.0.0.0 --port 5173) &
FRONTEND_PID=$!

# Trap Ctrl+C and kill both
trap 'echo ""; echo "[*] Stopping CAT Legacy services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' SIGINT SIGTERM

wait
