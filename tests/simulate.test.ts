import { describe, expect, it } from "vitest";
import { generateSwapEvents } from "../src/engine/dataGenerator";
import { compareStrategies } from "../src/engine/compare";
import { simulate } from "../src/engine/simulate";
import { baselineStrategy, volatilityAdaptiveStrategy, volumeTieredStrategy } from "../src/engine/strategies";

describe("flat-market sanity check", () => {
  // With no volatility and constant volume there is no signal for the adaptive hooks to
  // react to, so their fee (and therefore fee revenue / IL) should collapse to the
  // static baseline's. This is the sanity check called out in the grant application:
  // it proves the comparison engine's logic is correct independent of data realism.
  const events = generateSwapEvents({ seed: 42, days: 60, flat: true });

  it("generates a non-trivial flat event stream", () => {
    expect(events.length).toBeGreaterThan(100);
    expect(new Set(events.map((e) => e.priceAfter)).size).toBe(1);
  });

  it("volatility-adaptive hook revenue is near-identical to baseline", () => {
    const baseline = simulate(events, baselineStrategy);
    const hook = simulate(events, volatilityAdaptiveStrategy);
    const pctDiff =
      (Math.abs(hook.totalFeeRevenue - baseline.totalFeeRevenue) / baseline.totalFeeRevenue) * 100;
    expect(pctDiff).toBeLessThan(1);
  });

  it("volume-tiered hook revenue is near-identical to baseline", () => {
    const baseline = simulate(events, baselineStrategy);
    const hook = simulate(events, volumeTieredStrategy);
    const pctDiff =
      (Math.abs(hook.totalFeeRevenue - baseline.totalFeeRevenue) / baseline.totalFeeRevenue) * 100;
    expect(pctDiff).toBeLessThan(1);
  });

  it("compareStrategies reports near-zero fee revenue delta for both adaptive hooks", () => {
    const report = compareStrategies(events, { seed: 42, days: 60 });
    expect(Math.abs(report.deltas["volatility-adaptive"].feeRevenueDeltaPct)).toBeLessThan(1);
    expect(Math.abs(report.deltas["volume-tiered"].feeRevenueDeltaPct)).toBeLessThan(1);
  });
});

describe("compareStrategies over a regime-switching market", () => {
  const events = generateSwapEvents({ seed: 7, days: 90 });

  it("all strategies consume the identical event stream", () => {
    const report = compareStrategies(events, { seed: 7, days: 90 });
    for (const result of Object.values(report.results)) {
      expect(result.trace.length).toBe(events.length);
    }
  });

  it("produces a full swap-by-swap trace with monotonically non-decreasing cumulative revenue", () => {
    const report = compareStrategies(events, { seed: 7, days: 90 });
    const trace = report.results["volatility-adaptive"].trace;
    for (let i = 1; i < trace.length; i++) {
      expect(trace[i].cumulativeFeeRevenue).toBeGreaterThanOrEqual(trace[i - 1].cumulativeFeeRevenue);
    }
  });

  it("is deterministic for a given seed", () => {
    const eventsAgain = generateSwapEvents({ seed: 7, days: 90 });
    expect(eventsAgain).toEqual(events);
  });

  it("auto-rebalancing hook rebalances at least once over a volatile 90-day window", () => {
    const report = compareStrategies(events, { seed: 7, days: 90 });
    expect(report.results["auto-rebalancing"].rebalanceCount).toBeGreaterThan(0);
  });
});
