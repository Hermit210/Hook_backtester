import type { HookStrategy } from "../types";
import {
  BASE_FEE_PIPS,
  MAX_FEE_PIPS,
  MIN_FEE_PIPS,
  REF_ROLLING_VOLUME,
  VOLUME_FEE_SWING,
} from "../constants";

// Volume-tiered fee hook: lowers the fee during high-volume periods to stay competitive,
// raises it during low-volume periods to extract more value from scarce flow.
type State = Record<string, never>;

export const volumeTieredStrategy: HookStrategy<State> = {
  id: "volume-tiered",
  name: "Volume-Tiered Fee",
  description:
    "Fee drops when recent trading volume is high, rises when volume is thin.",
  createState: () => ({}),
  beforeSwap: (_state, _event, rolling) => {
    const volumeRatio = rolling.volume / REF_ROLLING_VOLUME - 1;
    const feePips = clamp(
      BASE_FEE_PIPS - volumeRatio * VOLUME_FEE_SWING,
      MIN_FEE_PIPS,
      MAX_FEE_PIPS
    );
    return { feePips, inRange: true };
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
