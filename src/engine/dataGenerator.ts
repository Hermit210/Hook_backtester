import { gaussian, mulberry32, poisson } from "./rng";
import type { GeneratorConfig, RegimeLevel, SwapEvent } from "./types";
import {
  DAY_MS,
  LIQUIDITY_BASE,
  LIQUIDITY_VOLUME_MULTIPLIER,
  SWAPS_PER_DAY,
  TRADE_SIZE_BASE,
  TRADE_SIZE_NOISE_SIGMA,
  VOLATILITY_SIGMA,
} from "./constants";

const LEVELS: RegimeLevel[] = ["low", "med", "high"];
const STARTING_PRICE = 1.0;
const TICK_BASE = 1.0001;

interface RegimeBlock {
  startMs: number;
  endMs: number;
  volatilityLevel: RegimeLevel;
  volumeLevel: RegimeLevel;
}

function priceToTick(price: number): number {
  return Math.round(Math.log(price) / Math.log(TICK_BASE));
}

function buildRegimeBlocks(rand: () => number, days: number): RegimeBlock[] {
  const numBlocks = Math.max(6, Math.min(12, Math.round(days / 10)));
  const blockDurationMs = (days * DAY_MS) / numBlocks;
  const blocks: RegimeBlock[] = [];
  for (let i = 0; i < numBlocks; i++) {
    blocks.push({
      startMs: i * blockDurationMs,
      endMs: (i + 1) * blockDurationMs,
      volatilityLevel: LEVELS[Math.floor(rand() * LEVELS.length)],
      volumeLevel: LEVELS[Math.floor(rand() * LEVELS.length)],
    });
  }
  // Guarantee at least one high-volatility and one high-volume block so every
  // generated run gives the hooks meaningfully different conditions to react to.
  if (!blocks.some((b) => b.volatilityLevel === "high")) {
    blocks[Math.floor(rand() * blocks.length)].volatilityLevel = "high";
  }
  if (!blocks.some((b) => b.volumeLevel === "high")) {
    blocks[Math.floor(rand() * blocks.length)].volumeLevel = "high";
  }
  return blocks;
}

function regimeAt(blocks: RegimeBlock[], ms: number): RegimeBlock {
  for (const block of blocks) {
    if (ms >= block.startMs && ms < block.endMs) return block;
  }
  return blocks[blocks.length - 1];
}

export function generateSwapEvents(config: GeneratorConfig): SwapEvent[] {
  const { seed, days } = config;
  const rand = mulberry32(seed);

  if (config.flat) {
    return generateFlatEvents(rand, days);
  }

  const blocks = buildRegimeBlocks(rand, days);

  // Generate arrival timestamps per block via a Poisson swap count, spread uniformly
  // within the block. This approximates a Poisson arrival process without a full
  // point-process simulation, which is sufficient for this prototype.
  const timestamps: number[] = [];
  for (const block of blocks) {
    const blockDays = (block.endMs - block.startMs) / DAY_MS;
    const expectedCount = SWAPS_PER_DAY[block.volumeLevel] * blockDays;
    const count = Math.max(1, poisson(rand, expectedCount));
    for (let i = 0; i < count; i++) {
      timestamps.push(block.startMs + rand() * (block.endMs - block.startMs));
    }
  }
  timestamps.sort((a, b) => a - b);

  const events: SwapEvent[] = [];
  let price = STARTING_PRICE;
  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    const regime = regimeAt(blocks, ts);
    const sigma = VOLATILITY_SIGMA[regime.volatilityLevel];
    const logReturn = sigma * gaussian(rand);
    const priceBefore = price;
    const priceAfter = priceBefore * Math.exp(logReturn);
    price = priceAfter;

    const sizeNoise = Math.exp(TRADE_SIZE_NOISE_SIGMA * gaussian(rand));
    const amountIn = Math.max(1, TRADE_SIZE_BASE[regime.volumeLevel] * sizeNoise);

    const liquidityNoise = 1 + 0.1 * gaussian(rand);
    const liquidity = Math.max(
      1,
      LIQUIDITY_BASE * LIQUIDITY_VOLUME_MULTIPLIER[regime.volumeLevel] * liquidityNoise
    );

    events.push({
      index: i,
      timestamp: Math.round(ts),
      direction: logReturn >= 0 ? "oneForZero" : "zeroForOne",
      amountIn,
      priceBefore,
      priceAfter,
      tick: priceToTick(priceAfter),
      liquidity,
      volatilityLevel: regime.volatilityLevel,
      volumeLevel: regime.volumeLevel,
    });
  }

  return events;
}

// Deterministic, constant-price, constant-volume market used by the flat-market sanity
// test: no signal for the volatility/volume-adaptive hooks to react to, so their fee
// output should collapse to the static baseline fee.
function generateFlatEvents(rand: () => number, days: number): SwapEvent[] {
  const intervalMs = DAY_MS / SWAPS_PER_DAY.med;
  const windowMs = days * DAY_MS;
  const count = Math.floor(windowMs / intervalMs);
  const price = STARTING_PRICE;
  const amountIn = TRADE_SIZE_BASE.med;
  const liquidity = LIQUIDITY_BASE * LIQUIDITY_VOLUME_MULTIPLIER.med;

  const events: SwapEvent[] = [];
  for (let i = 0; i < count; i++) {
    events.push({
      index: i,
      timestamp: Math.round(i * intervalMs),
      direction: i % 2 === 0 ? "zeroForOne" : "oneForZero",
      amountIn,
      priceBefore: price,
      priceAfter: price,
      tick: priceToTick(price),
      liquidity,
      volatilityLevel: "low",
      volumeLevel: "med",
    });
  }
  // consume rand() once so a flat run's seed still deterministically "uses" the PRNG,
  // keeping the function signature consistent with the non-flat path.
  void rand();
  return events;
}
