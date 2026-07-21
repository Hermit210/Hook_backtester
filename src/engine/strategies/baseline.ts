import type { HookStrategy } from "../types";
import { BASE_FEE_PIPS } from "../constants";

// Static-fee baseline: constant 0.30% fee, full-range liquidity, no rebalancing.
// Every preset hook is compared against this over the identical swap stream.
type State = Record<string, never>;

export const baselineStrategy: HookStrategy<State> = {
  id: "baseline",
  name: "Static Fee (0.30%)",
  description: "Fixed 0.30% swap fee, full-range liquidity, never rebalances.",
  createState: () => ({}),
  beforeSwap: () => ({ feePips: BASE_FEE_PIPS, inRange: true }),
};
