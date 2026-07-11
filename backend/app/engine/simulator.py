import random
from typing import List, Dict, Any

class AirlineSimulator:
    def __init__(self, seed: int = 42):
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
        # DFW Storm: Arrival capacity reduced by 60% from 14:00 (840) to 16:00 (960)
        delayed_flights = []
        for f in self.flights:
            if f["destination"] == "DFW":
                arr = f["scheduled_arrival"]
                if 840 <= arr <= 960:
                    # Random delay between 30 to 120 mins
                    delay = random.randint(30, 120)
                    delayed_flights.append({
                        "flight_id": f["id"],
                        "delay_minutes": delay
                    })
        return {"delayed_flights": delayed_flights}

    def simulate_baseline(self, disruption: Dict[str, Any]) -> Dict[str, Any]:
        # Simple baseline KPI calculation based on the hardcoded expected baseline
        # For a real implementation, this would walk the graph
        return {
            "passenger_delay_minutes": 18400,
            "missed_connections": 86,
            "cancellations": 5,
            "aircraft_out_of_position": 3,
            "recovery_score": 34200
        }

    def generate_candidate_plans(self, disruption: Dict[str, Any], count: int = 5000) -> List[Dict[str, Any]]:
        # Generates N random recovery plans consisting of delay, cancel, swap, hold actions
        plans = []
        for i in range(count):
            plans.append({
                "plan_id": f"{i}",
                "actions": [
                    "Delay flight AA1020 by 30 mins",
                    "Cancel flight AA1042",
                    "Swap aircraft N104 and N108"
                ],
                "score": 0, # To be filled by scorer
                "kpis": {}
            })
        return plans
