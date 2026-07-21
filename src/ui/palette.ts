// Fixed dark "trading terminal" theme — deliberately not adaptive to OS light/dark
// preference, matching the tool's instrument-panel aesthetic. Exposed as a static
// object (not derived from CSS custom properties) because Recharts' SVG props need
// literal color strings, not var() references.
export interface Palette {
  bg: string;
  surface: string;
  panelRecessed: string;
  border: string;
  gridline: string;
  textPrimary: string;
  textSecondary: string;
  accentAmber: string;
  accentAmberInk: string;
  accentTeal: string;
  good: string;
  critical: string;
}

export const palette: Palette = {
  bg: "#0d1117",
  surface: "#161b22",
  panelRecessed: "#10141a",
  border: "#2a3038",
  gridline: "#1c222b",
  textPrimary: "#e6e8eb",
  textSecondary: "#8b94a3",
  accentAmber: "#e8a33d",
  accentAmberInk: "#2a1c05",
  accentTeal: "#3fb8af",
  good: "#4ade80",
  critical: "#f87171",
};

export function usePalette(): Palette {
  return palette;
}
