import type { RollingSnapshot, SwapEvent } from "./types";

// Trailing-window helper shared by all strategies for computing realized volatility
// and recent volume, so each strategy doesn't reimplement its own bookkeeping.
export class RollingWindow {
  private entries: SwapEvent[] = [];
  private readonly maxEntries: number;

  constructor(maxEntries = 30) {
    this.maxEntries = maxEntries;
  }

  push(event: SwapEvent): void {
    this.entries.push(event);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  snapshot(): RollingSnapshot {
    if (this.entries.length < 2) {
      return { volatility: 0, volume: this.entries.reduce((s, e) => s + e.amountIn, 0) };
    }
    const returns = this.entries.map((e) => Math.log(e.priceAfter / e.priceBefore));
    const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
    const variance =
      returns.reduce((s, r) => s + (r - mean) ** 2, 0) / (returns.length - 1);
    const volatility = Math.sqrt(Math.max(variance, 0));
    const volume = this.entries.reduce((s, e) => s + e.amountIn, 0);
    return { volatility, volume };
  }
}
