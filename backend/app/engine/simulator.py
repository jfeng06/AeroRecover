import random
from typing import List, Dict, Any

from app.engine.scenarios import get_scenario


class AirlineSimulator:
    def __init__(self, seed: int = 42):
        self.seed = seed
        random.seed(seed)
        self.flights = self._generate_synthetic_flights()
        self.passenger_groups = self._generate_passenger_groups()

    def _generate_synthetic_flights(self) -> List[Dict[str, Any]]:
        # Generate 48 flights around DFW hub with 10 aircraft
        flights = []
        aircraft_ids = [f"N{100+i}" for i in range(10)]
        spokes = ["LAX", "ORD", "ATL", "DEN", "PHX", "MIA", "SEA", "JFK", "SFO", "LAS"]

        flight_id = 1000
        for ac in aircraft_ids:
            # Each aircraft does 4-5 flights a day
            num_flights = random.randint(4, 5)
            current_time = 8 * 60 # Start at 8 AM
            current_loc = random.choice(spokes)

            for i in range(num_flights):
                dest = "DFW" if current_loc != "DFW" else random.choice(spokes)
                flight_time = random.randint(90, 180) # 1.5 to 3 hours

                flights.append({
                    "id": f"AA{flight_id}",
                    "aircraft_id": ac,
                    "origin": current_loc,
                    "destination": dest,
                    "scheduled_departure": current_time,
                    "scheduled_arrival": current_time + flight_time,
                    "status": "scheduled"
                })

                current_time += flight_time + 45 # 45 min turn time
                current_loc = dest
                flight_id += 1

        return flights

    def _generate_passenger_groups(self) -> List[Dict[str, Any]]:
        # Generate passenger connections through DFW
        groups = []
        for i in range(120):
            groups.append({
                "id": f"PG_{i}",
                "size": random.randint(1, 6),
                "inbound_flight_id": f"AA{random.randint(1000, 1040)}",
                "outbound_flight_id": f"AA{random.randint(1020, 1047)}",
                "connection_minimum_minutes": 30
            })
        return groups

    def apply_disruption(self, scenario_id: str) -> Dict[str, Any]:
        """Compute which flights are hit, branching on the scenario type.

        Each scenario touches a different slice of the schedule, so the
        affected-flight set (and therefore the network view) actually
        differs per scenario instead of always being the DFW-storm window.
        """
        scenario = get_scenario(scenario_id)
        d = scenario["disruption"]
        # Deterministic per-scenario RNG so results are stable across calls
        rng = random.Random(f"{self.seed}:{scenario_id}")

        delayed_flights: List[Dict[str, Any]] = []
        dtype = d["type"]

        if dtype == "weather":
            # Reduced arrival capacity in a time window -> inbound arrivals delayed.
            for f in self.flights:
                if f["destination"] == d["affected_airport"]:
                    arr = f["scheduled_arrival"]
                    if d["start_time"] <= arr <= d["end_time"]:
                        delayed_flights.append({
                            "flight_id": f["id"],
                            "delay_minutes": rng.randint(30, 120),
                        })

        elif dtype == "mechanical":
            # A single aircraft (its whole rotation) goes out of service.
            grounded = "N104"
            for f in self.flights:
                if f["aircraft_id"] == grounded and f["scheduled_departure"] >= d["start_time"]:
                    delayed_flights.append({
                        "flight_id": f["id"],
                        "delay_minutes": rng.randint(60, 180),
                    })

        elif dtype == "late_inbound":
            # One inbound aircraft arrives late into the evening bank, so its
            # subsequent departures and their connections slip.
            late_ac = "N107"
            for f in self.flights:
                if f["aircraft_id"] == late_ac and \
                        d["start_time"] <= f["scheduled_departure"] <= d["end_time"]:
                    delayed_flights.append({
                        "flight_id": f["id"],
                        "delay_minutes": rng.randint(45, 90),
                    })

        else:  # capacity_reduction / fallback -> treat like weather window
            for f in self.flights:
                if d["start_time"] <= f["scheduled_arrival"] <= d["end_time"]:
                    delayed_flights.append({
                        "flight_id": f["id"],
                        "delay_minutes": rng.randint(30, 120),
                    })

        return {"scenario_id": scenario_id, "type": dtype, "delayed_flights": delayed_flights}

    def simulate_baseline(self, scenario_id: str) -> Dict[str, Any]:
        """Baseline KPIs for the scenario (per-scenario, not hardcoded to DFW)."""
        return dict(get_scenario(scenario_id)["baseline_kpis"])

    def generate_candidate_plans(self, scenario_id: str, count: int = 5000) -> List[Dict[str, Any]]:
        """Generate N candidate recovery plans using the scenario's action set."""
        actions = get_scenario(scenario_id)["optimized"]["actions"]
        plans = []
        for i in range(count):
            plans.append({
                "plan_id": f"{i}",
                "actions": actions,
                "score": 0,   # filled by scorer
                "kpis": {},
            })
        return plans
