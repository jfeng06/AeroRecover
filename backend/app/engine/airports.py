"""
Airport registry + per-run random disruption generator.

Design (per product decision):
- One "scenario" == one airport. The dropdown lists all airports below.
- Every Simulate run re-rolls a fresh random disruption (type + severity) and
  new baseline / optimized KPIs derived from the airport's traffic weight and
  the rolled severity. So the numbers are different every single run.
- A run is generated once (at /api/simulate/baseline) and cached by run_id so
  /api/optimize and /api/gemma/brief return numbers consistent with the
  baseline the user is looking at.
"""
import random
import uuid
from typing import Dict, Any, List, Optional

# code -> metadata. weight scales KPI magnitude (bigger hub -> bigger impact);
# lat/lon drive the marker positions on the 3D globe.
AIRPORTS: Dict[str, Dict[str, Any]] = {
    # ---- United States ----
    "ATL": {"city": "Atlanta", "region": "US", "weight": 1.00, "lat": 33.64, "lon": -84.43},
    "DFW": {"city": "Dallas–Fort Worth", "region": "US", "weight": 0.95, "lat": 32.90, "lon": -97.04},
    "ORD": {"city": "Chicago O'Hare", "region": "US", "weight": 0.92, "lat": 41.98, "lon": -87.90},
    "DEN": {"city": "Denver", "region": "US", "weight": 0.88, "lat": 39.86, "lon": -104.67},
    "LAX": {"city": "Los Angeles", "region": "US", "weight": 0.90, "lat": 33.94, "lon": -118.41},
    "JFK": {"city": "New York JFK", "region": "US", "weight": 0.82, "lat": 40.64, "lon": -73.78},
    "SFO": {"city": "San Francisco", "region": "US", "weight": 0.76, "lat": 37.62, "lon": -122.38},
    "SEA": {"city": "Seattle", "region": "US", "weight": 0.72, "lat": 47.45, "lon": -122.31},
    "LAS": {"city": "Las Vegas", "region": "US", "weight": 0.66, "lat": 36.08, "lon": -115.15},
    "MIA": {"city": "Miami", "region": "US", "weight": 0.70, "lat": 25.79, "lon": -80.29},
    "PHX": {"city": "Phoenix", "region": "US", "weight": 0.66, "lat": 33.43, "lon": -112.01},
    "CLT": {"city": "Charlotte", "region": "US", "weight": 0.71, "lat": 35.21, "lon": -80.94},
    "IAH": {"city": "Houston", "region": "US", "weight": 0.74, "lat": 29.99, "lon": -95.34},
    "EWR": {"city": "Newark", "region": "US", "weight": 0.70, "lat": 40.69, "lon": -74.17},
    "BOS": {"city": "Boston", "region": "US", "weight": 0.65, "lat": 42.36, "lon": -71.01},
    # ---- Global ----
    "LHR": {"city": "London Heathrow", "region": "Global", "weight": 0.95, "lat": 51.47, "lon": -0.46},
    "CDG": {"city": "Paris Charles de Gaulle", "region": "Global", "weight": 0.86, "lat": 49.01, "lon": 2.55},
    "AMS": {"city": "Amsterdam Schiphol", "region": "Global", "weight": 0.82, "lat": 52.31, "lon": 4.76},
    "FRA": {"city": "Frankfurt", "region": "Global", "weight": 0.85, "lat": 50.04, "lon": 8.56},
    "IST": {"city": "Istanbul", "region": "Global", "weight": 0.84, "lat": 41.28, "lon": 28.75},
    "DXB": {"city": "Dubai", "region": "Global", "weight": 0.90, "lat": 25.25, "lon": 55.36},
    "SIN": {"city": "Singapore Changi", "region": "Global", "weight": 0.85, "lat": 1.36, "lon": 103.99},
    "HKG": {"city": "Hong Kong", "region": "Global", "weight": 0.80, "lat": 22.31, "lon": 113.91},
    "NRT": {"city": "Tokyo Narita", "region": "Global", "weight": 0.80, "lat": 35.77, "lon": 140.39},
    "HND": {"city": "Tokyo Haneda", "region": "Global", "weight": 0.88, "lat": 35.55, "lon": 139.78},
    "ICN": {"city": "Seoul Incheon", "region": "Global", "weight": 0.81, "lat": 37.46, "lon": 126.44},
    "PEK": {"city": "Beijing Capital", "region": "Global", "weight": 0.89, "lat": 40.08, "lon": 116.58},
    "SYD": {"city": "Sydney", "region": "Global", "weight": 0.70, "lat": -33.94, "lon": 151.18},
    "YYZ": {"city": "Toronto Pearson", "region": "Global", "weight": 0.72, "lat": 43.68, "lon": -79.63},
    "DEL": {"city": "Delhi", "region": "Global", "weight": 0.78, "lat": 28.56, "lon": 77.10},
    "GRU": {"city": "São Paulo", "region": "Global", "weight": 0.71, "lat": -23.43, "lon": -46.47},
}

