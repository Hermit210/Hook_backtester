import { useState } from "react";
import { Link } from "react-router-dom";

interface FaqEntry {
  question: string;
  answer: React.ReactNode;
}

const ENTRIES: FaqEntry[] = [
  {
    question: "What is Hook Economic Backtester?",
    answer:
      "A tool that replays a swap event stream through a Uniswap v4 hook strategy and a static-fee baseline — on the identical data — so you can see fee revenue, volume capture, and impermanent-loss exposure before you deploy the hook against real liquidity.",
  },
  {
    question: "Why does this matter if my hook already passes its unit tests?",
    answer:
      "Unit tests check correctness — does it compile, does it revert, does it behave as coded. They don't check whether the pricing logic is actually a good strategy. A hook can be completely bug-free and still bleed volume to competitors or mistime its fee curve. This tool tests the economics, not the code.",
  },
  {
    question: "Is the data real Uniswap pool data?",
    answer: (
      <>
        No — not yet. Every run today uses generated synthetic data (a seeded,
        regime-switching random walk), clearly labeled as such throughout the site.
        Real Uniswap subgraph integration is the next milestone. See{" "}
        <Link to="/how-it-works">How It Works</Link> for the full breakdown of what's
        synthetic vs. what a real-data version would replace.
      </>
    ),
  },
  {
    question: "How is the synthetic data generated?",
    answer:
      "A deterministic, seeded random walk. The time window is split into 6–12 regime blocks, each randomly assigned a volatility level and a volume level (low/med/high), so swap arrival rate and price movement genuinely vary across the run instead of being uniform noise.",
  },
  {
    question: '"Fee revenue," "volume captured," and "IL exposure" — what do these mean?',
    answer:
      "Fee revenue vs. baseline is the % difference in total LP fees earned compared to a constant 0.30% fee. Volume captured is the modeled % of swap volume the strategy retains — fees priced above baseline lose some volume to a hypothetical cheaper competing pool. IL exposure vs. baseline is the % difference in impermanent-loss magnitude, using the standard constant-product formula.",
  },
  {
    question: "Can I test my own custom hook logic, or only the three presets?",
    answer:
      "Only the three presets today — Volatility-Adaptive, Volume-Tiered, and Auto-Rebalancing. Accepting arbitrary developer-supplied hook logic is a planned future milestone, not built yet.",
  },
  {
    question: "Is this open source?",
    answer: (
      <>
        Yes — MIT licensed. The full source is on{" "}
        <a href="https://github.com/Hermit210/Hook_backtester" target="_blank" rel="noreferrer">
          GitHub
        </a>
        .
      </>
    ),
  },
  {
    question: "Who is this for?",
    answer:
      "Uniswap v4 hook developers who want to evaluate a strategy's economic performance — fee revenue, competitiveness, IL exposure — before real liquidity providers put capital behind it.",
  },
];

export function Faq() {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="faq">
      {ENTRIES.map((entry, i) => {
        const isOpen = openSet.has(i);
        return (
          <div className={`faq-item${isOpen ? " faq-item--open" : ""}`} key={entry.question}>
            <button
              type="button"
              className="faq-item__question"
              aria-expanded={isOpen}
              onClick={() => toggle(i)}
            >
              <span>{entry.question}</span>
              <span className="faq-item__chevron mono" aria-hidden="true">▾</span>
            </button>
            {isOpen && <div className="faq-item__answer">{entry.answer}</div>}
          </div>
        );
      })}
    </div>
  );
}
