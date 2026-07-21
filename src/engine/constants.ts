import type { RegimeLevel } from "./types";

// Shared tunable constants. Fee values are in pips (hundredths of a bip; 1,000,000 = 100%),
// matching Uniswap v4's LP fee units (3000 = 0.30%, the familiar v3 default tier).
export const BASE_FEE_PIPS = 3000;
export const MIN_FEE_PIPS = 400;
export const MAX_FEE_PIPS = 12000;

// volatilityAdaptive: feePips = BASE_FEE_PIPS + volatility * VOL_FEE_SCALE (clamped).
// At volatility = 0 this collapses to exactly BASE_FEE_PIPS, matching the static baseline.
export const VOL_FEE_SCALE = 600000;

// volumeTiered: feePips = BASE_FEE_PIPS - (volume / REF_ROLLING_VOLUME - 1) * VOLUME_FEE_SWING (clamped).
// At volume === REF_ROLLING_VOLUME this collapses to exactly BASE_FEE_PIPS.
export const VOLUME_FEE_SWING = 2500;

export const ROLLING_WINDOW_SIZE = 30;

export const SWAPS_PER_DAY: Record<RegimeLevel, number> = { low: 20, med: 60, high: 150 };
export const VOLATILITY_SIGMA: Record<RegimeLevel, number> = { low: 0.0008, med: 0.003, high: 0.01 };
export const TRADE_SIZE_BASE: Record<RegimeLevel, number> = { low: 400, med: 1000, high: 2200 };
export const TRADE_SIZE_NOISE_SIGMA = 0.4; // lognormal noise applied on top of TRADE_SIZE_BASE

export const LIQUIDITY_BASE = 1_000_000;
export const LIQUIDITY_VOLUME_MULTIPLIER: Record<RegimeLevel, number> = { low: 0.7, med: 1.0, high: 1.4 };

// REF_ROLLING_VOLUME is calibrated so a flat/constant "med" volume market fills the
// rolling window to exactly this value, letting volumeTiered collapse to BASE_FEE_PIPS
// in the flat-market sanity test.
export const REF_ROLLING_VOLUME = ROLLING_WINDOW_SIZE * TRADE_SIZE_BASE.med;

export const DAY_MS = 24 * 60 * 60 * 1000;

// Auto-rebalancing range hook: earning range half-width, and a wider hysteresis band
// (TRIGGER_MULTIPLIER x wider) the price must clear before a rebalance actually fires —
// without this, the position would thrash-rebalance on every small oscillation.
export const RANGE_HALF_WIDTH = 0.04;
export const RANGE_TRIGGER_MULTIPLIER = 1.5;

// Volume-captured competitive model: a documented simplification, not derived from any
// real elasticity data. Swaps priced above the baseline fee lose a modeled fraction of
// volume to a hypothetical competing pool at the baseline fee.
export const COMPETITIVE_ELASTICITY = 0.6;