# Pool of spoke codes used to build plausible route strings in actions.
SPOKE_POOL = [
    "LAX", "ORD", "ATL", "DEN", "PHX", "MIA", "SEA", "JFK", "SFO", "LAS",
    "BOS", "EWR", "IAH", "CLT", "MSP", "DTW", "SLC", "SAN", "TPA", "AUS",
    "LHR", "CDG", "AMS", "FRA", "DXB", "SIN", "HKG", "NRT", "ICN", "SYD",
]

# Disruption types. kind drives the action template; sev_weights bias the
# random severity roll [low, medium, high].
DISRUPTIONS: Dict[str, Dict[str, Any]] = {
    "weather":            {"label": "Thunderstorm",            "kind": "hold",         "sev_weights": [1, 2, 3]},
    "snow":               {"label": "Snow / de-icing",         "kind": "hold",         "sev_weights": [1, 2, 3]},
    "fog":                {"label": "Low-visibility fog",      "kind": "hold",         "sev_weights": [2, 3, 1]},
    "capacity_reduction": {"label": "Runway capacity reduction","kind": "hold",        "sev_weights": [1, 3, 2]},
    "atc_flow":           {"label": "ATC flow restriction",    "kind": "hold",         "sev_weights": [2, 3, 1]},
    "ground_stop":        {"label": "Ground stop",             "kind": "hold",         "sev_weights": [1, 2, 2]},
    "mechanical":         {"label": "Aircraft mechanical (AOG)","kind": "mechanical",  "sev_weights": [2, 3, 1]},
    "late_inbound":       {"label": "Late inbound rotation",   "kind": "late_inbound", "sev_weights": [2, 3, 1]},
}

SEV_MULT = {"low": 0.55, "medium": 1.0, "high": 1.7}

# Cache of generated runs so optimize/gemma stay consistent with the baseline.
RUN_CACHE: Dict[str, Dict[str, Any]] = {}


def _fmt(minutes: int) -> str:
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def list_airports() -> List[Dict[str, Any]]:
    """Metadata for the dropdown, US first then Global, each alphabetical."""
    items = [
        {
            "id": code,
            "code": code,
            "city": m["city"],
            "region": m["region"],
            "lat": m["lat"],
            "lon": m["lon"],
        }
        for code, m in AIRPORTS.items()
    ]
    items.sort(key=lambda a: (a["region"] != "US", a["code"]))
    return items


def _capacity_note(rng: random.Random, dtype: str) -> str:
    if dtype in ("weather", "snow", "fog", "capacity_reduction", "atc_flow", "ground_stop"):
        return f"{rng.choice([30, 40, 50, 60, 70])}% arrival capacity reduction"
    if dtype == "mechanical":
        return "single aircraft out of service"
    return "delayed inbound aircraft"


def _build_actions(rng: random.Random, kind: str, ap: str) -> (List[str], List[str]):
    spokes = [s for s in rng.sample(SPOKE_POOL, 6) if s != ap]
    fnum = lambda: f"AA{rng.randint(100, 9999)}"
    tail = lambda: f"N{rng.randint(100, 199)}"
    n1, n2 = tail(), tail()

    if kind == "mechanical":
        actions = [
            f"Reassign {fnum()} {ap}-{spokes[0]} to spare aircraft {tail()}",
            f"Delay {fnum()} {ap}-{spokes[1]} by {rng.choice([30, 45, 60])} minutes",
            f"Cancel {fnum()} {ap}-{spokes[2]} (lowest connection load)",
        ]
        flags = [f"Confirm spare aircraft seat capacity covers the reassigned rotation"]
    elif kind == "late_inbound":
        actions = [
            f"Hold {fnum()} {ap}-{spokes[0]} by {rng.choice([15, 20, 22, 25])} minutes to protect {rng.randint(2, 5)} connections",
            f"Swap aircraft {n1} and {n2} for the {_fmt(rng.choice(range(17 * 60, 20 * 60, 30)))} departure",
            f"Reaccommodate {rng.randint(8, 24)} passengers onto {fnum()} {ap}-{spokes[1]}",
        ]
        flags = [f"Verify crew duty-time limits allow the extended hold"]
    else:  # hold-style (weather / capacity / atc / etc.)
        actions = [
            f"Hold {fnum()} {ap}-{spokes[0]} by {rng.choice([20, 26, 30, 40])} minutes",
            f"Swap aircraft {n1} and {n2}",
            f"Cancel {fnum()} {ap}-{spokes[1]} (lowest connection load)",
        ]
        flags = [f"Confirm aircraft swap {n1}/{n2} maintenance compatibility"]
    return actions, flags


