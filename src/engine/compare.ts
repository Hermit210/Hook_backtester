import type { ComparisonReport, HookStrategy, StrategyDelta, SwapEvent } from "./types";
import { simulate } from "./simulate";
import { allStrategies } from "./strategies";

export interface CompareOptions {
  seed: number;
  days: number;
  strategies?: HookStrategy<any>[];
  baselineId?: string;
}

// Runs baseline + every preset strategy over the identical event stream and derives
// deltas vs. the baseline for each preset.
export function compareStrategies(events: SwapEvent[], options: CompareOptions): ComparisonReport {
  const strategies = options.strategies ?? allStrategies;
  const baselineId = options.baselineId ?? "baseline";

  const results: ComparisonReport["results"] = {};
  for (const strategy of strategies) {
    results[strategy.id] = simulate(events, strategy);
  }

  const baseline = results[baselineId];
  const deltas: Record<string, StrategyDelta> = {};
  for (const strategy of strategies) {
    if (strategy.id === baselineId) continue;
    const result = results[strategy.id];
    const feeRevenueDeltaPct =
      baseline.totalFeeRevenue !== 0
        ? ((result.totalFeeRevenue - baseline.totalFeeRevenue) / baseline.totalFeeRevenue) * 100
        : 0;
    const ilDeltaPct =
      baseline.avgIlExposurePct !== 0
        ? ((result.avgIlExposurePct - baseline.avgIlExposurePct) / baseline.avgIlExposurePct) * 100
        : (result.avgIlExposurePct - baseline.avgIlExposurePct) * 100;

    deltas[strategy.id] = {
      strategyId: strategy.id,
      strategyName: strategy.name,
      feeRevenueDeltaPct,
      avgVolumeCapturedPct: result.avgVolumeCapturedPct,
      ilDeltaPct,
    };
  }

  return {
    seed: options.seed,
    days: options.days,
    generatedAt: new Date().toISOString(),
    eventCount: events.length,
    events,
    baselineId,
    results,
    deltas,
  };
}
