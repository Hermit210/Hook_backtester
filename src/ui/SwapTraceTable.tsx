import { useState } from "react";
import type { ComparisonReport } from "../engine/types";
import { formatDay, formatNumber, formatPips } from "./format";

interface Props {
  report: ComparisonReport;
  selectedStrategyId: string;
}

const PAGE_SIZE = 50;

export function SwapTraceTable({ report, selectedStrategyId }: Props) {
  const [page, setPage] = useState(0);
  const trace = report.results[selectedStrategyId].trace;
  const strategyName = report.results[selectedStrategyId].strategyName;
  const pageCount = Math.max(1, Math.ceil(trace.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount - 1);
  const start = clampedPage * PAGE_SIZE;
  const rows = trace.slice(start, start + PAGE_SIZE);

  return (
    <section className="panel">
      <h2>Swap-by-Swap Trace — {strategyName}</h2>
      <p className="muted">
        Showing swaps {start + 1}–{Math.min(start + PAGE_SIZE, trace.length)} of{" "}
        {trace.length.toLocaleString()}.
      </p>

      <div className="table-wrap">
        <table className="trace-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Time</th>
              <th>Direction</th>
              <th>Amount</th>
              <th>Price</th>
              <th>Fee</th>
              <th>In range</th>
              <th>Fee earned</th>
              <th>Cumulative revenue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.index}>
                <td>{row.index}</td>
                <td>{formatDay(row.timestamp)}</td>
                <td>{row.direction}</td>
                <td>{formatNumber(row.amountIn, 2)}</td>
                <td>{row.priceAfter.toFixed(4)}</td>
                <td>{formatPips(row.feePips)}</td>
                <td className={row.inRange ? "in-range-yes" : "in-range-no"}>{row.inRange ? "yes" : "no"}</td>
                <td>{formatNumber(row.feeEarned, 4)}</td>
                <td>{formatNumber(row.cumulativeFeeRevenue, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <button type="button" className="btn btn-ghost" onClick={() => setPage(0)} disabled={clampedPage === 0}>
          « First
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={clampedPage === 0}
        >
          ‹ Prev
        </button>
        <span className="pager-status">
          Page {clampedPage + 1} of {pageCount}
        </span>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          disabled={clampedPage >= pageCount - 1}
        >
          Next ›
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setPage(pageCount - 1)}
          disabled={clampedPage >= pageCount - 1}
        >
          Last »
        </button>
      </div>
    </section>
  );
}
