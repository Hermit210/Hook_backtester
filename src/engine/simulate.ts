import type { HookStrategy, SimResult, SwapEvent, SwapTraceEntry } from "./types";
import { RollingWindow } from "./rollingWindow";
import { computeCapturedFraction, computeImpermanentLoss } from "./metrics";
import { ROLLING_WINDOW_SIZE } from "./constants";

// Replays a single event stream through a single strategy. compare.ts calls this once
// per strategy over the SAME events array, so any difference in output is attributable
// purely to strategy logic, never to different input data.
export function simulate<S>(events: SwapEvent[], strategy: HookStrategy<S>): SimResult {
  const state = strategy.createState();
  const rolling = new RollingWindow(ROLLING_WINDOW_SIZE);

  let referencePrice = events.length > 0 ? events[0].priceBefore : 1;
  let cumulativeFeeRevenue = 0;
  let rebalanceCount = 0;
  let volumeCapturedWeighted = 0;
  let ilExposureWeighted = 0;
  let weightTotal = 0;

  const trace: SwapTraceEntry[] = [];

  for (const event of events) {
    const decision = strategy.beforeSwap(state, event, rolling.snapshot());
    const { feePips, inRange, rebalanced, note } = decision;

    if (rebalanced) {
      referencePrice = event.priceBefore;
      rebalanceCount += 1;
    }

    const capturedFraction = computeCapturedFraction(feePips);
    const feeEarned = inRange ? event.amountIn * capturedFraction * (feePips / 1_000_000) : 0;
    cumulativeFeeRevenue += feeEarned;

    const k = event.priceAfter / referencePrice;
    const ilExposure = inRange ? Math.abs(computeImpermanentLoss(k)) : 0;

    trace.push({
      index: event.index,
      timestamp: event.timestamp,
      direction: event.direction,
      amountIn: event.amountIn,
      priceAfter: event.priceAfter,
      tick: event.tick,
      feePips,
      capturedFraction,
      inRange,
      feeEarned,
      cumulativeFeeRevenue,
      ilExposure: ilExposure * 100,
      note,
    });

    volumeCapturedWeighted += capturedFraction * event.amountIn;
    ilExposureWeighted += ilExposure * event.amountIn;
    weightTotal += event.amountIn;

    rolling.push(event);
    if (strategy.afterSwap) {
      strategy.afterSwap(state, event, feeEarned, inRange);
    }
  }

  const finalPrice = events.length > 0 ? events[events.length - 1].priceAfter : referencePrice;

  return {
    strategyId: strategy.id,
    strategyName: strategy.name,
    trace,
    totalFeeRevenue: cumulativeFeeRevenue,
    avgVolumeCapturedPct: weightTotal > 0 ? (volumeCapturedWeighted / weightTotal) * 100 : 100,
    avgIlExposurePct: weightTotal > 0 ? (ilExposureWeighted / weightTotal) * 100 : 0,
    rebalanceCount,
    finalPrice,
  };
}
