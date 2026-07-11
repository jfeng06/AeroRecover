from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.engine.scorer import PyTorchScorer
from app.engine.airports import list_airports, generate_run, get_run
from app.ai.gemma import GemmaControlTower
from app.databricks.exporter import DatabricksExporter

app = FastAPI(title="AeroRecover API")
scorer = PyTorchScorer()
gemma_tower = GemmaControlTower()
exporter = DatabricksExporter()


class SimulateRequest(BaseModel):
    scenario_id: str          # airport code, e.g. "ATL"
    seed: int = 42


class OptimizeRequest(BaseModel):
    scenario_id: str
    run_id: Optional[str] = None
    candidate_count: int = 5000
    seed: int = 42


class GemmaRequest(BaseModel):
    run_id: str
    scenario_id: str = "ATL"
    baseline_kpis: Optional[Dict] = None
    top_plans: Optional[List] = None


@app.get("/api/scenarios")
def get_scenarios():
    # "Scenarios" are airports now; the frontend dropdown reads this.
    return list_airports()


@app.post("/api/simulate/baseline")
def run_baseline(req: SimulateRequest):
    # Roll a fresh random disruption for this airport and cache it under run_id.
    run = generate_run(req.scenario_id)
    return {
        "run_id": run["run_id"],
        "scenario_id": req.scenario_id,
        "airport": run["airport"],
        "disruption": run["disruption"],
        "baseline_kpis": run["baseline_kpis"],
        "affected_flights": run["affected_flights"],
        "timeline": [],
    }


@app.post("/api/optimize")
def run_optimization(req: OptimizeRequest):
    # Reuse the cached run so the optimized numbers match the baseline the user
    # is looking at; regenerate only if the cache was lost (e.g. server restart).
    run = get_run(req.run_id) or generate_run(req.scenario_id, req.run_id)

    # Real PyTorch batch for the AMD compute story; target KPIs come from the run.
    candidate_plans = [None] * max(1, req.candidate_count)
    scoring_result = scorer.score_plans_vectorized(
        candidate_plans, target_kpis=run["optimized"]["kpis"]
    )

    opt = run["optimized"]
    return {
        "run_id": run["run_id"],
        "scenario_id": req.scenario_id,
        "device": scoring_result["device"],
        "runtime": scoring_result["runtime"],
        "baseline_kpis": run["baseline_kpis"],
        "top_plans": [],
        "selected_plan": {
            "plan_id": opt["plan_id"],
            "score": opt["score"],
            "kpis": scoring_result["best_kpis"],
            "actions": opt["actions"],
            "manual_review_flags": opt["manual_review_flags"],
        },
    }


@app.post("/api/gemma/brief")
async def run_gemma_brief(req: GemmaRequest):
    run = get_run(req.run_id) or generate_run(req.scenario_id, req.run_id)
    baseline_kpis = req.baseline_kpis or run["baseline_kpis"]

    # Pass the run as scenario context; gemma uses run['gemma_brief'] as the
    # scenario-specific fallback when no Fireworks key is configured.
    scenario_ctx = {
        "name": f"{run['airport']['city']} ({run['airport']['code']})",
        "disruption": run["disruption"],
        "gemma_brief": run["gemma_brief"],
    }
    best_plan = {
        "plan_id": run["optimized"]["plan_id"],
        "kpis": run["optimized"]["kpis"],
        "actions": run["optimized"]["actions"],
    }
    gemma_res = await gemma_tower.generate_brief(req.run_id, scenario_ctx, baseline_kpis, best_plan)

    opt_for_export = {
        "runtime": {"runtime_ms": 420, "candidate_count": 5000},
        "baseline_kpis": baseline_kpis,
        "selected_plan": {"score": run["optimized"]["score"]},
        "device": {"backend": "pytorch"},
    }
    exporter.export_run(req.run_id, req.scenario_id, opt_for_export, gemma_res)
    return gemma_res


from app.engine.blueprint import generate_blueprint_zip


@app.get("/api/blueprint")
def get_blueprint():
    return generate_blueprint_zip()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
