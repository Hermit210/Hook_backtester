import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ComparisonReport } from "../engine/types";
import { usePalette } from "./palette";
import { sampleIndices } from "./downsample";
import { formatNumber } from "./format";

interface Props {
  report: ComparisonReport;
  selectedStrategyId: string;
}

const MAX_POINTS = 400;

export function Charts({ report, selectedStrategyId }: Props) {
  const palette = usePalette();
  const baselineTrace = report.results[report.baselineId].trace;
  const selectedTrace = report.results[selectedStrategyId].trace;
  const selectedName = report.results[selectedStrategyId].strategyName;

  const indices = sampleIndices(baselineTrace.length, MAX_POINTS);
  const chartData = indices.map((i) => ({
    day: Number((baselineTrace[i].timestamp / (24 * 60 * 60 * 1000)).toFixed(2)),
    baseline: baselineTrace[i].cumulativeFeeRevenue,
    selected: selectedTrace[i].cumulativeFeeRevenue,
    price: baselineTrace[i].priceAfter,
  }));

  const selectedColor = palette.series[selectedStrategyId as keyof typeof palette.series];

  const tooltipStyle = {
    background: palette.surface1,
    border: `1px solid ${palette.border}`,
    borderRadius: 8,
    color: palette.textPrimary,
    fontSize: 13,
  };

  return (
    <section className="panel">
      <h2>Cumulative LP Fee Revenue</h2>
      <p className="muted">Baseline vs. {selectedName}, over the same swap stream.</p>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={palette.gridline} />
            <XAxis
              dataKey="day"
              type="number"
              domain={["dataMin", "dataMax"]}
              stroke={palette.axis}
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              tickLine={false}
              label={{ value: "Day", position: "insideBottom", offset: -4, fill: palette.textMuted, fontSize: 12 }}
            />
            <YAxis
              stroke={palette.axis}
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              tickLine={false}
              tickFormatter={(v) => formatNumber(v)}
              width={70}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(v) => `Day ${v}`}
              formatter={(value, name) => [formatNumber(Number(value), 2), String(name)]}
            />
            <Legend wrapperStyle={{ color: palette.textSecondary, fontSize: 13 }} />
            <Line
              type="monotone"
              dataKey="baseline"
              name="Static Fee (baseline)"
              stroke={palette.series.baseline}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="selected"
              name={selectedName}
              stroke={selectedColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2>Underlying Synthetic Price Path</h2>
      <p className="muted">Shared across every strategy — the identical event stream each one replays.</p>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={palette.gridline} />
            <XAxis
              dataKey="day"
              type="number"
              domain={["dataMin", "dataMax"]}
              stroke={palette.axis}
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              stroke={palette.axis}
              tick={{ fill: palette.textMuted, fontSize: 12 }}
              tickLine={false}
              domain={["auto", "auto"]}
              width={70}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(v) => `Day ${v}`}
              formatter={(value) => [Number(value).toFixed(4), "price"]}
            />
            <Line
              type="monotone"
              dataKey="price"
              name="Price"
              stroke={palette.textSecondary}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
