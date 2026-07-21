import { useMemo } from "react";
import { Link } from "react-router-dom";
import { generateSwapEvents } from "../engine/dataGenerator";
import { presetStrategies } from "../engine/strategies";

const PROBLEM_POINTS = [
  {
    title: "Hooks are tested for correctness, not economics",
    body: "Does it compile, does it revert, does it pass a unit test — that's the bar today for Uniswap v4 hook logic.",
  },
  {
    title: "Nobody backtests the pricing logic itself",
    body: "A hook can be bug-free and still be a bad strategy: a fee curve that bleeds volume, or a range that never rebalances in time.",
  },
  {
    title: "The first real test is real liquidity",
    body: "Without a backtester, the first time a hook's economics get evaluated under real conditions is after LPs already have capital behind it.",
  },
];

const STEPS = [
  {
    title: "Generate",
    body: "A synthetic swap stream with regime-switching volatility and volume — real historical data is the next milestone.",
  },
  {
    title: "Replay",
    body: "The identical event stream through your hook strategy and a static-fee baseline, so nothing but the strategy logic differs.",
  },
  {
    title: "Compare",
    body: "Fee revenue, volume captured, and impermanent-loss exposure, side by side — down to every individual swap.",
  },
];

export function Home() {
  const defaultSwapCount = useMemo(
    () => generateSwapEvents({ seed: 1234, days: 90 }).length,
    []
  );

  return (
    <div className="site-container">
      <section className="hero">
        <h1>Test your hook's economics before real liquidity does.</h1>
        <p className="hero__subhead">
          Hook Economic Backtester replays a swap stream through your Uniswap v4 hook
          strategy and a static-fee baseline — side by side, on the same data — so you can
          see fee revenue, volume capture, and impermanent-loss exposure before you deploy.
        </p>
        <div className="hero__actions">
          <Link to="/backtester" className="btn btn-primary">
            Launch Backtester
          </Link>
          <Link to="/how-it-works" className="link-ghost">
            How it works →
          </Link>
        </div>
        <p className="hero__stat">
          Tested against <strong>{defaultSwapCount.toLocaleString()}+</strong> simulated swaps
          in the default 90-day run.
        </p>
      </section>

      <section className="section">
        <p className="section__eyebrow">The problem</p>
        <h2>Hook logic ships untested on the one thing that matters most.</h2>
        <div className="problem-grid">
          {PROBLEM_POINTS.map((p) => (
            <div className="problem-grid__item" key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <p className="section__eyebrow">How it works</p>
        <h2>Three steps, same data, honest comparison.</h2>
        <div className="steps">
          {STEPS.map((step, i) => (
            <div className="step" key={step.title}>
              <span className="step__index mono">{String(i + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <p className="section__eyebrow">Presets</p>
        <h2>Three hook strategies, ready to compare.</h2>
        <div className="card-grid">
          {presetStrategies.map((s, i) => (
            <div className="strategy-card" key={s.id}>
              <div className="strategy-card__header">
                <span className="strategy-card__index mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="strategy-card__name">{s.name}</span>
              </div>
              <p className="muted">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="disclosure-callout">
          <h3>⚠ Synthetic data</h3>
          <p>
            Everything above runs on generated market data — a regime-switching random walk,
            not real Uniswap pool history. Every number is computed from actually running
            that data through the strategy logic, nothing is hardcoded — but the market
            itself is synthetic. Real Uniswap subgraph integration is the next milestone.
          </p>
        </div>
      </section>
    </div>
  );
}
