import type { HookStrategy } from "../engine/types";

const DAY_OPTIONS = [30, 60, 90];

interface Props {
  seed: number;
  onSeedChange: (seed: number) => void;
  days: number;
  onDaysChange: (days: number) => void;
  strategies: HookStrategy<unknown>[];
  selectedStrategyId: string;
  onSelectStrategy: (id: string) => void;
  onRun: () => void;
}

export function ControlPanel({
  seed,
  onSeedChange,
  days,
  onDaysChange,
  strategies,
  selectedStrategyId,
  onSelectStrategy,
  onRun,
}: Props) {
  return (
    <section className="panel control-panel">
      <div className="control-row">
        <label className="control-field">
          <span>Seed</span>
          <div className="seed-input">
            <input
              type="number"
              value={seed}
              onChange={(e) => onSeedChange(Number(e.target.value))}
            />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => onSeedChange(Math.floor(Math.random() * 1_000_000_000))}
              title="Randomize seed"
            >
              🎲
            </button>
          </div>
        </label>

        <label className="control-field">
          <span>Window</span>
          <select value={days} onChange={(e) => onDaysChange(Number(e.target.value))}>
            {DAY_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} days
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="btn btn-primary" onClick={onRun}>
          Generate &amp; Run
        </button>
      </div>

      <div className="control-row strategy-picker">
        <span className="control-field-label">Focus strategy (for chart &amp; trace below)</span>
        <div className="strategy-radio-group">
          {strategies.map((s) => (
            <label
              key={s.id}
              className={`strategy-radio${selectedStrategyId === s.id ? " strategy-radio--active" : ""}`}
            >
              <input
                type="radio"
                name="strategy"
                value={s.id}
                checked={selectedStrategyId === s.id}
                onChange={() => onSelectStrategy(s.id)}
              />
              {s.name}
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
