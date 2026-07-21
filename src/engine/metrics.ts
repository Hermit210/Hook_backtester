import { BASE_FEE_PIPS, COMPETITIVE_ELASTICITY } from "./constants";

// Standard constant-product impermanent-loss formula for a 50/50 position, expressed as
// the fractional value change vs. simply holding, where k = priceNow / priceAtEntry.
export function computeImpermanentLoss(k: number): number {
  if (k <= 0 || !Number.isFinite(k)) return 0;
  return (2 * Math.sqrt(k)) / (1 + k) - 1;
}

// Volume-captured competitive model (documented simplification, see README): swaps
// priced above the baseline fee are assumed to lose a modeled fraction of volume to a
// hypothetical competing pool charging the baseline fee. At or below baseline fee, this
// prototype assumes full capture (no upside modeled for being cheaper than baseline).
export function computeCapturedFraction(feePips: number): number {
  if (feePips <= BASE_FEE_PIPS) return 1;
  const excessRatio = (feePips - BASE_FEE_PIPS) / BASE_FEE_PIPS;
  return Math.max(0, 1 - COMPETITIVE_ELASTICITY * excessRatio);
}
