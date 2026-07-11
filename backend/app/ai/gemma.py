import os
import json
import httpx
from typing import Dict, Any


class GemmaControlTower:
    def __init__(self):
        self.api_key = os.getenv("FIREWORKS_API_KEY")
        self.base_url = "https://api.fireworks.ai/inference/v1/chat/completions"
        self.model = "accounts/fireworks/models/gemma-7b-it"

    async def generate_brief(
        self,
        run_id: str,
        scenario: Dict[str, Any],
        baseline_kpis: Dict[str, Any],
        best_plan: Dict[str, Any],
    ) -> Dict[str, Any]:
        d = scenario.get("disruption", {})
        prompt = f"""
You are an expert Airline Control Tower AI reasoning assistant.

Disruption scenario: {scenario.get('name')} ({d.get('type')}) at {d.get('affected_airport')}.
Window: {d.get('window')}. Impact: {d.get('capacity_reduction')}.

Baseline KPIs without intervention:
{json.dumps(baseline_kpis, indent=2)}

Our PyTorch optimizer has selected the following recovery plan:
{json.dumps(best_plan, indent=2)}

Generate a structured JSON brief explaining:
1. "executive_summary": Array of strings (e.g. "Passenger delay reduced by 40%").
2. "tradeoffs": String acknowledging what is being sacrificed.
3. "controller_checklist": Array of strings for manual review.
4. "passenger_service_message": String message for the passengers.

Respond ONLY with valid JSON.
"""

        # Scenario-specific fallback brief (used when no API key or on error).
        fallback_brief = scenario.get("gemma_brief", {})

        if not self.api_key:
            return {
                "model": "gemma-mock",
                "brief": fallback_brief,
                "trace": {
                    "latency_ms": 0,
                    "prompt_version": "gemma-mock-v1"
                }
            }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.1,
                        "max_tokens": 512,
                        "response_format": {"type": "json_object"}
                    }
                )
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)

                return {
                    "model": self.model,
                    "brief": parsed,
                    "trace": {
                        "latency_ms": response.elapsed.total_seconds() * 1000,
                        "prompt_version": "gemma-fireworks-v1"
                    }
                }
        except Exception as e:
            # Fallback on error -> still scenario-specific
            return {
                "model": "gemma-error-fallback",
                "error": str(e),
                "brief": fallback_brief,
                "trace": {"latency_ms": 0, "prompt_version": "error"}
            }
