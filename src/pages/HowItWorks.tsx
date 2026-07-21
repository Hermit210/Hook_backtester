import { Link } from "react-router-dom";

export function HowItWorks() {
  return (
    <div className="site-container">
      <header className="app-header hero" style={{ paddingBottom: 8 }}>
        <h1 style={{ fontSize: "clamp(26px, 3.4vw, 38px)" }}>How it works</h1>
        <p className="hero__subhead">
          A precise walkthrough of what the backtester actually computes — the data
          generator, each preset strategy's trigger logic, the comparison engine, and what
          every output metric means.
        </p>
      </header>

      <section className="panel doc-section">
        <h2>1. The synthetic data generator</h2>
        <p>
          Swap events come from a deterministic, seeded random walk (a given seed always
          reproduces the same stream). The window is split into 6–12 regime blocks, each
          randomly assigned a volatility level and a volume level (low / med / high) —
          so the strategies genuinely see different market conditions to react to, not
          uniform noise.
        </p>
        <p>
          Within a block, swap arrival follows a Poisson-scaled process tied to the
          block's volume level, and each swap's price move is a log-normal step scaled by
          the block's volatility level. Trade size and pool liquidity depth are generated
          per swap too, with light log-normal noise layered on top of the block's base
          levels.
        </p>
      </section>

      <section className="panel doc-section">
        <h2>2. The three preset strategies</h2>
        <p>
          Each strategy implements a <span className="chip">beforeSwap</span>-style
          interface modeled on Uniswap v4's real mechanic: a dynamic-fee hook's{" "}
          <span className="chip">beforeSwap</span> callback calls{" "}
          <span className="chip">updateDynamicLPFee</span> on the PoolManager to set the
          fee for that specific swap, in pips (hundredths of a bip — <span className="chip">3000</span> = 0.30%).
        </p>

        <h3>Volatility-Adaptive Fee</h3>
        <p>
          Tracks realized volatility (stddev of log returns) over a trailing 30-swap
          window and scales the fee linearly:{" "}
          <span className="chip">fee = 3,000 + volatility × 600,000</span>, clamped to{" "}
          <span className="chip">[400, 12,000]</span> pips. At zero volatility this
          collapses to exactly the 3,000-pip baseline fee.
        </p>

        <h3>Volume-Tiered Fee</h3>
        <p>
          Tracks rolling volume over the same trailing window and moves the fee{" "}
          <em>inversely</em>: high recent volume lowers the fee to stay competitive, thin
          volume raises it. At the calibrated reference volume, the fee is exactly the
          3,000-pip baseline.
        </p>

        <h3>Auto-Rebalancing Range</h3>
        <p>
          Simulates a concentrated-liquidity position with a ±4% earning range around a
          center price. Swaps priced inside that range earn the fixed 3,000-pip fee;
          swaps outside it earn <strong>zero</strong> — matching how concentrated
          liquidity only accrues fees while active at the executing price. The position
          only re-centers once price clears a wider ±6% hysteresis band, avoiding
          thrash-rebalancing on every small oscillation.
        </p>
      </section>

      <section className="panel doc-section">
        <h2>3. The comparison engine</h2>
        <p>
          The static-fee baseline (constant 3,000 pips, always in range, never
          rebalances) and every preset strategy replay the exact same generated event
          array — not separately generated data. Because the input is identical, any
          difference in fee revenue, volume captured, or IL exposure is attributable
          purely to the strategy's logic, never to different market conditions.
        </p>
        <p>
          Every individual swap is logged in a full trace (fee applied, in-range status,
          fee earned, running cumulative revenue) — the summary numbers are a rollup of
          that trace, not a separate calculation.
        </p>
      </section>

      <section className="panel doc-section">
        <h2>4. What the output metrics mean</h2>
        <h3>Fee revenue vs. baseline</h3>
        <p>
          Sum of <span className="chip">amountIn × capturedFraction × feePips / 1,000,000</span>{" "}
          over in-range swaps, shown as a % delta against the baseline's total.
        </p>
        <h3>Volume captured</h3>
        <p>
          A documented, explicit simplification: swaps priced above the 3,000-pip
          baseline are assumed to lose a modeled fraction of volume to a hypothetical
          competing pool charging the baseline fee (a linear elasticity model). At or
          below baseline fee, capture is 100%. This isn't derived from real routing data —
          it's a stated assumption, not hidden.
        </p>
        <h3>IL exposure vs. baseline</h3>
        <p>
          The standard constant-product impermanent-loss formula, applied to the price
          ratio since each strategy's last reference point — which resets whenever a
          strategy actively rebalances (only Auto-Rebalancing does this). Reported as the
          volume-weighted average IL magnitude, then compared as a % delta against the
          baseline's exposure.
        </p>
      </section>

      <section className="panel doc-cta">
        <p className="muted" style={{ margin: 0 }}>
          Ready to see it run on real (synthetic) data?
        </p>
        <Link to="/backtester" className="btn btn-primary">
          Launch Backtester
        </Link>
      </section>
    </div>
  );
}
