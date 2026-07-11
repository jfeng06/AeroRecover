from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import time

# Import engine components (to be implemented)
from app.engine.simulator import AirlineSimulator
from app.engine.scorer import PyTorchScorer
from app.ai.gemma import GemmaControlTower
from app.databricks.exporter import DatabricksExporter
app = FastAPI(title="AeroRecover API")
simulator = AirlineSimulator(seed=42)
scorer = PyTorchScorer()

class SimulateRequest(BaseModel):
    scenario_id: str
    seed: int = 42

class OptimizeRequest(BaseModel):
    scenario_id: str
    candidate_count: int = 5000
    seed: int = 42

class GemmaRequest(BaseModel):
    run_id: str
    scenario: Optional[Dict] = None
    baseline_kpis: Optional[Dict] = None
    top_plans: Optional[List] = None

@app.get("/api/scenarios")
def get_scenarios():
    return [
        {
            "id": "dfw_storm",
            "name": "DFW Storm",
            "description": "Arrival capacity reduced by 60% from 14:00 to 16:00.",
            "severity": "high"
        }
    ]

@app.post("/api/simulate/baseline")
def run_baseline(req: SimulateRequest):
    disruption = simulator.apply_disruption(req.scenario_id)
    baseline_kpis = simulator.simulate_baseline(disruption)
    
    return {
        "run_id": "run_001",
        "baseline_kpis": baseline_kpis,
        "affected_flights": disruption["delayed_flights"],
        "timeline": []
    }

@app.post("/api/optimize")
def run_optimization(req: OptimizeRequest):
    disruption = simulator.apply_disruption(req.scenario_id)
    baseline_kpis = simulator.simulate_baseline(disruption)
    
    # Generate candidate plans
    candidate_plans = simulator.generate_candidate_plans(disruption, req.candidate_count)
    
    # Batch score candidates with PyTorch
    scoring_result = scorer.score_plans_vectorized(candidate_plans)
    
    best_idx = scoring_result["best_idx"]
    best_plan = candidate_plans[best_idx]
    
    return {
        "run_id": "run_001",
        "device": scoring_result["device"],
        "runtime": scoring_result["runtime"],
        "baseline_kpis": baseline_kpis,
        "top_plans": [],
        "selected_plan": {
            "plan_id": best_plan["plan_id"],
            "score": scoring_result["best_kpis"]["recovery_score"],
            "kpis": scoring_result["best_kpis"],
            "actions": best_plan["actions"],
            "manual_review_flags": [
                "Confirm aircraft swap N104/N108 is maintenance-compatible before execution"
            ]
        }
    }


gemma_tower = GemmaControlTower()
exporter = DatabricksExporter()

@app.post("/api/gemma/brief")
async def run_gemma_brief(req: GemmaRequest):
    if not req.top_plans or len(req.top_plans) == 0:
        # Fallback if no plan is provided
        best_plan = {"plan_id": "1842"}
    else:
        best_plan = req.top_plans[0]
        
    gemma_res = await gemma_tower.generate_brief(req.run_id, req.baseline_kpis or {}, best_plan)
    
    # In a real system, we'd fetch the optimization result from a DB using run_id
    # Here we mock the optimization result to satisfy the exporter signature
    mock_opt = {
        "runtime": {"runtime_ms": 420, "candidate_count": 5000},
        "baseline_kpis": req.baseline_kpis or {"recovery_score": 34200},
        "selected_plan": {"score": 17850},
        "device": {"backend": "pytorch"}
    }
    exporter.export_run(req.run_id, "dfw_storm", mock_opt, gemma_res)
    
    return gemma_res

from app.engine.blueprint import generate_blueprint_zip

@app.get("/api/blueprint")
def get_blueprint():
    return generate_blueprint_zip()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
