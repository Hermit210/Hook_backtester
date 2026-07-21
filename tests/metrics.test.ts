import { describe, expect, it } from "vitest";
import { computeCapturedFraction, computeImpermanentLoss } from "../src/engine/metrics";
import { BASE_FEE_PIPS } from "../src/engine/constants";

describe("computeImpermanentLoss", () => {
  it("is zero when price hasn't moved (k = 1)", () => {
    expect(computeImpermanentLoss(1)).toBeCloseTo(0, 10);
  });

  it("matches the hand-computed value for a 2x price move", () => {
    // IL(2) = 2*sqrt(2)/3 - 1 ≈ -0.0572
    expect(computeImpermanentLoss(2)).toBeCloseTo(2 * Math.sqrt(2) / 3 - 1, 10);
  });

  it("is symmetric in magnitude for a price halving vs. doubling", () => {
    const up = computeImpermanentLoss(2);
    const down = computeImpermanentLoss(0.5);
    expect(down).toBeCloseTo(up, 10);
  });

  it("returns 0 for non-finite or non-positive k", () => {
    expect(computeImpermanentLoss(0)).toBe(0);
    expect(computeImpermanentLoss(-1)).toBe(0);
    expect(computeImpermanentLoss(NaN)).toBe(0);
  });
});

describe("computeCapturedFraction", () => {
  it("captures 100% of volume at or below the baseline fee", () => {
    expect(computeCapturedFraction(BASE_FEE_PIPS)).toBe(1);
    expect(computeCapturedFraction(BASE_FEE_PIPS - 1000)).toBe(1);
  });

  it("loses volume as the fee rises above baseline", () => {
    const fraction = computeCapturedFraction(BASE_FEE_PIPS * 2);
    expect(fraction).toBeLessThan(1);
    expect(fraction).toBeGreaterThanOrEqual(0);
  });

  it("never goes negative for extreme fees", () => {
    expect(computeCapturedFraction(BASE_FEE_PIPS * 100)).toBe(0);
  });
});
