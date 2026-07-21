import { useEffect, useState } from "react";

export interface Palette {
  surface1: string;
  page: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  gridline: string;
  axis: string;
  border: string;
  good: string;
  critical: string;
  series: {
    baseline: string;
    "volatility-adaptive": string;
    "volume-tiered": string;
    "auto-rebalancing": string;
  };
}

// Fixed categorical order: blue (baseline) -> aqua -> yellow -> green.
// Never cycled/reassigned per-run so a strategy's color stays stable everywhere.
export const lightPalette: Palette = {
  surface1: "#fcfcfb",
  page: "#f9f9f7",
  textPrimary: "#0b0b0b",
  textSecondary: "#52514e",
  textMuted: "#898781",
  gridline: "#e1e0d9",
  axis: "#c3c2b7",
  border: "rgba(11,11,11,0.10)",
  good: "#0ca30c",
  critical: "#d03b3b",
  series: {
    baseline: "#2a78d6",
    "volatility-adaptive": "#1baf7a",
    "volume-tiered": "#eda100",
    "auto-rebalancing": "#008300",
  },
};

export const darkPalette: Palette = {
  surface1: "#1a1a19",
  page: "#0d0d0d",
  textPrimary: "#ffffff",
  textSecondary: "#c3c2b7",
  textMuted: "#898781",
  gridline: "#2c2c2a",
  axis: "#383835",
  border: "rgba(255,255,255,0.10)",
  good: "#0ca30c",
  critical: "#e66767",
  series: {
    baseline: "#3987e5",
    "volatility-adaptive": "#199e70",
    "volume-tiered": "#c98500",
    "auto-rebalancing": "#008300",
  },
};

export function usePalette(): Palette {
  const [dark, setDark] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return dark ? darkPalette : lightPalette;
}
