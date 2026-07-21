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
        <strong>{formatNumber(baseline.totalFeeRevenue, 2)}</strong> quote units of fee
        revenue over {report.eventCount.toLocaleString()} swaps across {report.days} days.
      </p>

      <div className="card-grid">
        {presetIds.map((id) => {
          const result = report.results[id];
          const delta = report.deltas[id];
          const color = palette.series[id as keyof typeof palette.series];
          const isSelected = id === selectedStrategyId;

          return (
            <button
              type="button"
              key={id}
              className={`strategy-card${isSelected ? " strategy-card--selected" : ""}`}
              style={{ borderColor: isSelected ? color : undefined }}
              onClick={() => onSelectStrategy(id)}
            >
              <div className="strategy-card__header">
                <span className="dot" style={{ background: color }} />
                <span className="strategy-card__name">{delta.strategyName}</span>
              </div>

              <dl className="metric-list">
                <div className="metric-row">
                  <dt>Fee revenue vs baseline</dt>
                  <dd style={{ color: delta.feeRevenueDeltaPct >= 0 ? palette.good : palette.critical }}>
                    {formatPct(delta.feeRevenueDeltaPct)}
                  </dd>
                </div>
                <div className="metric-row">
                  <dt>Volume captured</dt>
                  <dd>{delta.avgVolumeCapturedPct.toFixed(1)}%</dd>
                </div>
                <div className="metric-row">
                  <dt>IL exposure vs baseline</dt>
                  <dd style={{ color: delta.ilDeltaPct <= 0 ? palette.good : palette.critical }}>
                    {formatPct(delta.ilDeltaPct)}
                  </dd>
                </div>
                <div className="metric-row">
                  <dt>Total fee revenue</dt>
                  <dd>{formatNumber(result.totalFeeRevenue, 2)}</dd>
                </div>
                {result.rebalanceCount > 0 && (
                  <div className="metric-row">
                    <dt>Rebalances</dt>
                    <dd>{result.rebalanceCount}</dd>
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
