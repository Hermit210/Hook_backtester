import type { HookStrategy } from "../types";
import { baselineStrategy } from "./baseline";
import { volatilityAdaptiveStrategy } from "./volatilityAdaptive";
import { volumeTieredStrategy } from "./volumeTiered";
import { autoRebalancingStrategy } from "./autoRebalancing";

export { baselineStrategy } from "./baseline";
export { volatilityAdaptiveStrategy } from "./volatilityAdaptive";
export { volumeTieredStrategy } from "./volumeTiered";
export { autoRebalancingStrategy } from "./autoRebalancing";

// The three presets a user can pick in the UI, compared against the baseline.
export const presetStrategies: HookStrategy<any>[] = [
  volatilityAdaptiveStrategy,
  volumeTieredStrategy,
  autoRebalancingStrategy,
];

export const allStrategies: HookStrategy<any>[] = [baselineStrategy, ...presetStrategies];
