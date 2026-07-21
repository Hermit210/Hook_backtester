import type { HookStrategy } from "../types";
import { BASE_FEE_PIPS, RANGE_HALF_WIDTH, RANGE_TRIGGER_MULTIPLIER } from "../constants";

interface State {
  initialized: boolean;
  lower: number;
  upper: number;
  triggerLower: number;
  triggerUpper: number;
  rebalanceCount: number;
}

function centerRange(price: number): Pick<State, "lower" | "upper" | "triggerLower" | "triggerUpper"> {
  return {
    lower: price * (1 - RANGE_HALF_WIDTH),
    upper: price * (1 + RANGE_HALF_WIDTH),
    triggerLower: price * (1 - RANGE_HALF_WIDTH * RANGE_TRIGGER_MULTIPLIER),
    triggerUpper: price * (1 + RANGE_HALF_WIDTH * RANGE_TRIGGER_MULTIPLIER),
  };
}

// Auto-rebalancing range hook: simulates a concentrated liquidity position that only
// earns fees while the price sits inside its (narrow) earning range. If price drifts
// past a wider hysteresis band, the position auto-recenters ("rebalances") around the
// current price — modeling a keeper bot that doesn't thrash-rebalance on every tick.
export const autoRebalancingStrategy: HookStrategy<State> = {
  id: "auto-rebalancing",
  name: "Auto-Rebalancing Range",
  description:
    "Concentrated liquidity range that only earns fees in-range and re-centers when price drifts too far out.",
  createState: () => ({
    initialized: false,
    lower: 0,
    upper: 0,
    triggerLower: 0,
    triggerUpper: 0,
    rebalanceCount: 0,
  }),
  beforeSwap: (state, event) => {
    if (!state.initialized) {
      Object.assign(state, centerRange(event.priceBefore));
      state.initialized = true;
      return { feePips: BASE_FEE_PIPS, inRange: true, note: "range initialized" };
    }

    const outsideTrigger =
      event.priceBefore < state.triggerLower || event.priceBefore > state.triggerUpper;

    if (outsideTrigger) {
      Object.assign(state, centerRange(event.priceBefore));
      state.rebalanceCount += 1;
      return { feePips: BASE_FEE_PIPS, inRange: true, rebalanced: true, note: "rebalanced" };
    }

    const inRange = event.priceBefore >= state.lower && event.priceBefore <= state.upper;
    return { feePips: BASE_FEE_PIPS, inRange };
  },
};
