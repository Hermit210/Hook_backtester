import type { ComparisonReport } from "../engine/types";

interface Props {
  report: ComparisonReport;
}

export function JsonExport({ report }: Props) {
  function handleDownload() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hook-backtest-seed${report.seed}-${report.days}d.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" className="btn btn-ghost" onClick={handleDownload}>
      ⬇ Download full JSON report
    </button>
  );
}
