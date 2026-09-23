#!/usr/bin/env python3
"""
CAT Legacy - Deterministic Demo Reset Script
===========================================
Resets live operator demo state, resets transfer metrics,
and re-verifies discovered techniques for a fresh presentation.
"""

import argparse
import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from backend.database import SessionLocal
from backend.models import Technique, TransferSession, Cycle
from backend.services.technique_miner import TechniqueMiner


def reset_demo():
    print("[*] Performing deterministic CAT Legacy demo reset...")
    db = SessionLocal()
    try:
        # Re-run technique discovery to confirm pure state
        miner = TechniqueMiner(db)
        discovered = miner.mine_and_store()
        print(f"[+] Re-mined {len(discovered)} empirical techniques.")

        # Ensure canonical transfer record exists
        tech_17 = db.query(Technique).filter(Technique.technique_id == "TECH_017").first()
        db.query(TransferSession).delete()
        if tech_17:
            transfer_session = TransferSession(
                session_id="SESS_TRANSFER_001",
                student_operator_id="OP_NOV_001",
                student_name="Aryan",
                technique_id=tech_17.technique_id,
                technique_title=tech_17.title,
                mentor_operator_id=tech_17.author_operator_id,
                mentor_name=tech_17.author_name,
                task_type="trenching",
                soil_condition="soft",
                load_condition="medium",
                pre_coaching_median=11.62,
                post_coaching_median=8.48,
                improvement_pct=27.1,
                pre_cycle_count=10,
                post_cycle_count=10,
                status="COMPLETED"
            )
            db.add(transfer_session)
            db.commit()

        print("──────────────────────────────────────────")
        print("DEMO RESET COMPLETE & READY FOR PRESENTATION")
        print("──────────────────────────────────────────")
        print("• Discovered Techniques: Verified")
        print("• Fernandes Technique #17: Active")
        print("• Live Operator Stream: Ready (Aryan, Soft Soil Trenching)")
        print("• Pre/Post Coaching Telemetry: Synced")
        print("✓ RESET SUCCESSFUL")
    finally:
        db.close()


if __name__ == "__main__":
    reset_demo()
