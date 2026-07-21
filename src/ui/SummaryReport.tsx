import type { ComparisonReport } from "../engine/types";
import { formatNumber, formatPct } from "./format";
import { usePalette } from "./palette";

interface Props {
  report: ComparisonReport;
  selectedStrategyId: string;
  onSelectStrategy: (id: string) => void;
}

export function SummaryReport({ report, selectedStrategyId, onSelectStrategy }: Props) {
  const palette = usePalette();
  const baseline = report.results[report.baselineId];
  const presetIds = Object.keys(report.results).filter((id) => id !== report.baselineId);

  return (
    <section className="panel">
      <h2>Comparison Report</h2>
      <p className="muted">
        Baseline (static 0.30% fee) earned{" "}
        <strong className="mono">{formatNumber(baseline.totalFeeRevenue, 2)}</strong> quote units of
        fee revenue over <span className="mono">{report.eventCount.toLocaleString()}</span> swaps
        across <span className="mono">{report.days}</span> days.
      </p>

      <div className="card-grid">
        {presetIds.map((id, i) => {
          const result = report.results[id];
          const delta = report.deltas[id];
          const isSelected = id === selectedStrategyId;

          return (
            <button
              type="button"
              key={id}
              className={`strategy-card${isSelected ? " strategy-card--selected" : ""}`}
              onClick={() => onSelectStrategy(id)}
            >
              <div className="strategy-card__header">
                <span className="strategy-card__index mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="strategy-card__name">{delta.strategyName}</span>
              </div>

              <dl className="metric-list">
                <div className="metric-row">
                  <dt>Fee revenue vs baseline</dt>
                  <dd className="mono" style={{ color: delta.feeRevenueDeltaPct >= 0 ? palette.good : palette.critical }}>
                    {formatPct(delta.feeRevenueDeltaPct)}
                  </dd>
                </div>
                <div className="metric-row">
                  <dt>Volume captured</dt>
                  <dd className="mono">{delta.avgVolumeCapturedPct.toFixed(1)}%</dd>
                </div>
                <div className="metric-row">
                  <dt>IL exposure vs baseline</dt>
                  <dd className="mono" style={{ color: delta.ilDeltaPct <= 0 ? palette.good : palette.critical }}>
                    {formatPct(delta.ilDeltaPct)}
                  </dd>
                </div>
                <div className="metric-row">
                  <dt>Total fee revenue</dt>
                  <dd className="mono">{formatNumber(result.totalFeeRevenue, 2)}</dd>
                </div>
                {result.rebalanceCount > 0 && (
                  <div className="metric-row">
                    <dt>Rebalances</dt>
                    <dd className="mono">{result.rebalanceCount}</dd>
                  </div>
                )}
              </dl>
            </button>
          );
        })}
      </div>
    </section>
  );
}
