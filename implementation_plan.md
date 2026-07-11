# Implementation Plan: AeroRecover Dashboard

## Goal Description
Build "AeroRecover — powered by AMD OpsTwin", an AMD-native operational recovery platform for airline disruptions. The goal is to build a stunning, high-performance Next.js dashboard using premium UI components to create a visually memorable hackathon submission that highlights AMD GPU compute, Gemma reasoning, and Databricks evidence, as outlined in the hackathon strategy PDF.

## Proposed Setup & Initialization
1. **Initialize Project**: Run the requested bootstrap command: `pnpm dlx shadcn@latest init --preset b1uI39j9s --template next`
2. **Agent Skills**: Install the requested skills: `npx agent-skills install addyosmani/agent-skills` (or equivalent `agy` command).
3. **Dependencies**: Install framer-motion, lucide-react, and all necessary dependencies for Aceternity UI, 8starlabs, and the other linked component libraries.
4. **Monorepo / Stack**: 
   - **Frontend**: Next.js App Router, Tailwind CSS, shadcn/ui.
   - **Backend/API**: Since the hackathon strategy involves PyTorch scoring, we will set up a Python FastAPI backend alongside the Next.js app, or simulate the data within Next.js API routes for the MVP frontend if preferred.

## UI Component Mapping & Design
To ensure the dashboard doesn't just look like a "generic chatbot" and feels like a true high-tech operational digital twin, we will map your requested components to the specific dashboard panels:

1. **Header & Flight Status**: 
   - Use **Flip Clock** / **Text Flipping Board** (Aceternity / 8starlabs) to create an authentic "Airport Departure Board" aesthetic for the flight timeline and disruption scenario selection.
2. **AMD Scenario Engine Panel (The "Compute" Vibe)**:
   - Use **Dotmatrix** (zzzzshawn) or **ASCII Art** / **Encrypted Text** (Aceternity) to display the real-time scoring of thousands of candidate plans. This will visually emphasize the raw compute power of the AMD ROCm/MI300X GPUs.
3. **KPI Comparison (Baseline vs Optimized)**:
   - Use the **Partition Bar** (8starlabs) to visually break down passenger delay minutes, missed connections, and cancellations, making the optimization delta instantly obvious to judges.
4. **Gemma Control-Tower Brief**:
   - Wrap the Gemma AI explanation in a **Comet Card** (Aceternity) to give the AI reasoning layer a premium, glowing focus on the dashboard.
5. **Network Map / Delay Cascade**:
   - Utilize inspiration from **Flightcn** and **Heatmap** to show the cascading delays across the DFW hub and spokes.
6. **User Interaction**:
   - Use the **Keyboard** component (Aceternity) for specific control-tower overrides or exporting the AMD Blueprint.

## Execution Phases

### [x] Phase 1: Foundation
- [x] Initialize Next.js with the `b1uI39j9s` shadcn preset.
- [x] Add agent skills (`agent-skills-mcp` installed).
- [x] Set up the project structure, global CSS (dark mode by default, glassmorphism, modern typography like Inter).
- [x] Install all external component library dependencies (resolved build errors, `tailwindcss-animate`, `autoprefixer`).

### [x] Phase 2: UI Component Implementation
- [x] Implement the premium UI components (Flip Clock, Encrypted Text, Partition Bar, etc.) within the Next.js components directory.
- [x] Build the core dashboard layout based on the 1-page architecture from the PDF:
  - Scenario Card
  - AMD Scenario Engine Panel
  - Flight Timeline / Network Visual
  - KPI Comparison
  - Gemma Brief
  - Databricks Evidence & AMD Blueprint Export

### [x] Phase 3: Mock Data & API Wiring
- [x] Implemented static JSON fixtures and Next.js API Routes.
- [x] Wired UI components to global state (`lib/store.tsx`).

### [x] Phase 4: Best Coding Practices Review
- [x] Enforced strict TypeScript typing and error boundaries (`error.tsx`, `loading.tsx`).

### [ ] Phase 5: The Real "AMD OpsTwin" Backend & Engine (New Requirements)
Based on the explicit hackathon requirements, we must replace the mocked API routes with a genuine **Python/PyTorch Backend** and implement the full "Sacred Flow":
1. **Simulation Engine (`backend/app/engine`)**:
   - **Data Loader**: Generate synthetic DFW schedule (40-60 flights, 8-12 aircraft).
   - **Baseline Simulator**: Propagate delays without intervention.
   - **Candidate Generator**: Generate 2,000+ plans using Delay, Cancel, Swap, Hold actions.
   - **PyTorch Scorer**: Vectorized batch-scoring penalizing delays/missed connections/cancellations.
2. **Gemma Control Tower (`backend/app/ai`)**:
   - Integrate Fireworks API to call `gemma` with the structured top plans, outputting rationale, tradeoffs, and briefs.
3. **Databricks Evidence (`backend/app/databricks`)**:
   - Implement an export layer to push run metadata (scenario, runtime, scores, gemma latency) to Databricks.
4. **AMD Blueprint Export (`app/api/blueprint`)**:
   - Create a Next.js endpoint that generates a `.zip` file containing `Dockerfile.rocm`, `docker-compose.yml`, `AMD_RUNBOOK.md`, `run_scenario.sh`, `benchmark_rocm.py`, `sample_scenario.json`, and `databricks_schema.sql`.
5. **API Proxy**:
   - Point the Next.js frontend to communicate with the local FastAPI backend (e.g., `http://localhost:8000`).

## Open Questions
> [!IMPORTANT]  
> **Python Environment**: I will initialize the Python FastAPI backend inside a new `backend/` folder. Do you have a preferred Python version or virtual environment manager (e.g. `venv`, `poetry`, `conda`) for this workspace? I'll use standard `venv` and `pip` by default.

> [!WARNING]
> **API Keys**: To execute the Gemma reasoning and Databricks logging, we will need a `FIREWORKS_API_KEY`, `DATABRICKS_HOST`, and `DATABRICKS_TOKEN`. For the initial build, I will mock the Databricks API call or log it to a local SQLite file until the keys are provided.

## User Review Required
Please review the new **Phase 5** architecture that introduces the true Python/PyTorch backend and Blueprint exporter required by the hackathon strategy. If approved, I will begin creating the FastAPI server and the PyTorch scenario engine!