def generate_run(airport_code: str, run_id: Optional[str] = None) -> Dict[str, Any]:
    """Roll a fresh random disruption + KPIs for the airport and cache it."""
    code = airport_code if airport_code in AIRPORTS else "ATL"
    ap = AIRPORTS[code]
    if run_id is None:
        run_id = f"run_{code}_{uuid.uuid4().hex[:8]}"

    rng = random.Random()  # unseeded -> different every run ("random each time")

    dtype = rng.choice(list(DISRUPTIONS.keys()))
    d = DISRUPTIONS[dtype]
    severity = rng.choices(["low", "medium", "high"], weights=d["sev_weights"])[0]
    sev_mult = SEV_MULT[severity]
    w = ap["weight"]

    start = rng.choice(range(6 * 60, 20 * 60, 30))
    dur = rng.choice([90, 120, 150, 180])
    window = f"{_fmt(start)}-{_fmt(start + dur)}"
    capacity_note = _capacity_note(rng, dtype)

    # Baseline KPIs, scaled by hub size and severity.
    delay = int(rng.randint(5000, 11000) * w * sev_mult)
    missed = max(1, int(rng.randint(25, 60) * w * sev_mult))
    cancel = int(rng.randint(2, 7) * sev_mult)
    oop = max(1, int(rng.randint(1, 4) * sev_mult))
    base_score = delay + missed * 120 + cancel * 1000 + oop * 500

    # Optimized outcome (always better than baseline).
    rf = rng.uniform(0.40, 0.62)
    o_delay = int(delay * rf)
    o_missed = int(missed * rng.uniform(0.30, 0.50))
    o_cancel = max(0, cancel - rng.randint(1, 3))
    o_oop = max(0, oop - rng.randint(0, 2))
    o_score = o_delay + o_missed * 120 + o_cancel * 1000 + o_oop * 500
    plan_id = f"{rng.randint(100, 9999):04d}"

    actions, flags = _build_actions(rng, d["kind"], code)

    pct = round((1 - (o_delay / delay)) * 100) if delay else 0
    third = {
        "hold": "Airport throughput protected through the disruption window.",
        "mechanical": "Broken rotation restored via a spare aircraft.",
        "late_inbound": "Connecting bank largely protected with minimal holds.",
    }[d["kind"]]

    gemma_brief = {
        "recommended_plan": f"Plan #{plan_id}",
        "why": f"Lowest passenger delay for this {d['label'].lower()} while limiting cancellations.",
        "tradeoffs": f"{actions[-1]} — sacrifices one low-load leg to protect the rest of the schedule.",
        "controller_checklist": [
            flags[0],
            "Verify crew legality for the adjusted flights.",
        ],
        "passenger_service_message": (
            f"A {d['label'].lower()} at {ap['city']} ({code}) has affected some flights. "
            "Affected passengers are being reaccommodated."
        ),
        "executive_summary": [
            f"Passenger delay reduced ~{pct}% ({delay:,} -> {o_delay:,} min).",
            f"Missed connections cut from {missed} to {o_missed}.",
            third,
        ],
    }

    affected_flights = [
        {"flight_id": f"AA{rng.randint(100, 9999)}", "delay_minutes": rng.randint(30, 150)}
        for _ in range(rng.randint(4, 12))
    ]

    run = {
        "run_id": run_id,
        "airport": {"code": code, "city": ap["city"], "region": ap["region"]},
        "disruption": {
            "type": dtype,
            "label": d["label"],
            "severity": severity,
            "window": window,
            "capacity_note": capacity_note,
            "description": f"{d['label']} at {ap['city']} ({code}); {capacity_note}, {window}.",
        },
        "baseline_kpis": {
            "passenger_delay_minutes": delay,
            "missed_connections": missed,
            "cancellations": cancel,
            "aircraft_out_of_position": oop,
            "recovery_score": base_score,
        },
        "optimized": {
            "plan_id": plan_id,
            "score": o_score,
            "kpis": {
                "passenger_delay_minutes": o_delay,
                "missed_connections": o_missed,
                "cancellations": o_cancel,
                "aircraft_out_of_position": o_oop,
                "recovery_score": o_score,
            },
            "actions": actions,
            "manual_review_flags": flags,
        },
        "gemma_brief": gemma_brief,
        "affected_flights": affected_flights,
    }

    RUN_CACHE[run_id] = run
    # Keep the cache from growing without bound during a long demo.
    if len(RUN_CACHE) > 500:
        for k in list(RUN_CACHE.keys())[:100]:
            RUN_CACHE.pop(k, None)
    return run


def get_run(run_id: Optional[str]) -> Optional[Dict[str, Any]]:
    if not run_id:
        return None
    return RUN_CACHE.get(run_id)
