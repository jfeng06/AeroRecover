import io
import zipfile
from fastapi.responses import StreamingResponse

def generate_blueprint_zip() -> StreamingResponse:
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        # Dockerfile.rocm
        zip_file.writestr("Dockerfile.rocm", """FROM rocm/pytorch:rocm6.0_ubuntu22.04_py3.10_pytorch_2.1.1
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
""")
        
        # docker-compose.yml
        zip_file.writestr("docker-compose.yml", """version: '3.8'
services:
  aerorecover-engine:
    build: 
      context: .
      dockerfile: Dockerfile.rocm
    devices:
      - "/dev/kfd:/dev/kfd"
      - "/dev/dri:/dev/dri"
    ports:
      - "8000:8000"
    environment:
      - FIREWORKS_API_KEY=${FIREWORKS_API_KEY}
      - DATABRICKS_HOST=${DATABRICKS_HOST}
      - DATABRICKS_TOKEN=${DATABRICKS_TOKEN}
""")

        # AMD_RUNBOOK.md
        zip_file.writestr("AMD_RUNBOOK.md", """# AMD OpsTwin Runbook
This bundle provides everything needed to run AeroRecover natively on an AMD ROCm-enabled GPU (e.g., MI300X or Radeon VII).

## Instructions
1. `docker-compose up --build`
2. Run `./run_scenario.sh` to test the API.
3. Run `python benchmark_rocm.py` to test raw PyTorch scoring throughput.
""")

        # run_scenario.sh
        zip_file.writestr("run_scenario.sh", """#!/bin/bash
curl -X POST http://localhost:8000/api/optimize -H "Content-Type: application/json" -d @sample_scenario.json
""")

        # benchmark_rocm.py
        zip_file.writestr("benchmark_rocm.py", """import torch
import time
if not torch.cuda.is_available():
    print("Warning: ROCm/CUDA not detected. Running on CPU.")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Benchmarking on {device}...")
# Simulate generating 100k plans
t1 = time.time()
delay = torch.randint(0, 100, (100000,), device=device, dtype=torch.float32)
score = delay * 1.5
torch.cuda.synchronize() if torch.cuda.is_available() else None
t2 = time.time()
print(f"Scored 100,000 plans in {(t2-t1)*1000:.2f} ms")
""")

        # sample_scenario.json
        zip_file.writestr("sample_scenario.json", """{
  "scenario_id": "dfw_storm",
  "candidate_count": 20000,
  "seed": 42
}
""")

        # databricks_schema.sql
        zip_file.writestr("databricks_schema.sql", """CREATE TABLE IF NOT EXISTS optimization_runs (
    run_id STRING,
    scenario_id STRING,
    timestamp TIMESTAMP,
    runtime_ms INT,
    scenarios_scored INT,
    baseline_score INT,
    optimized_score INT,
    device_backend STRING,
    gemma_latency_ms INT
) USING DELTA;
""")

    zip_buffer.seek(0)
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": "attachment; filename=amd_blueprint.zip"
        }
    )
