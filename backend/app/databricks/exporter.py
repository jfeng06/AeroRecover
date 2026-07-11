import os
import json
import sqlite3
from typing import Dict, Any

class DatabricksExporter:
    def __init__(self):
        self.host = os.getenv("DATABRICKS_HOST")
        self.token = os.getenv("DATABRICKS_TOKEN")
        
        # Local fallback SQLite DB for the hackathon
        self.db_path = "evidence_log.sqlite"
        self._init_db()
        
    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS optimization_runs (
                    run_id TEXT PRIMARY KEY,
                    scenario_id TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    runtime_ms INTEGER,
                    scenarios_scored INTEGER,
                    baseline_score INTEGER,
                    optimized_score INTEGER,
                    device_backend TEXT,
                    gemma_latency_ms INTEGER
                )
            """)
            
    def export_run(self, run_id: str, scenario_id: str, optimization_res: Dict[str, Any], gemma_res: Dict[str, Any]):
        runtime_ms = optimization_res["runtime"]["runtime_ms"]
        scenarios_scored = optimization_res["runtime"]["candidate_count"]
        baseline_score = optimization_res["baseline_kpis"]["recovery_score"]
        optimized_score = optimization_res["selected_plan"]["score"]
        backend = optimization_res["device"]["backend"]
        gemma_latency = gemma_res["trace"]["latency_ms"]
        
        # Log locally
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO optimization_runs 
                (run_id, scenario_id, runtime_ms, scenarios_scored, baseline_score, optimized_score, device_backend, gemma_latency_ms)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (run_id, scenario_id, runtime_ms, scenarios_scored, baseline_score, optimized_score, backend, gemma_latency))
            
        # If we had actual Databricks credentials, we would push to Databricks SQL Warehouse or Unity Catalog here.
        if self.host and self.token:
            # Mock Databricks request
            pass 
            
        print(f"Logged run {run_id} to Evidence Layer. Improvement: {baseline_score - optimized_score} score points.")
