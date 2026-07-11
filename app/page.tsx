import { Header } from "@/components/dashboard/header";
import { ScenarioSelector } from "@/components/dashboard/scenario-selector";
import { AmdCompute } from "@/components/dashboard/amd-compute";
import { GemmaBrief } from "@/components/dashboard/gemma-brief";
import { NetworkMap } from "@/components/dashboard/network-map";
import { KpiComparison } from "@/components/dashboard/kpi-comparison";
import { ActionList } from "@/components/dashboard/action-list";
import { Keyboard, Key } from "@/components/ui/keyboard";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      <Header />
      <main className="flex-1 p-8">
        <div className="grid grid-cols-12 gap-6 max-w-[1800px] mx-auto">
          {/* Left Column: Input & Context */}
          <div className="col-span-12 lg:col-span-3 space-y-6 flex flex-col">
            <ScenarioSelector />
            <div className="flex-1 min-h-[300px]">
              <NetworkMap />
            </div>
          </div>
          
          {/* Middle Column: Core Logic & Impact */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <KpiComparison />
            <ActionList />
          </div>
          
          {/* Right Column: AI & Compute Evidence */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <AmdCompute />
            <GemmaBrief />
            
            <div className="bg-zinc-950 p-6 rounded-lg border border-zinc-800 flex justify-between items-center">
              <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Databricks Evidence</span>
              <a href="/api/blueprint" download="amd_blueprint.zip">
                <Keyboard className="p-1.5 bg-transparent border-none">
                  <Key className="w-auto px-4 bg-zinc-800 border-zinc-700 text-xs hover:bg-zinc-700 uppercase tracking-wide font-bold">
                    Export Blueprint
                  </Key>
                </Keyboard>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
