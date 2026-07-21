export type Direction = "zeroForOne" | "oneForZero";
export type RegimeLevel = "low" | "med" | "high";

// amountIn is denominated in a normalized quote-currency notional (not raw token units),
// so fee math stays a straightforward amountIn * feePips/1e6 without a token0/token1 conversion step.
// This is a documented simplification of this prototype (see README).
export interface SwapEvent {
  index: number;
  timestamp: number; // ms since window start
  direction: Direction;
  amountIn: number;
  priceBefore: number;
  priceAfter: number;
  tick: number;
  liquidity: number;
  volatilityLevel: RegimeLevel;
  volumeLevel: RegimeLevel;
}

export interface GeneratorConfig {
  seed: number;
  days: number;
  flat?: boolean; // forces a no-volatility, constant-volume market (used by the sanity test)
}

export interface RollingSnapshot {
  volatility: number; // stddev of log returns over the trailing window
  volume: number; // summed amountIn over the trailing window
}

// Mirrors the real v4 beforeSwap/afterSwap hook lifecycle: a hook is handed the pending
// swap plus recent market context and returns the fee to apply (via updateDynamicLPFee)
// and whether its liquidity is active ("in range") for this swap.
export interface HookStrategy<S = unknown> {
  id: string;
  name: string;
  description: string;
  createState(): S;
  beforeSwap(
    state: S,
    event: SwapEvent,
    rolling: RollingSnapshot
  ): { feePips: number; inRange: boolean; rebalanced?: boolean; note?: string };
  afterSwap?(state: S, event: SwapEvent, feeEarned: number, inRange: boolean): S;
}

export interface SwapTraceEntry {
  index: number;
  timestamp: number;
  direction: Direction;
  amountIn: number;
  priceAfter: number;
  tick: number;
  feePips: number;
  capturedFraction: number;
  inRange: boolean;
  feeEarned: number;
  cumulativeFeeRevenue: number;
  ilExposure: number; // |impermanent loss| at this point, relative to the strategy's current reference price
  note?: string;
}

export interface SimResult {
  strategyId: string;
  strategyName: string;
  trace: SwapTraceEntry[];
  totalFeeRevenue: number;
  avgVolumeCapturedPct: number;
  avgIlExposurePct: number;
  rebalanceCount: number;
  finalPrice: number;
}

export interface StrategyDelta {
  strategyId: string;
  strategyName: string;
  feeRevenueDeltaPct: number; // vs baseline
  avgVolumeCapturedPct: number;
  ilDeltaPct: number; // vs baseline avgIlExposurePct; negative = less IL than baseline
}

export interface ComparisonReport {
  seed: number;
  days: number;
  generatedAt: string;
  eventCount: number;
  events: SwapEvent[];
  baselineId: string;
  results: Record<string, SimResult>;
  deltas: Record<string, StrategyDelta>;
}
