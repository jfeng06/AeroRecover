"""
Single source of truth for the three demo scenarios.

DFW Storm numbers are taken VERBATIM from the hackathon strategy PDF
(pp. 95-96): baseline 18400/86/5/3, recovery_score 34200; optimized
plan #1842 -> 10900/31/2/1, score 17850, with the exact actions/flags.

Mechanical and Late Inbound numbers are NOT in the PDF. They are DERIVED
here so each scenario reads as distinct and operationally plausible, and
are grounded in the PDF disruption model (p.90: type / window /
capacity_multiplier / severity). Edit the numbers/actions below freely --
this dict is the only place scenario data lives.
"""
from typing import Dict, Any, List

SCENARIOS: Dict[str, Dict[str, Any]] = {
    # ---- FROM PDF (do not change without reason) ----------------------
    "dfw_storm": {
        "id": "dfw_storm",
        "name": "DFW Storm",
        "description": "Arrival capacity reduced by 60% from 14:00 to 16:00.",
        "severity": "high",
        "disruption": {
            "type": "weather",
            "affected_airport": "DFW",
            "window": "14:00-16:00",
            "start_time": 840,   # 14:00
            "end_time": 960,     # 16:00
            "capacity_multiplier": 0.40,
            "capacity_reduction": "60%",
        },
        "baseline_kpis": {
            "passenger_delay_minutes": 18400,
            "missed_connections": 86,
            "cancellations": 5,
            "aircraft_out_of_position": 3,
            "recovery_score": 34200,
        },
        "optimized": {
            "plan_id": "1842",
            "score": 17850,
            "kpis": {
                "passenger_delay_minutes": 10900,
                "missed_connections": 31,
                "cancellations": 2,
                "aircraft_out_of_position": 1,
                "recovery_score": 17850,
            },
            "actions": [
                "Hold AA214 DFW-LAX by 26 minutes",
                "Swap aircraft N104 and N108",
                "Cancel AA922 DFW-TUL",
            ],
            "manual_review_flags": [
                "Confirm aircraft swap N104/N108 maintenance compatibility",
            ],
        },
        "gemma_brief": {
            "recommended_plan": "Plan #1842",
            "why": "Lowest passenger delay with minimal aircraft imbalance while protecting the evening hub bank.",
            "tradeoffs": "Canceling AA922 DFW-TUL creates a small localized service failure but prevents three downstream cancellations.",
            "controller_checklist": [
                "Confirm aircraft swap N104/N108 is maintenance-compatible",
                "Verify crew legality for the 26-minute hold on AA214",
            ],
            "passenger_service_message": "Due to severe weather at DFW, some flights have been adjusted. We apologize for the inconvenience and are reprotecting affected connections.",
            "executive_summary": [
                "Passenger delay reduced ~41% (18,400 -> 10,900 min).",
                "Missed connections cut from 86 to 31.",
                "Aircraft positioning preserved for the evening hub bank.",
            ],
        },
    },

    # ---- DERIVED (not in PDF -- review / tune as needed) --------------
    "mechanical": {
        "id": "mechanical",
        "name": "Mechanical",
        "description": "Aircraft N104 grounded (AOG) at DFW from 12:30; rotation broken for the afternoon bank.",
        "severity": "medium",
        "disruption": {
            "type": "mechanical",
            "affected_airport": "DFW",
            "window": "12:30-onward",
            "start_time": 750,   # 12:30
            "end_time": 1440,    # rest of day
            "capacity_multiplier": 1.0,   # not a capacity event; single tail out
            "capacity_reduction": "0% (single aircraft out of service)",
        },
        "baseline_kpis": {
            "passenger_delay_minutes": 6200,
            "missed_connections": 24,
            "cancellations": 3,
            "aircraft_out_of_position": 2,
            "recovery_score": 13080,
        },
        "optimized": {
            "plan_id": "0413",
            "score": 5680,
            "kpis": {
                "passenger_delay_minutes": 3100,
                "missed_connections": 9,
                "cancellations": 1,
                "aircraft_out_of_position": 1,
                "recovery_score": 5680,
            },
            "actions": [
                "Reassign AA1180 DFW-PHX to spare aircraft N111",
                "Delay AA1205 DFW-DEN by 45 minutes",
                "Cancel AA1233 DFW-LAS (lowest connection load)",
            ],
            "manual_review_flags": [
                "Confirm spare aircraft N111 seat capacity covers AA1180 booking",
            ],
        },
        "gemma_brief": {
            "recommended_plan": "Plan #0413",
            "why": "Reassigning the single grounded rotation to spare tail N111 absorbs most of the impact without cascading cancellations.",
            "tradeoffs": "Canceling AA1233 DFW-LAS sacrifices one low-load leg to keep the rest of the N104 rotation intact.",
            "controller_checklist": [
                "Confirm N111 is airworthy and seat-compatible for AA1180",
                "Verify crew for reassigned AA1180 rotation",
            ],
            "passenger_service_message": "An aircraft maintenance issue at DFW has caused adjustments to a few afternoon flights. Affected passengers are being reaccommodated.",
            "executive_summary": [
                "Passenger delay reduced ~50% (6,200 -> 3,100 min).",
                "Missed connections cut from 24 to 9.",
                "Broken N104 rotation restored via spare tail N111.",
            ],
        },
    },

    "late_inbound": {
        "id": "late_inbound",
        "name": "Late Inbound",
        "description": "Aircraft N107 arrives 90 min late into the evening bank; downstream connections at risk.",
        "severity": "medium",
        "disruption": {
            "type": "late_inbound",
            "affected_airport": "DFW",
            "window": "17:00-21:00",
            "start_time": 1020,  # 17:00 -- evening bank onward
            "end_time": 1260,    # 21:00
            "capacity_multiplier": 1.0,
            "capacity_reduction": "0% (delayed inbound rotation)",
        },
        "baseline_kpis": {
            "passenger_delay_minutes": 9400,
            "missed_connections": 52,
            "cancellations": 2,
            "aircraft_out_of_position": 2,
            "recovery_score": 18640,
        },
        "optimized": {
            "plan_id": "0765",
            "score": 8860,
            "kpis": {
                "passenger_delay_minutes": 5200,
                "missed_connections": 18,
                "cancellations": 1,
                "aircraft_out_of_position": 1,
                "recovery_score": 8860,
            },
            "actions": [
                "Hold AA1330 DFW-SEA by 22 minutes to protect 3 connections",
                "Swap aircraft N107 and N102 for the 19:10 departure",
                "Reaccommodate 14 passengers onto AA1355 DFW-JFK",
            ],
            "manual_review_flags": [
                "Verify crew duty-time limits allow the 22-minute hold on AA1330",
            ],
        },
        "gemma_brief": {
            "recommended_plan": "Plan #0765",
            "why": "A short protective hold plus one aircraft swap saves the majority of at-risk connections without adding cancellations.",
            "tradeoffs": "Holding AA1330 delays an on-time flight by 22 minutes to protect three higher-value connecting groups.",
            "controller_checklist": [
                "Verify crew duty-time legality for the AA1330 hold",
                "Confirm N107/N102 swap is gate- and capacity-compatible",
            ],
            "passenger_service_message": "A late inbound aircraft at DFW has affected some evening connections. We are holding select flights and reprotecting passengers where possible.",
            "executive_summary": [
                "Passenger delay reduced ~45% (9,400 -> 5,200 min).",
                "Missed connections cut from 52 to 18.",
                "Evening connecting bank largely protected with a single hold + swap.",
            ],
        },
    },
}

DEFAULT_SCENARIO_ID = "dfw_storm"


def get_scenario(scenario_id: str) -> Dict[str, Any]:
    """Return the scenario config, falling back to DFW storm for unknown ids."""
    return SCENARIOS.get(scenario_id, SCENARIOS[DEFAULT_SCENARIO_ID])


def list_scenarios() -> List[Dict[str, Any]]:
    """Public metadata for the /api/scenarios endpoint."""
    return [
        {
            "id": s["id"],
            "name": s["name"],
            "description": s["description"],
            "severity": s["severity"],
        }
        for s in SCENARIOS.values()
    ]
