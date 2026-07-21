export function formatNumber(value: number, digits = 0): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatPct(value: number, digits = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatPips(feePips: number): string {
  return `${(feePips / 10000).toFixed(3)}%`;
}

export function formatDay(timestampMs: number): string {
  const day = timestampMs / (24 * 60 * 60 * 1000);
  return `Day ${day.toFixed(1)}`;
}
