# Hook Economic Backtester — Prototype

A working prototype of an ingest → simulate → compare pipeline for backtesting
Uniswap v4 hook economics. **This phase runs entirely on synthetic (generated) swap
data** — real Uniswap subgraph integration is a separate, future milestone.

Given a synthetic swap stream, the tool replays the *identical* stream through a
static-fee baseline and three preset v4 hook strategies, and reports LP fee revenue,
volume capture, and impermanent-loss exposure for each — with a full swap-by-swap
trace, not just summary numbers.

## Running it

```bash
npm install
npm run dev      # interactive demo at http://localhost:5173
npm test         # engine unit tests (vitest)
npm run build    # production build (dist/)
```

No database, no RPC connection, no backend — the simulation runs entirely in the
browser as pure TypeScript.

## What's implemented

- **Synthetic data generator** (`src/engine/dataGenerator.ts`): a deterministic
  (seeded), regime-switching random walk. The window is split into blocks, each
  randomly assigned a volatility level and a volume level (low/med/high), so the
  three hooks see meaningfully different market conditions to react to — not
  uniform noise.
- **Three preset hook strategies** (`src/engine/strategies/`), each a standalone
  module implementing a `beforeSwap`-style interface modeled on v4's real
  `updateDynamicLPFee` mechanic (a hook decides the fee for each swap right before
  it executes):
  - `volatilityAdaptive.ts` — fee rises with recent realized volatility, falls when
    calm.
  - `volumeTiered.ts` — fee falls during high-volume periods (stay competitive),
    rises when volume is thin.
  - `autoRebalancing.ts` — a concentrated-liquidity range that only earns fees while
    price sits inside its range, and auto-recenters when price drifts past a wider
    hysteresis band (avoiding thrash-rebalancing on every tick).
- **Static-fee baseline** (`baseline.ts`): constant 0.30% fee, full-range, never
  rebalances. Every preset is compared against this.
- **Simulation/comparison engine** (`simulate.ts`, `compare.ts`, `metrics.ts`): runs
  the SAME generated event stream through the baseline and all three presets, so any
  difference in outcome is attributable purely to hook logic, never to different
  input data. Produces a full per-swap trace plus cumulative fee revenue, volume
  captured %, and IL exposure delta % for each strategy.
- **Reporting**: a `ComparisonReport` JSON object (seed, full event stream, per-swap
  traces, summary deltas) — downloadable from the UI, and the same shape a future
  CLI/CI consumer would use — plus a rendered summary (cards, charts, paginated
  trace table).
- **Interactive web demo** (`src/ui/`): seed + window controls (reproducible runs),
  strategy picker, comparison cards, fee-revenue and price charts, and a paginated
  swap-by-swap trace table. A persistent banner discloses the data is synthetic.
- **Sanity test** (`tests/simulate.test.ts`): under a flat/no-volatility,
  constant-volume synthetic market, `volatilityAdaptive` and `volumeTiered` produce
  fee revenue within 1% of the baseline — proving the comparison engine's logic is
  correct independent of data realism (there's nothing for them to react to, so they
  should behave like the baseline).

## Grounded in the real v4 hook mechanic

Per the current Uniswap v4 docs, a dynamic-fee pool's fee is set per-swap by the
hook's `beforeSwap` callback calling `updateDynamicLPFee` on the PoolManager, in pips
(hundredths of a bip; `3000` = 0.30%) — not a fixed tier chosen once at pool
creation. That's the model this prototype's `HookStrategy.beforeSwap` interface
follows. The auto-rebalancing hook models v4/v3's concentrated-liquidity fact that
fees only accrue to liquidity active at the executing price ("in range").

## Synthetic vs. real — what a future version replaces

Every number in this prototype comes from actually running generated data through
the strategy logic — nothing is hardcoded. But several pieces are explicit,
documented simplifications that a real-data version would need to address:

| Assumption | This prototype | Real version would need |
|---|---|---|
| Swap flow | Regime-switching random walk (`dataGenerator.ts`) | Real swap events from the Uniswap subgraph |
| Trade size | Normalized quote-currency notional, not raw token0/token1 amounts | Token-denominated amounts + a price oracle for USD normalization |
| Volume-captured % | Linear elasticity model: fees above baseline lose a modeled fraction of volume to a hypothetical competing pool at the baseline fee (`COMPETITIVE_ELASTICITY` in `constants.ts`) | Actual cross-pool routing/competition data |
| Impermanent loss | Standard constant-product IL formula, reference price resets on rebalance, zero exposure while out-of-range | Same formula is realistic, but would need real position sizing and possibly multi-tick LP math |
| Gas / execution cost | Not modeled (explicitly out of scope for this phase) | Rebalance/rebase transaction cost modeling |
| Hook logic | 3 fixed presets | Arbitrary developer-supplied hook logic (a future CLI milestone) |

## Project structure

```
src/
  engine/            # pure TypeScript simulation engine (no React dependency)
    types.ts          # SwapEvent, HookStrategy, SimResult, ComparisonReport
    constants.ts       # every tunable constant, in one place
    rng.ts              # seeded PRNG (mulberry32) + gaussian/poisson helpers
    dataGenerator.ts   # synthetic swap stream generator
    rollingWindow.ts   # shared trailing-window volatility/volume helper
    strategies/         # baseline + 3 presets, one file each
    simulate.ts         # replays one strategy over one event stream
    compare.ts          # runs baseline + presets over the identical stream
    metrics.ts          # fee-capture and impermanent-loss math
  ui/                 # React components (control panel, charts, trace table, etc.)
tests/
  simulate.test.ts     # flat-market sanity check + determinism/integrity checks
  metrics.test.ts      # unit tests for the fee/IL math
```

## Out of scope for this phase

- Real Uniswap subgraph / on-chain data integration
- CLI tool
- Gas-cost modeling
- Arbitrary developer-supplied hook logic (only the 3 presets)
