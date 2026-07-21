import type { HookStrategy } from "../types";
import { BASE_FEE_PIPS, MAX_FEE_PIPS, MIN_FEE_PIPS, VOL_FEE_SCALE } from "../constants";

// Volatility-adaptive fee hook: raises the fee when recent realized volatility is high,
// lowers it when volatility is low. Mirrors a beforeSwap hook calling updateDynamicLPFee
// per swap based on rolling market conditions.
type State = Record<string, never>;

export const volatilityAdaptiveStrategy: HookStrategy<State> = {
  id: "volatility-adaptive",
  name: "Volatility-Adaptive Fee",
  description:
    "Fee scales up with recent realized volatility and down when the market is calm.",
  createState: () => ({}),
  beforeSwap: (_state, _event, rolling) => {
    const feePips = clamp(
      BASE_FEE_PIPS + rolling.volatility * VOL_FEE_SCALE,
      MIN_FEE_PIPS,
      MAX_FEE_PIPS
    );
    return { feePips, inRange: true };
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
