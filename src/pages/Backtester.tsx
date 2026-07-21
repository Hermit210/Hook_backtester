import { useState } from "react";
import { generateSwapEvents } from "../engine/dataGenerator";
import { compareStrategies } from "../engine/compare";
import { presetStrategies } from "../engine/strategies";
import type { ComparisonReport } from "../engine/types";
import { ControlPanel } from "../ui/ControlPanel";
import { SummaryReport } from "../ui/SummaryReport";
import { Charts } from "../ui/Charts";
import { SwapTraceTable } from "../ui/SwapTraceTable";
import { JsonExport } from "../ui/JsonExport";

const DEFAULT_SEED = 1234;
const DEFAULT_DAYS = 90;

function runSimulation(seed: number, days: number): ComparisonReport {
  const events = generateSwapEvents({ seed, days });
  return compareStrategies(events, { seed, days });
}

export function Backtester() {
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [selectedStrategyId, setSelectedStrategyId] = useState(presetStrategies[0].id);
  const [report, setReport] = useState<ComparisonReport>(() => runSimulation(DEFAULT_SEED, DEFAULT_DAYS));

  function handleRun() {
    setReport(runSimulation(seed, days));
  }

  return (
    <div className="site-container">
      <header className="app-header">
        <h1>Hook Economic Backtester</h1>
        <p className="muted">
          Replay a synthetic swap stream through a static-fee baseline and three preset
          Uniswap v4 hook strategies, over the identical event stream, and compare LP
          fee revenue, volume capture, and impermanent-loss exposure.
        </p>
      </header>

      <ControlPanel
        seed={seed}
        onSeedChange={setSeed}
        days={days}
        onDaysChange={setDays}
        strategies={presetStrategies}
        selectedStrategyId={selectedStrategyId}
        onSelectStrategy={setSelectedStrategyId}
        onRun={handleRun}
      />

      <SummaryReport
        report={report}
        selectedStrategyId={selectedStrategyId}
        onSelectStrategy={setSelectedStrategyId}
      />

      <Charts report={report} selectedStrategyId={selectedStrategyId} />

      <SwapTraceTable
        key={`${report.generatedAt}-${selectedStrategyId}`}
        report={report}
        selectedStrategyId={selectedStrategyId}
      />

      <footer className="app-footer">
        <JsonExport report={report} />
        <span className="muted mono">
          Seed {report.seed} · {report.days} days · {report.eventCount.toLocaleString()} swaps ·
          generated {new Date(report.generatedAt).toLocaleString()}
        </span>
      </footer>
    </div>
  );
}
