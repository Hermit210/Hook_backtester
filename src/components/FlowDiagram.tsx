interface Row {
  name: string;
  color: string;
}

const ROWS: Row[] = [
  { name: "Static Fee (Baseline)", color: "var(--path-baseline)" },
  { name: "Volatility-Adaptive", color: "var(--accent-amber)" },
  { name: "Volume-Tiered", color: "var(--accent-teal)" },
  { name: "Auto-Rebalancing", color: "var(--path-violet)" },
];

const OUTPUT_LABEL = "Fee Rev · Vol Cap · IL Exp";

interface Props {
  detailed?: boolean;
}

// Hand-built SVG diagram (no image asset) showing the tool's core mechanism: one
// input stream fans out into four identical-input paths, each producing its own
// output metrics, converging into one comparison report. Two separate markups
// (desktop horizontal / mobile vertical) swapped via CSS media query — see
// .flow-diagram rules in styles/site.css.
export function FlowDiagram({ detailed = false }: Props) {
  const rowY = [45, 115, 185, 255];
  const centerY = 150;

  return (
    <div className="flow-diagram">
      <div className="flow-diagram__desktop">
        <svg viewBox="0 0 920 300" role="img" aria-label="Diagram: one synthetic swap stream replayed through the baseline and three hook strategies, converging into one comparison report">
          {/* input -> strategy branch lines (identical-input fan-out) */}
          {rowY.map((y) => (
            <line
              key={`branch-${y}`}
              x1={160}
              y1={centerY}
              x2={230}
              y2={y}
              stroke="var(--text-secondary)"
              strokeWidth={1.5}
              opacity={0.6}
            />
          ))}
          <text x={170} y={14} className="fd-caption">identical input →</text>

          {/* source box */}
          <rect x={0} y={120} width={160} height={60} rx={6} fill="var(--surface)" stroke="var(--border)" strokeWidth={1.5} />
          <text x={80} y={146} textAnchor="middle" className="fd-label">Synthetic Swap</text>
          <text x={80} y={162} textAnchor="middle" className="fd-label">Events</text>

          {ROWS.map((row, i) => {
            const y = rowY[i];
            return (
              <g key={row.name}>
                <line x1={410} y1={y} x2={490} y2={y} stroke={row.color} strokeWidth={1.5} />
                <line
                  x1={670}
                  y1={y}
                  x2={760}
                  y2={centerY}
                  stroke="var(--border)"
                  strokeWidth={1.5}
                />

                <rect x={230} y={y - 22} width={180} height={44} rx={6} fill="var(--surface)" stroke={row.color} strokeWidth={1.5} />
                <text x={320} y={y + 5} textAnchor="middle" className="fd-label">{row.name}</text>

                <rect x={490} y={y - 22} width={180} height={44} rx={6} fill="var(--surface)" stroke="var(--border)" strokeWidth={1.5} />
                <text x={580} y={y + 5} textAnchor="middle" className="fd-sublabel">{OUTPUT_LABEL}</text>
              </g>
            );
          })}

          {/* comparison report box */}
          <rect x={760} y={120} width={160} height={60} rx={6} fill="var(--surface)" stroke="var(--accent-amber)" strokeWidth={1.5} />
          <text x={840} y={146} textAnchor="middle" className="fd-label">Comparison</text>
          <text x={840} y={162} textAnchor="middle" className="fd-label">Report</text>
        </svg>
        {detailed && (
          <p className="muted" style={{ marginTop: 16, maxWidth: 720 }}>
            Every path — the baseline and all three strategies — replays the exact same
            generated event array. Each produces its own fee revenue, volume captured, and
            IL exposure from that identical trace; the comparison report is just their deltas
            against the baseline.
          </p>
        )}
      </div>

      <div className="flow-diagram__mobile">
        <svg viewBox="0 0 320 500" role="img" aria-label="Diagram: one synthetic swap stream replayed through the baseline and three hook strategies, converging into one comparison report">
          <rect x={60} y={0} width={200} height={50} rx={6} fill="var(--surface)" stroke="var(--border)" strokeWidth={1.5} />
          <text x={160} y={22} textAnchor="middle" className="fd-label">Synthetic Swap Events</text>
          <text x={160} y={38} textAnchor="middle" className="fd-caption">identical input to all four</text>

          {ROWS.map((row, i) => {
            const y = 80 + i * 80;
            return (
              <g key={row.name}>
                <line x1={160} y1={50} x2={160} y2={y} stroke="var(--text-secondary)" strokeWidth={1.5} opacity={0.6} />
                <line x1={160} y1={y + 64} x2={160} y2={440} stroke="var(--border)" strokeWidth={1.5} />
                <rect x={20} y={y} width={280} height={64} rx={6} fill="var(--surface)" stroke={row.color} strokeWidth={1.5} />
                <text x={160} y={y + 26} textAnchor="middle" className="fd-label">{row.name}</text>
                <text x={160} y={y + 44} textAnchor="middle" className="fd-sublabel">{OUTPUT_LABEL}</text>
              </g>
            );
          })}

          <rect x={60} y={440} width={200} height={50} rx={6} fill="var(--surface)" stroke="var(--accent-amber)" strokeWidth={1.5} />
          <text x={160} y={462} textAnchor="middle" className="fd-label">Comparison Report</text>
          <text x={160} y={478} textAnchor="middle" className="fd-caption">deltas vs. baseline</text>
        </svg>
        {detailed && (
          <p className="muted" style={{ marginTop: 16 }}>
            Every path replays the exact same generated event array — each strategy's
            metrics come from that identical trace, so the comparison is attributable to
            strategy logic alone.
          </p>
        )}
      </div>
    </div>
  );
}
